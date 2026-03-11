"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Youtube from "@tiptap/extension-youtube";
import type { JSONContent } from "@tiptap/react";
import { useEffect, useRef, useCallback } from "react";
import { cn } from "@workspace/ui/lib/utils";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  HighlighterIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  PilcrowIcon,
  ListIcon,
  ListOrderedIcon,
  ListChecksIcon,
  QuoteIcon,
  CodeIcon,
  MinusIcon,
  ImageIcon,
  LinkIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  UndoIcon,
  RedoIcon,
  SubscriptIcon,
  SuperscriptIcon,
} from "lucide-react";

// Hoisted to module scope - no runtime dependencies
const extensions = [
  StarterKit,
  Image,
  Link.configure({ openOnClick: false }),
  Underline,
  Placeholder.configure({ placeholder: "Start writing..." }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Highlight.configure({ multicolor: true }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Subscript,
  Superscript,
  Youtube,
];

function useAutoCompleteToolResult(
  status: { type: string },
  addResult: (result: { success: boolean }) => void,
) {
  const addResultRef = useRef(addResult);
  addResultRef.current = addResult;

  useEffect(() => {
    if (status.type === "requires-action") {
      addResultRef.current({ success: true });
    }
  }, [status.type]);
}

function MenuButton({
  onClick,
  isActive = false,
  disabled = false,
  tooltip,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}

function MenuBar({ editor }: { editor: Editor | null }) {
  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const href = window.prompt("Link URL:");
    if (href) {
      editor.chain().focus().setLink({ href, target: "_blank" }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
      {/* Undo / Redo */}
      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        tooltip="Undo"
      >
        <UndoIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        tooltip="Redo"
      >
        <RedoIcon className="size-4" />
      </MenuButton>

      <Separator />

      {/* Block type */}
      <MenuButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={editor.isActive("paragraph")}
        tooltip="Paragraph"
      >
        <PilcrowIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        tooltip="Heading 1"
      >
        <Heading1Icon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        tooltip="Heading 2"
      >
        <Heading2Icon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        tooltip="Heading 3"
      >
        <Heading3Icon className="size-4" />
      </MenuButton>

      <Separator />

      {/* Inline formatting */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        tooltip="Bold"
      >
        <BoldIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        tooltip="Italic"
      >
        <ItalicIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        tooltip="Underline"
      >
        <UnderlineIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        tooltip="Strikethrough"
      >
        <StrikethroughIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        tooltip="Inline Code"
      >
        <CodeIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive("highlight")}
        tooltip="Highlight"
      >
        <HighlighterIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        isActive={editor.isActive("subscript")}
        tooltip="Subscript"
      >
        <SubscriptIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        isActive={editor.isActive("superscript")}
        tooltip="Superscript"
      >
        <SuperscriptIcon className="size-4" />
      </MenuButton>

      <Separator />

      {/* Lists */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        tooltip="Bullet List"
      >
        <ListIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        tooltip="Ordered List"
      >
        <ListOrderedIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive("taskList")}
        tooltip="Task List"
      >
        <ListChecksIcon className="size-4" />
      </MenuButton>

      <Separator />

      {/* Block elements */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        tooltip="Blockquote"
      >
        <QuoteIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        tooltip="Horizontal Rule"
      >
        <MinusIcon className="size-4" />
      </MenuButton>
      <MenuButton onClick={addImage} tooltip="Insert Image">
        <ImageIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={addLink}
        isActive={editor.isActive("link")}
        tooltip="Insert Link"
      >
        <LinkIcon className="size-4" />
      </MenuButton>

      <Separator />

      {/* Text alignment */}
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        tooltip="Align Left"
      >
        <AlignLeftIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        tooltip="Align Center"
      >
        <AlignCenterIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        tooltip="Align Right"
      >
        <AlignRightIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        isActive={editor.isActive({ textAlign: "justify" })}
        tooltip="Justify"
      >
        <AlignJustifyIcon className="size-4" />
      </MenuButton>
    </div>
  );
}

function TiptapBlogRenderer({
  title,
  content,
  loading,
}: {
  title: string;
  content: JSONContent;
  loading: boolean;
}) {
  const editor = useEditor({
    extensions,
    content,
    editable: true,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[200px] px-4 py-3",
      },
    },
  });

  // Update editor content when streaming new content
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border bg-background">
      <div className="border-b bg-muted/30 px-4 py-3">
        <h2 className="font-semibold text-lg">{title || "Untitled"}</h2>
      </div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {loading && (
        <div className="border-t px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Generating blog...
          </div>
        </div>
      )}
    </div>
  );
}

export const TiptapRenderToolUI = makeAssistantToolUI<
  {
    title: string;
    content: JSONContent;
  },
  { success: boolean }
>({
  toolName: "render_blog",
  render: ({ args, status, addResult }) => {
    useAutoCompleteToolResult(status, addResult);

    const loading = status.type === "running";

    if (!args?.content) {
      if (!loading) return null;
      return (
        <div className="my-4 rounded-xl border bg-muted/30 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Generating blog...
          </div>
        </div>
      );
    }

    return (
      <TiptapBlogRenderer
        title={args.title || ""}
        content={args.content}
        loading={loading}
      />
    );
  },
});
