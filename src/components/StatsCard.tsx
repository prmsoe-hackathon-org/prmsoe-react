import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: boolean;
  delay?: number;
}

export default function StatsCard({ title, value, subtitle, icon: Icon, accent, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`glass rounded-xl border p-5 transition-all hover:bg-secondary/20 ${
        accent ? "border-primary/30 glow-primary" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent ? 'bg-primary/20' : 'bg-secondary'}`}>
          <Icon className={`h-5 w-5 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </div>
    </motion.div>
  );
}
