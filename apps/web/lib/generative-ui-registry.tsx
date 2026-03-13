"use client";

import React, { type ReactNode, isValidElement, cloneElement } from "react";
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

type ComponentFn = (p: { props: Record<string, unknown>; children?: ReactNode; [k: string]: unknown }) => ReactNode;

/**
 * Wrap a shadcn component so that any `className` array from the spec
 * is merged onto the component's root element via cloneElement.
 */
function withCls(Component: ComponentFn): ComponentFn {
  return (componentProps) => {
    const classes = cls(componentProps.props);
    const rendered = Component(componentProps);
    if (classes.length === 0 || !isValidElement(rendered)) return rendered;
    const existing = (rendered.props as Record<string, unknown>).className ?? "";
    return cloneElement(rendered, {
      className: cn(existing as string, ...classes),
    } as Record<string, unknown>);
  };
}

const wrappedComponents = Object.fromEntries(
  Object.entries(shadcnComponents).map(([name, comp]) => [
    name,
    withCls(comp as unknown as ComponentFn),
  ]),
);

const registryDef = defineRegistry(generativeUiCatalog, {
  components: {
    ...(wrappedComponents as unknown as typeof shadcnComponents),
    // Override Card to ensure padding and className passthrough
    Card: ({ props, children }: { props: Record<string, any>; children?: ReactNode }) => {
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
