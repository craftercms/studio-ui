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

import type { ControlProps } from '../../FormsEngine/types';
import FormsEngineField from '../../FormsEngine/components/FormsEngineField';
import React, { useMemo } from 'react';
import { isTouchDevice } from '../../FormsEngine/lib/sortableListUtil';
import type { ContentTypeSection } from '../../../models';
import FieldBox from '../../FormsEngine/components/FieldBox';
import { EmptyState } from '../../EmptyState';
import { FormattedMessage } from 'react-intl';
import TouchSortableList from '../../FormsEngine/components/TouchSortableList';
import SortableList from '../../FormsEngine/components/SortableList';

export interface SectionsProps extends ControlProps {
	value: ContentTypeSection[];
}

export function Sections(props: SectionsProps) {
	const { field, value, setValue } = props;
	const useTouchSorting = useMemo(() => isTouchDevice(), []);
	const sections = value.map((section) => ({ key: section.id, value: section.title, content: section }));
	const hasContent = Boolean(sections?.length);

	const onReorderSections = (newSections) => {
		setValue?.(newSections.map((section) => section.content));
	};

	return (
		<FormsEngineField field={field}>
			<FieldBox sx={{ mt: 1 }} dashed={!hasContent}>
				{hasContent ? (
					useTouchSorting ? (
						<TouchSortableList items={sections} onChange={onReorderSections} />
					) : (
						<SortableList items={sections} onChange={onReorderSections} />
					)
				) : (
					<EmptyState title={<FormattedMessage defaultMessage="No sections set" />} />
				)}
			</FieldBox>
		</FormsEngineField>
	);
}

export default Sections;
