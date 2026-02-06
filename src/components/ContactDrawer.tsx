import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, MessageSquare, ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

interface ContactDrawerProps {
  contact: Contact | null;
  onClose: () => void;
}

const heatConfig = {
  hot: { label: "Hot", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  warm: { label: "Warm", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  cold: { label: "Cold", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

export default function ContactDrawer({ contact, onClose }: ContactDrawerProps) {
  const [editedPitch, setEditedPitch] = useState("");

  const handleOpen = () => {
    if (contact) setEditedPitch(contact.pitch);
  };

  return (
    <AnimatePresence>
      {contact && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onAnimationComplete={() => handleOpen()}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border p-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">{contact.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {contact.role} · {contact.company}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold uppercase tracking-wider ${heatConfig[contact.heat].className}`}
                  >
                    {heatConfig[contact.heat].label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Met {contact.dateMet}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* AI Insight */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Strategic Insight
                  </h3>
                </div>
                <div className="glass rounded-xl border border-primary/20 p-4">
                  <p className="text-sm leading-relaxed text-foreground">{contact.insight}</p>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Personalized Pitch */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Personalized Pitch
                  </h3>
                </div>
                <Textarea
                  value={editedPitch || contact.pitch}
                  onChange={(e) => setEditedPitch(e.target.value)}
                  rows={5}
                  className="border-border bg-input text-foreground resize-none focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-6">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-border bg-secondary/50 text-foreground hover:bg-secondary"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Enrich via You.com
                </Button>
                <Button
                  className="flex-1 h-11 rounded-xl bg-[#0057FF] text-primary-foreground hover:bg-[#0057FF]/90 hover:glow-primary-strong"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Contact via Intercom
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
