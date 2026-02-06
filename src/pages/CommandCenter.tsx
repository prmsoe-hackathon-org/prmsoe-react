import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FlaskConical, ExternalLink, Copy, Send, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getDrafts, sendOutreach, type DraftItem } from "@/services/api";

const strategyColors: Record<string, string> = {
  PAIN_POINT: "bg-red-500/20 text-red-400 border-red-500/30",
  VALIDATION_ASK: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DIRECT_PITCH: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MUTUAL_CONNECTION: "bg-green-500/20 text-green-400 border-green-500/30",
  INDUSTRY_TREND: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function CommandCenter() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editedMessages, setEditedMessages] = useState<Record<string, string>>({});
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const { data: initialData, isLoading, error } = useQuery({
    queryKey: ["drafts", user?.id],
    queryFn: () => getDrafts(user!.id, 20, 0),
    enabled: !!user,
  });

  useEffect(() => {
    if (initialData) {
      setDrafts(initialData.drafts);
      setTotal(initialData.total);
      setHasMore(initialData.has_more);
      setOffset(initialData.drafts.length);
    }
  }, [initialData]);

  useEffect(() => {
    if (error) {
      toast({ title: "Failed to load drafts", description: (error as Error).message, variant: "destructive" });
    }
  }, [error]);

  const fetchMore = async () => {
    if (!user) return;
    setLoadingMore(true);
    try {
      const res = await getDrafts(user.id, 20, offset);
      setDrafts((prev) => [...prev, ...res.drafts]);
      setTotal(res.total);
      setHasMore(res.has_more);
      setOffset((prev) => prev + res.drafts.length);
    } catch (err: any) {
      toast({ title: "Failed to load more drafts", description: err.message, variant: "destructive" });
    } finally {
      setLoadingMore(false);
    }
  };

  const sendMutation = useMutation({
    mutationFn: ({ contactId, message, strategyTag }: { contactId: string; message: string; strategyTag: string }) =>
      sendOutreach(contactId, message, strategyTag),
    onSuccess: (_data, { contactId }) => {
      setSentIds((prev) => new Set(prev).add(contactId));
      const draft = drafts.find((d) => d.contact_id === contactId);
      toast({ title: "Outreach recorded", description: `Message to ${draft?.full_name ?? "contact"} marked as sent.` });
    },
    onError: (err: Error) => {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    },
  });

  const handleSend = (draft: DraftItem) => {
    const message = editedMessages[draft.contact_id] || draft.draft_message;
    sendMutation.mutate({ contactId: draft.contact_id, message, strategyTag: draft.strategy_tag });
  };

  const handleCopyAndOpen = (draft: DraftItem) => {
    const message = editedMessages[draft.contact_id] || draft.draft_message;
    navigator.clipboard.writeText(message);
    if (draft.linkedin_url) {
      window.open(draft.linkedin_url, "_blank");
    }
    toast({ title: "Copied to clipboard", description: "Message copied. LinkedIn opened in a new tab." });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
              3
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Lab
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Draft Lab
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review, edit, and send AI-generated outreach messages.{" "}
            <span className="text-foreground font-medium">{total}</span> drafts ready.
          </p>
        </div>

        {/* Draft Cards */}
        {drafts.length === 0 ? (
          <div className="glass rounded-xl border border-border p-8 text-center">
            <FlaskConical className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No drafts yet. Upload contacts to generate outreach messages.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft, i) => {
              const isSent = sentIds.has(draft.contact_id);
              const isSending =
                sendMutation.isPending &&
                sendMutation.variables?.contactId === draft.contact_id;

              return (
                <motion.div
                  key={draft.contact_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * Math.min(i, 10) }}
                  className={`glass rounded-xl border p-5 transition-all ${
                    isSent ? "border-green-500/30 opacity-60" : "border-border"
                  }`}
                >
                  {/* Card Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {draft.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {draft.raw_role} · {draft.company_name}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        strategyColors[draft.strategy_tag] || "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {draft.strategy_tag.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {/* Research Snippet */}
                  {draft.research.news_summary && (
                    <div className="mb-3 rounded-lg bg-secondary/30 p-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {draft.research.news_summary}
                      </p>
                      {draft.research.source_url && (
                        <a
                          href={draft.research.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Source
                        </a>
                      )}
                    </div>
                  )}

                  {/* Editable Draft */}
                  <Textarea
                    value={editedMessages[draft.contact_id] ?? draft.draft_message}
                    onChange={(e) =>
                      setEditedMessages((prev) => ({
                        ...prev,
                        [draft.contact_id]: e.target.value,
                      }))
                    }
                    disabled={isSent}
                    rows={3}
                    className="mb-3 border-border bg-input text-sm text-foreground resize-none focus:border-primary focus:ring-primary/20"
                  />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyAndOpen(draft)}
                      disabled={isSent}
                      className="flex-1 rounded-lg border-border text-xs"
                    >
                      <Copy className="mr-1.5 h-3 w-3" />
                      Copy & Open LinkedIn
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSend(draft)}
                      disabled={isSent || isSending}
                      className="flex-1 rounded-lg bg-primary text-xs"
                    >
                      {isSending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isSent ? (
                        "Sent"
                      ) : (
                        <>
                          <Send className="mr-1.5 h-3 w-3" />
                          Mark as Sent
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={fetchMore}
                  disabled={loadingMore}
                  className="rounded-xl"
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Load More
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
