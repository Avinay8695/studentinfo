import { useState, useCallback, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Bot, Send, Loader2, Trash2, Sparkles, Copy, RefreshCw, Check, Shield, User as UserIcon, Wrench, X, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import type { Student } from '@/types/student';
import { executeTool, isWriteTool, summarizeAction, type ToolContext } from '@/utils/aiTools';

type ChatMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; tool_calls?: Array<{ id: string; name: string; args: any; status: 'pending' | 'confirmed' | 'cancelled' | 'done' | 'error'; result?: any }> }
  | { role: 'tool'; tool_call_id: string; name: string; content: string };

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
  isAdmin?: boolean;
  students?: Student[];
  onMarkPayment?: ToolContext['updatePaymentStatus'];
  onOpenStudentPayments?: (student: Student) => void;
  onOpenStudentAnalytics?: (student: Student) => void;
}

const ADMIN_PROMPTS = [
  '📊 Overall performance summary',
  '💰 Next month ka revenue forecast',
  '⚠️ Top 5 defaulters list karo',
  '📞 Sabse zyada overdue wale students ke mobile do',
  '🎯 Course-wise collection breakdown',
  '💡 Collection improve karne ke 3 tips',
];

const USER_PROMPTS = [
  '📊 Overall stats dikhao',
  '💰 Collection rate kaisa hai?',
  '🔔 WhatsApp reminder kaise bhejein?',
  '💡 Best practices for fee collection',
];

