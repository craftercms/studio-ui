/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { createContext, MutableRefObject, useContext } from 'react';
import { DiffEditorProps } from '@monaco-editor/react';
import { CompareVersionsDialogProps } from './utils';
import { ViewVersionDialogProps } from '../ViewVersionDialog/utils';
import { LookupTable } from '../../models';

export interface FieldViewState {
  compareXml: boolean;
  cleanText: boolean;
  compareMode: boolean;
  compareModeDisabled: boolean;
  xmlEditorOptions: DiffEditorProps['options'];
}

export interface VersionsDialogContextProps {
  compareSlideOutState?: CompareVersionsDialogProps;
  viewSlideOutState: ViewVersionDialogProps;
  fieldsViewState: LookupTable<FieldViewState>;
}

export const initialFieldViewState = {
  compareXml: false,
  cleanText: false,
  compareMode: false,
  compareModeDisabled: false,
  xmlEditorOptions: {
    ignoreTrimWhitespace: false,
    renderSideBySide: true,
    diffWordWrap: 'off' as DiffEditorProps['options']['diffWordWrap'],
    wordWrap: 'on' as DiffEditorProps['options']['wordWrap']
  }
};

export interface VersionsDialogContextApi {
  setState: (state: Partial<VersionsDialogContextProps>) => void;
  setCompareSlideOutState: (props: Partial<CompareVersionsDialogProps>) => void;
  setViewSlideOutState: (props: Partial<ViewVersionDialogProps>) => void;
  setFieldViewState: (fieldId: string, viewState: Partial<FieldViewState>) => void;
  setFieldViewEditorOptionsState: (fieldId: string, options: DiffEditorProps['options']) => void;
  closeSlideOuts: () => void;
}

export type VersionsDialogContextType = [VersionsDialogContextProps, MutableRefObject<VersionsDialogContextApi>];

export const VersionsDialogContext = createContext<VersionsDialogContextType>(null);

export function useVersionsDialogContext() {
  const context = useContext(VersionsDialogContext);
  if (!context) {
    throw new Error('useMyContext must be used within a MyProvider');
  }
  return context;
}
