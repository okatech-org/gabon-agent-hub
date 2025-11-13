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
          voiceId: (data as any).voice_id || prev.voiceId,
          silenceDuration: (data as any).voice_silence_duration || 900,
          silenceThreshold: (data as any).voice_silence_threshold || 10,
          continuousMode: (data as any).voice_continuous_mode || false,
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="neu-card p-6">
                <h3 className="text-lg font-semibold mb-4">Voix ElevenLabs</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sélectionnez une voix naturelle et expressive pour iAsted
                </p>
                <VoiceSelector
                  selectedVoiceId={voiceSettings.voiceId}
                  onVoiceSelect={(voiceId) => setVoiceSettings(prev => ({ ...prev, voiceId }))}
                />
              </div>

              <div className="neu-card p-6">
                <h3 className="text-lg font-semibold mb-4">Paramètres d'Écoute</h3>
                <div className="space-y-4">

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Durée de silence (ms)
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="3000"
                      step="100"
                      value={voiceSettings.silenceDuration}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, silenceDuration: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {voiceSettings.silenceDuration}ms
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voiceSettings.continuousMode}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, continuousMode: e.target.checked }))}
                        className="neu-inset"
                      />
                      <span className="text-sm font-medium">Mode Continu</span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enchaînement automatique des questions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <div className="neu-card p-6">
                <h3 className="text-lg font-semibold mb-4">Raccourcis Clavier</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Activer/Désactiver</span>
                    <code className="neu-inset px-2 py-1 rounded">Espace</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annuler</span>
                    <code className="neu-inset px-2 py-1 rounded">Échap</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nouvelle question</span>
                    <code className="neu-inset px-2 py-1 rounded">R</code>
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