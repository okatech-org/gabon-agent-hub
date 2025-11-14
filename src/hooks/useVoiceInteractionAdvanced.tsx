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
  energyThreshold: number;
  silenceThreshold: number;
  minSpeechDuration: number;
  preSpeechPadding: number;
  postSpeechPadding: number;
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
  setContinuousModeEnabled: (enabled: boolean) => void;
  stopSpeaking: () => void;
  clearConversation: () => void;
}

export const useVoiceInteractionAdvanced = (): UseVoiceInteractionReturn => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<VoiceInteractionMessage[]>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [silenceTimeRemaining, setSilenceTimeRemaining] = useState<number>(0);
  const [continuousMode, setContinuousMode] = useState<boolean>(false);
  const [continuousModePaused, setContinuousModePaused] = useState<boolean>(false);

  const [vadConfig, setVadConfig] = useState<VADConfig>({
    energyThreshold: 0.015,
    silenceThreshold: 800,
    minSpeechDuration: 400,
    preSpeechPadding: 300,
    postSpeechPadding: 500,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const speechStartTimeRef = useRef<number>(0);
  const lastSoundTimeRef = useRef<number>(0);
  const isSpeakingRef = useRef<boolean>(false);
  const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const sessionIdRef = useRef<string>(`session-${Date.now()}`);
  const voiceIdRef = useRef<string>('');
  const aiModelRef = useRef<'gemini' | 'gpt' | 'claude'>('claude');

  const voiceStateRef = useRef<VoiceState>('idle');
  const continuousModeRef = useRef<boolean>(false);
  const continuousModePausedRef = useRef<boolean>(false);

  const isListening = voiceState === 'listening';
  const isThinking = voiceState === 'thinking';
  const isSpeaking = voiceState === 'speaking';

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    continuousModeRef.current = continuousMode;
  }, [continuousMode]);

  useEffect(() => {
    continuousModePausedRef.current = continuousModePaused;
  }, [continuousModePaused]);

  const startVAD = useCallback(() => {
    if (!audioContextRef.current || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const energy = Math.sqrt(sum / bufferLength) / 255;

      setAudioLevel(energy * 100);

      const now = Date.now();

      if (energy > vadConfig.energyThreshold) {
        lastSoundTimeRef.current = now;
        if (!isSpeakingRef.current) {
          isSpeakingRef.current = true;
          speechStartTimeRef.current = now;
          setSilenceTimeRemaining(0);
        }
      } else if (isSpeakingRef.current) {
        const silenceDuration = now - lastSoundTimeRef.current;
        const speechDuration = now - speechStartTimeRef.current;
        setSilenceTimeRemaining(Math.max(0, vadConfig.silenceThreshold - silenceDuration));

        if (
          silenceDuration > vadConfig.silenceThreshold &&
          speechDuration > vadConfig.minSpeechDuration
        ) {
          isSpeakingRef.current = false;
          stopRecording();
        }
      }
    };

    vadIntervalRef.current = setInterval(checkAudioLevel, 50);
  }, [vadConfig]);

  const startRecording = useCallback(async () => {
    try {
      audioChunksRef.current = [];
      isSpeakingRef.current = false;
      speechStartTimeRef.current = 0;
      lastSoundTimeRef.current = 0;
      setSilenceTimeRemaining(0);
      setLiveTranscript('');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });
      streamRef.current = stream;

      audioContextRef.current = new AudioContext({ sampleRate: 48000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);

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
        await processRecording();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);

      setVoiceState('listening');
      startVAD();
      toast.success('Je vous écoute Excellence...', { duration: 2000, icon: '🎤' });
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error("Impossible d'accéder au microphone");
      setVoiceState('idle');
    }
  }, [startVAD]);
  const scheduleAutoResume = useCallback(() => {
    if (continuousModeRef.current && !continuousModePausedRef.current) {
      setTimeout(() => {
        if (
          continuousModeRef.current &&
          !continuousModePausedRef.current &&
          voiceStateRef.current === 'idle'
        ) {
          startRecording();
        }
      }, 600);
    }
  }, [startRecording]);

  const stopRecording = useCallback(() => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setAudioLevel(0);
    setSilenceTimeRemaining(0);
  }, []);

  const playAudio = useCallback(async (base64Audio: string, forceResume: boolean = false) => {
    try {
      setVoiceState('speaking');
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      audio.playbackRate = 1.0;
      audio.volume = 1.0;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setVoiceState('idle');
        audioElementRef.current = null;
        // Si iAsted pose une question ou mode continu actif, relancer l'écoute
        if (forceResume || (continuousModeRef.current && !continuousModePausedRef.current)) {
          scheduleAutoResume();
        }
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setVoiceState('idle');
        audioElementRef.current = null;
        toast.error('Erreur de lecture audio');
        if (forceResume || (continuousModeRef.current && !continuousModePausedRef.current)) {
          scheduleAutoResume();
        }
      };

      await audio.play();
    } catch (error) {
      console.error('Playback error:', error);
      setVoiceState('idle');
      audioElementRef.current = null;
      if (forceResume || (continuousModeRef.current && !continuousModePausedRef.current)) {
        scheduleAutoResume();
      }
    }
  }, [scheduleAutoResume]);

  const processRecording = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      setVoiceState('idle');
      return;
    }

    setVoiceState('thinking');
    setLiveTranscript('Transcription en cours...');

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const conversationContext = messages.slice(-3).map((m) => m.content).join(' ');
        const needsDetails = /d[ée]tail|pr[ée]cis|expliqu|comment|pourquoi/i.test(conversationContext);
        const needsSynthesis = /r[ée]sum|synth[èe]se|bref|en gros/i.test(conversationContext);

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
          },
        });

        if (error) throw error;

        const { transcript, responseText, audioContent, fileUrl, fileName, fileType, intent, documentType } = data;
        setLiveTranscript(transcript);

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

        setMessages((prev) => [...prev, userMessage, assistantMessage]);

        // Détecter si iAsted pose une question pour relancer l'écoute automatiquement
        const isQuestion = /\?|précis|détails|expliqu|comment|quelle?|quel|combien|pourquoi|souhaitez-vous|avez-vous|voulez-vous|désirez-vous/i.test(responseText);

        if (audioContent) {
          await playAudio(audioContent, isQuestion);
        } else {
          setVoiceState('idle');
          if (isQuestion || (continuousModeRef.current && !continuousModePausedRef.current)) {
            scheduleAutoResume();
          }
        }
      };
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Erreur de communication avec iAsted');
      setVoiceState('idle');
      scheduleAutoResume();
    }
  }, [messages, playAudio, scheduleAutoResume]);

  const stopSpeaking = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
      setVoiceState('idle');
      scheduleAutoResume();
    }
  }, [scheduleAutoResume]);

  const handleInteraction = useCallback(() => {
    if (voiceStateRef.current === 'idle') {
      startRecording();
    } else if (voiceStateRef.current === 'listening') {
      stopRecording();
    } else if (voiceStateRef.current === 'speaking') {
      stopSpeaking();
    }
  }, [startRecording, stopRecording, stopSpeaking]);

  const toggleContinuousPause = useCallback(() => {
    setContinuousModePaused((prev) => !prev);
  }, []);

  const setContinuousModeEnabled = useCallback((enabled: boolean) => {
    setContinuousMode(enabled);
    if (!enabled) {
      setContinuousModePaused(false);
    }
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setLiveTranscript('');
    sessionIdRef.current = `session-${Date.now()}`;
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (prefs) {
          voiceIdRef.current = prefs.voice_id || '';
          aiModelRef.current = prefs.ai_model || 'claude';
          setContinuousMode(prefs.voice_continuous_mode || false);
          if (prefs.vad_config) {
            setVadConfig(prefs.vad_config);
          }
        }
      } catch (error) {
        console.error('Preferences load error:', error);
      }
    };

    loadPreferences();
  }, []);

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
    setContinuousModeEnabled,
    stopSpeaking,
    clearConversation,
  };
};


