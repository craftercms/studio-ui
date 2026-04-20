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

import React, { useEffect } from 'react';
import { useItemMetaContext, useStableFormContext } from '../lib/formsEngineContext';
import { PrimitiveAtom, useAtom } from 'jotai';

export function AutoFileName() {
	const { id } = useItemMetaContext();
	const formContext = useStableFormContext();
	const atoms = formContext.atoms;
	const [value, setValue] = useAtom(atoms.fileName as PrimitiveAtom<string>);

	useEffect(() => {
		if (!value) {
			setValue(id);
		}
	}, [setValue, value, id]);
	return (
		// This control has no visual presentation.
		<></>
	);
}

export default AutoFileName;
