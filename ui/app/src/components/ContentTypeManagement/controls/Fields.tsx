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

import React, { useMemo } from 'react';
import FormsEngineField from '../../FormsEngine/components/FormsEngineField';
import { ControlProps } from '../../FormsEngine/types';
import TouchSortableList from '../../FormsEngine/components/TouchSortableList';
import SortableList from '../../FormsEngine/components/SortableList';
import { isTouchDevice } from '../../FormsEngine/lib/sortableListUtil';

export interface FieldsProps extends ControlProps {
	value: string[];
}

export function Fields(props: FieldsProps) {
	const { field, value, setValue } = props;
	const useTouchSorting = useMemo(() => isTouchDevice(), []);
	const fields = value.map((item) => ({ key: item, value: item }));

	const onReorderFields = (newFields) => {
		setValue(newFields.map((item) => item.key));
	};

	return (
		<FormsEngineField field={field}>
			{useTouchSorting ? (
				<TouchSortableList items={fields} onChange={onReorderFields} />
			) : (
				<SortableList items={fields} onChange={onReorderFields} />
			)}
		</FormsEngineField>
	);
}

export default Fields;
