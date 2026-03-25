/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_API_BASE_URL?: string;
  readonly PUBLIC_FIREBASE_API_KEY: string;
  readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  readonly PUBLIC_FIREBASE_PROJECT_ID: string;
  readonly PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly PUBLIC_FIREBASE_APP_ID: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface Window {
  modalHelpers: {
    openModal: (modalId: string) => void;
    closeModal: (modal: HTMLElement | string) => void;
    closeAllModals: () => void;
    updateModalMessage: (modalId: string, newMessage: string) => void;
  };
  confirmModalHelpers: {
    open: (id: string, onConfirm: () => void) => void;
    close: (id: string | HTMLElement) => void;
  };
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  openForgotPasswordModal: () => void;
}