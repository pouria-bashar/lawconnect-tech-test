---
name: json-render-ui
description: Generate json-render UI specs with shadcn components. Use this skill whenever asked to generate, build, or create a UI. Contains the full component registry with props, examples, state bindings, actions, and validation.
---

# json-render UI Spec Generator

Generate UI component specs as JSON conforming to the json-render format.

## Spec Structure

```json
{
  "root": "main",
  "elements": {
    "main": { "type": "Card", "props": { "title": "My UI" }, "children": ["content"] },
    "content": { "type": "Text", "props": { "text": "Hello!" }, "children": [] }
  },
  "state": {}
}
```

Each element: `{ type, props, children, visible?, on?, repeat?, watch? }`

---

## Available Components — Full Props Reference

### Layout Components

**Card** — Container card
```
props: { title?: string, description?: string, centered?: boolean, className?: string[] }
```

**Stack** — Flex layout
```
props: { direction: "vertical" | "horizontal", gap: "sm" | "md" | "lg", align?: "start" | "center" | "end" | "stretch", justify?: "start" | "center" | "end" | "between", wrap?: boolean, className?: string[] }
```

**Grid** — Grid layout
```
props: { columns: number, gap: "sm" | "md" | "lg", className?: string[] }
```

**Separator** — Divider
```
props: { orientation?: "horizontal" | "vertical", className?: string[] }
```

**Tabs** — Tabbed sections (children map to tabs by index)
```
props: { tabs: [{ label: string, value: string }], defaultValue?: string, value?: dynamic, className?: string[] }
events: ["change"]
```

**Accordion** — Collapsible sections (children map to items by index)
```
props: { items: [{ title: string, value: string }], type?: "single" | "multiple", defaultValue?: string, className?: string[] }
```

**Collapsible** — Single collapsible
```
props: { title: string, defaultOpen?: boolean, className?: string[] }
```

**Dialog** — Modal dialog
```
props: { title: string, description?: string, triggerLabel: string, className?: string[] }
```

**Drawer** — Slide-out panel
```
props: { title: string, description?: string, triggerLabel: string, side?: "top" | "right" | "bottom" | "left", className?: string[] }
```

**Carousel** — Image/content slider
```
props: { autoplay?: boolean, interval?: number, className?: string[] }
```

### Data Display Components

**Heading** — Heading element
```
props: { text: string, level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6", className?: string[] }
```

**Text** — Text block
```
props: { text: string | dynamic, variant?: "default" | "lead" | "muted" | "small", className?: string[] }
```

**Image** — Image element
```
props: { src: string, alt: string, width?: number, height?: number, className?: string[] }
```

**Avatar** — User avatar
```
props: { src?: string, fallback?: string, size?: "sm" | "md" | "lg", className?: string[] }
```

**Badge** — Label badge
```
props: { text: string | dynamic, variant?: "default" | "secondary" | "outline" | "destructive", className?: string[] }
```

**Alert** — Alert box
```
props: { title: string, description?: string, variant?: "default" | "destructive", className?: string[] }
```

**Progress** — Progress bar
```
props: { value: number, max?: number, className?: string[] }
```

**Table** — Data table
```
props: { columns: string[], rows: string[][], caption?: string, className?: string[] }
```

**Skeleton** — Loading placeholder
```
props: { width?: string, height?: string, className?: string[] }
```

**Spinner** — Loading spinner
```
props: { size?: "sm" | "md" | "lg", className?: string[] }
```

**Tooltip** — Hover tooltip (wraps child)
```
props: { content: string, className?: string[] }
```

**Popover** — Click popover (wraps child)
```
props: { triggerLabel: string, className?: string[] }
```

### Form Input Components

**Input** — Text input
```
props: { label: string, name: string, type?: "text" | "email" | "password" | "number" | "tel" | "url", placeholder?: string, value?: dynamic, disabled?: boolean, checks?: Check[], validateOn?: "blur" | "change" | "submit", className?: string[] }
events: ["change", "focus", "blur"]
```

**Textarea** — Multiline input
```
props: { label: string, name: string, placeholder?: string, value?: dynamic, rows?: number, disabled?: boolean, checks?: Check[], validateOn?: "blur" | "change" | "submit", className?: string[] }
```

