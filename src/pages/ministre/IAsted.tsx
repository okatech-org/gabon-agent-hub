import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, History, Settings, Mic, Sparkles } from "lucide-react";
import { useVoiceInteraction } from "@/hooks/useVoiceInteraction";
import { VoiceSelector } from "@/components/ministre/VoiceSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface VoiceSettings {
  voiceId: string;
  silenceDuration: number;
  silenceThreshold: number;
  continuousMode: boolean;
  // Paramètres avancés
  thinkingTime: 'auto' | 'fast' | 'balanced' | 'thorough';
  responseMode: 'auto' | 'concise' | 'detailed' | 'conversational';
  aiModel: 'gemini' | 'gpt' | 'claude';
  formalityLevel: 'formal' | 'balanced' | 'casual';
  proactivity: 'low' | 'medium' | 'high';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function IAsted() {
  const { user } = useAuth();
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voiceId: '9BWtsMINqrJLrRacOk9x', // Aria by default (ElevenLabs)
    silenceDuration: 900,
    silenceThreshold: 10,
    continuousMode: false,
    // Paramètres avancés par défaut
    thinkingTime: 'auto',
    responseMode: 'auto',
    aiModel: 'gemini',
    formalityLevel: 'formal',
    proactivity: 'medium',
  });

  const [messages, setMessages] = useState<Message[]>([]);

  // Load user preferences and default iAsted voice
  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      // Charger d'abord la voix iAsted depuis ElevenLabs
      try {
        const { data: voicesData, error: voicesError } = await supabase.functions.invoke('list-voices');
        
        if (!voicesError && voicesData?.voices) {
          const iastedVoice = voicesData.voices.find(
            (voice: any) => voice.name.toLowerCase() === 'iasted'
          );
          
          if (iastedVoice) {
            console.log('✅ Voix iAsted trouvée:', iastedVoice.voice_id);
            setVoiceSettings(prev => ({
              ...prev,
              voiceId: iastedVoice.voice_id
            }));
          } else {
            console.warn('⚠️ Voix "iAsted" non trouvée dans votre compte ElevenLabs');
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des voix:', error);
      }

      // Puis charger les préférences utilisateur
      const { data, error } = await supabase
        .from('user_preferences' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setVoiceSettings(prev => ({
          ...prev,
          voiceId: (data as any).voice_id || prev.voiceId,
          silenceDuration: (data as any).voice_silence_duration || prev.silenceDuration,
          silenceThreshold: (data as any).voice_silence_threshold || prev.silenceThreshold,
          continuousMode: (data as any).voice_continuous_mode || prev.continuousMode,
          thinkingTime: (data as any).thinking_time || prev.thinkingTime,
          responseMode: (data as any).response_mode || prev.responseMode,
          aiModel: (data as any).ai_model || prev.aiModel,
          formalityLevel: (data as any).formality_level || prev.formalityLevel,
          proactivity: (data as any).proactivity || prev.proactivity,
        }));
      }
    };

    loadPreferences();
  }, [user]);

  // Save preferences when they change
  useEffect(() => {
    if (!user) return;

    const savePreferences = async () => {
      await supabase
        .from('user_preferences' as any)
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

    savePreferences();
  }, [voiceSettings, user]);

  const {
    voiceState,
    handleInteraction,
    isListening,
    isThinking,
    isSpeaking,
    audioLevel,
    continuousMode,
    continuousModePaused,
    toggleContinuousPause,
    liveTranscript,
    silenceTimeRemaining,
  } = useVoiceInteraction();

  const handleMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, {
      role,
      content,
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="neu-card p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="neu-raised w-16 h-16 flex items-center justify-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                iA
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">iAsted</h1>
              <p className="text-muted-foreground">
                Assistant IA Vocal - Ministère de la Fonction Publique
              </p>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid w-full grid-cols-3 neu-card p-1">
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span>Vocal</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </TabsTrigger>
          </TabsList>

          {/* Voice Tab */}
          <TabsContent value="voice" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Voice Interface */}
              <div className="neu-card p-8 flex flex-col items-center justify-center min-h-[500px]">
                {/* Voice Button */}
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
                  {/* Animated Ring */}
                  {isListening && (
                    <div 
                      className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
                      style={{ animationDuration: '1.5s' }}
                    />
                  )}
                  
                  {/* Icon */}
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <Mic className={`w-12 h-12 ${isListening ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>

                  {/* Audio Level Indicator */}
                  {isListening && audioLevel > 0 && (
                    <div 
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 h-2 bg-primary rounded-full transition-all"
                      style={{ width: `${audioLevel}%` }}
                    />
                  )}
                </button>

                {/* State Indicator */}
                <div className="mt-8 text-center">
                  <p className="text-lg font-semibold">
                    {isListening && "Je vous écoute Excellence..."}
                    {isThinking && "Je réfléchis..."}
                    {isSpeaking && "Je réponds..."}
                    {voiceState === 'idle' && "Appuyez pour parler"}
                  </p>

                  {/* Live Transcript */}
                  {isListening && liveTranscript && (
                    <div className="mt-4 neu-inset p-4 rounded-lg max-w-md">
                      <p className="text-sm text-muted-foreground italic">
                        {liveTranscript}
                      </p>
                    </div>
                  )}

                  {/* Silence Timer */}
                  {isListening && silenceTimeRemaining > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Fin de l'écoute dans {Math.ceil(silenceTimeRemaining / 1000)}s
                    </div>
                  )}
                </div>

                {/* Continuous Mode Badge */}
                {continuousMode && (
                  <div className="mt-6">
                    <button
                      onClick={toggleContinuousPause}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        continuousModePaused
                          ? 'neu-inset text-muted-foreground'
                          : 'neu-raised bg-primary/10 text-primary'
                      }`}
                    >
                      Mode Continu {continuousModePaused ? '(Pause)' : '(Actif)'}
                    </button>
                  </div>
                )}
              </div>

              {/* Conversation History */}
              <div className="neu-card p-6">
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
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-6">
            <div className="neu-card p-6">
              <p className="text-muted-foreground text-center py-12">
                Interface de chat textuel (à implémenter)
              </p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              {/* Voice Section */}
              <div className="neu-card p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Voix iAsted
                  </h3>
                  <p className="text-muted-foreground">
                    La voix officielle d'iAsted depuis votre compte ElevenLabs. 
                    Cette voix unique a été spécialement créée pour l'assistant ministériel.
                  </p>
                </div>
                
                <VoiceSelector
                  selectedVoiceId={voiceSettings.voiceId}
                  onVoiceSelect={(voiceId) => setVoiceSettings(prev => ({ ...prev, voiceId }))}
                />
              </div>

              {/* Listening Parameters Section */}
              <div className="neu-card p-6">
                <h3 className="text-xl font-bold mb-2">Paramètres d'Écoute</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Ajustez les paramètres de détection de silence pour optimiser la reconnaissance vocale
                </p>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block flex items-center justify-between">
                      <span>Durée de silence avant validation</span>
                      <span className="text-primary font-bold">{voiceSettings.silenceDuration}ms</span>
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="3000"
                      step="100"
                      value={voiceSettings.silenceDuration}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, silenceDuration: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Rapide (500ms)</span>
                      <span>Normal (900ms)</span>
                      <span>Lent (3s)</span>
                    </div>
                  </div>

                  <div className="neu-inset p-4 rounded-lg">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voiceSettings.continuousMode}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, continuousMode: e.target.checked }))}
                        className="mt-1 w-4 h-4 accent-primary"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold block mb-1">Mode Continu Automatique</span>
                        <p className="text-xs text-muted-foreground">
                          iAsted enchaîne automatiquement les questions-réponses sans intervention manuelle
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Intelligence Parameters Section */}
              <div className="neu-card p-6">
                <h3 className="text-xl font-bold mb-2">Paramètres d'Intelligence</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Configurez le comportement et la profondeur d'analyse d'iAsted
                </p>
                
                <div className="space-y-6">
                  {/* AI Model Selection */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Modèle d'Intelligence Artificielle
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'gemini', label: 'Gemini', desc: 'Équilibré et rapide' },
                        { value: 'gpt', label: 'GPT', desc: 'Très précis' },
                        { value: 'claude', label: 'Claude', desc: 'Analytique' }
                      ].map(model => (
                        <button
                          key={model.value}
                          onClick={() => setVoiceSettings(prev => ({ ...prev, aiModel: model.value as any }))}
                          className={`
                            neu-card p-4 text-center transition-all hover:scale-105
                            ${voiceSettings.aiModel === model.value ? 'ring-2 ring-primary bg-primary/10' : ''}
                          `}
                        >
                          <div className="font-semibold text-sm mb-1">{model.label}</div>
                          <div className="text-xs text-muted-foreground">{model.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thinking Time */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Temps de Réflexion
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 'auto', label: 'Auto', icon: '🤖' },
                        { value: 'fast', label: 'Rapide', icon: '⚡' },
                        { value: 'balanced', label: 'Équilibré', icon: '⚖️' },
                        { value: 'thorough', label: 'Approfondi', icon: '🔍' }
                      ].map(mode => (
                        <button
                          key={mode.value}
                          onClick={() => setVoiceSettings(prev => ({ ...prev, thinkingTime: mode.value as any }))}
                          className={`
                            neu-card p-3 text-center transition-all hover:scale-105
                            ${voiceSettings.thinkingTime === mode.value ? 'ring-2 ring-primary bg-primary/10' : ''}
                          `}
                        >
                          <div className="text-2xl mb-1">{mode.icon}</div>
                          <div className="text-xs font-medium">{mode.label}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {voiceSettings.thinkingTime === 'auto' && '⚡ Adaptation automatique selon la complexité'}
                      {voiceSettings.thinkingTime === 'fast' && '⚡ Réponses immédiates, idéal pour questions simples'}
                      {voiceSettings.thinkingTime === 'balanced' && '⚖️ Compromis entre vitesse et qualité'}
                      {voiceSettings.thinkingTime === 'thorough' && '🔍 Analyse approfondie, meilleure pour décisions complexes'}
                    </p>
                  </div>

                  {/* Response Mode */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Style de Réponse
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 'auto', label: 'Auto', icon: '🎯' },
                        { value: 'concise', label: 'Concis', icon: '📝' },
                        { value: 'detailed', label: 'Détaillé', icon: '📚' },
                        { value: 'conversational', label: 'Conversationnel', icon: '💬' }
                      ].map(mode => (
                        <button
                          key={mode.value}
                          onClick={() => setVoiceSettings(prev => ({ ...prev, responseMode: mode.value as any }))}
                          className={`
                            neu-card p-3 text-center transition-all hover:scale-105
                            ${voiceSettings.responseMode === mode.value ? 'ring-2 ring-primary bg-primary/10' : ''}
                          `}
                        >
                          <div className="text-2xl mb-1">{mode.icon}</div>
                          <div className="text-xs font-medium">{mode.label}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {voiceSettings.responseMode === 'auto' && '🎯 Adapté au contexte et à la complexité'}
                      {voiceSettings.responseMode === 'concise' && '📝 Réponses courtes et directes'}
                      {voiceSettings.responseMode === 'detailed' && '📚 Explications complètes avec contexte'}
                      {voiceSettings.responseMode === 'conversational' && '💬 Style naturel et accessible'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Behavior Parameters Section */}
              <div className="neu-card p-6">
                <h3 className="text-xl font-bold mb-2">Paramètres de Comportement</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Ajustez la personnalité et le style d'interaction d'iAsted
                </p>
                
                <div className="space-y-6">
                  {/* Formality Level */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Niveau de Formalité
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'formal', label: 'Formel', desc: 'Protocole ministériel strict', icon: '🎩' },
                        { value: 'balanced', label: 'Équilibré', desc: 'Professionnel et accessible', icon: '🤝' },
                        { value: 'casual', label: 'Décontracté', desc: 'Naturel et direct', icon: '😊' }
                      ].map(level => (
                        <button
                          key={level.value}
                          onClick={() => setVoiceSettings(prev => ({ ...prev, formalityLevel: level.value as any }))}
                          className={`
                            neu-card p-4 transition-all hover:scale-105
                            ${voiceSettings.formalityLevel === level.value ? 'ring-2 ring-primary bg-primary/10' : ''}
                          `}
                        >
                          <div className="text-3xl mb-2 text-center">{level.icon}</div>
                          <div className="font-semibold text-sm mb-1">{level.label}</div>
                          <div className="text-xs text-muted-foreground">{level.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Proactivity Level */}
                  <div>
                    <label className="text-sm font-medium mb-3 block flex items-center justify-between">
                      <span>Niveau de Proactivité</span>
                      <span className="text-primary font-bold capitalize">{voiceSettings.proactivity}</span>
                    </label>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="1"
                        value={['low', 'medium', 'high'].indexOf(voiceSettings.proactivity)}
                        onChange={(e) => {
                          const levels = ['low', 'medium', 'high'];
                          setVoiceSettings(prev => ({ ...prev, proactivity: levels[parseInt(e.target.value)] as any }));
                        }}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-xs">
                        <span className={voiceSettings.proactivity === 'low' ? 'text-primary font-semibold' : 'text-muted-foreground'}>
                          🔕 Faible - Répond uniquement aux questions
                        </span>
                        <span className={voiceSettings.proactivity === 'medium' ? 'text-primary font-semibold' : 'text-muted-foreground'}>
                          🔔 Moyen - Suggestions occasionnelles
                        </span>
                        <span className={voiceSettings.proactivity === 'high' ? 'text-primary font-semibold' : 'text-muted-foreground'}>
                          🔊 Élevé - Propose activement des analyses
                        </span>
                      </div>
                    </div>
                    <div className="neu-inset p-3 mt-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        {voiceSettings.proactivity === 'low' && '🔕 iAsted se concentre sur vos demandes sans proposer d\'informations supplémentaires'}
                        {voiceSettings.proactivity === 'medium' && '🔔 iAsted peut suggérer des actions ou analyses pertinentes de temps en temps'}
                        {voiceSettings.proactivity === 'high' && '🔊 iAsted propose activement des insights, alertes et recommandations'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts Section */}
              <div className="neu-card p-6">
                <h3 className="text-xl font-bold mb-4">Raccourcis Clavier</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm">Démarrer/Arrêter l'écoute</span>
                    <kbd className="px-3 py-1 text-sm font-mono bg-muted rounded">Espace</kbd>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm">Pause/Reprendre (Mode Continu)</span>
                    <kbd className="px-3 py-1 text-sm font-mono bg-muted rounded">P</kbd>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Arrêter iAsted</span>
                    <kbd className="px-3 py-1 text-sm font-mono bg-muted rounded">Échap</kbd>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}