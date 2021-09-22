import StandardAction from './StandardAction';
import { LookupTable } from './LookupTable';

export interface MinimizedTab {
  id: string;
  title: string;
  minimized: boolean;
  subtitle?: string;
  status?: 'indeterminate' | number;
  onMaximized?: StandardAction;
}

export type MinimizedDialogsStateProps = LookupTable<MinimizedTab>;
