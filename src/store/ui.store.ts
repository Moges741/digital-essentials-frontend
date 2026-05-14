
import { create } from 'zustand';

type Language = 'en' | 'am' | 'om';

interface UIState {
  sidebarOpen: boolean;
  language:    Language;

  toggleSidebar:  () => void;
  setSidebarOpen: (open: boolean) => void;
  setLanguage:    (lang: Language) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  language:    'en',

  toggleSidebar:  () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLanguage:    (lang) => set({ language: lang }),
}));