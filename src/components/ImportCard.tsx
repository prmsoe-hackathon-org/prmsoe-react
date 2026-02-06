import { Upload } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface ImportSource {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

interface ImportCardProps {
  source: ImportSource;
  isSelected: boolean;
  isDisabled: boolean;
  onImport: () => void;
}

export default function ImportCard({ source, isSelected, isDisabled, onImport }: ImportCardProps) {
  const Icon = source.icon;

  return (
    <button
      onClick={onImport}
      disabled={isDisabled && !isSelected}
      className={`glass group relative flex w-full flex-col items-center gap-4 rounded-xl border p-6 text-center transition-all duration-300 ${
        isSelected
          ? "border-primary/50 bg-primary/5 glow-primary"
          : "border-border hover:border-muted-foreground/30 hover:bg-secondary/30"
      } ${isDisabled && !isSelected ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${source.color} transition-transform group-hover:scale-105`}>
        <Icon className="h-7 w-7 text-foreground/80" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{source.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{source.description}</p>
      </div>
      {!isDisabled && !isSelected && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          <Upload className="h-3 w-3" />
          Import
        </div>
      )}
    </button>
  );
}
