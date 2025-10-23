/*
 * Copyright (C) 2007-2025 Crafter Software Corporation. All Rights Reserved.
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

import type { EnhancedDialogProps } from '../EnhancedDialog';
import type { ReactNode } from 'react';

export interface ImageEditorDialogBaseProps {
	path?: string;
	mimeType?: string;
	restrictions?: ImageRestrictions;
	writeContent?: boolean;
	title?: ReactNode;
	subtitle?: ReactNode;
	tools?: ('crop' | 'rotate' | 'flip' | 'adjustments')[];
}

export interface ImageRestrictions {
	width?: number;
	height?: number;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
}

export interface ImageEditorDialogProps extends ImageEditorDialogBaseProps, EnhancedDialogProps {
	onCrop?(blob: Blob, path?: string | null): void;
}
