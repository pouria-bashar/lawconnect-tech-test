"use client";

import { useState } from "react";
import { defineRegistry, useBoundProp, useFieldValidation } from "@json-render/react";
import { catalog } from "./json-render-catalog";
import { cn } from "@workspace/ui/lib/utils";

// shadcn components
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { Separator } from "@workspace/ui/components/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@workspace/ui/components/accordion";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@workspace/ui/components/table";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { Progress } from "@workspace/ui/components/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@workspace/ui/components/collapsible";

export { catalog } from "./json-render-catalog";

/** Extract className array from props, defaulting to empty */
function cls(props: Record<string, unknown>): string[] {
  const c = props.className;
  return Array.isArray(c) ? (c as string[]).filter(Boolean) : [];
}

/** Shared hook: resolve bound-or-local state for form controls */
function useBoundOrLocal<T>(
  propValue: unknown,
  binding: unknown,
  fallback: T,
): [T, (v: T) => void] {
  const [boundValue, setBoundValue] = useBoundProp(propValue, binding as string | undefined);
  const [localValue, setLocalValue] = useState(fallback);
  const isBound = !!binding;
  return [
    (isBound ? (boundValue as T) ?? fallback : localValue),
    isBound ? (setBoundValue as (v: T) => void) : setLocalValue,
  ];
}

