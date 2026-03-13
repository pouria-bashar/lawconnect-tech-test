"use client";

import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { generativeUiCatalog } from "./generative-ui-catalog";
import { cn } from "@workspace/ui/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card";

function cls(props: Record<string, unknown>): string[] {
  const c = props.className;
  return Array.isArray(c) ? (c as string[]).filter(Boolean) : [];
}

const registryDef = defineRegistry(generativeUiCatalog, {
  components: {
    ...shadcnComponents,
    // Override Card to ensure padding and className passthrough
    Card: ({ props, children }: { props: Record<string, any>; children: React.ReactNode }) => {
      return (
        <Card className={cn("w-full", props.centered && "mx-auto", ...cls(props))}>
          {(props.title || props.description) && (
            <CardHeader>
              {props.title && <CardTitle>{props.title}</CardTitle>}
              {props.description && (
                <CardDescription>{props.description}</CardDescription>
              )}
            </CardHeader>
          )}
          <CardContent className="flex flex-col gap-4">{children}</CardContent>
        </Card>
      );
    },
  },
});

export const generativeUiRegistry = registryDef.registry;
