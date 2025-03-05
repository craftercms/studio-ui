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

import { ElementType, lazy } from 'react';

// FE2 TODO: See `typeMap` at services/contentTypes.ts
// | 'image'
// | 'text'
export type BuiltInControlType =
	| 'repeat'
	| 'auto-filename'
	| 'aws-file-upload'
	| 'box-file-upload'
	| 'checkbox-group'
	| 'checkbox'
	| 'date-time'
	| 'disabled'
	| 'dropdown'
	| 'file-name'
	| 'forcehttps'
	| 'image-picker'
	| 'input'
	| 'internal-name'
	| 'label'
	| 'link-input'
	| 'link-textarea'
	| 'linked-dropdown'
	| 'locale-selector'
	| 'node-selector'
	| 'numeric-input'
	| 'page-nav-order'
	| 'rte'
	| 'textarea'
	| 'time'
	| 'transcoded-video-picker'
	| 'uuid'
	| 'video-picker';

export const controlMap: Record<BuiltInControlType, ElementType> = {
	repeat: lazy(() => import('../controls/Repeat')),
	'auto-filename': lazy(() => import('../controls/AutoFileName')),
	'aws-file-upload': null,
	'box-file-upload': null,
	'checkbox-group': lazy(() => import('../controls/CheckboxGroup')),
	checkbox: lazy(() => import('../controls/Checkbox')),
	'date-time': null,
	disabled: null,
	dropdown: lazy(() => import('../controls/Dropdown')),
	'file-name': lazy(() => import('../controls/Slug')),
	forcehttps: null, // TODO: probably not needed, getname returns `disabled`
	'image-picker': lazy(() => import('../controls/ImagePicker')),
	input: lazy(() => import('../controls/Text')),
	'internal-name': null,
	label: null,
	'link-input': null,
	'link-textarea': null,
	'linked-dropdown': null,
	'locale-selector': null,
	'node-selector': lazy(() => import('../controls/NodeSelector')),
	'numeric-input': lazy(() => import('../controls/Numeric')),
	'page-nav-order': null,
	rte: lazy(() => import('../controls/RichTextEditor')),
	textarea: lazy(() => import('../controls/Textarea')),
	time: null,
	'transcoded-video-picker': null,
	uuid: null,
	'video-picker': null
};
