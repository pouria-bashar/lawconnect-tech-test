import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import { z } from "zod";

/**
 * Extend a component definition to include an optional className array prop.
 */
function withClassName<T extends { props: z.ZodType; [key: string]: unknown }>(
  def: T,
): T {
  const extended = {
    ...def,
    props: (def.props as z.ZodObject<z.ZodRawShape>).extend({
      className: z
        .array(z.string())
        .nullable()
        .describe("Additional CSS class names to apply to the component"),
    }),
  };
  return extended as unknown as T;
}

const componentDefs = {
  // Layout
  Card: withClassName(shadcnComponentDefinitions.Card),
  Stack: withClassName(shadcnComponentDefinitions.Stack),
  Grid: withClassName(shadcnComponentDefinitions.Grid),
  Separator: withClassName(shadcnComponentDefinitions.Separator),
  Tabs: withClassName(shadcnComponentDefinitions.Tabs),
  Accordion: withClassName(shadcnComponentDefinitions.Accordion),
  Collapsible: withClassName(shadcnComponentDefinitions.Collapsible),
  Dialog: withClassName(shadcnComponentDefinitions.Dialog),
  Drawer: withClassName(shadcnComponentDefinitions.Drawer),
  Carousel: withClassName(shadcnComponentDefinitions.Carousel),

  // Data Display
  Table: withClassName(shadcnComponentDefinitions.Table),
  Heading: withClassName(shadcnComponentDefinitions.Heading),
  Text: withClassName(shadcnComponentDefinitions.Text),
  Image: withClassName(shadcnComponentDefinitions.Image),
  Avatar: withClassName(shadcnComponentDefinitions.Avatar),
  Badge: withClassName(shadcnComponentDefinitions.Badge),
  Alert: withClassName(shadcnComponentDefinitions.Alert),
  Progress: withClassName(shadcnComponentDefinitions.Progress),
  Skeleton: withClassName(shadcnComponentDefinitions.Skeleton),
  Spinner: withClassName(shadcnComponentDefinitions.Spinner),
  Tooltip: withClassName(shadcnComponentDefinitions.Tooltip),
  Popover: withClassName(shadcnComponentDefinitions.Popover),

  // Form Inputs
  Input: withClassName(shadcnComponentDefinitions.Input),
  Textarea: withClassName(shadcnComponentDefinitions.Textarea),
  Select: withClassName(shadcnComponentDefinitions.Select),
  Checkbox: withClassName(shadcnComponentDefinitions.Checkbox),
  Radio: withClassName(shadcnComponentDefinitions.Radio),
  Switch: withClassName(shadcnComponentDefinitions.Switch),
  Slider: withClassName(shadcnComponentDefinitions.Slider),

  // Actions
  Button: withClassName(shadcnComponentDefinitions.Button),
  Link: withClassName(shadcnComponentDefinitions.Link),
  DropdownMenu: withClassName(shadcnComponentDefinitions.DropdownMenu),
  Toggle: withClassName(shadcnComponentDefinitions.Toggle),
  ToggleGroup: withClassName(shadcnComponentDefinitions.ToggleGroup),
  ButtonGroup: withClassName(shadcnComponentDefinitions.ButtonGroup),
  Pagination: withClassName(shadcnComponentDefinitions.Pagination),
};

export const generativeUiCatalog = defineCatalog(schema, {
  components: componentDefs,
  actions: {},
});

/**
 * Generate a tool-friendly prompt from the catalog.
 */
export function generativeUiToolPrompt(options?: { customRules?: string[] }): string {
  const { customRules = [] } = options ?? {};

  const fullPrompt = generativeUiCatalog.prompt();
  const componentsMatch = fullPrompt.match(/AVAILABLE COMPONENTS[\s\S]*/);
  const componentsDocs = componentsMatch?.[0] ?? "";

  const rules = [
    ...customRules,
    "ONLY use component types from the AVAILABLE COMPONENTS list.",
    "Each element needs: type, props, children (array of child element keys).",
    "Use unique keys for element IDs (e.g. 'header', 'name-input', 'submit-btn').",
  ];

  return `SPEC FORMAT — YOU MUST USE THE generate_ui TOOL:
You MUST call the generate_ui tool with a JSON object. The tool accepts:
  - root: string — the key of the root element (e.g. "main")
  - elements: object — flat map of element IDs to element definitions
  - state: object (optional) — initial state for the UI

Each element has: { type, props, children, visible?, on?, repeat? }

Example generate_ui tool call argument:
{
  "root": "main",
  "elements": {
    "main": { "type": "Card", "props": { "title": "Hello" }, "children": ["greeting"] },
    "greeting": { "type": "Text", "props": { "text": "Welcome!" }, "children": [] }
  }
}

CRITICAL: You MUST call the generate_ui tool. Do NOT output raw JSON or JSONL patches in your response. The generate_ui tool is the ONLY way to generate UI.

STATE & BINDINGS:
- Use the "state" field to seed initial state values.
- Use { "$bindState": "/path" } on input value props for two-way bindings.
- Use { "$state": "/path" } to display state values in text/props.
- You MUST include state whenever using $state, $bindState, or repeat expressions.

DYNAMIC LISTS (repeat):
- Add "repeat": { "statePath": "/arrayPath", "key": "id" } on an element to render per item.
- Use { "$item": "field" } / { "$bindItem": "field" } / { "$index": true } inside repeated children.

ACTIONS (on):
- Use "on": { "eventName": { "action": "setState", "params": { "statePath": "/path", "value": ... } } }
- pushState: append items. removeState: remove by index.
- State paths use RFC 6901 JSON Pointer syntax (e.g. "/todos/0/title").
- submit: Collects all bound form state and submits it as the tool result. Use on submit buttons: "on": { "press": { "action": "submit" } }

VALIDATION (checks):
- Add "checks" array and "validateOn" to Input props for field-level validation.
- validateOn: "blur" (default), "change", or "submit".
- Built-in check types:
  - required: { "type": "required", "message": "Field is required" }
  - email: { "type": "email", "message": "Invalid email" }
  - minLength: { "type": "minLength", "args": { "min": 3 }, "message": "Too short" }
  - maxLength: { "type": "maxLength", "args": { "max": 100 }, "message": "Too long" }
  - pattern: { "type": "pattern", "args": { "pattern": "^[0-9]+$" }, "message": "Numbers only" }
  - min/max: { "type": "min", "args": { "min": 0 }, "message": "Must be positive" }
  - numeric: { "type": "numeric", "message": "Must be a number" }
  - url: { "type": "url", "message": "Invalid URL" }
  - matches: { "type": "matches", "args": { "other": { "$state": "/path" } }, "message": "Must match" }
- Example: { "type": "Input", "props": { "value": { "$bindState": "/email" }, "checks": [{ "type": "required", "message": "Email is required" }, { "type": "email", "message": "Invalid email" }], "validateOn": "blur" } }

${componentsDocs}

RULES:
${rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;
}
