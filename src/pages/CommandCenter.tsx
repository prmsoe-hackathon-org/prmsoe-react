import { useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Zap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/StatsCard";
import ContactDrawer from "@/components/ContactDrawer";

interface Contact {
  id: number;
  name: string;
  company: string;
  role: string;
  dateMet: string;
  heat: "hot" | "warm" | "cold";
  insight: string;
  pitch: string;
}

const contacts: Contact[] = [
  { id: 1, name: "Sarah Chen", company: "Stripe", role: "Engineering Lead", dateMet: "Jan 2025", heat: "hot", insight: "Targeting technical debt in Go microservices. Stripe's infrastructure team is hiring aggressively for platform reliability.", pitch: "Hi Sarah, I noticed Stripe's push into Go microservice reliability — I've been building tooling in exactly this space. Would love 15 min to share what we've shipped." },
  { id: 2, name: "Marcus Johnson", company: "Vercel", role: "Solutions Architect", dateMet: "Feb 2025", heat: "warm", insight: "Exploring edge computing partnerships. Vercel looking to expand enterprise deployment options.", pitch: "Marcus, following Vercel's edge infra announcements — our platform integrates natively with your deployment pipeline. Quick demo?" },
  { id: 3, name: "Priya Sharma", company: "Datadog", role: "PM Director", dateMet: "Mar 2025", heat: "hot", insight: "Building new observability vertical for AI/ML pipelines. Budget allocated for Q3.", pitch: "Priya, saw Datadog's new AI monitoring initiative. We've built ML pipeline observability that complements your stack perfectly." },
  { id: 4, name: "Alex Rivera", company: "Figma", role: "Design Systems", dateMet: "Dec 2024", heat: "cold", insight: "Maintaining design token infrastructure. Low urgency, but potential for design-dev tooling.", pitch: "Alex, your design system work at Figma is impressive. We're exploring design-to-code pipelines — curious about your pain points?" },
  { id: 5, name: "James Wu", company: "Notion", role: "Staff Engineer", dateMet: "Feb 2025", heat: "warm", insight: "Leading performance optimization initiative. Notion is investing in real-time collaboration infrastructure.", pitch: "James, Notion's real-time collab is world-class. We've solved similar CRDT scaling challenges — worth comparing notes?" },
  { id: 6, name: "Emily Park", company: "Linear", role: "Founding Engineer", dateMet: "Jan 2025", heat: "hot", insight: "Scaling engineering team rapidly. Interested in developer productivity tooling and CI/CD optimization.", pitch: "Emily, Linear's growth trajectory is incredible. Our dev productivity platform has helped similar-stage teams ship 40% faster." },
  { id: 7, name: "David Kim", company: "Supabase", role: "DevRel Lead", dateMet: "Nov 2024", heat: "warm", insight: "Expanding partnership ecosystem. Looking for complementary developer tools for joint GTM.", pitch: "David, Supabase's developer community is unmatched. We'd love to explore a joint integration that benefits both ecosystems." },
  { id: 8, name: "Lisa Tanaka", company: "Anthropic", role: "Research Scientist", dateMet: "Mar 2025", heat: "hot", insight: "Working on safety evaluation frameworks. Anthropic actively seeking external tooling for evaluation pipelines.", pitch: "Lisa, your work on AI safety evaluation is fascinating. We've built infrastructure specifically for model evaluation pipelines at scale." },
];

const heatConfig = {
  hot: { label: "Hot", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  warm: { label: "Warm", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  cold: { label: "Cold", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

export default function CommandCenter() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hotCount = contacts.filter((c) => c.heat === "hot").length;

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
              Command Center
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Strategic Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-powered insights across your entire network.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatsCard
            title="Total Contacts"
            value={contacts.length}
            subtitle="Across all sources"
            icon={Users}
            delay={0.1}
          />
          <StatsCard
            title="High Momentum"
            value={hotCount}
            subtitle="Ready to engage"
            icon={TrendingUp}
            accent
            delay={0.2}
          />
          <StatsCard
            title="AI Signals"
            value={12}
            subtitle="New opportunities detected"
            icon={Zap}
            delay={0.3}
          />
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts, companies, roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 border-border bg-input pl-10 text-foreground placeholder:text-muted-foreground/40 focus:border-primary"
            />
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass overflow-hidden rounded-xl border border-border"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company / Role</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date Met</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Heat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contact) => (
                <TableRow
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="cursor-pointer border-border/50 transition-colors hover:bg-secondary/30"
                >
                  <TableCell className="font-medium text-foreground">{contact.name}</TableCell>
                  <TableCell>
                    <div>
                      <span className="text-foreground">{contact.company}</span>
                      <span className="ml-1 text-muted-foreground">· {contact.role}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{contact.dateMet}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold uppercase tracking-wider ${heatConfig[contact.heat].className}`}
                    >
                      {heatConfig[contact.heat].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>

        {/* Drawer */}
        <ContactDrawer
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      </motion.div>
    </div>
  );
}
