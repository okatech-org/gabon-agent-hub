import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send, BarChart3, FileText, Users } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function IastedChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickActions = [
    { 
      label: 'Analyse des effectifs', 
      icon: Users,
      prompt: 'Donne-moi une analyse détaillée des effectifs de la fonction publique avec les tendances et recommandations.' ,
      action: 'effectifs'
    },
    { 
      label: 'État des actes', 
      icon: FileText,
      prompt: 'Quel est l\'état actuel des actes administratifs en attente de validation ?',
      action: 'actes'
    },
    { 
      label: 'Simulation départs retraite', 
      icon: BarChart3,
      prompt: 'Simule l\'impact des départs à la retraite sur les 5 prochaines années et propose des solutions.',
      action: 'effectifs'
    },
  ];

  const sendMessage = async (messageText: string, action?: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('iasted-agent', {
        body: { 
          query: messageText,
          action: action || 'general',
          context: 'Ministre de la Fonction Publique - Gabon'
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Error calling iAsted:', error);
      toast.error(error.message || 'Erreur lors de la communication avec iAsted');
      
      // Message d'erreur de l'assistant
      const errorMessage: Message = {
        role: 'assistant',
        content: "Désolé, je rencontre une difficulté technique. Veuillez réessayer dans un instant.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Actions rapides */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={() => sendMessage(action.prompt, action.action)}
            disabled={isLoading}
            className="gap-2"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-muted/30">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg font-medium mb-2">Bonjour Excellence,</p>
            <p>Je suis iAsted, votre assistant IA. Comment puis-je vous aider aujourd'hui ?</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card
              className={`max-w-[80%] p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <Badge variant={message.role === 'user' ? 'secondary' : 'default'}>
                  {message.role === 'user' ? 'Vous' : 'iAsted'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] p-4 bg-card">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  iAsted analyse votre demande...
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Posez votre question à iAsted... (Shift+Enter pour nouvelle ligne)"
          className="min-h-[60px]"
          disabled={isLoading}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          size="icon"
          className="h-[60px] w-[60px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
