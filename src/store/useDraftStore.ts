import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { ReportDraft } from "../services/types";

const DRAFT_STORAGE_KEY = "@problemas_jalisco_active_draft";

export interface DraftState extends ReportDraft {
  isLoaded: boolean;
  isSaving: boolean;
  setStep: (step: number) => void;
  setCategory: (category: string) => void;
  setLocation: (location: {
    latitude: number;
    longitude: number;
    address?: string;
    colonia?: string;
    municipality?: string;
    reference?: string;
  }) => void;
  addPhoto: (photoUri: string) => void;
  removePhoto: (index: number) => void;
  setDescription: (description: string) => void;
  setContact: (contact: {
    isAnonymous?: boolean;
    contactPhone?: string;
    contactName?: string;
  }) => void;
  resetDraft: () => Promise<void>;
  restoreDraft: () => Promise<void>;
  hasDraftContent: () => boolean;
}

const initialDraftValues: ReportDraft = {
  step: 1,
  category: null,
  latitude: 20.6767,
  longitude: -103.3472,
  address: "",
  colonia: "",
  municipality: "Guadalajara",
  reference: "",
  photos: [],
  description: "",
  isAnonymous: true,
  contactPhone: "",
  contactName: "",
  lastUpdated: Date.now(),
};

export const useDraftStore = create<DraftState>((set, get) => ({
  ...initialDraftValues,
  isLoaded: false,
  isSaving: false,

  setStep: (step: number) => {
    set({ step, lastUpdated: Date.now() });
    void persistDraft(get());
  },

  setCategory: (category: string) => {
    set({ category, lastUpdated: Date.now() });
    void persistDraft(get());
  },

  setLocation: (location) => {
    set((state) => ({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address !== undefined ? location.address : state.address,
      colonia: location.colonia !== undefined ? location.colonia : state.colonia,
      municipality: location.municipality !== undefined ? location.municipality : state.municipality,
      reference: location.reference !== undefined ? location.reference : state.reference,
      lastUpdated: Date.now(),
    }));
    void persistDraft(get());
  },

  addPhoto: (photoUri: string) => {
    const current = get().photos;
    if (current.length >= 3) return;
    set({ photos: [...current, photoUri], lastUpdated: Date.now() });
    void persistDraft(get());
  },

  removePhoto: (index: number) => {
    const current = [...get().photos];
    current.splice(index, 1);
    set({ photos: current, lastUpdated: Date.now() });
    void persistDraft(get());
  },

  setDescription: (description: string) => {
    set({ description, lastUpdated: Date.now() });
    void persistDraft(get());
  },

  setContact: (contact) => {
    set((state) => ({
      isAnonymous: contact.isAnonymous !== undefined ? contact.isAnonymous : state.isAnonymous,
      contactPhone: contact.contactPhone !== undefined ? contact.contactPhone : state.contactPhone,
      contactName: contact.contactName !== undefined ? contact.contactName : state.contactName,
      lastUpdated: Date.now(),
    }));
    void persistDraft(get());
  },

  resetDraft: async () => {
    set({ ...initialDraftValues, isLoaded: true, isSaving: false });
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore local storage error
    }
  },

  restoreDraft: async () => {
    try {
      const stored = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ReportDraft>;
        set({
          ...initialDraftValues,
          ...parsed,
          isLoaded: true,
        });
        return;
      }
    } catch {
      // Ignore parsing errors
    }
    set({ isLoaded: true });
  },

  hasDraftContent: () => {
    const s = get();
    return Boolean(
      s.category ||
        s.address.trim() ||
        s.photos.length > 0 ||
        s.description.trim()
    );
  },
}));

async function persistDraft(state: DraftState) {
  try {
    const dataToSave: ReportDraft = {
      step: state.step,
      category: state.category,
      latitude: state.latitude,
      longitude: state.longitude,
      address: state.address,
      colonia: state.colonia,
      municipality: state.municipality,
      reference: state.reference,
      photos: state.photos,
      description: state.description,
      isAnonymous: state.isAnonymous,
      contactPhone: state.contactPhone,
      contactName: state.contactName,
      lastUpdated: state.lastUpdated,
    };
    await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch {
    // Local storage non-critical failure
  }
}