**Select** — Dropdown select
```
props: { label: string, name: string, options: [{ label: string, value: string }], value?: dynamic, placeholder?: string, disabled?: boolean, className?: string[] }
events: ["change"]
```

**Checkbox** — Checkbox toggle
```
props: { label: string, name: string, checked?: dynamic, disabled?: boolean, className?: string[] }
events: ["change"]
```

**Radio** — Radio group
```
props: { label: string, name: string, options: [{ label: string, value: string }], value?: dynamic, disabled?: boolean, className?: string[] }
events: ["change"]
```

**Switch** — Toggle switch
```
props: { label: string, name: string, checked?: dynamic, disabled?: boolean, className?: string[] }
events: ["change"]
```

**Slider** — Range slider
```
props: { label: string, name: string, min?: number, max?: number, step?: number, value?: dynamic, disabled?: boolean, className?: string[] }
events: ["change"]
```

### Action Components

**Button** — Click button
```
props: { label: string, variant?: "primary" | "secondary" | "danger", disabled?: boolean, className?: string[] }
events: ["press"]
```

**Link** — Hyperlink
```
props: { label: string, href: string, external?: boolean, className?: string[] }
```

**DropdownMenu** — Dropdown menu
```
props: { triggerLabel: string, items: [{ label: string, value: string }], className?: string[] }
events: ["select"]
```

**Toggle** — Toggle button
```
props: { label: string, pressed?: dynamic, disabled?: boolean, className?: string[] }
events: ["press"]
```

**ToggleGroup** — Toggle group
```
props: { items: [{ label: string, value: string }], type?: "single" | "multiple", value?: dynamic, className?: string[] }
events: ["change"]
```

**ButtonGroup** — Groups Button children
```
props: { className?: string[] }
```

**Pagination** — Page navigation
```
props: { total: number, pageSize?: number, page?: dynamic, className?: string[] }
events: ["change"]
```

---

## State & Dynamic Expressions

### Bindings
- `{ "$state": "/path" }` — read state value (one-way)
- `{ "$bindState": "/path" }` — two-way binding for form inputs (use on value/checked prop)
- `{ "$template": "Hello, ${/user/name}!" }` — string interpolation with state values
- `{ "$item": "field" }` — access field in repeat scope
- `{ "$item": "$value" }` — raw item value (for string arrays)
- `{ "$bindItem": "field" }` — two-way binding to repeat item field
- `{ "$index": true }` — current repeat index

### Conditional Expressions
```json
{
  "color": {
    "$cond": { "$state": "/isActive", "eq": true },
    "$then": "text-primary",
    "$else": "text-muted-foreground"
  }
}
```

---

## Dynamic Lists (repeat)

### String Array
```json
{
  "state": { "skills": ["JavaScript", "React", "Node.js"] },
  "elements": {
    "skill-list": {
      "type": "Stack",
      "props": { "direction": "horizontal", "gap": "sm" },
      "repeat": { "statePath": "/skills" },
      "children": ["skill-badge"]
    },
    "skill-badge": {
      "type": "Badge",
      "props": { "text": { "$item": "$value" }, "className": ["bg-primary/10", "text-primary"] },
      "children": []
    }
  }
}
```

### Object Array
```json
{
  "state": {
    "team": [
      { "id": "1", "name": "Alice", "role": "Engineer" },
      { "id": "2", "name": "Bob", "role": "Designer" }
    ]
  },
  "elements": {
    "team-list": {
      "type": "Stack",
      "props": { "direction": "vertical", "gap": "md" },
      "repeat": { "statePath": "/team", "key": "id" },
      "children": ["team-card"]
    },
    "team-card": {
      "type": "Stack",
      "props": { "direction": "horizontal", "gap": "md", "align": "center", "className": ["p-4", "rounded-lg", "border", "border-border"] },
      "children": ["member-avatar", "member-info"]
    },
    "member-avatar": {
      "type": "Avatar",
      "props": { "fallback": { "$item": "name" }, "size": "md" },
      "children": []
    },
    "member-info": {
      "type": "Stack",
      "props": { "direction": "vertical", "gap": "sm" },
      "children": ["member-name", "member-role"]
    },
    "member-name": {
      "type": "Text",
      "props": { "text": { "$item": "name" }, "className": ["font-semibold"] },
      "children": []
    },
    "member-role": {
      "type": "Text",
      "props": { "text": { "$item": "role" }, "variant": "muted" },
      "children": []
    }
  }
}
```

