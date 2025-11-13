import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Volume2, Loader2, Check, Sparkles } from 'lucide-react';
import { toast } from '@/lib/toast';

interface Voice {
  voice_id: string;
  name: string;
  preview_url?: string;
  category?: string;
  labels?: Record<string, string>;
}

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onVoiceSelect: (voiceId: string) => void;
}

export function VoiceSelector({ selectedVoiceId, onVoiceSelect }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadVoices();
    
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const loadVoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('list-voices');
      
      if (error) throw error;
      
      if (data?.voices) {
        // Ne garder que la voix "iAsted"
        const iastedVoice = data.voices.filter((voice: Voice) => 
          voice.name.toLowerCase() === 'iasted'
        );
        
        if (iastedVoice.length === 0) {
          toast.error('Voix "iAsted" non trouvée dans votre compte ElevenLabs');
        } else {
          setVoices(iastedVoice);
          // Sélectionner automatiquement la voix iAsted si elle n'est pas déjà sélectionnée
          if (iastedVoice[0] && selectedVoiceId !== iastedVoice[0].voice_id) {
            onVoiceSelect(iastedVoice[0].voice_id);
          }
        }
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      toast.error('Impossible de charger les voix');
    } finally {
      setLoading(false);
    }
  };

  const playPreview = async (voice: Voice) => {
    if (playingVoice === voice.voice_id) {
      // Stop playing
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
      setPlayingVoice(null);
      return;
    }

    try {
      setPlayingVoice(voice.voice_id);
      
      if (voice.preview_url) {
        // Use ElevenLabs preview URL
        const audio = new Audio(voice.preview_url);
        audio.onended = () => setPlayingVoice(null);
        audio.onerror = () => {
          toast.error('Erreur lors de la lecture');
          setPlayingVoice(null);
        };
        setAudioElement(audio);
        await audio.play();
      } else {
        // Generate preview with edge function
        const { data, error } = await supabase.functions.invoke('generate-greeting-audio', {
          body: { 
            text: 'Bonjour Excellence, je suis iAsted, votre assistant vocal.',
            voiceId: voice.voice_id
          }
        });

        if (error) throw error;

        if (data?.audioContent) {
          const binaryString = atob(data.audioContent);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          const audio = new Audio(audioUrl);
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            setPlayingVoice(null);
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            toast.error('Erreur lors de la lecture');
            setPlayingVoice(null);
          };
          setAudioElement(audio);
          await audio.play();
        }
      }
    } catch (error) {
      console.error('Error playing preview:', error);
      toast.error('Impossible de lire l\'aperçu');
      setPlayingVoice(null);
    }
  };

  const getVoiceDescription = (voice: Voice) => {
    const labels = voice.labels || {};
    const descriptors = [];
    
    if (labels.accent) descriptors.push(labels.accent);
    if (labels.age) descriptors.push(labels.age);
    if (labels.gender) descriptors.push(labels.gender);
    
    return descriptors.length > 0 ? descriptors.join(', ') : 'Voix neutre';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (voices.length === 0) {
    return (
      <div className="neu-card p-6 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold text-lg mb-2">Voix iAsted introuvable</h3>
        <p className="text-sm text-muted-foreground">
          Assurez-vous d'avoir créé une voix nommée "iAsted" dans votre compte ElevenLabs
        </p>
      </div>
    );
  }

  const voice = voices[0]; // Une seule voix : iAsted
  const isPlaying = playingVoice === voice.voice_id;

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="neu-card p-4 bg-primary/5 border-l-4 border-primary">
        <p className="text-sm text-foreground">
          <Sparkles className="w-4 h-4 inline mr-2 text-primary" />
          Voix officielle d'iAsted configurée et active
        </p>
      </div>

      {/* Single Voice Card */}
      <div className="neu-card p-6 border-2 border-primary/30 bg-primary/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Voice Name & Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-xl">{voice.name}</h4>
              <Badge variant="default" className="bg-primary text-primary-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                Voix Officielle
              </Badge>
              <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                <Check className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>

            {/* Voice Description */}
            <p className="text-sm text-muted-foreground">
              {getVoiceDescription(voice)}
            </p>

            {/* Voice Characteristics */}
            <div className="flex items-center gap-2 flex-wrap">
              {voice.category && (
                <Badge variant="outline" className="text-xs">
                  {voice.category}
                </Badge>
              )}
              {voice.labels && Object.entries(voice.labels).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {value}
                </Badge>
              ))}
            </div>
          </div>

          {/* Play Button */}
          <Button
            size="lg"
            variant={isPlaying ? 'default' : 'outline'}
            className={`
              shrink-0 w-16 h-16 transition-all
              ${isPlaying ? 'animate-pulse' : 'hover:scale-110'}
            `}
            onClick={() => playPreview(voice)}
          >
            {isPlaying ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Info Footer */}
      <div className="neu-card p-3 text-center">
        <p className="text-xs text-muted-foreground">
          Cliquez sur <Volume2 className="w-3 h-3 inline" /> pour écouter un aperçu de la voix iAsted
        </p>
      </div>
    </div>
  );
}
