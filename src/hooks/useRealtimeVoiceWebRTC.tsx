import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { IASTED_TOOLS } from '@/config/iasted-config';

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'processing';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface UseRealtimeVoiceWebRTC {
    isConnected: boolean;
    isConnecting: boolean;
    voiceState: VoiceState;
    messages: Message[];
    audioLevel: number;
    speechRate: number;
    setSpeechRate: (rate: number) => void;
    connect: (voice?: 'echo' | 'ash' | 'shimmer', systemPrompt?: string) => Promise<void>;
    disconnect: () => Promise<void>;
    toggleConversation: (voice?: 'echo' | 'ash', systemPrompt?: string) => Promise<void>;
    clearSession: () => void;
}

export const useRealtimeVoiceWebRTC = (
    onToolCall?: (name: string, args: any) => Promise<{ success: boolean; message: string } | void>
): UseRealtimeVoiceWebRTC => {
    const [isConnected, setIsConnected] = useState(false);
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [audioLevel, setAudioLevel] = useState(0);
    const [speechRate, setSpeechRate] = useState(1.0);
    const [pendingVoiceChange, setPendingVoiceChange] = useState<string | null>(null);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
    const audioElRef = useRef<HTMLAudioElement | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const isConnectingRef = useRef(false);
    const systemPromptRef = useRef<string>('');
    const currentTranscriptRef = useRef<string>('');
    const speechRateRef = useRef(speechRate);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        speechRateRef.current = speechRate;
    }, [speechRate]);

    const applyPlaybackRate = useCallback((rate: number) => {
        if (audioElRef.current) {
            audioElRef.current.playbackRate = rate;
        }
    }, []);

    const startAudioAnalysis = useCallback((stream: MediaStream, audioContext: AudioContext) => {
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const analyzeLevel = () => {
            if (!analyserRef.current) return;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            setAudioLevel(Math.round((avg / 255) * 100));
            animationFrameRef.current = requestAnimationFrame(analyzeLevel);
        };
        analyzeLevel();
    }, []);

    const stopAudioAnalysis = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        setAudioLevel(0);
    }, []);

    const handleDataChannelMessage = useCallback(async (event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'session.created':
                    console.log('✅ [WebRTC] Session created');
                    setVoiceState('listening');
                    break;

                case 'input_audio_buffer.speech_started':
                    console.log('🎤 [WebRTC] User speaking');
                    setVoiceState('listening');
                    break;

                case 'input_audio_buffer.speech_stopped':
                    console.log('🛑 [WebRTC] User stopped speaking');
                    setVoiceState('processing');
                    break;

                case 'response.audio_transcript.delta':
                    currentTranscriptRef.current += data.delta || '';
                    break;

                case 'response.audio_transcript.done':
                    if (currentTranscriptRef.current) {
                        setMessages(prev => [...prev, {
                            id: `assistant-${Date.now()}`,
                            role: 'assistant',
                            content: currentTranscriptRef.current,
                            timestamp: new Date()
                        }]);
                        currentTranscriptRef.current = '';
                    }
                    break;

                case 'response.audio.delta':
                    setVoiceState('speaking');
                    break;

                case 'response.done':
                    console.log('✅ [WebRTC] Response complete');
                    setVoiceState('listening');
                    break;

                case 'conversation.item.input_audio_transcription.completed':
                    if (data.transcript) {
                        setMessages(prev => [...prev, {
                            id: `user-${Date.now()}`,
                            role: 'user',
                            content: data.transcript,
                            timestamp: new Date()
                        }]);
                    }
                    break;

                case 'response.function_call_arguments.done':
                    const functionName = data.name;
                    const args = JSON.parse(data.arguments || '{}');
                    console.log('🔧 [WebRTC] Tool call:', functionName, args);

                    let toolResult = { success: true, message: "Action exécutée" };

                    if (onToolCall) {
                        try {
                            const executionResult = await onToolCall(functionName, args);
                            if (executionResult && typeof executionResult === 'object' && 'success' in executionResult) {
                                toolResult = executionResult;
                            }
                        } catch (error: any) {
                            console.error('❌ [WebRTC] Tool execution error:', error);
                            toolResult = { success: false, message: error.message || "Erreur d'exécution" };
                        }
                    }

                    // Send tool result back to AI
                    const toolOutput = {
                        type: 'conversation.item.create',
                        item: {
                            type: 'function_call_output',
                            call_id: data.call_id,
                            output: JSON.stringify(toolResult)
                        }
                    };
                    dcRef.current?.send(JSON.stringify(toolOutput));
                    dcRef.current?.send(JSON.stringify({ type: 'response.create' }));
                    break;

                case 'error':
                    console.error('❌ [WebRTC] Error:', data.error);
                    toast({
                        title: 'Erreur',
                        description: data.error?.message || 'Une erreur est survenue',
                        variant: 'destructive',
                    });
                    break;
            }
        } catch (error) {
            console.error('❌ [WebRTC] Message processing error:', error);
        }
    }, [toast, onToolCall]);

    const connect = useCallback(async (voice: 'echo' | 'ash' | 'shimmer' = 'ash', systemPrompt?: string) => {
        if (systemPrompt) {
            systemPromptRef.current = systemPrompt;
        }

        if (pcRef.current || isConnectingRef.current) {
            console.log('⚠️ [WebRTC] Connection already in progress');
            return;
        }

        isConnectingRef.current = true;

        try {
            console.log('🔌 [WebRTC] Connecting...');
            setVoiceState('connecting');

            // Get ephemeral token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Non authentifié");
            }

            const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-realtime-token', {
                headers: { Authorization: `Bearer ${session.access_token}` },
                body: { voice, systemPrompt: systemPromptRef.current }
            });

            if (tokenError || !tokenData?.client_secret?.value) {
                throw new Error('Failed to get token: ' + (tokenError?.message || 'No data'));
            }

            const EPHEMERAL_KEY = tokenData.client_secret.value;
            console.log('✅ [WebRTC] Token obtained');

            // Create peer connection
            pcRef.current = new RTCPeerConnection();

            // Setup remote audio
            if (!audioElRef.current) {
                audioElRef.current = document.createElement("audio");
                audioElRef.current.autoplay = true;
            }

            pcRef.current.ontrack = (e) => {
                console.log('🎵 [WebRTC] Audio track received');
                if (audioElRef.current) {
                    audioElRef.current.srcObject = e.streams[0];
                    applyPlaybackRate(speechRateRef.current);
                }
            };

            // Add local audio track
            const ms = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 24000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            pcRef.current.addTrack(ms.getTracks()[0]);

            // Start audio analysis
            const ac = new AudioContext();
            startAudioAnalysis(ms, ac);

            // Setup data channel
            dcRef.current = pcRef.current.createDataChannel("oai-events");
            dcRef.current.addEventListener("message", handleDataChannelMessage);

            dcRef.current.addEventListener("open", () => {
                console.log('📡 [WebRTC] Data channel open');

                // Configure session with ALL tools and optimized VAD
                const event = {
                    type: 'session.update',
                    session: {
                        modalities: ['text', 'audio'],
                        instructions: systemPromptRef.current || `Tu es iAsted. Réponses ultra-courtes (3-5 mots). Agis immédiatement.`,
                        voice: voice,
                        input_audio_transcription: { model: 'whisper-1' },
                        // Optimized VAD for faster response
                        turn_detection: {
                            type: 'server_vad',
                            threshold: 0.4,
                            prefix_padding_ms: 200,
                            silence_duration_ms: 400
                        },
                        tools: IASTED_TOOLS as any[]
                    }
                };
                dcRef.current?.send(JSON.stringify(event));

                // Trigger initial greeting
                setTimeout(() => {
                    if (dcRef.current?.readyState === 'open') {
                        dcRef.current.send(JSON.stringify({
                            type: 'response.create',
                            response: {
                                modalities: ['text', 'audio'],
                                instructions: "Saluez immédiatement l'utilisateur de manière brève et professionnelle."
                            }
                        }));
                    }
                }, 1000);
            });

            // Create and send offer
            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);

            const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`, {
                method: "POST",
                body: offer.sdp,
                headers: {
                    Authorization: `Bearer ${EPHEMERAL_KEY}`,
                    "Content-Type": "application/sdp"
                },
            });

            if (!sdpResponse.ok) {
                throw new Error(`OpenAI connection failed: ${sdpResponse.status}`);
            }

            const answer: RTCSessionDescriptionInit = {
                type: "answer",
                sdp: await sdpResponse.text(),
            };

            await pcRef.current.setRemoteDescription(answer);
            console.log('✅ [WebRTC] Connected');

            setIsConnected(true);
            isConnectingRef.current = false;

            toast({ title: 'Connecté', description: 'iAsted est prêt à vous écouter' });

        } catch (error) {
            console.error('❌ [WebRTC] Connection error:', error);
            setVoiceState('idle');

            if (pcRef.current) {
                pcRef.current.close();
                pcRef.current = null;
            }

            isConnectingRef.current = false;

            toast({
                title: 'Erreur de connexion',
                description: error instanceof Error ? error.message : 'Impossible de se connecter',
                variant: 'destructive',
            });
        }
    }, [handleDataChannelMessage, toast, startAudioAnalysis, applyPlaybackRate]);

    const disconnect = useCallback(async () => {
        console.log('🔌 [WebRTC] Disconnecting...');

        if (recorderRef.current) {
            recorderRef.current.stop();
            recorderRef.current = null;
        }

        if (dcRef.current) {
            dcRef.current.close();
            dcRef.current = null;
        }

        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }

        if (audioElRef.current) {
            audioElRef.current.srcObject = null;
        }

        stopAudioAnalysis();
        setIsConnected(false);
        setVoiceState('idle');
        currentTranscriptRef.current = '';

        await new Promise(resolve => setTimeout(resolve, 300));
    }, [stopAudioAnalysis]);

    useEffect(() => {
        if (pendingVoiceChange && !isConnectingRef.current) {
            const voice = pendingVoiceChange as 'echo' | 'ash' | 'shimmer';
            setPendingVoiceChange(null);

            const performVoiceChange = async () => {
                await disconnect();
                setTimeout(() => connect(voice, systemPromptRef.current), 500);
            };

            performVoiceChange();
        }
    }, [pendingVoiceChange, disconnect, connect]);

    const toggleConversation = useCallback(async (voice: 'echo' | 'ash' = 'ash', systemPrompt?: string) => {
        if (isConnected) {
            await disconnect();
        } else {
            await connect(voice, systemPrompt);
        }
    }, [isConnected, connect, disconnect]);

    return {
        isConnecting: voiceState === 'connecting',
        voiceState,
        messages,
        isConnected,
        audioLevel,
        speechRate,
        setSpeechRate: (rate: number) => {
            const clampedRate = Math.max(0.5, Math.min(2.0, rate));
            setSpeechRate(clampedRate);
            if (audioElRef.current) {
                audioElRef.current.playbackRate = clampedRate;
            }
        },
        connect,
        disconnect,
        toggleConversation,
        clearSession: () => setMessages([]),
    };
};
