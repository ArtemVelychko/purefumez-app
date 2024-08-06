import { Doc } from "@/convex/_generated/dataModel";
import { create } from "zustand";

type OpenMaterialState = {
  material: Doc<"materials"> | null;
  isOpen: boolean;
  onOpen: (material: Doc<"materials">) => void;
  onClose: () => void;
};

export const useOnOpenMaterial = create<OpenMaterialState>((set) => ({
  material: null,
  isOpen: false,
  onOpen: (material: Doc<"materials">) => set({ material, isOpen: true }),
  onClose: () => set({ isOpen: false, material: null}),
}));