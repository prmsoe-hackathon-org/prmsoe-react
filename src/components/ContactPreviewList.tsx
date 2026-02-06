import { motion } from "framer-motion";
import { User } from "lucide-react";

interface Contact {
  name: string;
  company: string;
  role: string;
  email: string;
}

interface ContactPreviewListProps {
  contacts: Contact[];
}

export default function ContactPreviewList({ contacts }: ContactPreviewListProps) {
  return (
    <div className="glass overflow-hidden rounded-xl border border-border">
      <div className="max-h-[360px] overflow-y-auto">
        {contacts.map((contact, i) => (
          <motion.div
            key={contact.email}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-4 border-b border-border/50 px-5 py-3.5 last:border-b-0 transition-colors hover:bg-secondary/30"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {contact.role} · {contact.company}
              </p>
            </div>
            <span className="hidden text-xs text-muted-foreground/60 sm:block">{contact.email}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
