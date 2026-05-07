import { create } from "zustand";

export interface CitationData {
  passageId: string;
  docId: string;
  title: string;
  page: number;
  text: string;
}

interface ViewerState {
  isOpen: boolean;
  docId: string | null;
  viewerWidth: number; // percentage
  viewerOnLeft: boolean;
  isMaximized: boolean;
  activePassageId: string | null;
  
  openDoc: (docId: string) => void;
  closeDoc: () => void;
  setViewerWidth: (width: number) => void;
  toggleMaximize: () => void;
  setPassage: (passageId: string | null) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  isOpen: false,
  docId: null,
  viewerWidth: 50,
  viewerOnLeft: false,
  isMaximized: false,
  activePassageId: null,

  openDoc: (docId) => set({ docId, isOpen: true }),
  closeDoc: () => set({ isOpen: false, docId: null }),
  setViewerWidth: (viewerWidth) => set({ viewerWidth }),
  toggleMaximize: () => set((state) => ({ isMaximized: !state.isMaximized })),
  setPassage: (activePassageId) => set({ activePassageId }),
}));

export const getViewerContextSnapshot = () => {
  const state = useViewerStore.getState();
  if (!state.isOpen || !state.docId) return null;
  return {
    docId: state.docId,
    page: 1, // Placeholder or extract from actual DOM if possible
  };
};
