import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, BarChart3, Loader2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface AIInsightsPanelProps {
  stats: {
    total: number;
    paid: number;
    notPaid: number;
    totalFees: number;
    collectedFees: number;
    pendingFees: number;
  };
  overdueStudents: number;
  totalOverdueMonths: number;
  activeCourses: number;
}

const PROMPT_OPTIONS = [
  { id: 'overall', label: 'Overall Analysis', icon: BarChart3, description: 'Complete health check' },
  { id: 'revenue_forecast', label: 'Revenue Forecast', icon: TrendingUp, description: 'Collection predictions' },
  { id: 'at_risk', label: 'At-Risk Students', icon: AlertTriangle, description: 'Overdue analysis' },
  { id: 'collection_tips', label: 'Collection Tips', icon: Lightbulb, description: 'Improvement strategies' },
] as const;

export function AIInsightsPanel({ stats, overdueStudents, totalOverdueMonths, activeCourses }: AIInsightsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  const streamInsights = useCallback(async (promptType: string) => {
    setIsLoading(true);
    setResponse('');
    setActivePrompt(promptType);

    const collectionRate = stats.totalFees > 0 ? Math.round((stats.collectedFees / stats.totalFees) * 100) : 0;

    const body = {
      stats: {
        totalStudents: stats.total,
        totalRevenue: stats.totalFees,
        totalCollected: stats.collectedFees,
        totalPending: stats.pendingFees,
        collectionRate,
        overdueStudents,
        totalOverdueMonths,
        fullyPaidStudents: stats.paid,
        activeCourses,
      },
      promptType,
    };

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (resp.status === 429) {
        toast.error('Rate limit exceeded. Please try again in a moment.');
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error('AI credits exhausted. Please add funds.');
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        toast.error('AI service unavailable. Please try again.');
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';
      let streamDone = false;

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
              setResponse(fullText);
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
              setResponse(fullText);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error('AI insights error:', e);
      toast.error('Failed to get AI insights');
    } finally {
      setIsLoading(false);
    }
  }, [stats, overdueStudents, totalOverdueMonths, activeCourses]);

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 transition-all duration-300 flex items-center justify-center group"
      >
        <Sparkles className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                <Sparkles className="w-5 h-5 text-violet-500" />
              </div>
              AI Smart Insights
            </SheetTitle>
            <SheetDescription>
              AI-powered analysis of your institute's data
            </SheetDescription>
          </SheetHeader>

          {/* Prompt Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {PROMPT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => streamInsights(opt.id)}
                disabled={isLoading}
                className={`p-3 rounded-xl border text-left transition-all hover:shadow-md disabled:opacity-50 ${
                  activePrompt === opt.id
                    ? 'border-violet-500/50 bg-violet-500/5 shadow-sm'
                    : 'border-border/50 bg-muted/30 hover:bg-muted/60'
                }`}
              >
                <opt.icon className={`w-4 h-4 mb-1.5 ${activePrompt === opt.id ? 'text-violet-500' : 'text-muted-foreground'}`} />
                <p className="text-xs font-semibold text-card-foreground">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground">{opt.description}</p>
              </button>
            ))}
          </div>

          {/* Response Area */}
          {(response || isLoading) && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/30 min-h-[200px]">
              {isLoading && !response && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing your data...</span>
                </div>
              )}
              {response && (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_p]:text-sm [&_li]:text-sm [&_ul]:my-1 [&_ol]:my-1">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              )}
              {isLoading && response && (
                <span className="inline-block w-1.5 h-4 bg-violet-500 animate-pulse ml-0.5 rounded-sm" />
              )}
            </div>
          )}

          {!response && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Choose an analysis type above</p>
              <p className="text-xs mt-1">AI will analyze your institute's aggregated data</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
