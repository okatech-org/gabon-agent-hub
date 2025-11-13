import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, Send, BarChart3, FileText, Users, 
  DollarSign, FileCheck, Bell, 
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
      <div className="space-y-4 mb-6">
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
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.prompt, action.action)}
                    disabled={isLoading}
                    className="neu-button text-sm px-3 py-2 flex items-center gap-2"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="neu-inset flex-1 overflow-y-auto space-y-4 mb-4 p-4 rounded-xl">
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
            <div
              className={`max-w-[80%] p-4 rounded-xl ${
                message.role === 'user'
                  ? 'neu-raised bg-primary text-primary-foreground'
                  : 'neu-card'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className={`neu-raised text-xs px-2 py-1 rounded-full font-medium ${
                  message.role === 'user' ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                }`}>
                  {message.role === 'user' ? 'Vous' : 'iAsted'}
                </span>
                <span className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="neu-card max-w-[80%] p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  iAsted analyse votre demande...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
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
          className="neu-inset min-h-[60px] resize-none"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          className="neu-button neu-button-admin h-[60px] w-[60px] flex items-center justify-center flex-shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
