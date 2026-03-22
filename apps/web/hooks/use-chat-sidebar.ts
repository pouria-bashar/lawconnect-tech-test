import { create } from "zustand";

interface ChatSidebarStore {
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export const useChatSidebar = create<ChatSidebarStore>((set) => ({
  open: true,
  toggle: () => set((s) => ({ open: !s.open })),
  setOpen: (open) => set({ open }),
}));