---

## Actions (on)

```json
{ "on": { "press": { "action": "setState", "params": { "statePath": "/count", "value": 0 } } } }
```

Built-in actions:
- `setState` — set value: `{ "statePath": "/path", "value": ... }`
- `pushState` — append to array: `{ "statePath": "/items", "value": { "id": "3", "title": "New" } }`
- `removeState` — remove by index: `{ "statePath": "/items", "index": 0 }`
- `submit` — collect bound form state: `"on": { "press": { "action": "submit" } }`

---

## Validation (checks)

```json
{
  "type": "Input",
  "props": {
    "label": "Email",
    "name": "email",
    "value": { "$bindState": "/email" },
    "checks": [
      { "type": "required", "message": "Email is required" },
      { "type": "email", "message": "Invalid email address" }
    ],
    "validateOn": "blur"
  },
  "children": []
}
```

Check types: `required`, `email`, `url`, `numeric`, `minLength` (args: { min }), `maxLength` (args: { max }), `min` (args: { min }), `max` (args: { max }), `pattern` (args: { pattern }), `matches` (args: { other: { "$state": "/path" } }).

---

## Visibility Conditions

```json
{ "visible": { "$state": "/showDetails" } }
{ "visible": { "$state": "/role", "eq": "admin" } }
{ "visible": { "$state": "/loading", "not": true } }
{ "visible": [{ "$state": "/loggedIn" }, { "$state": "/isAdmin" }] }
```

---

## Example: Login Form with Validation

```json
{
  "root": "main",
  "state": { "email": "", "password": "", "remember": false },
  "elements": {
    "main": {
      "type": "Card",
      "props": {
        "title": "Welcome back",
        "description": "Sign in to your account",
        "className": ["max-w-md", "mx-auto", "shadow-lg"]
      },
      "children": ["form"]
    },
    "form": {
      "type": "Stack",
      "props": { "direction": "vertical", "gap": "lg" },
      "children": ["email-input", "password-input", "options-row", "login-btn", "divider", "signup-link"]
    },
    "email-input": {
      "type": "Input",
      "props": {
        "label": "Email",
        "name": "email",
        "type": "email",
        "placeholder": "you@example.com",
        "value": { "$bindState": "/email" },
        "checks": [
          { "type": "required", "message": "Email is required" },
          { "type": "email", "message": "Please enter a valid email" }
        ],
        "validateOn": "blur"
      },
      "children": []
    },
    "password-input": {
      "type": "Input",
      "props": {
        "label": "Password",
        "name": "password",
        "type": "password",
        "placeholder": "Enter your password",
        "value": { "$bindState": "/password" },
        "checks": [
          { "type": "required", "message": "Password is required" },
          { "type": "minLength", "args": { "min": 8 }, "message": "At least 8 characters" }
        ],
        "validateOn": "blur"
      },
      "children": []
    },
    "options-row": {
      "type": "Stack",
      "props": { "direction": "horizontal", "justify": "between", "align": "center" },
      "children": ["remember-me", "forgot-link"]
    },
    "remember-me": {
      "type": "Checkbox",
      "props": { "label": "Remember me", "name": "remember", "checked": { "$bindState": "/remember" } },
      "children": []
    },
    "forgot-link": {
      "type": "Link",
      "props": { "label": "Forgot password?", "href": "#", "className": ["text-sm", "text-primary"] },
      "children": []
    },
    "login-btn": {
      "type": "Button",
      "props": {
        "label": "Sign in",
        "variant": "primary",
        "className": ["w-full", "bg-primary", "text-primary-foreground", "shadow-sm"]
      },
      "on": { "press": { "action": "submit" } },
      "children": []
    },
    "divider": {
      "type": "Separator",
      "props": {},
      "children": []
    },
    "signup-link": {
      "type": "Text",
      "props": {
        "text": "Don't have an account? Sign up",
        "variant": "muted",
        "className": ["text-center", "text-sm"]
      },
      "children": []
    }
  }
}
```

