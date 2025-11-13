import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Volume2, Loader2 } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {voices.map((voice) => (
          <div
            key={voice.voice_id}
            className={`
              neu-card p-4 cursor-pointer transition-all
              ${selectedVoiceId === voice.voice_id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/5'}
            `}
            onClick={() => onVoiceSelect(voice.voice_id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{voice.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {getVoiceDescription(voice)}
                </p>
              </div>
              
              <Button
                size="sm"
                variant={playingVoice === voice.voice_id ? 'default' : 'outline'}
                className="ml-4"
                onClick={(e) => {
                  e.stopPropagation();
                  playPreview(voice);
                }}
              >
                {playingVoice === voice.voice_id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
