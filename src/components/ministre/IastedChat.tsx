import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Send, X, Mic, MicOff } from "lucide-react";
import { InlineDocumentPreview } from "@/components/ministre/GeneratedDocument";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'pdf' | 'docx';
  documentType?: 'decree' | 'letter' | 'report' | 'note';
}

interface IastedChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IastedChat({ isOpen, onClose }: IastedChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sessionIdRef = useRef<string>(`session-${Date.now()}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const loadVoice = async () => {
      try {
        const { data: voicesData } = await supabase.functions.invoke('list-voices');
        const iastedVoice = voicesData?.voices?.find(
          (voice: any) => voice.name?.toLowerCase() === 'iasted'
        );
        if (iastedVoice) {
          setVoiceId(iastedVoice.voice_id);
        }
      } catch (err) {
        console.error('Erreur chargement voix iAsted:', err);
      }
    };

    loadVoice();
  }, [user]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Impossible d'accéder au microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const sendAudioMessage = async (audioBlob: Blob) => {
    if (!user) return;

    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        const shouldGenerateAudio = Boolean(voiceId);
        const { data, error } = await supabase.functions.invoke('chat-with-iasted-advanced', {
          body: {
            sessionId: sessionIdRef.current,
            userId: user.id,
            audioBase64: base64Audio,
            voiceId: voiceId || undefined,
            generateAudio: shouldGenerateAudio,
            streamAudio: false,
            responseType: 'adaptive',
          }
        });

        if (error) throw error;

        const userMessage: Message = {
          role: 'user',
          content: data.transcript,
          timestamp: new Date().toISOString()
        };

        const assistantMessage: Message = {
          role: 'assistant',
          content: data.responseText,
          timestamp: new Date().toISOString(),
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileType: data.fileType,
          documentType: data.documentType,
        };

        setMessages(prev => [...prev, userMessage, assistantMessage]);

        // Jouer la réponse audio si disponible
        if (data.audioContent) {
          const audioData = atob(data.audioContent);
          const audioArray = new Uint8Array(audioData.length);
          for (let i = 0; i < audioData.length; i++) {
            audioArray[i] = audioData.charCodeAt(i);
          }
          const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
        }
      };
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Erreur de communication avec iAsted");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const textToSend = input.trim();
    if (!textToSend || isLoading || !user) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-iasted-advanced', {
        body: {
          sessionId: sessionIdRef.current,
          userId: user.id,
          textMessage: textToSend,
          generateAudio: false,
          voiceId: voiceId || undefined,
          responseType: 'adaptive',
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.responseText,
        timestamp: new Date().toISOString(),
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileType: data.fileType,
        documentType: data.documentType,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Erreur de communication avec iAsted");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 bottom-24 z-[9998] w-[500px] h-[700px]">
      <div className="neu-card h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 neu-raised rounded-full flex items-center justify-center">
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                iA
              </span>
            </div>
            <div>
              <h3 className="font-semibold">iAsted</h3>
              <p className="text-xs text-muted-foreground">Assistant IA</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>Commencez une conversation avec iAsted</p>
              <p className="text-sm mt-2">Vocale ou textuelle</p>
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
                {msg.fileUrl && (
                  <div className="mt-3">
                    <InlineDocumentPreview
                      fileUrl={msg.fileUrl}
                      fileName={msg.fileName || 'document.pdf'}
                      fileType={msg.fileType || 'pdf'}
                      documentType={msg.documentType}
                    />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
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
              placeholder="Écrivez votre message..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading || isRecording}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="icon"
                variant={isRecording ? "destructive" : "secondary"}
                disabled={isLoading}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                size="icon"
                disabled={!input.trim() || isLoading || isRecording}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
