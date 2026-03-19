export const queryKeys = {
  threads: {
    all: ["threads"] as const,
    list: (agentId: string) => ["threads", agentId] as const,
  },
  threadMessages: {
    all: ["thread-messages"] as const,
    detail: (chatApiPath: string, threadId?: string) =>
      ["thread-messages", chatApiPath, threadId] as const,
  },
  buildJob: {
    all: ["build-job"] as const,
    status: (jobId: string) => ["build-job", jobId] as const,
  },
  syntheticTest: {
    all: ["synthetic-test"] as const,
    detail: (id: string) => ["synthetic-test", id] as const,
    reports: (id: string) => ["synthetic-test-reports", id] as const,
  },
  sandboxEditor: {
    tree: () => ["sandbox-editor", "tree"] as const,
    file: (path: string) => ["sandbox-editor", "file", path] as const,
  },
} as const;
