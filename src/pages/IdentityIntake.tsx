import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, MapPin, Briefcase, Compass, ArrowRight, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";

const businessModels = [
  { value: "product", label: "Product", icon: "📦" },
  { value: "service", label: "Service", icon: "🔧" },
  { value: "content", label: "Content", icon: "📝" },
  { value: "employment", label: "Employment", icon: "💼" },
];

const phaseLabels = ["Exploring Ideas", "Already have a Product"];

export default function IdentityIntake() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [city, setCity] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [phase, setPhase] = useState([0]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.type === "text/plain")) {
      setResumeFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or text file.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  const handleSubmit = () => {
    toast({
      title: "Profile saved",
      description: "Your identity context has been captured.",
    });
    navigate("/network");
  };

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
              Step 1 of 3
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Who are you?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us about yourself so our AI can build your strategic profile.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Resume Upload */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Resume Upload
            </Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`glass relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/5 glow-primary"
                  : resumeFile
                  ? "border-primary/30 bg-primary/5"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              {resumeFile ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{resumeFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(resumeFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); setResumeFile(null); }}
                    className="ml-2 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mb-3 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Drop your resume here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    PDF or TXT • Max 10MB
                  </p>
                </>
              )}
            </div>
          </motion.div>

          {/* Current City */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Current City
            </Label>
            <Input
              placeholder="e.g., San Francisco, CA"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="glass h-12 border-border bg-input text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:ring-primary/20"
            />
          </motion.div>

          {/* Business Model */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Briefcase className="h-4 w-4 text-primary" />
              Business Model
            </Label>
            <ToggleGroup
              type="single"
              value={businessModel}
              onValueChange={(val) => val && setBusinessModel(val)}
              className="grid grid-cols-2 gap-3"
            >
              {businessModels.map((model) => (
                <ToggleGroupItem
                  key={model.value}
                  value={model.value}
                  className="glass flex h-auto flex-col gap-1 rounded-xl border border-border px-4 py-4 text-muted-foreground transition-all data-[state=on]:border-primary/50 data-[state=on]:bg-primary/10 data-[state=on]:text-foreground data-[state=on]:glow-primary hover:bg-secondary/50"
                >
                  <span className="text-xl">{model.icon}</span>
                  <span className="text-sm font-medium">{model.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </motion.div>

          {/* Phase Slider */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Compass className="h-4 w-4 text-primary" />
              Phase
            </Label>
            <div className="glass rounded-xl border border-border p-6">
              <Slider
                value={phase}
                onValueChange={setPhase}
                max={1}
                step={1}
                className="mb-4"
              />
              <div className="flex justify-between">
                {phaseLabels.map((label, i) => (
                  <span
                    key={label}
                    className={`text-xs font-medium transition-colors ${
                      phase[0] === i ? "text-primary" : "text-muted-foreground/50"
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-4"
          >
            <Button
              onClick={handleSubmit}
              className="group h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all hover:glow-primary-strong"
              size="lg"
            >
              Save & Continue
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
