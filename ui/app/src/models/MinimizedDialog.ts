import StandardAction from './StandardAction';
import { LookupTable } from './LookupTable';

export interface Status {
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
  status?: Status;
  onMaximized?: StandardAction;
}

export type MinimizedDialogsStateProps = LookupTable<MinimizedDialog>;
