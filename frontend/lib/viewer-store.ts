import { create } from "zustand";

export interface CitationData {
  passageId: string;
  docId: string;
  title: string;
  page: number;
  text: string;
  // Fields used by CitationChip
  label: string;
  pageNumber: number;
  highlightText?: string;
}

interface ViewerState {
  isOpen: boolean;
  docId: string | null;
  activeCitation: CitationData | null;
  viewerWidth: number;
  viewerOnLeft: boolean;
  isMaximized: boolean;
  activePassageId: string | null;

  openViewer: (citation: CitationData) => void;
  closeViewer: () => void;
  openDoc: (docId: string) => void;
  closeDoc: () => void;
  setViewerWidth: (width: number) => void;
  toggleMaximize: () => void;
  setPassage: (passageId: string | null) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  isOpen: false,
  docId: null,
  activeCitation: null,
  viewerWidth: 50,
  viewerOnLeft: false,
  isMaximized: false,
  activePassageId: null,

  openViewer: (citation) =>
    set({ isOpen: true, docId: citation.docId, activeCitation: citation, activePassageId: citation.passageId }),
  closeViewer: () =>
    set({ isOpen: false, docId: null, activeCitation: null, activePassageId: null }),
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
    page: state.activeCitation?.pageNumber ?? 1,
  };
};
