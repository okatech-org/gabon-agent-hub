import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, Send, X, Minimize2, Maximize2,
  BarChart3, FileText, Users, 
  DollarSign, FileCheck, Bell, 
  GraduationCap, History, AlertTriangle
} from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface IAstedInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IAstedInterface({ isOpen, onClose }: IAstedInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { 
      label: 'Économie & Finances', 
      icon: DollarSign,
      prompt: 'Excellence, donnez-moi une analyse de la masse salariale de la fonction publique et son impact budgétaire.',
      category: 'ÉCONOMIE'
    },
    { 
      label: 'Analyse Effectifs', 
      icon: Users,
      prompt: 'Excellence, fournissez-moi une analyse détaillée des effectifs avec répartition par corps, provinces et catégories.',
      category: 'RH'
    },
    { 
      label: 'État des Actes', 
      icon: FileCheck,
      prompt: 'Excellence, quel est l\'état des actes administratifs en attente de validation ?',
      category: 'DOCUMENTS'
    },
    { 
      label: 'Simulation Réforme', 
      icon: BarChart3,
      prompt: 'Excellence, simulez l\'impact d\'un gel des recrutements pendant 3 ans.',
      category: 'STRATÉGIE'
    },
  ];

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('iasted-agent', {
        body: { 
          query: textToSend,
          context: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || "Désolé Excellence, je n'ai pas pu traiter cette demande.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Erreur de communication avec iAsted");
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "Excellence, je rencontre un problème technique. Veuillez réessayer.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed right-6 bottom-24 z-[9998] transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-[500px] h-[700px]'
    }`}>
      <div className="neu-card h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="neu-raised w-10 h-10 flex items-center justify-center">
              <span className="text-sm font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                iA
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">iAsted</h3>
              <p className="text-xs text-muted-foreground">Assistant IA Ministériel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="neu-raised w-8 h-8 flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="neu-raised w-8 h-8 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="neu-raised w-20 h-20 flex items-center justify-center">
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      iA
                    </span>
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="font-semibold text-lg">Excellence, comment puis-je vous assister ?</h4>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Je suis votre copilote décisionnel pour la gestion de la Fonction publique gabonaise.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action.prompt)}
                          className="neu-card-sm p-3 text-left hover:scale-[1.02] transition-transform"
                        >
                          <div className="flex items-start gap-2">
                            <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs font-medium">{action.label}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{action.category}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] ${
                          message.role === 'user'
                            ? 'neu-card-sm p-3 bg-gradient-to-r from-primary/10 to-secondary/10'
                            : 'neu-inset p-3'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className="text-[10px] text-muted-foreground mt-2">
                          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="neu-inset p-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Excellence, posez votre question..."
                  className="neu-inset border-0 resize-none min-h-[60px]"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="neu-button neu-button-admin px-4 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
