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

import { decomposeColor, hslToRgb, recomposeColor, rgbToHex } from '@mui/system';

export type ColourFormat = 'rgb' | 'hsl' | 'hex';

export function toTargetFormat(format: ColourFormat, allowAlpha: boolean, colour: string): string {
	if (!colour) return '';
	let newColour: string = colour;
	switch (format) {
		case 'hex':
			newColour = anyColorToHex(colour, allowAlpha);
			break;
		case 'hsl':
			newColour = anyColorToHsl(colour, allowAlpha);
			break;
		case 'rgb':
			newColour = anyColorToRgb(colour, allowAlpha);
			break;
	}
	return newColour;
}

export function anyColorToHex(color: string, allowAlpha: boolean): string {
	let rgbString: string;
	// Decompose the color into a color object
	const colorObject = decomposeColor(color);
	// Recompose to get a standardized RGB string
	if (colorObject.type.includes('hsl')) {
		rgbString = rgbToHex(hslToRgb(color));
	} else {
		rgbString = recomposeColor(colorObject);
	}
	const hex = rgbToHex(rgbString);
	if (allowAlpha) return hex;
	return hex.substring(0, 7);
}

export function anyColorToRgb(color: string, allowAlpha: boolean): string {
	const colorObject = decomposeColor(color);
	if (colorObject.type.includes('rgb')) {
		if (allowAlpha || colorObject.type === 'rgb') return recomposeColor(colorObject);
		return recomposeColor({
			type: 'rgb',
			values: colorObject.values.slice(0, -1) as [number, number, number]
		});
	}
	colorObject.type = `rgb${allowAlpha && colorObject.type.endsWith('a') ? 'a' : ''}`;
	return recomposeColor(colorObject);
}

export function anyColorToHsl(color: string, allowAlpha: boolean): string {
	const colorObject = decomposeColor(color);
	if (colorObject.type.includes('hsl')) {
		if (allowAlpha || colorObject.type === 'hsl') return color;
		return recomposeColor({
			type: 'hsl',
			values: colorObject.values.slice(0, -1) as [number, number, number]
		});
	}
	const helperResult = rgbValuesToHslValues(
		colorObject.values[0] / 255,
		colorObject.values[1] / 255,
		colorObject.values[2] / 255
	);
	const values: number[] = [
		helperResult.h,
		helperResult.s,
		helperResult.l,
		allowAlpha && colorObject.values[3] != null && colorObject.values[3]
	].filter(Boolean);
	return recomposeColor({
		type: `hsl${allowAlpha && colorObject.type.endsWith('a') ? 'a' : ''}`,
		values: values as [number, number, number]
	});
}

export function rgbValuesToHslValues(r: number, g: number, b: number): { h: number; s: number; l: number } {
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	// Convert to degrees, percentages
	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100)
	};
}
