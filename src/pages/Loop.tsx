import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, MessageCircle, Ghost, AlertTriangle, Loader2, Mail, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  getFeedbackQueue,
  recordSwipe,
  getComposioStatus,
  composioConnect,
  composioDisconnect,
  autoDetectReplies,
  type FeedbackItem,
} from "@/services/api";

const strategyColors: Record<string, string> = {
  PAIN_POINT: "bg-red-500/20 text-red-400 border-red-500/30",
  VALIDATION_ASK: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DIRECT_PITCH: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MUTUAL_CONNECTION: "bg-green-500/20 text-green-400 border-green-500/30",
  INDUSTRY_TREND: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function Loop() {
  const [searchParams] = useSearchParams();
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Handle OAuth callback — when Composio redirects back with ?status=success
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      setIsOAuthCallback(true);
    }
  }, [searchParams]);

  // If this tab is an OAuth callback, show a simple success message
  if (isOAuthCallback) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <CheckCircle className="h-12 w-12 text-green-400" />
        <h2 className="text-xl font-semibold text-foreground">Gmail Connected!</h2>
        <p className="text-sm text-muted-foreground">You can close this tab and return to the app.</p>
        <Button variant="outline" size="sm" onClick={() => window.close()} className="mt-2">
          Close Tab
        </Button>
      </div>
    );
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["feedbackQueue", user?.id],
    queryFn: () => getFeedbackQueue(user!.id),
    enabled: !!user,
  });

  const queue = data?.pending ?? [];

  // Gmail connection status
  const { data: gmailStatus, refetch: refetchGmailStatus } = useQuery({
    queryKey: ["composioStatus", user?.id],
    queryFn: () => getComposioStatus(user!.id),
    enabled: !!user,
  });

  const gmailConnected = gmailStatus?.connected ?? false;

  // Re-check Gmail status when user returns from OAuth tab
  const handleFocus = useCallback(() => {
    if (user && !gmailConnected) refetchGmailStatus();
  }, [user, gmailConnected, refetchGmailStatus]);

  useEffect(() => {
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [handleFocus]);

  // Connect Gmail mutation
  const connectMutation = useMutation({
    mutationFn: () => composioConnect(user!.id, window.location.href),
    onSuccess: (data) => {
      window.open(data.redirect_url, "_blank");
    },
    onError: (err: Error) => {
      toast({ title: "Failed to connect Gmail", description: err.message, variant: "destructive" });
    },
  });

  // Disconnect Gmail mutation
  const disconnectMutation = useMutation({
    mutationFn: () => composioDisconnect(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["composioStatus", user?.id] });
      toast({ title: "Gmail disconnected" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to disconnect Gmail", description: err.message, variant: "destructive" });
    },
  });

  // Auto-detect replies mutation
  const scanMutation = useMutation({
    mutationFn: () => autoDetectReplies(user!.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["feedbackQueue", user?.id] });
      toast({
        title: data.count > 0 ? `${data.count} replies detected` : "No new replies found",
        description: data.count > 0
          ? data.detected.map((d) => d.full_name).join(", ")
          : "Try again later or manually record feedback below.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Scan failed", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (error) {
      toast({ title: "Failed to load feedback queue", description: (error as Error).message, variant: "destructive" });
    }
  }, [error]);

  const swipeMutation = useMutation({
    mutationFn: ({ outreachId, outcome }: { outreachId: string; outcome: "REPLIED" | "GHOSTED" | "BOUNCED" }) =>
      recordSwipe(outreachId, outcome),
    onMutate: async ({ outreachId }) => {
      await queryClient.cancelQueries({ queryKey: ["feedbackQueue", user?.id] });
      const prev = queryClient.getQueryData<{ pending: FeedbackItem[] }>(["feedbackQueue", user?.id]);
      queryClient.setQueryData(["feedbackQueue", user?.id], (old: { pending: FeedbackItem[] } | undefined) =>
        old ? { pending: old.pending.filter((item) => item.outreach_id !== outreachId) } : old
      );
      return { prev };
    },
    onSuccess: (_data, { outcome }) => {
      toast({ title: "Feedback recorded", description: `Marked as ${outcome.toLowerCase()}.` });
    },
    onError: (err: Error, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["feedbackQueue", user?.id], context.prev);
      }
      toast({ title: "Swipe failed", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
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

        {/* Gmail Connect / Scan Banner */}
        <div className="mb-6">
          {!gmailConnected ? (
            <div className="glass rounded-xl border border-border p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Connect Gmail to auto-detect replies
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending}
                className="rounded-lg text-xs"
              >
                {connectMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <Mail className="mr-1.5 h-3 w-3" />
                )}
                Connect Gmail
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-xs font-medium text-green-400">Gmail connected</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scanMutation.mutate()}
                  disabled={scanMutation.isPending}
                  className="rounded-lg border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs"
                >
                  {scanMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  ) : (
                    <Search className="mr-1.5 h-3 w-3" />
                  )}
                  Scan for Replies
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  className="rounded-lg text-xs text-muted-foreground hover:text-red-400"
                >
                  {disconnectMutation.isPending && (
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  )}
                  Disconnect
                </Button>
              </div>
            </div>
          )}
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
                const isSwiping =
                  swipeMutation.isPending &&
                  swipeMutation.variables?.outreachId === item.outreach_id;

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
                        onClick={() => swipeMutation.mutate({ outreachId: item.outreach_id, outcome: "REPLIED" })}
                        disabled={isSwiping}
                        className="rounded-lg border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs"
                      >
                        <MessageCircle className="mr-1.5 h-3 w-3" />
                        Replied
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => swipeMutation.mutate({ outreachId: item.outreach_id, outcome: "GHOSTED" })}
                        disabled={isSwiping}
                        className="rounded-lg border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs"
                      >
                        <Ghost className="mr-1.5 h-3 w-3" />
                        Ghosted
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => swipeMutation.mutate({ outreachId: item.outreach_id, outcome: "BOUNCED" })}
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