export function AIChatBot({ stats, overdueStudents, totalOverdueMonths, activeCourses, courseList, isAdmin = false, students = [], onMarkPayment, onOpenStudentPayments, onOpenStudentAnalytics }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toolCtx: ToolContext = {
    students,
    updatePaymentStatus: onMarkPayment || (async () => { throw new Error('Not configured'); }),
    openStudentPayments: (s) => { onOpenStudentPayments?.(s); setIsOpen(false); },
    openStudentAnalytics: (s) => { onOpenStudentAnalytics?.(s); setIsOpen(false); },
  };

  const useTools = isAdmin && !!onMarkPayment;

  const QUICK_PROMPTS = isAdmin ? ADMIN_PROMPTS : USER_PROMPTS;

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

  // Convert local chat messages to OpenAI-style messages for the API
  const toApiMessages = (msgs: ChatMessage[]) => msgs.map(m => {
    if (m.role === 'tool') return { role: 'tool', tool_call_id: m.tool_call_id, name: m.name, content: m.content };
    if (m.role === 'assistant' && m.tool_calls && m.tool_calls.length > 0) {
      return {
        role: 'assistant',
        content: m.content || '',
        tool_calls: m.tool_calls.map(tc => ({ id: tc.id, type: 'function', function: { name: tc.name, arguments: JSON.stringify(tc.args) } })),
      };
    }
    return { role: m.role, content: (m as any).content };
  });

  const callApi = useCallback(async (msgs: ChatMessage[], stream: boolean) => {
    return fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: toApiMessages(msgs),
        stats: buildStats(),
        isAdmin,
        useTools: stream ? false : useTools,
        students: isAdmin ? students.map(s => ({
            id: s.id,
            fullName: s.fullName,
            course: s.course,
            batch: s.batch,
            mobile: s.mobile,
            enrollmentDate: s.enrollmentDate,
            courseDuration: s.courseDuration,
            monthlyFee: s.monthlyFee,
            feesStatus: s.feesStatus,
            monthlyPayments: s.monthlyPayments,
          })) : undefined,
      }),
    });
  }, [buildStats, isAdmin, students, useTools]);

  const streamAssistantText = useCallback(async (resp: Response) => {
    if (!resp.body) return;
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let fullText = '';
    let streamDone = false;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, nl);
        textBuffer = textBuffer.slice(nl + 1);
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
            setMessages(prev => prev.map((m, i) => i === prev.length - 1 && m.role === 'assistant' ? { ...m, content: fullText } : m));
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  }, []);

  // Run the conversation loop with tool support. Returns when AI produces final text or a pending write tool.
  const runConversation = useCallback(async (initialMessages: ChatMessage[]) => {
    let working = initialMessages;
    setIsLoading(true);
    try {
      // Up to 8 tool round-trips
      for (let step = 0; step < 8; step++) {
        if (!useTools) {
          // Pure streaming
          const resp = await callApi(working, true);
          if (resp.status === 429) { toast.error('Rate limit! Thoda wait karo.'); return; }
          if (resp.status === 402) { toast.error('AI credits khatam.'); return; }
          if (!resp.ok) { toast.error('AI unavailable.'); return; }
          await streamAssistantText(resp);
          return;
        }

        // Tool-calling JSON mode
        const resp = await callApi(working, false);
        if (resp.status === 429) { toast.error('Rate limit! Thoda wait karo.'); return; }
        if (resp.status === 402) { toast.error('AI credits khatam.'); return; }
        if (!resp.ok) { toast.error('AI unavailable.'); return; }
        const data = await resp.json();
        const choice = data.choices?.[0];
        const msg = choice?.message;
        const rawToolCalls = msg?.tool_calls as Array<any> | undefined;
        const content: string = msg?.content || '';

        if (!rawToolCalls || rawToolCalls.length === 0) {
          // Final answer
          const assistantMsg: ChatMessage = { role: 'assistant', content };
          working = [...working, assistantMsg];
          setMessages(working);
          return;
        }

        // Parse tool calls
        const toolCalls = rawToolCalls.map((tc: any) => {
          let args: any = {};
          try { args = typeof tc.function?.arguments === 'string' ? JSON.parse(tc.function.arguments || '{}') : (tc.function?.arguments || {}); } catch { args = {}; }
          return { id: tc.id, name: tc.function?.name, args, status: 'pending' as const };
        });

        const writeTools = toolCalls.filter(tc => isWriteTool(tc.name));
        const readTools = toolCalls.filter(tc => !isWriteTool(tc.name));

        if (writeTools.length > 0) {
          // Surface write tools for user confirmation. Stop the loop.
          const assistantMsg: ChatMessage = { role: 'assistant', content, tool_calls: toolCalls };
          working = [...working, assistantMsg];
          setMessages(working);
          return;
        }

        // Auto-execute read-only tools, then continue loop
        const assistantMsg: ChatMessage = { role: 'assistant', content, tool_calls: toolCalls.map(t => ({ ...t, status: 'done' as const })) };
        working = [...working, assistantMsg];
        for (const tc of readTools) {
          const result = await executeTool(tc.name, tc.args, toolCtx);
          working = [...working, { role: 'tool', tool_call_id: tc.id, name: tc.name, content: JSON.stringify(result) }];
        }
        setMessages(working);
      }
    } catch (e) {
      console.error('AI chat error:', e);
      toast.error('Chat error. Try again.');
    } finally {
      setIsLoading(false);
    }
  }, [callApi, streamAssistantText, useTools, toolCtx]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const newMessages: ChatMessage[] = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    await runConversation(newMessages);
  }, [messages, isLoading, runConversation]);

  // Confirm / cancel a pending tool call
  const handleConfirmTool = useCallback(async (msgIdx: number, callId: string, confirm: boolean) => {
    const target = messages[msgIdx];
    if (!target || target.role !== 'assistant' || !target.tool_calls) return;
    const tc = target.tool_calls.find(t => t.id === callId);
    if (!tc || tc.status !== 'pending') return;

    let updated = [...messages];
    if (!confirm) {
      const newCalls = target.tool_calls.map(t => t.id === callId ? { ...t, status: 'cancelled' as const } : t);
      updated[msgIdx] = { ...target, tool_calls: newCalls };
      updated.push({ role: 'tool', tool_call_id: callId, name: tc.name, content: JSON.stringify({ ok: false, error: 'User cancelled the action' }) });
    } else {
      const result = await executeTool(tc.name, tc.args, toolCtx);
      const newCalls = target.tool_calls.map(t => t.id === callId ? { ...t, status: result.ok ? 'done' as const : 'error' as const, result } : t);
      updated[msgIdx] = { ...target, tool_calls: newCalls };
      updated.push({ role: 'tool', tool_call_id: callId, name: tc.name, content: JSON.stringify(result) });
    }
    setMessages(updated);

    // If all pending calls in this message are resolved, continue conversation
    const stillPending = (updated[msgIdx] as any).tool_calls?.some((t: any) => t.status === 'pending');
    if (!stillPending) {
      await runConversation(updated);
    }
  }, [messages, runConversation, toolCtx]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    toast.success('Copied!');
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleRegenerate = () => {
    // Find last user message and resend
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIdx === -1) return;
    const realIdx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[realIdx] as { role: 'user'; content: string };
    setMessages(messages.slice(0, realIdx));
    setTimeout(() => sendMessage(lastUserMsg.content), 50);
  };

  return (
    <>
      {/* Floating AI Chat Button — Premium glow */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 group"
        aria-label="Open AI Chat"
      >
        {/* Animated glow ring */}
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600 blur-xl opacity-60 group-hover:opacity-90 transition-opacity animate-pulse" />
        {/* Rotating border gradient */}
        <span className="absolute -inset-[2px] rounded-2xl bg-[conic-gradient(from_0deg,#a855f7,#ec4899,#8b5cf6,#a855f7)] opacity-80 group-hover:opacity-100" style={{ animation: 'spin 4s linear infinite' }} />
        <span className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-2xl shadow-violet-500/40 group-hover:scale-105 transition-all duration-300">
          <Bot className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
          {/* Online dot */}
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-violet-700 animate-pulse" />
          {/* Sparkle */}
          <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
        </span>
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 gap-0 bg-gradient-to-b from-background via-background to-violet-500/[0.03]">
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/30 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-transparent">
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-lg">
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent font-bold">SD Assistant</span>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                    {isAdmin ? <><Shield className="w-2.5 h-2.5 text-violet-500" /> Admin Mode · Full Access</> : <><UserIcon className="w-2.5 h-2.5" /> User Mode</>}
                  </span>
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </SheetTitle>
            <SheetDescription className="text-xs">
              {isAdmin
                ? 'Kuch bhi puchho — student details, payments, forecasts, sab kuch! ✨'
                : 'Apne institute ke baare me general info aur tips puchho 🤖'}
            </SheetDescription>
          </SheetHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-2xl opacity-30 rounded-full" />
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 border border-violet-500/20">
                    <Sparkles className="w-10 h-10 text-violet-500" />
                  </div>
                </div>
                <p className="text-base font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent mb-1">Namaste! 👋</p>
                <p className="text-xs text-muted-foreground mb-5 max-w-xs">
                  {isAdmin ? 'Mai aapka personal data analyst hoon. Kisi bhi student, payment, ya trend ke baare me puchho.' : 'Apne institute ka koi bhi general sawaal pucho.'}
                </p>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-xs px-3.5 py-2.5 rounded-xl border border-border/50 bg-card/40 hover:bg-violet-500/10 hover:border-violet-500/40 text-foreground text-left transition-all hover:translate-x-0.5 hover:shadow-md hover:shadow-violet-500/10"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.role === 'tool') return null;
              return (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col gap-1 max-w-[88%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'assistant' && (msg.content || !msg.tool_calls?.length) && (
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-md shadow-violet-500/20'
                        : 'bg-card/70 backdrop-blur-sm border border-border/40 rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="ai-markdown max-w-none">
                        {msg.content ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-base font-bold mt-3 mb-2 pb-1 border-b border-violet-500/20 bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-sm font-bold mt-3 mb-1.5 flex items-center gap-1.5 text-violet-500 dark:text-violet-400">
                                  <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground/90">{children}</h3>
                              ),
                              p: ({ children }) => <p className="text-sm leading-relaxed my-1.5">{children}</p>,
                              ul: ({ children }) => <ul className="my-1.5 space-y-1 pl-1 list-none">{children}</ul>,
                              ol: ({ children }) => <ol className="my-1.5 space-y-1 pl-5 list-decimal marker:text-violet-500 marker:font-bold">{children}</ol>,
                              li: ({ children, ...props }) => {
                                const isOrdered = (props as any).ordered;
                                if (isOrdered) return <li className="text-sm pl-1">{children}</li>;
                                return (
                                  <li className="text-sm flex gap-2 items-start">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shrink-0" />
                                    <span className="flex-1">{children}</span>
                                  </li>
                                );
                              },
                              strong: ({ children }) => <strong className="font-semibold text-violet-600 dark:text-violet-300">{children}</strong>,
                              em: ({ children }) => <em className="text-fuchsia-500 dark:text-fuchsia-400 not-italic font-medium">{children}</em>,
                              code: ({ children, className }) => {
                                const isBlock = className?.includes('language-');
                                if (isBlock) {
                                  return (
                                    <code className="block bg-zinc-900 dark:bg-black/60 text-emerald-300 text-xs p-3 rounded-lg my-2 overflow-x-auto font-mono border border-violet-500/20">{children}</code>
                                  );
                                }
                                return <code className="text-xs bg-violet-500/10 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded font-mono border border-violet-500/15">{children}</code>;
                              },
                              pre: ({ children }) => <pre className="my-2">{children}</pre>,
                              blockquote: ({ children }) => (
                                <blockquote className="my-2 pl-3 border-l-2 border-violet-500/50 bg-violet-500/5 py-1.5 pr-2 rounded-r-md text-sm italic text-foreground/80">{children}</blockquote>
                              ),
                              table: ({ children }) => (
                                <div className="my-2 overflow-x-auto rounded-lg border border-violet-500/20">
                                  <table className="w-full text-xs border-collapse">{children}</table>
                                </div>
                              ),
                              thead: ({ children }) => <thead className="bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10">{children}</thead>,
                              th: ({ children }) => <th className="px-2.5 py-1.5 text-left font-semibold text-violet-600 dark:text-violet-300 border-b border-violet-500/20">{children}</th>,
                              td: ({ children }) => <td className="px-2.5 py-1.5 border-b border-border/30">{children}</td>,
                              tr: ({ children }) => <tr className="hover:bg-violet-500/5 transition-colors">{children}</tr>,
                              hr: () => <hr className="my-3 border-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />,
                              a: ({ children, href }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:text-fuchsia-500 underline underline-offset-2 decoration-violet-500/40">{children}</a>
                              ),
                            }}
                          >{msg.content}</ReactMarkdown>
                        ) : (
                          <div className="flex items-center gap-1.5 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        )}
                      </div>
                    ) : (
                      (msg as any).content
                    )}
                  </div>
                  )}
                  {/* Tool calls UI */}
                  {msg.role === 'assistant' && msg.tool_calls && msg.tool_calls.length > 0 && (
                    <div className="flex flex-col gap-1.5 w-full">
                      {msg.tool_calls.map((tc) => {
                        const isWrite = isWriteTool(tc.name);
                        if (!isWrite) {
                          return (
                            <div key={tc.id} className="flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-lg bg-violet-500/5 border border-violet-500/15 text-muted-foreground">
                              <Wrench className="w-3 h-3 text-violet-500" />
                              <span className="font-mono">{tc.name}</span>
                              {tc.status === 'done' && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
                            </div>
                          );
                        }
                        return (
                          <div key={tc.id} className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-4 h-4 text-violet-500" />
                              <span className="text-xs font-bold text-violet-600 dark:text-violet-300 uppercase tracking-wide">Action Request</span>
                              {tc.status === 'done' && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold">DONE</span>}
                              {tc.status === 'cancelled' && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">CANCELLED</span>}
                              {tc.status === 'error' && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold">ERROR</span>}
                            </div>
                            <div className="text-sm text-foreground mb-3">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({children}) => <span>{children}</span>, strong: ({children}) => <strong className="text-violet-600 dark:text-violet-300">{children}</strong> }}>
                                {summarizeAction(tc.name, tc.args, toolCtx)}
                              </ReactMarkdown>
                            </div>
                            {tc.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleConfirmTool(i, tc.id, true)}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all active:scale-95"
                                >
                                  <Check className="w-3.5 h-3.5" /> Confirm
                                </button>
                                <button
                                  onClick={() => handleConfirmTool(i, tc.id, false)}
                                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive text-xs font-semibold transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                            {tc.status === 'error' && tc.result?.error && (
                              <p className="text-[11px] text-destructive mt-1">{tc.result.error}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Message actions for assistant messages */}
                  {msg.role === 'assistant' && msg.content && !isLoading && (
                    <div className="flex items-center gap-1 px-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(msg.content, i)}
                        className="p-1 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy"
                      >
                        {copiedIdx === i ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                      {i === messages.length - 1 && (
                        <button
                          onClick={handleRegenerate}
                          className="p-1 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                          title="Regenerate"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border/30 flex gap-2 bg-background/80 backdrop-blur-sm">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAdmin ? 'Kuch bhi puchho — student names, payments, forecasts...' : 'Kuch bhi pucho...'}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-border/50 bg-muted/40 px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/40 transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
