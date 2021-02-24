import StandardAction from './StandardAction';
import { LookupTable } from './LookupTable';

export interface MinimizedDialog {
  id: string;
  title: string;
  minimized: boolean;
  subtitle?: string;
  status?: 'indeterminate' | number;
  onMaximized?: StandardAction;
  showMaximizeButton?: false;
}

export type MinimizedDialogsStateProps = LookupTable<MinimizedDialog>;
