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

/** Returns true when `localStorage` is available (browser / client). */
export function isLocalStorageAvailable(): boolean {
	return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * SSR-safe `localStorage.getItem`.
 * Returns `null` when unavailable or when the key is missing/empty (same as native).
 */
export function getLocalStorageItem(key: string): string | null {
	if (!key || !isLocalStorageAvailable()) {
		return null;
	}
	return localStorage.getItem(key);
}

/** SSR-safe `localStorage.setItem`. No-ops when storage is unavailable. */
export function setLocalStorageItem(key: string, value: string): void {
	if (!key || !isLocalStorageAvailable()) {
		return;
	}
	localStorage.setItem(key, value);
}

/** SSR-safe `localStorage.removeItem`. No-ops when storage is unavailable. */
export function removeLocalStorageItem(key: string): void {
	if (!key || !isLocalStorageAvailable()) {
		return;
	}
	localStorage.removeItem(key);
}

/** SSR-safe `Object.keys(localStorage)`. Returns `[]` when unavailable. */
export function getLocalStorageKeys(): string[] {
	if (!isLocalStorageAvailable()) {
		return [];
	}
	return Object.keys(localStorage);
}