// Components are typed loosely because we extended catalog props with className
// but defineRegistry expects exact prop matches from the catalog schema.
const registryDef = defineRegistry(catalog, {
  components: {
    // ── Branding ────────────────────────────────────────────────────────

    Brand: (({ props }: { props: Record<string, unknown> }) => (
      <div className={cn("mb-5 flex items-center gap-2.5", ...cls(props))}>
        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-5 text-white"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight">
          <span className="text-emerald-600">Law</span>
          <span className="text-foreground">Network</span>
        </span>
      </div>
    )) as any,

    // ── Layout ──────────────────────────────────────────────────────────

    Card: (({ props, children }) => {
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
    }),

    Stack: (({ props, children }) => {
      const isHorizontal = props.direction === "horizontal";
      const gapClass =
        { none: "gap-0", sm: "gap-2", md: "gap-4", lg: "gap-6" }[props.gap ?? "md"] ?? "gap-4";
      const alignClass =
        { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" }[
          props.align ?? "stretch"
        ] ?? "items-stretch";
      const justifyClass =
        { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between", around: "justify-around" }[
          props.justify ?? "start"
        ] ?? "";

      return (
        <div
          className={cn(
            "flex",
            isHorizontal ? "flex-row flex-wrap" : "flex-col",
            gapClass, alignClass, justifyClass,
            ...cls(props),
          )}
        >
          {children}
        </div>
      );
    }),

    Grid: (({ props, children }) => {
      const cols = Math.max(1, Math.min(6, props.columns ?? 1));
      const colsClass = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" }[cols] ?? "grid-cols-1";
      const gapClass = { sm: "gap-2", md: "gap-4", lg: "gap-6" }[props.gap ?? "md"] ?? "gap-4";

      return (
        <div className={cn("grid", colsClass, gapClass, ...cls(props))}>
          {children}
        </div>
      );
    }),

    Separator: (({ props }) => (
      <Separator
        orientation={props.orientation ?? "horizontal"}
        className={cn(props.orientation === "vertical" ? "h-full mx-2" : "my-4", ...cls(props))}
      />
    )),

    Tabs: (({ props, children, bindings, emit }) => {
      const tabs = props.tabs ?? [];
      const [value, setValue] = useBoundOrLocal(props.value, bindings?.value, props.defaultValue ?? tabs[0]?.value ?? "");

      return (
        <Tabs
          value={value as string}
          onValueChange={(v) => { setValue(v); emit("change"); }}
          className={cn(...cls(props))}
        >
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
          {children}
        </Tabs>
      );
    }),

    Accordion: (({ props }) => {
      const items = props.items ?? [];
      return (
        <Accordion
          type={props.type === "multiple" ? "multiple" : "single"}
          collapsible={props.type !== "multiple"}
          className={cn("w-full", ...cls(props))}
        >
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
    }),

    Collapsible: (({ props, children }) => {
      const [open, setOpen] = useState(false);
      return (
        <Collapsible open={open} onOpenChange={setOpen} className={cn("w-full", ...cls(props))}>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
              {props.title}
              <svg
                className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">{children}</CollapsibleContent>
        </Collapsible>
      );
    }),

    // ── Data Display ────────────────────────────────────────────────────

    Table: (({ props }) => {
      const columns = props.columns ?? [];
      const rows = (props.rows ?? []).map((row) => row.map(String));
      return (
        <div className={cn("rounded-md border overflow-hidden", ...cls(props))}>
          <Table>
            {props.caption && <TableCaption>{props.caption}</TableCaption>}
            <TableHeader>
              <TableRow>
                {columns.map((col) => <TableHead key={col}>{col}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }),

    Heading: (({ props }) => {
      // Handle both string ("h2") and numeric (2) levels
      const raw = props.level ?? "h2";
      const Tag = (typeof raw === "number" ? `h${raw}` : raw) as "h1" | "h2" | "h3" | "h4";
      const sizeClass = {
        h1: "text-3xl font-bold tracking-tight",
        h2: "text-2xl font-semibold tracking-tight",
        h3: "text-xl font-semibold",
        h4: "text-lg font-medium",
      }[Tag] ?? "text-2xl font-semibold";

      return <Tag className={cn(sizeClass, ...cls(props))}>{props.text}</Tag>;
    }),

    Text: (({ props }) => {
      const variantClass = {
        body: "text-base leading-relaxed",
        caption: "text-xs text-muted-foreground",
        muted: "text-sm text-muted-foreground",
        lead: "text-xl text-muted-foreground",
        code: "font-mono text-sm bg-muted px-1.5 py-0.5 rounded",
      }[props.variant ?? "body"] ?? "text-base leading-relaxed";

      if (props.variant === "code") {
        return <code className={cn(variantClass, ...cls(props))}>{props.text}</code>;
      }
      return <p className={cn(variantClass, ...cls(props))}>{props.text}</p>;
    }),

    Image: (({ props }) => {
      if (props.src) {
        return (
          <img
            src={props.src} alt={props.alt ?? ""}
            width={props.width ?? undefined} height={props.height ?? undefined}
            className={cn("rounded max-w-full", ...cls(props))}
          />
        );
      }
      return (
        <div
          className={cn("bg-muted border rounded flex items-center justify-center text-xs text-muted-foreground", ...cls(props))}
          style={{ width: props.width ?? 80, height: props.height ?? 60 }}
        >
          {props.alt || "img"}
        </div>
      );
    }),

    Badge: (({ props }) => (
      <Badge variant={props.variant ?? "default"} className={cn(...cls(props))}>
        {props.text}
      </Badge>
    )),

    Alert: (({ props }) => {
      const variant = props.type === "error" || props.type === "warning" ? "destructive" : "default";
      const iconMap: Record<string, React.ReactNode> = {
        info: (
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
          </svg>
        ),
        success: (
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
          </svg>
        ),
        warning: (
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
          </svg>
        ),
        error: (
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
          </svg>
        ),
      };
      const icon = iconMap[props.type as string] ?? iconMap.info;
      return (
        <Alert variant={variant} className={cn("rounded-lg p-4", ...cls(props))}>
          {icon}
          <AlertTitle>{props.title ?? (props as Record<string, unknown>).text}</AlertTitle>
          {props.message && <AlertDescription>{props.message}</AlertDescription>}
        </Alert>
      );
    }),

    Progress: (({ props }) => (
      <div className={cn("space-y-2", ...cls(props))}>
        {props.label && (
          <div className="flex justify-between text-sm">
            <span>{props.label}</span>
            <span className="text-muted-foreground">{props.value}%</span>
          </div>
        )}
        <Progress value={props.value} max={props.max ?? 100} />
      </div>
    )),

    // ── Form Controls ───────────────────────────────────────────────────

    Input: (({ props, bindings, emit }) => {
      const [value, setValue] = useBoundOrLocal<string>(props.value, bindings?.value, "");
      const validation = useFieldValidation(bindings?.value ?? "", {
        checks: props.checks as any,
        validateOn: props.validateOn as any,
      });

      return (
        <div className={cn("flex flex-col gap-2", ...cls(props))}>
          {props.label && <Label htmlFor={props.name ?? undefined}>{props.label}</Label>}
          <Input
            id={props.name ?? undefined}
            name={props.name ?? undefined}
            type={props.type ?? "text"}
            placeholder={props.placeholder ?? ""}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") emit("submit"); }}
            onFocus={() => emit("focus")}
            onBlur={() => { validation.touch(); emit("blur"); }}
            className={cn(!validation.isValid && "border-destructive")}
          />
          {validation.errors.length > 0 && (
            <p className="text-xs text-destructive">{validation.errors[0]}</p>
          )}
        </div>
      );
    }),

    Select: (({ props, bindings, emit }) => {
      const [value, setValue] = useBoundOrLocal<string>(props.value, bindings?.value, "");

      return (
        <div className={cn("flex flex-col gap-2", ...cls(props))}>
          {props.label && <Label>{props.label}</Label>}
          <Select value={value} onValueChange={(v) => { setValue(v); emit("change"); }}>
            <SelectTrigger>
              <SelectValue placeholder={props.placeholder ?? "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {(props.options ?? []).map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }),

    Checkbox: (({ props, bindings, emit }) => {
      const [checked, setChecked] = useBoundOrLocal<boolean>(props.checked, bindings?.checked, false);

      return (
        <div className={cn("flex items-center gap-3", ...cls(props))}>
          <Checkbox
            id={props.name}
            checked={checked}
            onCheckedChange={(v) => { setChecked(v === true); emit("change"); }}
          />
          {props.label && <Label htmlFor={props.name}>{props.label}</Label>}
        </div>
      );
    }),

    Switch: (({ props, bindings, emit }) => {
      const [checked, setChecked] = useBoundOrLocal<boolean>(props.checked, bindings?.checked, false);

      return (
        <div className={cn("flex items-center gap-3", ...cls(props))}>
          <Switch
            id={props.name}
            checked={checked}
            onCheckedChange={(v) => { setChecked(v); emit("change"); }}
          />
          {props.label && <Label htmlFor={props.name}>{props.label}</Label>}
        </div>
      );
    }),

    Textarea: (({ props, bindings, emit }) => {
      const [value, setValue] = useBoundOrLocal<string>(props.value, bindings?.value, "");
      const validation = useFieldValidation(bindings?.value ?? "", {
        checks: props.checks as any,
        validateOn: props.validateOn as any,
      });

      return (
        <div className={cn("flex flex-col gap-2", ...cls(props))}>
          {props.label && <Label htmlFor={props.name ?? undefined}>{props.label}</Label>}
          <Textarea
            id={props.name ?? undefined}
            name={props.name ?? undefined}
            placeholder={props.placeholder ?? ""}
            rows={props.rows ?? 4}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => emit("focus")}
            onBlur={() => { validation.touch(); emit("blur"); }}
            className={cn(!validation.isValid && "border-destructive")}
          />
          {validation.errors.length > 0 && (
            <p className="text-xs text-destructive">{validation.errors[0]}</p>
          )}
        </div>
      );
    }),

    // ── Interactive ─────────────────────────────────────────────────────

    Button: (({ props, emit, loading }) => {
      const variant = props.variant === "primary" ? "default"
        : props.variant === "danger" ? "destructive"
        : props.variant === "secondary" ? "secondary"
        : "default";
      const isPrimary = !props.variant || props.variant === "primary";

      return (
        <Button
          variant={variant}
          disabled={loading || (props.disabled ?? false)}
          onClick={() => emit("press")}
          className={cn(
            "w-full",
            isPrimary && "bg-emerald-600 hover:bg-emerald-700 text-white",
            ...cls(props),
          )}
        >
          {loading ? "..." : (props.label || String((props as Record<string, unknown>).text ?? "") || "Button")}
        </Button>
      );
    }),
  },
});

export const { registry } = registryDef;
