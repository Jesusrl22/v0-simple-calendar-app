"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface TeamChatProps {
  teamId: string;
  userId: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function TeamChat({ teamId, userId }: TeamChatProps) {
  const { language } = useTranslation();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data, mutate } = useSWR(
    `/api/teams/${teamId}/messages?limit=100`,
    fetcher,
    { refreshInterval: 3000 }
  );

  const messages: Message[] = data?.messages || [];

  const translations = {
    en: {
      noMessages: "No messages yet. Start the conversation!",
      placeholder: "Type a message...",
      send: "Send",
      error: "Failed to send message",
      emptyMessage: "Message cannot be empty",
    },
    es: {
      noMessages: "Sin mensajes aún. ¡Comienza la conversación!",
      placeholder: "Escribe un mensaje...",
      send: "Enviar",
      error: "Error al enviar el mensaje",
      emptyMessage: "El mensaje no puede estar vacío",
    },
    fr: {
      noMessages: "Pas de messages encore. Commencez la conversation!",
      placeholder: "Tapez un message...",
      send: "Envoyer",
      error: "Échec de l'envoi du message",
      emptyMessage: "Le message ne peut pas être vide",
    },
    de: {
      noMessages: "Noch keine Nachrichten. Beginnen Sie das Gespräch!",
      placeholder: "Geben Sie eine Nachricht ein...",
      send: "Senden",
      error: "Fehler beim Senden der Nachricht",
      emptyMessage: "Nachricht darf nicht leer sein",
    },
    it: {
      noMessages: "Nessun messaggio ancora. Inizia la conversazione!",
      placeholder: "Scrivi un messaggio...",
      send: "Invia",
      error: "Errore nell'invio del messaggio",
      emptyMessage: "Il messaggio non può essere vuoto",
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) {
      setError(t.emptyMessage);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/teams/${teamId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t.error);
      }

      setInput("");
      setError(null);
      mutate();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t.error;
      setError(errorMsg);
      console.error("[v0] Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border border-border">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>{t.noMessages}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3 animate-in fade-in">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.user_id}`} />
                <AvatarFallback>
                  {message.user_id.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm">
                    User {message.user_id.substring(0, 8)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.created_at), "HH:mm")}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-1 break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t.placeholder}
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
