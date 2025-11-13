import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, Send, BarChart3, FileText, Users, 
  DollarSign, ClipboardList, FileCheck, Bell, 
  GraduationCap, History, AlertTriangle
} from "lucide-react";

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
    // ÉCONOMIE & FINANCES
    { 
      label: 'Économie & Finances', 
      icon: DollarSign,
      prompt: 'Donne-moi une analyse de la masse salariale de la fonction publique et son impact budgétaire. Propose des optimisations possibles.',
      action: 'economie',
      category: 'ÉCONOMIE & FINANCES'
    },
    
    // ACTIONS & GESTION - Actions Ministérielles
    { 
      label: 'Documents', 
      icon: FileText,
      prompt: 'Liste les types de documents ministériels disponibles (Arrêté, Circulaire, Instruction, Note de Service, Décision, Rapport, Communiqué, Réponse Ministérielle, Projet de Loi, Projet d\'Ordonnance, Projet de Décret).',
      action: 'documents',
      category: 'ACTIONS MINISTÉRIELLES'
    },
    { 
      label: 'Réglementations', 
      icon: FileCheck,
      prompt: 'Donne-moi un aperçu des réglementations en vigueur et des projets de textes en préparation dans le domaine de la fonction publique.',
      action: 'reglementations',
      category: 'ACTIONS MINISTÉRIELLES'
    },
    { 
      label: 'Notifications', 
      icon: Bell,
      prompt: 'Quelles sont les notifications et alertes importantes qui nécessitent mon attention ?',
      action: 'notifications',
      category: 'ACTIONS MINISTÉRIELLES'
    },
    
    // ACTIONS & GESTION - Autres
    { 
      label: 'Formations', 
      icon: GraduationCap,
      prompt: 'Quel est l\'état actuel des programmes de formation continue pour les agents de la fonction publique ? Identifie les besoins prioritaires.',
      action: 'formations',
      category: 'ACTIONS & GESTION'
    },
    { 
      label: 'Historique', 
      icon: History,
      prompt: 'Montre-moi l\'historique des principales décisions et réformes des 12 derniers mois avec leurs impacts.',
      action: 'historique',
      category: 'ACTIONS & GESTION'
    },
    { 
      label: 'Alertes', 
      icon: AlertTriangle,
      prompt: 'Quelles sont les alertes critiques en cours ? Donne-moi les anomalies détectées et les actions urgentes à prendre.',
      action: 'alertes',
      category: 'ACTIONS & GESTION'
    },
    
    // VUE GLOBALE MINISTÈRE
    { 
      label: 'Analyse des effectifs', 
      icon: Users,
      prompt: 'Donne-moi une analyse détaillée des effectifs de la fonction publique avec répartition par corps, provinces et catégories. Identifie les provinces à risque pour les départs à la retraite dans les 5 prochaines années.',
      action: 'effectifs',
      category: 'VUE GLOBALE'
    },
    { 
      label: 'État des actes', 
      icon: FileText,
      prompt: 'Quel est l\'état actuel des actes administratifs en attente de validation ? Donne-moi un résumé par type d\'acte et les impacts chiffrés.',
      action: 'actes',
      category: 'VUE GLOBALE'
    },
    { 
      label: 'Simulation réforme', 
      icon: BarChart3,
      prompt: 'Simule l\'impact d\'un gel des recrutements de catégorie A pendant 3 ans sur la continuité du service public. Analyse les effets sur les effectifs, la pyramide des âges et propose des solutions alternatives.',
      action: 'simulation',
      category: 'VUE GLOBALE'
    },
    {
      label: 'Pyramide des âges',
      icon: Users,
      prompt: 'Analyse la pyramide des âges de la fonction publique et identifie les pics de départs à la retraite prévus. Quelles sont les directions les plus impactées ?',
      action: 'effectifs',
      category: 'VUE GLOBALE'
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
      {/* Actions rapides par catégorie */}
      <div className="space-y-4 mb-4">
        {['ÉCONOMIE & FINANCES', 'ACTIONS MINISTÉRIELLES', 'ACTIONS & GESTION', 'VUE GLOBALE'].map((category) => {
          const categoryActions = quickActions.filter(a => a.category === category);
          if (categoryActions.length === 0) return null;
          
          return (
            <div key={category} className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </h4>
              <div className="flex gap-2 flex-wrap">
                {categoryActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(action.prompt, action.action)}
                    disabled={isLoading}
                    className="gap-2 neu-button"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
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
