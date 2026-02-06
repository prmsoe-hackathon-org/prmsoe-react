import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, MessageCircle, Ghost, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getFeedbackQueue, recordSwipe, type FeedbackItem } from "@/services/api";

const strategyColors: Record<string, string> = {
  PAIN_POINT: "bg-red-500/20 text-red-400 border-red-500/30",
  VALIDATION_ASK: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DIRECT_PITCH: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MUTUAL_CONNECTION: "bg-green-500/20 text-green-400 border-green-500/30",
  INDUSTRY_TREND: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function Loop() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [queue, setQueue] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipingId, setSwipingId] = useState<string | null>(null);

  const fetchQueue = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getFeedbackQueue(user.id);
      setQueue(res.pending);
    } catch (err: any) {
      toast({ title: "Failed to load feedback queue", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [user]);

  const handleSwipe = async (outreachId: string, outcome: "REPLIED" | "GHOSTED" | "BOUNCED") => {
    setSwipingId(outreachId);
    try {
      await recordSwipe(outreachId, outcome);
      setQueue((prev) => prev.filter((item) => item.outreach_id !== outreachId));
      toast({ title: "Feedback recorded", description: `Marked as ${outcome.toLowerCase()}.` });
    } catch (err: any) {
      toast({ title: "Swipe failed", description: err.message, variant: "destructive" });
    } finally {
      setSwipingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
              4
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Feedback Loop
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Loop
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Record outcomes for your sent outreach. This trains the AI for better future drafts.
          </p>
        </div>

        {/* Queue */}
        {queue.length === 0 ? (
          <div className="glass rounded-xl border border-border p-8 text-center">
            <RefreshCw className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No pending feedback. Outreach items will appear here 3 days after being sent.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {queue.map((item) => {
                const isSwiping = swipingId === item.outreach_id;

                return (
                  <motion.div
                    key={item.outreach_id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="glass rounded-xl border border-border p-5"
                  >
                    {/* Contact Info */}
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {item.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.company_name}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          strategyColors[item.strategy_tag] || "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {item.strategy_tag.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    {/* Message Preview */}
                    <div className="mb-4 rounded-lg bg-secondary/30 p-3">
                      <p className="text-xs text-muted-foreground italic">
                        "{item.message_preview}..."
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground/60">
                        Sent {new Date(item.sent_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Outcome Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwipe(item.outreach_id, "REPLIED")}
                        disabled={isSwiping}
                        className="rounded-lg border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs"
                      >
                        <MessageCircle className="mr-1.5 h-3 w-3" />
                        Replied
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwipe(item.outreach_id, "GHOSTED")}
                        disabled={isSwiping}
                        className="rounded-lg border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs"
                      >
                        <Ghost className="mr-1.5 h-3 w-3" />
                        Ghosted
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwipe(item.outreach_id, "BOUNCED")}
                        disabled={isSwiping}
                        className="rounded-lg border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                      >
                        <AlertTriangle className="mr-1.5 h-3 w-3" />
                        Bounced
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
