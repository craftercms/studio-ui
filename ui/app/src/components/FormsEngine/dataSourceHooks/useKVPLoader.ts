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

import { DataSource } from '../../../models';
import { useEffect, useState } from 'react';
import { forkJoin } from 'rxjs';
import { fetchContentDOM } from '../../../services/content';
import { deserialize, getInnerHtml } from '../../../utils/xml';
import { asArray } from '../../../utils/array';

export interface KVPLoaderItem {
	id: string;
	label: string;
	items: Array<{ key: string; value: string }>;
}

export function useKVPLoader(siteId: string, dataSourceIds: string[], dataSourceList: DataSource[]): KVPLoaderItem[] {
	const [optionGroups, setOptionGroups] = useState<KVPLoaderItem[]>();
	useEffect(() => {
		const keyValuePairItemsToLoad = [];
		const staticKeyValuePairs = [];
		dataSourceList.forEach((ds) => {
			if (dataSourceIds.includes(ds.id)) {
				switch (ds.type) {
					case 'simpleTaxonomy':
						ds.properties.componentPath && keyValuePairItemsToLoad.push(ds.properties.componentPath);
						break;
					case 'key-value-list':
						try {
							staticKeyValuePairs.push({
								id: ds.id,
								label: ds.title,
								items: JSON.parse(ds.properties.options)
							});
						} catch (e) {
							console.error(`Error parsing key-value-list data source ${ds.title} (${ds.id})`, e);
						}
						break;
					default:
						console.warn(`Unsupported data source type: ${ds.type}`, ds);
				}
			}
		});
		if (keyValuePairItemsToLoad.length) {
			forkJoin(keyValuePairItemsToLoad.map((path) => fetchContentDOM(siteId, path))).subscribe((docs) => {
				const optionGroups = docs.flatMap((doc, index) => {
					const items = doc.querySelector(':scope > items');
					if (!items) return [];
					return items
						? {
								id: getInnerHtml(doc.querySelector(':scope > objectId')) || index,
								label: getInnerHtml(doc.querySelector(':scope > internal-name')),
								items: asArray(deserialize(items).items.item)
							}
						: [];
				});
				setOptionGroups(staticKeyValuePairs.concat(optionGroups));
			});
		} else {
			setOptionGroups(staticKeyValuePairs);
		}
	}, [dataSourceIds, dataSourceList, siteId]);
	return optionGroups;
}

export default useKVPLoader;
