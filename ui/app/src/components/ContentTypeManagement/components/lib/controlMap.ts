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

export type ContentTypeControlType =
	| 'content-path-input'
	| 'contentTypes'
	| 'dropdown-static-values'
	| 'template-selector'
	| 'type-image-selector'
	| 'datasource-selector'
	| 'read-only-value'
	| 'range'
	| 'type-js-controller-selector'
	| 'key-value-map'
	| 'type-destination-paths-selector'
	| 'path-with-macro-creator'
	| 'merge-strategy-selector'
	| 'datasource-single-selector';

export const controlMap: Record<ContentTypeControlType, ElementType> = {
	'content-path-input': lazy(() => import('../../controls/ContentPathInput')),
	contentTypes: lazy(() => import('../../controls/ContentTypesSelector')),
	'dropdown-static-values': lazy(() => import('../../controls/DropdownStaticValues')),
	'template-selector': lazy(() => import('../../controls/TemplateSelector')),
	'type-image-selector': lazy(() => import('../../controls/TypeImageSelector')),
	'datasource-selector': lazy(() => import('../../controls/DataSourceMultiSelector')),
	'read-only-value': lazy(() => import('../../controls/ReadOnlyValue')),
	range: lazy(() => import('../../controls/Range')),
	'type-js-controller-selector': lazy(() => import('../../controls/TypeJsControllerSelector')),
	'key-value-map': lazy(() => import('../../controls/KeyValueMap')),
	'type-destination-paths-selector': lazy(() => import('../../controls/TypeDestinationPathsSelector')),
	'path-with-macro-creator': lazy(() => import('../../controls/PathWithMacroCreator')),
	'merge-strategy-selector': lazy(() => import('../../controls/MergeStrategySelector')),
	'datasource-single-selector': lazy(() => import('../../controls/DataSourceSingleSelector'))
};
