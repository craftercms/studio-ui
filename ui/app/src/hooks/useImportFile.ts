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

import useActiveSiteId from './useActiveSiteId';
import { useEffect, useState } from 'react';
import { importFile } from '../services/plugin';

type Return = { error: unknown; module: Partial<Record<'default' | string, unknown>> } | undefined;

// FE2 TODO: backend does not support mjs extension
export function useImportFile(type: string, name: string, file?: string, id?: string): Return {
	const site = useActiveSiteId();
	const [value, setValue] = useState<Return>();
	useEffect(() => {
		let mounted = true;
		importFile(site, type, name, file, id)
			.then((module) => mounted && setValue({ error: null, module }))
			.catch((error) => mounted && setValue({ error, module: null }));
		return () => {
			mounted = false;
		};
	}, [site, type, name, file, id]);
	return value;
}

export default useImportFile;
