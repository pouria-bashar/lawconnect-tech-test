import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { ArrowRightIcon } from "lucide-react";

const projects = [
  {
    title: "Lead Capture",
    description:
      "AI-driven legal intake flow. Answer guided questions, fill out dynamic forms, and get matched with a suitable lawyer — all powered by an intelligent agent.",
    href: "/lead-capture",
    color: "text-blue-500",
  },
  {
    title: "Blog Writer",
    description:
      "Describe a topic and let the AI generate a full blog post rendered in a rich text editor. Review, edit, and save your posts to the database.",
    href: "/blogs",
    color: "text-emerald-500",
  },
  {
    title: "Synthetic Test Generator",
    description:
      "Describe test scenarios in natural language and get Playwright test code generated in a Monaco editor. Dry-run tests in a sandboxed environment before saving.",
    href: "/synthetic-test",
    color: "text-violet-500",
  },
  {
    title: "Immigration Assistant",
    description:
      "AI-guided immigration intake. Answer questions about your visa, citizenship, or other immigration matter and get matched with a specialist immigration lawyer.",
    href: "/immigration",
    color: "text-amber-500",
  },
  {
    title: "Generative UI",
    description:
      "Describe any UI you want — login forms, landing pages, dashboards, resumes — and watch the AI build it live with interactive components.",
    href: "/generative-ui",
    color: "text-pink-500",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Tech Test</h1>
        <p className="mt-2 text-muted-foreground">
          AI-powered tools for legal intake, content creation, and test
          automation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.href} href={project.href} className="group">
            <Card className="h-full transition-colors hover:ring-foreground/20">
              <CardHeader>
                <CardTitle className={project.color}>
                  {project.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>{project.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto gap-1 text-xs"
                >
                  Open
                  <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
