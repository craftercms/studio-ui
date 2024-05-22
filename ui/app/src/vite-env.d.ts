/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_SHOW_TOOLS_PANEL: string;
  VITE_PREVIEW_LANDING: string;
  VITE_AUTHORING_BASE: string;
  VITE_GUEST_BASE: string;
  /**
   * Can be used to specify a different entry file other than `main.prod.tsx`
   * to use for the dev server's `index.html`.
   */
  VITE_MAIN: string;
}
