import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, History, Settings, Mic, Sparkles, FileText, Zap } from "lucide-react";
import { useVoiceInteractionAdvanced } from "@/hooks/useVoiceInteractionAdvanced";
import { VoiceSelector } from "@/components/ministre/VoiceSelector";
import { GeneratedDocument, DocumentList, InlineDocumentPreview } from "@/components/ministre/GeneratedDocument";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface VoiceSettings {
  voiceId: string;
  silenceDuration: number;
  silenceThreshold: number;
  continuousMode: boolean;
  thinkingTime: 'auto' | 'fast' | 'balanced' | 'thorough';
  responseMode: 'auto' | 'concise' | 'detailed' | 'conversational';
  aiModel: 'gemini' | 'gpt' | 'claude';
  formalityLevel: 'formal' | 'balanced' | 'casual';
  proactivity: 'low' | 'medium' | 'high';
}

export default function IAstedAdvanced() {
  const { user } = useAuth();
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voiceId: '',
    silenceDuration: 800,
    silenceThreshold: 10,
    continuousMode: false,
    thinkingTime: 'balanced',
    responseMode: 'auto',
    aiModel: 'claude', // Claude par défaut
    formalityLevel: 'formal',
    proactivity: 'medium',
  });

  const {
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
  } = useVoiceInteractionAdvanced();

  // Charger la voix iAsted au montage
  useEffect(() => {
    const loadIAstedVoice = async () => {
      try {
        const { data: voicesData, error } = await supabase.functions.invoke('list-voices');
        
        if (!error && voicesData?.voices) {
          const iastedVoice = voicesData.voices.find(
            (voice: any) => voice.name.toLowerCase() === 'iasted'
          );
          
          if (iastedVoice) {
            console.log('✅ Voix iAsted chargée:', iastedVoice.voice_id);
            setVoiceSettings(prev => ({
              ...prev,
              voiceId: iastedVoice.voice_id
            }));
          }
        }
      } catch (error) {
        console.error('Erreur chargement voix:', error);
      }
    };

    loadIAstedVoice();
  }, []);

  // Charger les préférences utilisateur
  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setVoiceSettings(prev => ({
          ...prev,
          voiceId: data.voice_id || prev.voiceId,
          silenceDuration: data.voice_silence_duration || prev.silenceDuration,
          silenceThreshold: data.voice_silence_threshold || prev.silenceThreshold,
          continuousMode: data.voice_continuous_mode || prev.continuousMode,
          thinkingTime: data.thinking_time || prev.thinkingTime,
          responseMode: data.response_mode || prev.responseMode,
          aiModel: data.ai_model || prev.aiModel,
          formalityLevel: data.formality_level || prev.formalityLevel,
          proactivity: data.proactivity || prev.proactivity,
        }));
      }
    };

    loadPreferences();
  }, [user]);

  // Sauvegarder les préférences quand elles changent
  useEffect(() => {
    if (!user) return;

    const savePreferences = async () => {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          voice_id: voiceSettings.voiceId,
          voice_silence_duration: voiceSettings.silenceDuration,
          voice_silence_threshold: voiceSettings.silenceThreshold,
          voice_continuous_mode: voiceSettings.continuousMode,
          thinking_time: voiceSettings.thinkingTime,
          response_mode: voiceSettings.responseMode,
          ai_model: voiceSettings.aiModel,
          formality_level: voiceSettings.formalityLevel,
          proactivity: voiceSettings.proactivity,
        }, {
          onConflict: 'user_id'
        });
    };

    const debounce = setTimeout(savePreferences, 1000);
    return () => clearTimeout(debounce);
  }, [voiceSettings, user]);

  // Extraire les documents générés
  const generatedDocuments = messages
    .filter(m => m.fileUrl)
    .map(m => ({
      fileUrl: m.fileUrl!,
      fileName: m.fileName || 'document.pdf',
      fileType: m.fileType || 'pdf' as const,
      timestamp: m.timestamp,
      documentType: m.documentType,
    }));

  return (
    <div className="min-h-screen w-full p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="neu-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="neu-raised w-16 h-16 flex items-center justify-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  iA
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">iAsted</h1>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                    Optimisé Claude
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">
                  Assistant IA Vocal avec Génération de Documents
                </p>
              </div>
            </div>
            
            {/* Indicateur de statut */}
            <div className="flex items-center gap-3">
              {isListening && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-primary">Écoute...</span>
                </div>
              )}
              {isThinking && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10">
                  <Zap className="w-4 h-4 text-secondary animate-pulse" />
                  <span className="text-sm font-medium text-secondary">Réflexion...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium text-success">Parle...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid w-full grid-cols-4 neu-card p-1">
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span>Vocal</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
              {generatedDocuments.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                  {generatedDocuments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>Historique</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Vocal */}
          <TabsContent value="voice" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Interface Vocale */}
              <Card className="neu-card">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[500px]">
                  {/* Bouton Micro */}
                  <button
                    onClick={handleInteraction}
                    disabled={isThinking}
                    className={`
                      relative w-32 h-32 rounded-full transition-all duration-300
                      ${isListening 
                        ? 'neu-pressed scale-95' 
                        : 'neu-raised hover:scale-105'}
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {isListening && (
                      <div 
                        className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
                        style={{ animationDuration: '1.5s' }}
                      />
                    )}
                    
                    <div className="relative z-10 flex items-center justify-center h-full">
                      <Mic className={`w-12 h-12 ${isListening ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>

                    {isListening && audioLevel > 0 && (
                      <div 
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 h-2 bg-primary rounded-full transition-all"
                        style={{ width: `${audioLevel}%` }}
                      />
                    )}
                  </button>

                  {/* État & Transcript */}
                  <div className="mt-8 text-center w-full max-w-md">
                    <p className="text-lg font-semibold mb-4">
                      {isListening && "Je vous écoute Excellence..."}
                      {isThinking && "Analyse et réflexion en cours..."}
                      {isSpeaking && "Je réponds..."}
                      {voiceState === 'idle' && "Appuyez pour parler"}
                    </p>

                    {/* Transcript en temps réel */}
                    {isListening && liveTranscript && (
                      <div className="neu-inset p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground italic">
                          {liveTranscript}
                        </p>
                      </div>
                    )}

                    {/* Timer silence */}
                    {isListening && silenceTimeRemaining > 0 && (
                      <div className="mt-3 space-y-2">
                        <Progress 
                          value={(silenceTimeRemaining / voiceSettings.silenceDuration) * 100} 
                          className="h-1"
                        />
                        <p className="text-xs text-muted-foreground">
                          Fin dans {Math.ceil(silenceTimeRemaining / 1000)}s
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mode Continu */}
                  {continuousMode && (
                    <div className="mt-6">
                      <Button
                        onClick={toggleContinuousPause}
                        variant={continuousModePaused ? 'outline' : 'default'}
                        size="sm"
                      >
                        Mode Continu {continuousModePaused ? '(Pause)' : '(Actif)'}
                      </Button>
                    </div>
                  )}

                  {/* Actions rapides */}
                  <div className="mt-6 flex gap-2">
                    {isSpeaking && (
                      <Button onClick={stopSpeaking} variant="destructive" size="sm">
                        Arrêter
                      </Button>
                    )}
                    {messages.length > 0 && (
                      <Button onClick={clearConversation} variant="outline" size="sm">
                        Nouvelle conversation
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Conversation */}
              <Card className="neu-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Conversation</h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-12">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Aucun message pour le moment</p>
                        <p className="text-sm mt-2">Commencez une conversation vocale</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`${
                            msg.role === 'user' 
                              ? 'ml-12 neu-card-sm bg-primary/5' 
                              : 'mr-12 neu-inset'
                          } p-4 rounded-lg`}
                        >
                          <div className="text-xs text-muted-foreground mb-2">
                            {msg.role === 'user' ? 'Vous' : 'iAsted'} •{' '}
                            {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          
                          {/* Document généré */}
                          {msg.fileUrl && (
                            <InlineDocumentPreview
                              fileUrl={msg.fileUrl}
                              fileName={msg.fileName || 'document.pdf'}
                              fileType={msg.fileType || 'pdf'}
                              documentType={msg.documentType}
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Documents */}
          <TabsContent value="documents" className="mt-6">
            <Card className="neu-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Documents Générés</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tous les documents créés par iAsted
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{generatedDocuments.length}</p>
                    <p className="text-xs text-muted-foreground">Documents</p>
                  </div>
                </div>
                
                <DocumentList 
                  documents={generatedDocuments}
                  emptyMessage="Demandez à iAsted de créer un décret, une lettre, ou un rapport"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Historique */}
          <TabsContent value="history" className="mt-6">
            <Card className="neu-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Historique Complet</h3>
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className="neu-inset p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          msg.role === 'user' ? 'text-primary' : 'text-secondary'
                        }`}>
                          {msg.role === 'user' ? 'Vous' : 'iAsted'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                      {msg.fileUrl && (
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Document joint: {msg.fileName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              {/* Voix */}
              <Card className="neu-card">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-primary" />
                      Voix iAsted
                    </h3>
                    <p className="text-muted-foreground">
                      Voix officielle spécialement créée pour l'assistant ministériel
                    </p>
                  </div>
                  
                  <VoiceSelector
                    selectedVoiceId={voiceSettings.voiceId}
                    onVoiceSelect={(voiceId) => setVoiceSettings(prev => ({ ...prev, voiceId }))}
                  />
                </CardContent>
              </Card>

              {/* Modèle IA */}
              <Card className="neu-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Intelligence Artificielle</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'claude', label: 'Claude Sonnet 4', desc: 'Raisonnement avancé', recommended: true },
                      { value: 'gpt', label: 'GPT-5', desc: 'Très précis' },
                      { value: 'gemini', label: 'Gemini Flash', desc: 'Rapide' }
                    ].map(model => (
                      <button
                        key={model.value}
                        onClick={() => setVoiceSettings(prev => ({ ...prev, aiModel: model.value as any }))}
                        className={`
                          neu-card p-4 text-center transition-all hover:scale-105 relative
                          ${voiceSettings.aiModel === model.value ? 'ring-2 ring-primary bg-primary/10' : ''}
                        `}
                      >
                        {model.recommended && (
                          <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                            Recommandé
                          </div>
                        )}
                        <div className="font-semibold text-sm mb-1">{model.label}</div>
                        <div className="text-xs text-muted-foreground">{model.desc}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Détection Audio */}
              <Card className="neu-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Détection de Parole</h3>
                  <div>
                    <label className="text-sm font-medium mb-3 block flex items-center justify-between">
                      <span>Durée de silence avant fin d'écoute</span>
                      <span className="text-primary font-bold">{voiceSettings.silenceDuration}ms</span>
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="2000"
                      step="100"
                      value={voiceSettings.silenceDuration}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, silenceDuration: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Rapide (500ms)</span>
                      <span>Équilibré (800ms)</span>
                      <span>Lent (2s)</span>
                    </div>
                  </div>

                  <div className="neu-inset p-4 rounded-lg mt-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voiceSettings.continuousMode}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, continuousMode: e.target.checked }))}
                        className="mt-1 w-4 h-4 accent-primary"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold block mb-1">Mode Continu</span>
                        <p className="text-xs text-muted-foreground">
                          iAsted enchaîne automatiquement les échanges
                        </p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

