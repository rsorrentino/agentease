'use client';

import { create } from 'zustand';

type WizardState = {
  name: string;
  description: string;
  promptTemplate: string;
  setField: (field: 'name' | 'description' | 'promptTemplate', value: string) => void;
  reset: () => void;
};

export const useAgentWizardStore = create<WizardState>((set) => ({
  name: '',
  description: '',
  promptTemplate: '',
  setField: (field, value) => set(() => ({ [field]: value })),
  reset: () => set({ name: '', description: '', promptTemplate: '' })
}));
