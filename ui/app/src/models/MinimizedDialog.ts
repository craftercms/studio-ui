import StandardAction from './StandardAction';
import { LookupTable } from './LookupTable';

export interface MinimizedDialogStatus {
  status?: string,
  files?: number,
  uploadedFiles?: number,
  progress?: number
}

export interface MinimizedDialog {
  id: string;
  title: string;
  minimized: boolean;
  subtitle?: string;
  status?: MinimizedDialogStatus;
  onMaximized?: StandardAction;
}

export type MinimizedDialogsStateProps = LookupTable<MinimizedDialog>;
