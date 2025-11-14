import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface VoiceInteractionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'pdf' | 'docx';
  documentType?: 'decree' | 'letter' | 'report' | 'note';
}

interface VADConfig {
  energyThreshold: number;      // Seuil d'énergie pour détecter la parole
  silenceThreshold: number;     // Durée de silence pour considérer fin de parole
  minSpeechDuration: number;    // Durée minimale de parole pour valider
  preSpeechPadding: number;     // Padding avant la parole
  postSpeechPadding: number;    // Padding après la parole
}

interface UseVoiceInteractionReturn {
  voiceState: VoiceState;
  messages: VoiceInteractionMessage[];
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  liveTranscript: string;
  silenceTimeRemaining: number;
  continuousMode: boolean;
  continuousModePaused: boolean;
  handleInteraction: () => void;
  toggleContinuousPause: () => void;
  stopSpeaking: () => void;
  clearConversation: () => void;
}

export const useVoiceInteractionAdvanced = (): UseVoiceInteractionReturn => {
  // États principaux
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<VoiceInteractionMessage[]>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [silenceTimeRemaining, setSilenceTimeRemaining] = useState<number>(0);
  const [continuousMode, setContinuousMode] = useState<boolean>(false);
  const [continuousModePaused, setContinuousModePaused] = useState<boolean>(false);
  
  // Configuration VAD avancée
  const [vadConfig, setVadConfig] = useState<VADConfig>({
    energyThreshold: 0.015,      // Seuil plus sensible
    silenceThreshold: 800,       // 800ms de silence
    minSpeechDuration: 400,      // 400ms minimum de parole
    preSpeechPadding: 300,       // 300ms avant
    postSpeechPadding: 500,      // 500ms après
  });
  
  // Refs pour l'audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Refs pour VAD
  const speechStartTimeRef = useRef<number>(0);
  const lastSoundTimeRef = useRef<number>(0);
  const isSpeakingRef = useRef<boolean>(false);
  const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs pour playback
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  // Session
  const sessionIdRef = useRef<string>(`session-${Date.now()}`);
  
  // Préférences utilisateur
  const voiceIdRef = useRef<string>('');
  const aiModelRef = useRef<'gemini' | 'gpt' | 'claude'>('claude');
  
  // États calculés
  const isListening = voiceState === 'listening';
  const isThinking = voiceState === 'thinking';
  const isSpeaking = voiceState === 'speaking';

  /**
   * Détection avancée de fin de parole (VAD - Voice Activity Detection)
   */
  const startVAD = useCallback(() => {
    if (!audioContextRef.current || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculer l'énergie du signal
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const energy = Math.sqrt(sum / bufferLength) / 255;
      
      // Mettre à jour le niveau audio pour l'UI
      setAudioLevel(energy * 100);
      
      const now = Date.now();
      
      // Détecter si on parle
      if (energy > vadConfig.energyThreshold) {
        // Son détecté
        lastSoundTimeRef.current = now;
        
        if (!isSpeakingRef.current) {
          // Début de parole
          isSpeakingRef.current = true;
          speechStartTimeRef.current = now;
          setSilenceTimeRemaining(0);
        }
      } else if (isSpeakingRef.current) {
        // Silence pendant qu'on parlait
        const silenceDuration = now - lastSoundTimeRef.current;
        const speechDuration = now - speechStartTimeRef.current;
        
        setSilenceTimeRemaining(Math.max(0, vadConfig.silenceThreshold - silenceDuration));
        
        // Fin de parole si:
        // 1. Silence suffisamment long
        // 2. Durée de parole suffisante
        if (
          silenceDuration > vadConfig.silenceThreshold &&
          speechDuration > vadConfig.minSpeechDuration
        ) {
          console.log('✅ Fin de parole détectée', {
            speechDuration: `${speechDuration}ms`,
            silenceDuration: `${silenceDuration}ms`
          });
          
          isSpeakingRef.current = false;
          stopRecording();
        }
      }
    };

    vadIntervalRef.current = setInterval(checkAudioLevel, 50); // 20 fps
  }, [vadConfig]);

  /**
   * Démarrer l'enregistrement avec VAD
   */
  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Démarrage enregistrement avec VAD avancé...');
      
      // Réinitialiser les états
      audioChunksRef.current = [];
      isSpeakingRef.current = false;
      speechStartTimeRef.current = 0;
      lastSoundTimeRef.current = 0;
      setSilenceTimeRemaining(0);
      setLiveTranscript('');
      
      // Obtenir le flux audio
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        } 
      });
      streamRef.current = stream;
      
      // Configurer AudioContext pour VAD
      audioContextRef.current = new AudioContext({ sampleRate: 48000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);
      
      // Configurer MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000,
      });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        console.log('⏹️ Enregistrement arrêté, traitement...');
        await processRecording();
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start(100);
      
      setVoiceState('listening');
      startVAD();
      
      toast.success('Je vous écoute Excellence...', {
        duration: 2000,
        icon: '🎤',
      });
      
    } catch (error) {
      console.error('❌ Erreur accès microphone:', error);
      toast.error('Impossible d\'accéder au microphone');
      setVoiceState('idle');
    }
  }, [startVAD]);

  /**
   * Arrêter l'enregistrement
   */
  const stopRecording = useCallback(() => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setAudioLevel(0);
    setSilenceTimeRemaining(0);
  }, []);

  /**
   * Traiter l'enregistrement et envoyer au backend
   */
  const processRecording = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      console.warn('⚠️ Pas de données audio');
      setVoiceState('idle');
      return;
    }

    setVoiceState('thinking');
    setLiveTranscript('Transcription en cours...');

    try {
      // Créer le blob audio
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log(`📦 Audio blob créé: ${(audioBlob.size / 1024).toFixed(2)} KB`);

      // Convertir en base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Analyser le contexte de conversation pour déterminer le type de réponse
        const conversationContext = messages.slice(-3).map(m => m.content).join(' ');
        const needsDetails = /détail|précis|expliqu|comment|pourquoi/i.test(conversationContext);
        const needsSynthesis = /résumé|synthèse|bref|en gros/i.test(conversationContext);
        
        // Appeler le backend avec détection de type de réponse
        const { data, error } = await supabase.functions.invoke('chat-with-iasted-advanced', {
          body: {
            sessionId: sessionIdRef.current,
            userId: (await supabase.auth.getUser()).data.user?.id,
            audioBase64: base64Audio,
            voiceId: voiceIdRef.current,
            aiModel: aiModelRef.current,
            generateAudio: true,
            streamAudio: true,
            responseType: needsDetails ? 'detailed' : needsSynthesis ? 'concise' : 'adaptive',
          }
        });

        if (error) throw error;

        const { transcript, responseText, audioContent, fileUrl, fileName, fileType, documentType } = data;

        // Mettre à jour le transcript
        setLiveTranscript(transcript);

        // Ajouter les messages
        const userMessage: VoiceInteractionMessage = {
          role: 'user',
          content: transcript,
          timestamp: new Date().toISOString(),
        };

        const assistantMessage: VoiceInteractionMessage = {
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toISOString(),
          fileUrl,
          fileName,
          fileType,
          documentType,
        };

        setMessages(prev => [...prev, userMessage, assistantMessage]);

        // Jouer la réponse audio
        if (audioContent) {
          await playAudioWithStreaming(audioContent);
        } else {
          setVoiceState('idle');
        }

        // Mode continu
        if (continuousMode && !continuousModePaused) {
          setTimeout(() => {
            if (voiceState !== 'speaking') {
              startRecording();
            }
          }, 1000);
        }

      };

    } catch (error: any) {
      console.error('❌ Erreur traitement:', error);
      toast.error('Erreur de communication avec iAsted');
      setVoiceState('idle');
    }
  }, [messages, continuousMode, continuousModePaused, voiceState]);

  /**
   * Playback audio avec streaming pour réponse naturelle
   */
  const playAudioWithStreaming = useCallback(async (base64Audio: string) => {
    try {
      setVoiceState('speaking');
      console.log('🔊 Lecture audio avec streaming...');

      // Décoder le base64
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Créer le blob audio
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Créer l'élément audio
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      // Paramètres pour débit naturel
      audio.playbackRate = 1.0;
      audio.volume = 1.0;

      // Listeners
      audio.onended = () => {
        console.log('✅ Lecture audio terminée');
        URL.revokeObjectURL(audioUrl);
        setVoiceState('idle');
        audioElementRef.current = null;
      };

      audio.onerror = (e) => {
        console.error('❌ Erreur lecture audio:', e);
        URL.revokeObjectURL(audioUrl);
        setVoiceState('idle');
        toast.error('Erreur de lecture audio');
      };

      // Lancer la lecture
      await audio.play();

    } catch (error) {
      console.error('❌ Erreur playback:', error);
      setVoiceState('idle');
    }
  }, []);

  /**
   * Arrêter la parole d'iAsted
   */
  const stopSpeaking = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
      setVoiceState('idle');
    }
  }, []);

  /**
   * Gérer l'interaction (toggle écoute)
   */
  const handleInteraction = useCallback(() => {
    if (voiceState === 'idle') {
      startRecording();
    } else if (voiceState === 'listening') {
      stopRecording();
    } else if (voiceState === 'speaking') {
      stopSpeaking();
    }
  }, [voiceState, startRecording, stopRecording, stopSpeaking]);

  /**
   * Toggle pause mode continu
   */
  const toggleContinuousPause = useCallback(() => {
    setContinuousModePaused(prev => !prev);
  }, []);

  /**
   * Effacer la conversation
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
    setLiveTranscript('');
    sessionIdRef.current = `session-${Date.now()}`;
  }, []);

  // Charger les préférences au montage
  // Charger préférences utilisateur (simplifiées - pas de table user_preferences)
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Charger voix par défaut iAsted
        const { data: voicesData } = await supabase.functions.invoke('list-voices');
        const iastedVoice = voicesData?.voices?.find(
          (voice: any) => voice.name?.toLowerCase() === 'iasted'
        );
        if (iastedVoice) {
          voiceIdRef.current = iastedVoice.voice_id;
        }
      } catch (error) {
        console.error('Erreur chargement préférences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Nettoyage
  useEffect(() => {
    return () => {
      stopRecording();
      stopSpeaking();
      if (vadIntervalRef.current) {
        clearInterval(vadIntervalRef.current);
      }
    };
  }, [stopRecording, stopSpeaking]);

  return {
    voiceState,
    messages,
    isListening,
    isThinking,
    isSpeaking,
    audioLevel,
    liveTranscript,
    silenceTimeRemaining,
    continuousMode,
    continuousModePaused,
    handleInteraction,
    toggleContinuousPause,
    stopSpeaking,
    clearConversation,
  };
};
