"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tree, type NodeApi } from "react-arborist";
import MonacoEditor from "@monaco-editor/react";
import {
  CaretRightIcon,
  FileIcon,
  FileTsIcon,
  FileTsxIcon,
  FileJsIcon,
  FileJsxIcon,
  FileCssIcon,
  FileHtmlIcon,
  FileMdIcon,
  FileSqlIcon,
  FileIniIcon,
  FileCodeIcon,
  FolderIcon,
  FolderOpenIcon,
} from "@phosphor-icons/react";
import { Button } from "@workspace/ui/components/button";
import { useSandboxFileTree, useSandboxFile, useSaveFile, type FileTreeNode } from "@/hooks/use-sandbox-editor";

const EXT_TO_LANGUAGE: Record<string, string> = {
  ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
  json: "json", html: "html", css: "css", md: "markdown",
  toml: "ini", yaml: "yaml", yml: "yaml", sh: "shell", sql: "sql",
};

function getLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_LANGUAGE[ext] ?? "plaintext";
}

function FileTypeIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "ts":
      return <FileTsIcon size={14} weight="duotone" className="shrink-0 text-blue-400" />;
    case "tsx":
      return <FileTsxIcon size={14} weight="duotone" className="shrink-0 text-blue-400" />;
    case "js":
      return <FileJsIcon size={14} weight="duotone" className="shrink-0 text-yellow-400" />;
    case "jsx":
      return <FileJsxIcon size={14} weight="duotone" className="shrink-0 text-yellow-400" />;
    case "css":
      return <FileCssIcon size={14} weight="duotone" className="shrink-0 text-sky-400" />;
    case "html":
      return <FileHtmlIcon size={14} weight="duotone" className="shrink-0 text-orange-400" />;
    case "md":
      return <FileMdIcon size={14} weight="duotone" className="shrink-0 text-slate-400" />;
    case "sql":
      return <FileSqlIcon size={14} weight="duotone" className="shrink-0 text-pink-400" />;
    case "toml":
    case "ini":
      return <FileIniIcon size={14} weight="duotone" className="shrink-0 text-purple-400" />;
    case "json":
      return <FileCodeIcon size={14} weight="duotone" className="shrink-0 text-yellow-300" />;
    case "yaml":
    case "yml":
    case "sh":
      return <FileCodeIcon size={14} weight="duotone" className="shrink-0 text-muted-foreground" />;
    default:
      return <FileIcon size={14} weight="duotone" className="shrink-0 text-muted-foreground" />;
  }
}

function FileNode({
  node,
  style,
  dragHandle,
  onSelectFile,
  selectedPath,
}: {
  node: NodeApi<FileTreeNode>;
  style: React.CSSProperties;
  dragHandle?: (el: HTMLDivElement | null) => void;
  onSelectFile: (path: string) => void;
  selectedPath: string | null;
}) {
  const isSelected = node.data.id === selectedPath;

  return (
    <div
      ref={dragHandle}
      style={style}
      className={`flex items-center gap-1 px-1 py-0.5 text-xs cursor-pointer select-none rounded-sm transition-colors ${
        isSelected
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      onClick={() => {
        if (node.isInternal) {
          node.toggle();
        } else {
          onSelectFile(node.data.id);
        }
      }}
    >
      {/* Chevron — only for folders */}
      {node.isInternal ? (
        <CaretRightIcon
          size={12}
          className={`shrink-0 transition-transform ${node.isOpen ? "rotate-90" : ""}`}
        />
      ) : (
        <span className="size-3 shrink-0" />
      )}

      {/* Folder or file icon */}
      {node.isInternal ? (
        node.isOpen
          ? <FolderOpenIcon size={14} weight="duotone" className="shrink-0 text-yellow-400" />
          : <FolderIcon size={14} weight="duotone" className="shrink-0 text-yellow-400" />
      ) : (
        <FileTypeIcon name={node.data.name} />
      )}

      <span className="ml-1 truncate">{node.data.name}</span>
    </div>
  );
}

export function SandboxEditorPanel({ projectId, projectDir }: { projectId: string; projectDir: string | null }) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ path: string; content: string } | null>(null);
  const { data: treeData, isLoading: treeLoading, error: treeError } = useSandboxFileTree(projectId, projectDir);
  const { data: fileData, isLoading: fileLoading } = useSandboxFile(selectedPath, projectId);
  const saveFile = useSaveFile(projectId);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [treeHeight, setTreeHeight] = useState(500);

  const editorContent = draft?.path === selectedPath ? draft.content : (fileData?.content ?? null);
  const isDirty = draft?.path === selectedPath && draft.content !== fileData?.content;

  useEffect(() => {
    if (!treeContainerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h) setTreeHeight(h);
    });
    ro.observe(treeContainerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleSave = useCallback(() => {
    if (!selectedPath || !isDirty || draft?.path !== selectedPath) return;
    saveFile.mutate({ path: selectedPath, content: draft.content });
  }, [selectedPath, isDirty, draft, saveFile]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background w-full">
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold">Editor</h3>
          {selectedPath && (
            <span className="text-xs text-muted-foreground truncate">
              {selectedPath.split("/").pop()}
            </span>
          )}
          {isDirty && <span className="text-xs text-muted-foreground">· Unsaved</span>}
        </div>
        {selectedPath && (
          <Button
            variant="outline"
            size="xs"
            onClick={handleSave}
            disabled={!isDirty || saveFile.isPending}
          >
            {saveFile.isPending ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div ref={treeContainerRef} className="w-56 shrink-0 border-r overflow-y-auto bg-muted/20 py-2 px-3">
          {treeLoading && <p className="text-xs text-muted-foreground">Loading files...</p>}
          {treeError && <p className="text-xs text-destructive">Failed to load files</p>}
          {treeData?.tree && (
            <Tree<FileTreeNode>
              data={treeData.tree}
              openByDefault={false}
              width={176}
              height={treeHeight}
              indent={12}
              rowHeight={24}
              disableDrag
              disableDrop
            >
              {({ node, style, dragHandle }) => (
                <FileNode
                  node={node}
                  style={style}
                  dragHandle={dragHandle ?? undefined}
                  onSelectFile={setSelectedPath}
                  selectedPath={selectedPath}
                />
              )}
            </Tree>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          {!selectedPath && (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Select a file to edit
            </div>
          )}
          {selectedPath && fileLoading && (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Loading...
            </div>
          )}
          {selectedPath && !fileLoading && (
            <MonacoEditor
              height="100%"
              language={getLanguage(selectedPath)}
              value={editorContent ?? ""}
              onChange={(val) => selectedPath && setDraft({ path: selectedPath, content: val ?? "" })}
              theme="vs-dark"
              beforeMount={(monaco) => {
                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                  noSemanticValidation: true,
                  noSyntaxValidation: true,
                });
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                  noSemanticValidation: true,
                  noSyntaxValidation: true,
                });
              }}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                lineNumbers: "on",
                wordWrap: "on",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
