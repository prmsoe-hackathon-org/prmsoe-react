import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Network,
  Lightbulb,
  Target,
  Users,
  Shield,
  Rocket,
  CheckCircle2,
} from "lucide-react";

const featureItems = [
  {
    title: "Network intelligence",
    description: "Map your relationships into a living, searchable graph of warm intros.",
    icon: Network,
  },
  {
    title: "Idea validation loop",
    description: "Turn conversations into structured signals, interviews, and proof points.",
    icon: Lightbulb,
  },
  {
    title: "Strategic prioritization",
    description: "Score opportunities by urgency, budget, and founder-market fit.",
    icon: Target,
  },
  {
    title: "Founder-ready CRM",
    description: "Keep context, follow-ups, and momentum with a purpose-built pipeline.",
    icon: Users,
  },
  {
    title: "Trust-by-design",
    description: "Keep private notes, permissioned sharing, and secure exports.",
    icon: Shield,
  },
  {
    title: "Launch acceleration",
    description: "Move from signal to MVP with a clear next-step engine.",
    icon: Rocket,
  },
];

const steps = [
  {
    title: "Ingest your network",
    description: "Import contacts, signals, and context from the places you already work.",
  },
  {
    title: "Design your thesis",
    description: "Define what you are exploring and the proof you need to collect.",
  },
  {
    title: "Run the opportunity loop",
    description: "Capture insights, validate demand, and track traction across interviews.",
  },
];

const outcomes = [
  "Find warm paths to early adopters",
  "Validate ideas before you build",
  "Build momentum with structured follow-ups",
  "Spot repeatable patterns across conversations",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.15),_transparent_55%)]" />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">PRMSOE</p>
              <p className="text-base font-semibold">Personal Relationship Managing • Strategic Opportunity Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-20 pt-10 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <Badge className="w-fit" variant="secondary">
              Built for engineers building SaaS
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Turn your network into a launchpad for your next startup idea.
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              PRMSOE helps software engineers tap into their relationships to discover, validate, and prioritize
              high-signal opportunities before writing a line of production code.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link to="/auth">Start the opportunity loop</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">See a guided demo</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6 text-sm text-muted-foreground sm:grid-cols-4">
              <div>
                <p className="text-2xl font-semibold text-foreground">3x</p>
                <p>faster validation cycles</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">40%</p>
                <p>more warm intros</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">12</p>
                <p>signals per idea</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">1</p>
                <p>source of truth</p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <Card className="border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Opportunity Engine Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-lg border border-border bg-background/80 p-4">
                  <p className="text-sm font-semibold">Active Thesis</p>
                  <p className="text-lg font-medium">Developer onboarding for AI copilots</p>
                  <p className="text-sm text-muted-foreground">Signal strength: 8.6 / 10</p>
                </div>
                <div className="grid gap-3">
                  {outcomes.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm font-semibold">Next best action</p>
                  <p className="text-sm text-muted-foreground">Schedule 3 founder interviews with security leads.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <section id="features" className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-3">
          <Badge className="w-fit" variant="secondary">
            Why PRMSOE
          </Badge>
          <h2 className="text-3xl font-semibold">A relationship-first engine for product discovery</h2>
          <p className="text-muted-foreground">
            Stop chasing cold leads. Activate the people who already trust you to validate what the market truly
            wants.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featureItems.map((item) => (
            <Card key={item.title} className="border-border/60">
              <CardHeader className="space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="workflow" className="bg-secondary/30 py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-10 flex flex-col gap-3">
            <Badge className="w-fit" variant="secondary">
              Workflow
            </Badge>
            <h2 className="text-3xl font-semibold">From signal to validated opportunity in days</h2>
            <p className="text-muted-foreground">
              PRMSOE keeps your discovery process structured so you can move fast without losing context.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title} className="border-border/60">
                <CardHeader className="space-y-2">
                  <Badge className="w-fit" variant="outline">
                    Step {index + 1}
                  </Badge>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{step.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="audience" className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <Badge className="w-fit" variant="secondary">
              Built for software engineers
            </Badge>
            <h2 className="text-3xl font-semibold">A strategic advantage for technical founders</h2>
            <p className="text-muted-foreground">
              Whether you are exploring a side project or full-time founder mode, PRMSOE makes sure your network
              turns into verified demand instead of random chats.
            </p>
            <div className="grid gap-3">
              {[
                "Turn insights into a repeatable validation system",
                "Keep founders, mentors, and investors aligned",
                "Capture learning across every interview",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl">PRMSOE success loop</CardTitle>
              <p className="text-sm text-muted-foreground">
                Align your network, narrative, and next steps with a single source of truth.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Network className="mt-0.5 h-5 w-5 text-primary" />
                <p>Segment relationships by persona, urgency, and influence.</p>
              </div>
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-0.5 h-5 w-5 text-primary" />
                <p>Transform feedback into prioritized experiments.</p>
              </div>
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 h-5 w-5 text-primary" />
                <p>Track traction metrics and close feedback loops quickly.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/20 py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-10 px-6 lg:flex-row lg:items-center">
          <div className="space-y-3">
            <Badge className="w-fit" variant="secondary">
              Launch now
            </Badge>
            <h2 className="text-3xl font-semibold">Make your next idea impossible to ignore.</h2>
            <p className="text-muted-foreground">
              PRMSOE keeps your opportunity pipeline sharp so you can move from conversations to product-market fit.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/auth">Start your opportunity engine</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">Book a walkthrough</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
