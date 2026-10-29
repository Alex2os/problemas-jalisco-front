import { create } from "zustand";
import type { ReportDraft } from "../services/types";

interface DraftState extends ReportDraft {
  isSubmitting: boolean;
  setSubmitting: (isSubmitting: boolean) => void;
  setStep: (step: number) => void;
  setCategory: (category: string) => void;
  setLocation: (location: Partial<Pick<ReportDraft, "latitude" | "longitude" | "address" | "colonia" | "municipality" | "reference">>) => void;
  setPhotos: (photos: ReportDraft["photos"]) => void;
  setDescription: (description: string) => void;
  resetDraft: () => Promise<void>;
}
const emptyDraft = (): ReportDraft => ({
  step: 1, category: null, latitude: 20.6767, longitude: -103.3472,
  address: "", colonia: "", municipality: "Guadalajara", reference: "",
  photos: [], description: "", lastUpdated: Date.now(),
});

// Unsubmitted form state only. Reports and drafts are never saved to device storage.
export const useDraftStore = create<DraftState>((set) => ({
  ...emptyDraft(),
  isSubmitting: false,
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setStep: (step) => set({ step }),
  setCategory: (category) => set({ category }),
  setLocation: (location) => set(location),
  setPhotos: (photos) => set({ photos }),
  setDescription: (description) => set({ description }),
  resetDraft: async () => { set({ ...emptyDraft(), isSubmitting: false }); },
}));
