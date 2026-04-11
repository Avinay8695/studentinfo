import { useState, useCallback, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Bot, Send, Loader2, Trash2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatBotProps {
  stats: {
    total: number;
    paid: number;
    notPaid: number;
    totalFees: number;
    paidFees: number;
  };
  overdueStudents: number;
  totalOverdueMonths: number;
  activeCourses: number;
  courseList?: string;
}

const QUICK_PROMPTS = [
  '📊 Mera overall performance kaisa hai?',
  '💰 Revenue forecast batao',
  '⚠️ At-risk students ka analysis',
  '💡 Collection improve karne ke tips',
  '🔔 WhatsApp reminder kaise bhejein?',
];

export function AIChatBot({ stats, overdueStudents, totalOverdueMonths, activeCourses, courseList }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const buildStats = useCallback(() => {
    const collectedFees = stats.paidFees;
    const pendingFees = stats.totalFees - stats.paidFees;
    const collectionRate = stats.totalFees > 0 ? Math.round((collectedFees / stats.totalFees) * 100) : 0;
    return {
      totalStudents: stats.total,
      totalRevenue: stats.totalFees,
      totalCollected: collectedFees,
      totalPending: pendingFees,
      collectionRate,
      overdueStudents,
      totalOverdueMonths,
      fullyPaidStudents: stats.paid,
      activeCourses,
      courseList: courseList || '',
    };
  }, [stats, overdueStudents, totalOverdueMonths, activeCourses, courseList]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          stats: buildStats(),
        }),
      });

      if (resp.status === 429) { toast.error('Rate limit! Thoda wait karo.'); setIsLoading(false); return; }
      if (resp.status === 402) { toast.error('AI credits khatam. Funds add karo.'); setIsLoading(false); return; }
      if (!resp.ok || !resp.body) { toast.error('AI unavailable. Try again.'); setIsLoading(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';
      let streamDone = false;

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullText } : m));
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullText } : m));
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error('AI chat error:', e);
      toast.error('Chat error. Try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, buildStats]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating AI Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 transition-all duration-300 flex items-center justify-center group"
        aria-label="Open AI Chat"
      >
        <Bot className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/30">
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                  <Bot className="w-5 h-5 text-violet-500" />
                </div>
                SD Assistant
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </SheetTitle>
            <SheetDescription className="text-xs">
              Apne institute ke baare me kuch bhi puchho — data, tips, help! 🤖
            </SheetDescription>
          </SheetHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 mb-4">
                  <Sparkles className="w-8 h-8 text-violet-500 opacity-60" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Namaste! 👋 Mai SD Assistant hoon</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Apne institute ka koi bhi sawaal pucho
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-muted/30 hover:bg-muted/60 text-foreground transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted/50 border border-border/30 rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:text-sm [&_li]:text-sm [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_ul]:my-1 [&_ol]:my-1 [&_p]:my-1">
                      {msg.content ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span className="text-xs">Soch raha hoon...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content && (
              <span className="inline-block w-1.5 h-4 bg-violet-500 animate-pulse ml-1 rounded-sm" />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border/30 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Kuch bhi pucho..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-border/50 bg-muted/30 px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center disabled:opacity-50 hover:shadow-lg hover:shadow-violet-500/30 transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
