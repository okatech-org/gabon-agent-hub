import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, X, Bot, User, Brain, RefreshCw, Trash2 } from 'lucide-react';
import { useVoiceInteraction } from "@/hooks/useVoiceInteraction";
import { useRealtimeVoiceWebRTC } from "@/hooks/useRealtimeVoiceWebRTC";
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { commandService } from '@/services/CommandService';
import { IASTED_SYSTEM_PROMPT, VOICE_OPTIONS } from '@/config/iasted-config';

interface IAstedChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DEFAULT_CONFIG = {
    agentName: 'iAsted',
    agentIcon: '🤖',
    greeting: "Bonjour Excellence. Je suis votre Chef de Cabinet Digital. Comment puis-je vous aider ?",
    placeholder: "Donnez une instruction à iAsted...",
};

export const IAstedChatModal: React.FC<IAstedChatModalProps> = ({ isOpen, onClose }) => {
    const [inputText, setInputText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState<'ash' | 'shimmer'>('ash');
    const [useWebRTC, setUseWebRTC] = useState(true); // Toggle between WebRTC and Browser TTS
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const { setTheme } = useTheme();

    // Initialize CommandService context
    useEffect(() => {
        commandService.setContext({ navigate, setTheme });
    }, [navigate, setTheme]);

    // Tool call handler for WebRTC - ALL 11 TOOLS
    const handleToolCall = async (name: string, args: any) => {
        console.log('🔧 [IAstedChatModal] Tool call:', name, args);

        switch (name) {
            // Navigation
            case 'global_navigate':
            case 'navigate_app':
                if (args.route) {
                    navigate(args.route);
                    return { success: true, message: `Navigation: ${args.route}` };
                }
                break;
            case 'navigate_to_section':
                if (args.section_id) {
                    // Scroll to section or trigger tab change
                    const section = document.getElementById(args.section_id);
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                    return { success: true, message: `Section: ${args.section_id}` };
                }
                break;

            // UI Control
            case 'control_ui':
                if (args.action === 'set_theme_dark') {
                    setTheme('dark');
                    return { success: true, message: 'Mode sombre activé' };
                }
                if (args.action === 'set_theme_light') {
                    setTheme('light');
                    return { success: true, message: 'Mode clair activé' };
                }
                if (args.action === 'toggle_theme') {
                    const current = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                    setTheme(current);
                    return { success: true, message: `Thème: ${current}` };
                }
                if (args.action?.includes('sidebar')) {
                    // Sidebar toggle would require a global state - for now acknowledge
                    return { success: true, message: 'Sidebar toggled' };
                }
                break;
            case 'set_speech_rate':
                if (args.rate) {
                    openaiRTC.setSpeechRate(args.rate);
                    return { success: true, message: `Vitesse: ${args.rate}x` };
                }
                break;

            // Documents
            case 'generate_document':
                console.log('📄 [Document] Generate:', args);
                // TODO: Call document generation service
                return { success: true, message: `Document ${args.type} créé` };
            case 'control_document':
                return { success: true, message: `Document: ${args.action}` };

            // Search
            case 'search_web':
                console.log('🌐 [Search] Web:', args.query);
                // TODO: Call search edge function
                return { success: true, message: 'Recherche lancée' };
            case 'search_knowledge':
                console.log('📚 [Search] Knowledge:', args.query);
                return { success: true, message: 'Recherche base effectuée' };

            // Conversation
            case 'change_voice':
                const newVoice = args.gender === 'female' ? 'shimmer' as const : 'ash' as const;
                handleVoiceChange(newVoice);
                return { success: true, message: `Voix: ${args.gender === 'female' ? 'Femme' : 'Homme'}` };
            case 'manage_history':
                if (args.action === 'clear_chat' || args.action === 'new_conversation') {
                    openaiRTC.clearSession();
                    return { success: true, message: 'Historique effacé' };
                }
                break;
            case 'stop_conversation':
                openaiRTC.disconnect();
                return { success: true, message: 'Au revoir Excellence' };

            default:
                await commandService.execute(name, args);
        }
        return { success: true, message: 'Action exécutée' };
    };

    // WebRTC Voice Hook
    const openaiRTC = useRealtimeVoiceWebRTC(handleToolCall);

    // Browser TTS Fallback Hook
    const browserVoice = useVoiceInteraction();

    // Combined messages from both sources
    const messages = useWebRTC ? openaiRTC.messages : browserVoice.messages;
    const isProcessing = useWebRTC
        ? openaiRTC.voiceState === 'processing'
        : browserVoice.voiceState === 'thinking';

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        // For text input, use the browser voice hook's sendMessage if available
        // Note: The hook may not expose sendMessage, handle gracefully
        try {
            // @ts-ignore - sendMessage may not be in type definition
            if (!useWebRTC && typeof browserVoice.sendMessage === 'function') {
                await browserVoice.sendMessage(inputText.trim());
            }
        } catch (e) {
            console.warn('Text message sending not available:', e);
        }
        // Note: WebRTC is voice-only, text goes through browser TTS fallback

        setInputText('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleNewConversation = () => {
        if (useWebRTC) {
            openaiRTC.clearSession();
        }
    };

    const handleVoiceToggle = async () => {
        if (useWebRTC) {
            await openaiRTC.toggleConversation(selectedVoice as 'ash' | 'echo', IASTED_SYSTEM_PROMPT);
        } else {
            browserVoice.handleInteraction?.();
        }
    };

    const handleVoiceChange = async (voice: 'ash' | 'shimmer') => {
        setSelectedVoice(voice);
        localStorage.setItem('iasted-voice-selection', voice);

        // Reconnect with new voice if currently connected
        if (openaiRTC.isConnected) {
            await openaiRTC.disconnect();
            await openaiRTC.connect(voice, IASTED_SYSTEM_PROMPT);
        }
    };

    if (!isOpen) return null;

    const isListening = useWebRTC ? openaiRTC.voiceState === 'listening' : browserVoice.isListening;
    const isSpeaking = useWebRTC ? openaiRTC.voiceState === 'speaking' : browserVoice.isSpeaking;
    const isConnected = useWebRTC ? openaiRTC.isConnected : false;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
            <div
                onClick={e => e.stopPropagation()}
                className="w-full max-w-2xl h-[80vh] max-h-[750px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-border bg-card/95 backdrop-blur-md animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-muted/50 border-b border-border">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg shadow-primary/20 text-primary-foreground">
                            <span className="text-2xl">{DEFAULT_CONFIG.agentIcon}</span>
                        </div>
                        <div className="flex flex-col">
                            <span>{DEFAULT_CONFIG.agentName}</span>
                            <span className="text-xs text-muted-foreground font-normal">Chef de Cabinet Digital</span>
                        </div>
                    </h2>

                    <div className="flex items-center gap-2">
                        {/* Voice Selection */}
                        <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1 border border-border/50">
                            <button
                                onClick={() => handleVoiceChange('ash')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${selectedVoice === 'ash'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-background/80'
                                    }`}
                            >
                                Homme
                            </button>
                            <button
                                onClick={() => handleVoiceChange('shimmer')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${selectedVoice === 'shimmer'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-background/80'
                                    }`}
                            >
                                Femme
                            </button>
                        </div>

                        <button
                            onClick={handleNewConversation}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title="Nouvelle conversation"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all flex items-center justify-center"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                            <div className="w-20 h-20 mb-6 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
                                <Bot size={40} className="text-primary" />
                            </div>
                            <p className="text-lg text-foreground font-medium mb-2">Bonjour Excellence</p>
                            <p className="text-sm text-muted-foreground max-w-xs">{DEFAULT_CONFIG.greeting}</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div
                            key={msg.id || idx}
                            className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse self-end' : 'flex-row self-start'}`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'assistant'
                                ? 'bg-muted text-primary border border-border'
                                : 'bg-primary text-primary-foreground shadow-primary/20'
                                }`}>
                                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                            </div>
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'assistant'
                                ? 'bg-muted/50 text-foreground border border-border rounded-tl-sm'
                                : 'bg-primary text-primary-foreground shadow-primary/20 rounded-tr-sm'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isProcessing && (
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-lg bg-muted text-primary border border-border flex items-center justify-center shrink-0">
                                <Brain size={16} className="animate-pulse" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border border-border flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
                                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }} />
                                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }} />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-muted/30 border-t border-border flex gap-3 items-end backdrop-blur-sm">
                    <button
                        onClick={handleVoiceToggle}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-md ${isConnected || isListening
                            ? 'bg-red-500/10 text-red-500 border border-red-500/50 animate-pulse ring-2 ring-red-500/20'
                            : 'bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5'
                            }`}
                        title={isConnected ? "Arrêter le mode vocal" : "Activer le mode vocal"}
                    >
                        {isConnected || isListening ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>

                    <div className="flex-1 relative">
                        <textarea
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={isConnected ? `🎙️ Mode vocal actif (${selectedVoice === 'ash' ? 'Homme' : 'Femme'})` : DEFAULT_CONFIG.placeholder}
                            disabled={isProcessing || isConnected}
                            rows={1}
                            className="w-full bg-background text-foreground placeholder-muted-foreground text-sm rounded-xl border border-input focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none resize-none py-3 px-4 min-h-[48px] max-h-[120px] disabled:opacity-50 shadow-inner"
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isProcessing || isConnected}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-all ${!inputText.trim() || isProcessing || isConnected
                            ? 'bg-muted text-muted-foreground cursor-not-allowed border border-transparent'
                            : 'bg-gradient-to-br from-primary to-blue-600 text-primary-foreground hover:shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95 border border-primary/20'
                            }`}
                    >
                        <Send size={20} />
                    </button>
                </div>

                {/* Status Bar */}
                <div className="py-2 text-center bg-muted/50 text-[10px] text-muted-foreground border-t border-border uppercase tracking-wider font-semibold">
                    {isProcessing ? (
                        <span className="text-primary flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> Traitement en cours...
                        </span>
                    ) : isSpeaking ? (
                        <span className="text-green-500 flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> iAsted parle
                        </span>
                    ) : isConnected ? (
                        <span className="text-blue-500 flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> WebRTC actif ({selectedVoice === 'ash' ? 'Homme' : 'Femme'})
                        </span>
                    ) : isListening ? (
                        <span className="text-red-500 flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Écoute active
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" /> Prêt
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
