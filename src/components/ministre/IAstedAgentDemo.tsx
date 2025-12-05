import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useRealtimeVoiceWebRTC } from '@/hooks/useRealtimeVoiceWebRTC';
import { IASTED_SYSTEM_PROMPT, VOICE_OPTIONS, MINISTER_ROUTES } from '@/config/iasted-config';
import { Mic, MicOff, Send, X, Bot, User, Brain, Moon, Sun, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// 🤖 iAsted - Agent IA du Ministre de la Fonction Publique
// ============================================================================

const DEFAULT_CONFIG = {
  agentName: 'iAsted',
  agentIcon: '🇬🇦',
  greeting: "Bonjour Excellence. Je suis iAsted, votre Chef de Cabinet Digital. Comment puis-je vous assister ?",
  placeholder: "Posez votre question, Excellence...",
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface IAstedAgentDemoProps {
  onToolCall?: (name: string, args: any) => Promise<{ success: boolean; message: string } | void>;
  className?: string;
}

export default function IAstedAgentDemo({ onToolCall, className }: IAstedAgentDemoProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: DEFAULT_CONFIG.greeting, timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'ash' | 'shimmer'>('ash');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tool call handler
  const handleToolCall = async (name: string, args: any) => {
    console.log('🛠️ Tool called:', name, args);
    
    switch (name) {
      case 'global_navigate':
        if (args.route) {
          navigate(args.route);
          return { success: true, message: `Navigation vers ${args.route}` };
        }
        break;
      case 'control_ui':
        if (args.action === 'set_theme_dark') {
          setTheme('dark');
          return { success: true, message: 'Mode sombre activé' };
        } else if (args.action === 'set_theme_light') {
          setTheme('light');
          return { success: true, message: 'Mode clair activé' };
        } else if (args.action === 'toggle_theme') {
          setTheme(theme === 'dark' ? 'light' : 'dark');
          return { success: true, message: 'Thème changé' };
        }
        break;
      case 'change_voice':
        if (args.gender === 'male') {
          setSelectedVoice('ash');
          return { success: true, message: 'Voix masculine activée' };
        } else if (args.gender === 'female') {
          setSelectedVoice('shimmer');
          return { success: true, message: 'Voix féminine activée' };
        }
        break;
      case 'stop_conversation':
        webrtc.disconnect();
        return { success: true, message: 'Conversation terminée' };
    }
    
    if (onToolCall) {
      return onToolCall(name, args);
    }
    
    return { success: false, message: 'Outil non implémenté' };
  };

  // WebRTC Voice Hook
  const webrtc = useRealtimeVoiceWebRTC(handleToolCall);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, webrtc.messages]);

  const handleVoiceToggle = async () => {
    if (webrtc.isConnected) {
      await webrtc.disconnect();
    } else {
      await webrtc.connect(selectedVoice, IASTED_SYSTEM_PROMPT);
    }
  };

  const handleDoubleClick = () => {
    setIsOpen(true);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    // Simulated response for demo (in real implementation, would call edge function)
    setTimeout(() => {
      const responses = [
        "Bien compris Excellence. Je m'en occupe immédiatement.",
        "C'est fait, Excellence. Y a-t-il autre chose ?",
        "Je prépare cela pour vous, Excellence.",
        "À votre service, Monsieur le Ministre.",
      ];
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      }]);
      setIsProcessing(false);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getButtonIcon = () => {
    if (webrtc.voiceState === 'listening') return <Mic className="w-8 h-8 animate-pulse" />;
    if (webrtc.voiceState === 'speaking') return <Volume2 className="w-8 h-8 animate-pulse" />;
    if (webrtc.voiceState === 'processing') return <Brain className="w-8 h-8 animate-spin" />;
    return <span className="text-3xl">{DEFAULT_CONFIG.agentIcon}</span>;
  };

  const getStateLabel = () => {
    switch(webrtc.voiceState) {
      case 'listening': return '🎤 Écoute...';
      case 'processing': return '🧠 Réflexion...';
      case 'speaking': return '💬 Parle...';
      case 'connecting': return '🔄 Connexion...';
      default: return webrtc.isConnected ? '✅ Prêt' : '⚪ Inactif';
    }
  };

  const allMessages = [...messages, ...webrtc.messages.map(m => ({
    ...m,
    timestamp: m.timestamp || new Date()
  }))].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className={cn("flex flex-col items-center justify-center gap-8", className)}>
      {/* Spherical Voice Button */}
      <button 
        onClick={handleVoiceToggle}
        onDoubleClick={handleDoubleClick}
        className={cn(
          "relative w-32 h-32 rounded-full border-none cursor-pointer transition-all duration-500 ease-out",
          "focus:outline-none focus:ring-4 focus:ring-primary/30",
          webrtc.voiceState === 'listening' && "scale-105",
          webrtc.voiceState === 'speaking' && "scale-110",
          webrtc.voiceState === 'processing' && "animate-pulse",
        )}
        style={{
          background: webrtc.voiceState === 'listening' 
            ? 'radial-gradient(circle at 30% 30%, rgba(34,197,94,0.3), rgba(34,197,94,0.6), hsl(var(--primary)))'
            : webrtc.voiceState === 'speaking'
            ? 'radial-gradient(circle at 30% 30%, rgba(0,170,255,0.3), rgba(0,102,255,0.6), hsl(var(--primary)))'
            : 'radial-gradient(circle at 30% 30%, hsl(var(--primary)/0.4), hsl(var(--primary)/0.7), hsl(var(--primary)))',
          boxShadow: webrtc.isConnected
            ? '0 0 50px hsl(var(--primary)/0.5), 0 0 100px hsl(var(--primary)/0.3), 0 10px 30px rgba(0,0,0,0.3)'
            : '0 0 30px hsl(var(--primary)/0.3), 0 10px 30px rgba(0,0,0,0.2), inset 0 -5px 20px rgba(0,0,0,0.2), inset 0 5px 20px rgba(255,255,255,0.2)',
        }}
      >
        {/* Shine layer */}
        <div className="absolute inset-[10%] rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
        
        {/* Audio level ring */}
        {webrtc.isConnected && webrtc.audioLevel > 0 && (
          <div 
            className="absolute inset-0 rounded-full border-4 border-primary/50 animate-ping"
            style={{ 
              transform: `scale(${1 + webrtc.audioLevel * 0.3})`,
              opacity: webrtc.audioLevel 
            }}
          />
        )}
        
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center z-10 text-white font-bold">
          {getButtonIcon()}
        </div>
      </button>

      {/* State Label */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          {getStateLabel()}
        </p>
        <p className="text-muted-foreground/60 text-xs mt-2">
          Clic = Mode vocal | Double-clic = Chat
        </p>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl w-full max-w-2xl h-[70vh] max-h-[600px] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xl">
                  {DEFAULT_CONFIG.agentIcon}
                </div>
                {DEFAULT_CONFIG.agentName}
              </h2>
              
              <div className="flex gap-3 items-center">
                {/* Voice Selector */}
                <div className="flex bg-muted rounded-lg p-1 gap-1">
                  <button 
                    onClick={() => setSelectedVoice('ash')}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      selectedVoice === 'ash' 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Homme
                  </button>
                  <button 
                    onClick={() => setSelectedVoice('shimmer')}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      selectedVoice === 'shimmer' 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Femme
                  </button>
                </div>

                {/* Theme Toggle */}
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-9 h-9 rounded-lg bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-lg bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {allMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === 'user' ? "self-end flex-row-reverse" : "self-start"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === 'assistant' 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'assistant' 
                      ? "bg-muted text-foreground rounded-bl-sm" 
                      : "bg-primary text-primary-foreground rounded-br-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isProcessing && (
                <div className="flex gap-3 max-w-[85%] self-start">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex gap-1 px-4 py-3 bg-muted rounded-2xl rounded-bl-sm">
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border flex gap-3 items-end bg-muted/20">
              {/* Voice Button */}
              <button 
                onClick={handleVoiceToggle}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
                  webrtc.isConnected 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-primary hover:bg-muted/80"
                )}
              >
                {webrtc.isConnected ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              {/* Text Input */}
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={DEFAULT_CONFIG.placeholder}
                disabled={isProcessing}
                rows={1}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground text-sm resize-none min-h-[48px] max-h-[120px] outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
              />
              
              {/* Send Button */}
              <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isProcessing}
                className={cn(
                  "w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 transition-all",
                  (!inputText.trim() || isProcessing) && "opacity-50 cursor-not-allowed"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Status Bar */}
            <div className="text-center py-2 text-xs text-muted-foreground bg-muted/10">
              {isProcessing ? '🧠 Réflexion...' : webrtc.isConnected ? `🎙️ Mode vocal (${selectedVoice === 'ash' ? 'Homme' : 'Femme'})` : '💬 Chat textuel'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
