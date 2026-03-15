"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Trash2Icon, ExternalLinkIcon, RefreshCwIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl px-6 py-10">
      <h1 className="mb-6 font-bold text-2xl tracking-tight">Settings</h1>

      <Tabs defaultValue="cloudflare" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="cloudflare">Cloudflare</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="cloudflare" className="mt-6">
          <CloudflareTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GeneralTab() {
  return (
    <div className="rounded-lg border p-6">
      <p className="text-muted-foreground text-sm">
        Nothing to configure yet.
      </p>
    </div>
  );
}

interface WorkerScript {
  id?: string;
  created_on?: string;
  modified_on?: string;
}

const WORKER_BASE_URL = "https://ui.pouriab.workers.dev";

function CloudflareTab() {
  const [scripts, setScripts] = useState<WorkerScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  const fetchScripts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workers");
      if (res.ok) {
        const data = await res.json();
        setScripts(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  async function handleDelete(name: string) {
    if (!confirm(`Delete worker "${name}"? This cannot be undone.`)) return;

    setDeleting((prev) => new Set(prev).add(name));
    try {
      const res = await fetch(`/api/workers/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setScripts((prev) => prev.filter((s) => s.id !== name));
      }
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Worker scripts in the dispatch namespace.
        </p>
        <Button variant="outline" size="sm" onClick={fetchScripts} disabled={loading}>
          <RefreshCwIcon className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Script Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : scripts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground text-center py-8">
                  No worker scripts found.
                </TableCell>
              </TableRow>
            ) : (
              scripts.map((script) => {
                const name = script.id ?? "unknown";
                const isDeleting = deleting.has(name);
                return (
                  <TableRow key={name}>
                    <TableCell className="font-mono text-sm">{name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {script.created_on
                        ? new Date(script.created_on).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {script.modified_on
                        ? new Date(script.modified_on).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={`${WORKER_BASE_URL}/${name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLinkIcon className="size-4" />
                            <span className="sr-only">Visit</span>
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(name)}
                          disabled={isDeleting}
                        >
                          <Trash2Icon className="size-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
