import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, ArrowRight, Users, FileJson, Globe, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ImportCard from "@/components/ImportCard";
import ContactPreviewList from "@/components/ContactPreviewList";

const importSources = [
  {
    id: "linkedin",
    title: "LinkedIn CSV",
    description: "Export from LinkedIn connections",
    icon: Users,
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    id: "google",
    title: "Google Contacts",
    description: "Import from Google account",
    icon: Globe,
    color: "from-green-500/20 to-green-600/10",
  },
  {
    id: "timeline",
    title: "Timeline.json",
    description: "Custom timeline data format",
    icon: FileJson,
    color: "from-amber-500/20 to-amber-600/10",
  },
];

const mockContacts = [
  { name: "Sarah Chen", company: "Stripe", role: "Engineering Lead", email: "s.chen@stripe.com" },
  { name: "Marcus Johnson", company: "Vercel", role: "Solutions Architect", email: "m.johnson@vercel.com" },
  { name: "Priya Sharma", company: "Datadog", role: "PM Director", email: "p.sharma@datadog.com" },
  { name: "Alex Rivera", company: "Figma", role: "Design Systems", email: "a.rivera@figma.com" },
  { name: "James Wu", company: "Notion", role: "Staff Engineer", email: "j.wu@notion.com" },
  { name: "Emily Park", company: "Linear", role: "Founding Engineer", email: "e.park@linear.com" },
  { name: "David Kim", company: "Supabase", role: "DevRel Lead", email: "d.kim@supabase.com" },
  { name: "Lisa Tanaka", company: "Anthropic", role: "Research Scientist", email: "l.tanaka@anthropic.com" },
  { name: "Ryan O'Brien", company: "Scale AI", role: "ML Engineer", email: "r.obrien@scale.com" },
  { name: "Nina Patel", company: "Rippling", role: "VP Product", email: "n.patel@rippling.com" },
];

type ImportStatus = "idle" | "mapping" | "saving" | "done";

export default function NetworkIngest() {
  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (importStatus === "mapping") {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 50) {
            clearInterval(timer);
            setImportStatus("saving");
            return 50;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(timer);
    }

    if (importStatus === "saving") {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setImportStatus("done");
            return 100;
          }
          return prev + 3;
        });
      }, 60);
      return () => clearInterval(timer);
    }
  }, [importStatus]);

  const handleImport = (sourceId: string) => {
    setSelectedSource(sourceId);
    setProgress(0);
    setImportStatus("mapping");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
              2
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Step 2 of 3
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Your Contacts
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Import your network to unlock AI-powered strategic insights.
          </p>
        </div>

        {/* Import Sources */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {importSources.map((source, i) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <ImportCard
                source={source}
                isSelected={selectedSource === source.id}
                isDisabled={importStatus !== "idle" && importStatus !== "done"}
                onImport={() => handleImport(source.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Status Tracker */}
        {importStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mb-8 rounded-xl border border-border p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {importStatus === "done" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {importStatus === "mapping" && "Mapping fields..."}
                    {importStatus === "saving" && "Saving contacts..."}
                    {importStatus === "done" && "Import complete"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {importStatus === "done"
                      ? `${mockContacts.length} contacts imported successfully`
                      : "Processing your contact data"}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </motion.div>
        )}

        {/* Preview List */}
        {importStatus === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Preview — First {mockContacts.length} Contacts
            </h3>
            <ContactPreviewList contacts={mockContacts} />
          </motion.div>
        )}

        {/* Action */}
        {importStatus === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={() => navigate("/command")}
              className="group h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all hover:glow-primary-strong"
              size="lg"
            >
              Proceed to Command Center
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
