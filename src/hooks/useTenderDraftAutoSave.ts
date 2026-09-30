import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TenderSafetyFileDraftState,
  ContractorTierId,
  CONTRACTOR_TIERS,
  TENDER_ADDONS
} from '../types/tenderTypes';
import {
  loadTenderDraft,
  saveTenderDraft,
  clearTenderDraft,
  markTenderPaidUnlocked,
  checkIfTenderPaidUnlocked,
  calculateDraftTotalAmount,
  TENDER_DRAFT_STORAGE_KEY,
  TENDER_PAID_UNLOCKED_KEY
} from '../services/tenderDraftService';

export interface UseTenderDraftAutoSaveReturn {
  draft: TenderSafetyFileDraftState;
  updateDraft: (patch: Partial<TenderSafetyFileDraftState>) => void;
  setTier: (tierId: ContractorTierId, customPrice?: number) => void;
  toggleAddOn: (addonId: string) => void;
  resetDraft: () => void;
  markUnlocked: (tier?: ContractorTierId, addOns?: string[]) => void;
  isPaidUnlocked: boolean;
  totalAmountZar: number;
  lastSavedTime: string;
  isSaving: boolean;
}

export function useTenderDraftAutoSave(debounceMs: number = 400): UseTenderDraftAutoSaveReturn {
  const [draft, setDraft] = useState<TenderSafetyFileDraftState>(() => loadTenderDraft());
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const saveTimerRef = useRef<any>(null);
  const draftRef = useRef<TenderSafetyFileDraftState>(draft);
  draftRef.current = draft;

  // Sync with localStorage on storage event (e.g., checkout opened in modal, external tab, or payment completed)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TENDER_DRAFT_STORAGE_KEY || e.key === TENDER_PAID_UNLOCKED_KEY) {
        const reloaded = loadTenderDraft();
        setDraft(reloaded);
        setLastSavedTime(new Date().toLocaleTimeString());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  // Debounced auto-save function
  const triggerAutoSave = useCallback((updatedDraft: TenderSafetyFileDraftState) => {
    setIsSaving(true);
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      try {
        saveTenderDraft(updatedDraft);
        setLastSavedTime(new Date().toLocaleTimeString());
      } catch (err) {
        console.warn('[useTenderDraftAutoSave] Error saving to localStorage:', err);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);
  }, [debounceMs]);

  // General state update
  const updateDraft = useCallback((patch: Partial<TenderSafetyFileDraftState>) => {
    setDraft(prev => {
      const merged = { ...prev, ...patch };
      // Recalculate total amount if tier, custom price or add-ons changed
      const totalAmountZar = calculateDraftTotalAmount(
        merged.selectedTier,
        merged.customTierPriceZar,
        merged.selectedAddOns || []
      );
      const nextState: TenderSafetyFileDraftState = {
        ...merged,
        totalAmountZar,
        lastSavedAt: new Date().toISOString()
      };
      triggerAutoSave(nextState);
      return nextState;
    });
  }, [triggerAutoSave]);

  // Set Tier and optional custom price
  const setTier = useCallback((tierId: ContractorTierId, customPrice?: number) => {
    const tierObj = CONTRACTOR_TIERS.find(t => t.id === tierId) || CONTRACTOR_TIERS[0];
    const priceToSet = typeof customPrice === 'number' ? customPrice : tierObj.defaultPriceZar;
    updateDraft({
      selectedTier: tierId,
      customTierPriceZar: priceToSet
    });
  }, [updateDraft]);

  // Toggle Add-on
  const toggleAddOn = useCallback((addonId: string) => {
    setDraft(prev => {
      const currentAddOns = prev.selectedAddOns || [];
      const nextAddOns = currentAddOns.includes(addonId)
        ? currentAddOns.filter(id => id !== addonId)
        : [...currentAddOns, addonId];

      const totalAmountZar = calculateDraftTotalAmount(
        prev.selectedTier,
        prev.customTierPriceZar,
        nextAddOns
      );

      const nextState: TenderSafetyFileDraftState = {
        ...prev,
        selectedAddOns: nextAddOns,
        totalAmountZar,
        lastSavedAt: new Date().toISOString()
      };
      triggerAutoSave(nextState);
      return nextState;
    });
  }, [triggerAutoSave]);

  // Reset draft to initial defaults
  const resetDraft = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const fresh = clearTenderDraft();
    setDraft(fresh);
    setLastSavedTime(new Date().toLocaleTimeString());
  }, []);

  // Mark as unlocked/paid
  const markUnlocked = useCallback((tier?: ContractorTierId, addOns?: string[]) => {
    const tierToMark = tier || draftRef.current.selectedTier;
    const addOnsToMark = addOns || draftRef.current.selectedAddOns || [];
    markTenderPaidUnlocked(tierToMark, addOnsToMark);
    updateDraft({
      isPaidUnlocked: true,
      selectedTier: tierToMark,
      selectedAddOns: addOnsToMark
    });
  }, [updateDraft]);

  const isPaidUnlocked = checkIfTenderPaidUnlocked() || draft.isPaidUnlocked;
  const totalAmountZar = draft.totalAmountZar || calculateDraftTotalAmount(
    draft.selectedTier,
    draft.customTierPriceZar,
    draft.selectedAddOns || []
  );

  return {
    draft,
    updateDraft,
    setTier,
    toggleAddOn,
    resetDraft,
    markUnlocked,
    isPaidUnlocked,
    totalAmountZar,
    lastSavedTime,
    isSaving
  };
}
