import { create } from "zustand";

export interface MindMapData {
  nodes: any[];
  edges: any[];
}

interface MindMapState {
  isOpen: boolean;
  docId: string | null;
  mindMapWidth: number; // percentage
  data: MindMapData | null;
  lastGenerated: string | null;
  canUndo: boolean;
  loading: boolean;

  openMap: (docId: string) => void;
  closeMap: () => void;
  setMindMapWidth: (width: number) => void;
  setData: (data: MindMapData, generatedAt: string, canUndo: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useMindMapStore = create<MindMapState>((set) => ({
  isOpen: false,
  docId: null,
  mindMapWidth: 50,
  data: null,
  lastGenerated: null,
  canUndo: false,
  loading: false,

  openMap: (docId) => set({ docId, isOpen: true }),
  closeMap: () => set({ isOpen: false, docId: null }),
  setMindMapWidth: (mindMapWidth) => set({ mindMapWidth }),
  setData: (data, lastGenerated, canUndo) => set({ data, lastGenerated, canUndo, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
