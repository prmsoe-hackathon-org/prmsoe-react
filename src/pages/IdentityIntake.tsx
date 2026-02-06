import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function IdentityIntake() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [missionStatement, setMissionStatement] = useState("");
  const [intentType, setIntentType] = useState<"VALIDATION" | "SALES">("VALIDATION");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("mission_statement, intent_type")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setMissionStatement(data.mission_statement || "");
          setIntentType((data.intent_type as "VALIDATION" | "SALES") || "VALIDATION");
        }
        setLoadingProfile(false);
      });
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        mission_statement: missionStatement,
        intent_type: intentType,
      });

    setSaving(false);

    if (error) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profile saved",
      description: "Your mission and intent have been captured.",
    });
    navigate("/upload");
  };

  if (loadingProfile) {
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
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
              1
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Step 1 of 5
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            What's your mission?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us what you're building so our AI can craft personalized outreach.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Target className="h-4 w-4 text-primary" />
              Mission Statement
            </Label>
            <Textarea
              placeholder="e.g., Building an AI-powered tool that helps sales teams prioritize warm leads using LinkedIn data..."
              value={missionStatement}
              onChange={(e) => setMissionStatement(e.target.value)}
              rows={5}
              className="glass border-border bg-input text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:ring-primary/20 resize-none"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              The more specific, the better your AI-generated outreach will be.
            </p>
          </motion.div>

          {/* Intent Type */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              Intent
            </Label>
            <ToggleGroup
              type="single"
              value={intentType}
              onValueChange={(val) => {
                if (val === "VALIDATION" || val === "SALES") setIntentType(val);
              }}
              className="grid grid-cols-2 gap-3"
            >
              <ToggleGroupItem
                value="VALIDATION"
                className="glass flex h-auto flex-col gap-1 rounded-xl border border-border px-4 py-4 text-muted-foreground transition-all data-[state=on]:border-primary/50 data-[state=on]:bg-primary/10 data-[state=on]:text-foreground data-[state=on]:glow-primary hover:bg-secondary/50"
              >
                <span className="text-sm font-medium">Validation</span>
                <span className="text-xs text-muted-foreground">
                  Get feedback on your idea
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="SALES"
                className="glass flex h-auto flex-col gap-1 rounded-xl border border-border px-4 py-4 text-muted-foreground transition-all data-[state=on]:border-primary/50 data-[state=on]:bg-primary/10 data-[state=on]:text-foreground data-[state=on]:glow-primary hover:bg-secondary/50"
              >
                <span className="text-sm font-medium">Sales</span>
                <span className="text-xs text-muted-foreground">
                  Sell a product or service
                </span>
              </ToggleGroupItem>
            </ToggleGroup>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-4"
          >
            <Button
              onClick={handleSubmit}
              disabled={saving || !missionStatement.trim()}
              className="group h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all hover:glow-primary-strong"
              size="lg"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Save & Continue
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
