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
        setVoices(data.voices);
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

  const isIastedVoice = (voice: Voice) => {
    return voice.name.toLowerCase() === 'iasted';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="neu-card p-4 bg-primary/5 border-l-4 border-primary">
        <p className="text-sm text-foreground">
          <Sparkles className="w-4 h-4 inline mr-2 text-primary" />
          Cliquez sur une voix pour la sélectionner, puis sur le bouton de lecture pour tester
        </p>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="grid gap-4">
          {voices.map((voice) => {
            const isSelected = selectedVoiceId === voice.voice_id;
            const isPlaying = playingVoice === voice.voice_id;
            const isIasted = isIastedVoice(voice);

            return (
              <div
                key={voice.voice_id}
                className={`
                  neu-card p-5 cursor-pointer transition-all group
                  ${isSelected ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-accent/5'}
                  ${isIasted ? 'border-2 border-primary/30' : ''}
                `}
                onClick={() => onVoiceSelect(voice.voice_id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Voice Name & Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-base">{voice.name}</h4>
                      
                      {isIasted && (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Voix iAsted
                        </Badge>
                      )}
                      
                      {isSelected && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          <Check className="w-3 h-3 mr-1" />
                          Sélectionnée
                        </Badge>
                      )}
                    </div>

                    {/* Voice Description */}
                    <p className="text-sm text-muted-foreground">
                      {getVoiceDescription(voice)}
                    </p>

                    {/* Voice Category & Labels */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {voice.category && (
                        <Badge variant="outline" className="text-xs">
                          {voice.category}
                        </Badge>
                      )}
                      {voice.labels && Object.entries(voice.labels).slice(0, 3).map(([key, value]) => (
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
                      shrink-0 transition-all
                      ${isPlaying ? 'animate-pulse' : 'group-hover:scale-110'}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      playPreview(voice);
                    }}
                  >
                    {isPlaying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Stats */}
      <div className="neu-card p-3 text-center">
        <p className="text-xs text-muted-foreground">
          {voices.length} voix disponibles • {voices.filter(isIastedVoice).length} voix iAsted trouvée(s)
        </p>
      </div>
    </div>
  );
}
