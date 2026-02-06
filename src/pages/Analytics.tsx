import { useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Send, MessageCircle, TrendingUp, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/StatsCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getDashboard } from "@/services/api";

const strategyBarColors: Record<string, string> = {
  PAIN_POINT: "#ef4444",
  VALIDATION_ASK: "#a855f7",
  DIRECT_PITCH: "#3b82f6",
  MUTUAL_CONNECTION: "#22c55e",
  INDUSTRY_TREND: "#f59e0b",
};

export default function Analytics() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: () => getDashboard(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (error) {
      toast({ title: "Failed to load analytics", description: (error as Error).message, variant: "destructive" });
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass rounded-xl border border-border p-8 text-center">
        <BarChart3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No analytics data yet. Send some outreach first.
        </p>
      </div>
    );
  }

  const chartData = data.by_strategy.map((s) => ({
    name: s.strategy_tag.replace(/_/g, " "),
    tag: s.strategy_tag,
    sent: s.sent,
    replied: s.replied,
    rate: Math.round(s.reply_rate * 100),
  }));

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
              5
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Analytics
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your outreach performance and strategy effectiveness.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatsCard
            title="Total Sent"
            value={data.total_sent}
            subtitle="Messages sent"
            icon={Send}
            delay={0.1}
          />
          <StatsCard
            title="Replies"
            value={data.total_replied}
            subtitle={`${data.total_completed} reviewed`}
            icon={MessageCircle}
            accent
            delay={0.2}
          />
          <StatsCard
            title="Reply Rate"
            value={`${Math.round(data.global_reply_rate * 100)}%`}
            subtitle="Overall effectiveness"
            icon={TrendingUp}
            delay={0.3}
          />
        </div>

        {/* Strategy Breakdown Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl border border-border p-6"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              By Strategy
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      color: "hsl(var(--foreground))",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="sent" name="Sent" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.tag}
                        fill={strategyBarColors[entry.tag] || "#6b7280"}
                        fillOpacity={0.4}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="replied" name="Replied" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.tag}
                        fill={strategyBarColors[entry.tag] || "#6b7280"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Strategy Table */}
            <div className="mt-4 space-y-2">
              {chartData.map((s) => (
                <div
                  key={s.tag}
                  className="flex items-center justify-between rounded-lg bg-secondary/20 px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: strategyBarColors[s.tag] || "#6b7280" }}
                    />
                    <span className="text-xs font-medium text-foreground">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{s.sent} sent</span>
                    <span>{s.replied} replied</span>
                    <span className="font-semibold text-foreground">{s.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
