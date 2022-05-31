/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import palette from '@craftercms/studio-ui/styles/palette';
import { CSSObject } from 'tss-react';

export interface GuestStyleSheetConfig<RuleName extends string | number | symbol = string> {
  styles: Record<RuleName, CSSObject>;
  assetUploadMaskZIndex: number;
  assetUploadMaskBackgroundColor: string;
  zoneLabelBackground: string;
  zoneLabelTextColor: string;
  zoneLabelZIndex: number;
  zoneMarkerZIndex: number;
  dropMarkerZIndex: number;
  dropMarkerColor: string;
  snackBarZIndex: number;
  snackBarBackgroundColor: string;
  zoneMarkerOutlineColor: string;
  validationMandatoryColor: string;
  validationSuggestedColor: string;
  inlineTextEditorOutlineColor: string;
  inlineTextEditorFocusOutlineColor: string;
}

export const defaultStyleConfig: GuestStyleSheetConfig = {
  styles: undefined,
  assetUploadMaskZIndex: 1010,
  assetUploadMaskBackgroundColor: 'white',
  dropMarkerZIndex: 1010,
  dropMarkerColor: palette.blue.main,
  snackBarZIndex: 1010,
  snackBarBackgroundColor: 'rgb(49, 49, 49)',
  zoneLabelZIndex: 1010,
  zoneLabelTextColor: '#00270b',
  zoneLabelBackground: 'linear-gradient(to bottom, rgba(48,219,91,0.8) 0%, rgba(52,199,89,0.8) 100%)',
  zoneMarkerZIndex: 1010,
  zoneMarkerOutlineColor: palette.green.main,
  inlineTextEditorOutlineColor: palette.blue.tint,
  inlineTextEditorFocusOutlineColor: palette.blue.main,
  validationMandatoryColor: palette.red.main,
  validationSuggestedColor: palette.orange.main
};
