import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, ArrowRight, CheckCircle2, FileSpreadsheet, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { uploadCSV, getJobStatus, getContacts, ContactItem } from "@/services/api";

type UploadState = "idle" | "uploading" | "enriching" | "done" | "error";

export default function NetworkIngest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [contactsCreated, setContactsCreated] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const PAGE_SIZE = 10;
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [contactsPage, setContactsPage] = useState(0);
  const [contactsLoading, setContactsLoading] = useState(false);
  const totalPages = Math.max(1, Math.ceil(contactsTotal / PAGE_SIZE));

  const fetchContacts = async (page: number) => {
    if (!user) return;
    setContactsLoading(true);
    try {
      const res = await getContacts(user.id, PAGE_SIZE, page * PAGE_SIZE);
      setContacts(res.contacts);
      setContactsTotal(res.total);
    } catch {
      // silent — list is supplementary
    } finally {
      setContactsLoading(false);
    }
  };

  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current && user) {
      hasFetched.current = true;
      fetchContacts(0);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleFile = async (file: File) => {
    if (!user) return;
    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setUploadState("uploading");
    setProgress(0);
    setErrorMessage("");

    try {
      const result = await uploadCSV(file, user.id);
      setContactsCreated(result.contacts_created);

      if (result.contacts_created === 0) {
        setUploadState("done");
        setProgress(100);
        return;
      }

      // Start polling enrichment status
      setUploadState("enriching");
      const jobId = result.job_id;
      const total = result.contacts_created;

      pollRef.current = setInterval(async () => {
        try {
          const status = await getJobStatus(jobId, user.id);
          const pct = total > 0
            ? Math.round((status.processed_count / total) * 100)
            : 0;
          setProgress(pct);

          if (status.status === "COMPLETED" || status.status === "FAILED") {
            if (pollRef.current) clearInterval(pollRef.current);
            setUploadState(status.status === "COMPLETED" ? "done" : "error");
            setProgress(100);
            if (status.status === "FAILED") {
              setErrorMessage("Enrichment failed. Some contacts may not have drafts.");
            }
            setContactsPage(0);
            fetchContacts(0);
          }
        } catch {
          // Polling error — keep trying
        }
      }, 3000);
    } catch (err: any) {
      setUploadState("error");
      setErrorMessage(err.message || "Upload failed");
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
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
              2
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Step 2 of 5
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Upload Contacts
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload your LinkedIn CSV export. We'll research each contact and generate personalized drafts.
          </p>
        </div>

        {/* Upload Zone */}
        {uploadState === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`glass relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/5 glow-primary"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <FileSpreadsheet className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                Drop your LinkedIn CSV here
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                or click to browse
              </p>
            </div>
          </motion.div>
        )}

        {/* Progress */}
        {(uploadState === "uploading" || uploadState === "enriching") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-border p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {uploadState === "uploading"
                      ? "Uploading CSV..."
                      : "Enriching contacts with AI..."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadState === "uploading"
                      ? "Parsing and validating your contacts"
                      : `Researching and drafting messages (${progress}%)`}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </motion.div>
        )}

        {/* Done */}
        {uploadState === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass rounded-xl border border-border p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Import complete
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {contactsCreated} contacts enriched with research and drafts
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate("/app/lab")}
              className="group h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all hover:glow-primary-strong"
              size="lg"
            >
              Review Drafts in Lab
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        )}

        {/* Error */}
        {uploadState === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass rounded-xl border border-destructive/30 p-6">
              <p className="text-sm font-medium text-destructive">
                {errorMessage}
              </p>
            </div>
            <Button
              onClick={() => {
                setUploadState("idle");
                setProgress(0);
              }}
              variant="outline"
              className="h-12 w-full rounded-xl"
              size="lg"
            >
              Try Again
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Contacts List */}
      {(contactsLoading || contactsTotal > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Your Contacts{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({contactsTotal})
              </span>
            </h2>
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={contactsPage === 0}
                  onClick={() => {
                    const p = contactsPage - 1;
                    setContactsPage(p);
                    fetchContacts(p);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {contactsPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={contactsPage >= totalPages - 1}
                  onClick={() => {
                    const p = contactsPage + 1;
                    setContactsPage(p);
                    fetchContacts(p);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {contactsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="glass flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.full_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.raw_role}{c.raw_role && c.company_name ? " · " : ""}{c.company_name}
                    </p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      c.status === "DRAFT_READY"
                        ? "bg-green-500/10 text-green-400"
                        : c.status === "SENT"
                          ? "bg-blue-500/10 text-blue-400"
                          : c.status === "RESEARCHING"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}


        </motion.div>
      )}
    </div>
  );
}
