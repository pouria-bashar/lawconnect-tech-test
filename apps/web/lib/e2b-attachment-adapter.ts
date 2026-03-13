import type { AttachmentAdapter } from "@assistant-ui/react";

export const e2bAttachmentAdapter: AttachmentAdapter = {
  accept: "*/*",

  async add({ file }) {
    return {
      id: crypto.randomUUID(),
      type: file.type.startsWith("image/") ? "image" as const : "document" as const,
      name: file.name,
      contentType: file.type,
      file,
      status: { type: "requires-action" as const, reason: "composer-send" as const },
    };
  },

  async send(attachment) {
    const file = attachment.file;
    if (!file) throw new Error("No file to upload");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/generative-ui/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload file");

    const { name } = await res.json();

    return {
      ...attachment,
      status: { type: "complete" as const },
      content: [
        {
          type: "text" as const,
          text: `[Attached file: ${name}]`,
        },
      ],
    };
  },

  async remove() {
    // No cleanup needed — sandbox files are ephemeral
  },
};
