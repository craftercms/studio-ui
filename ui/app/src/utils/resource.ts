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

import { Resource } from '../models/Resource';

export function createFakeResource<T>(result: T): Resource<T> {
	return {
		complete: true,
		error: false,
		read() {
			return result;
		}
	};
}

export function createResource<T>(factoryFn: () => Promise<T>): Resource<T> {
	let result: T;
	let status: 'pending' | 'error' | 'success' = 'pending';
	const resource: { complete: boolean; error: boolean; read(): T } = {
		complete: false,
		error: false,
		read() {
			if (status === 'pending') {
				throw factoryFn().then(
					(response) => {
						status = 'success';
						result = response;
						return response;
					},
					(error) => {
						status = 'error';
						result = error;
						return result;
					}
				);
			} else if (status === 'error') {
				resource.complete = true;
				resource.error = true;
				throw result;
			} else if (status === 'success') {
				resource.complete = true;
				return result;
			}
		}
	};
	return resource;
}

export function createResourceBundle<T>(): [Resource<T>, (value?: T | Promise<T>) => void, (reason?: unknown) => void] {
	let resolve: (value?: T | Promise<T>) => void, reject: (reason?: unknown) => void;
	const promise = new Promise<T>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	return [createResource(() => promise), resolve, reject];
}
