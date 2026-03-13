// Kill-only process registry.
// Uses globalThis so the Map survives HMR reloads in Next.js dev mode.

type KillFn = () => Promise<boolean>;

const g = globalThis as unknown as { __e2bKillFns?: Map<string, KillFn> };
const killFns = (g.__e2bKillFns ??= new Map<string, KillFn>());

export const processRegistry = {
  register(id: string, fn: KillFn) {
    killFns.set(id, fn);
  },

  async kill(id: string): Promise<boolean> {
    const fn = killFns.get(id);
    if (!fn) return false;
    const killed = await fn();
    if (killed) killFns.delete(id);
    return killed;
  },

  remove(id: string) {
    killFns.delete(id);
  },
};
