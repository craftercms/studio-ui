/*
 * Copyright (C) 2007-2026 Crafter Software Corporation. All Rights Reserved.
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

import { AwsItem, MediaItem, WebDAVItem } from '../../models';
import { getFileExtension } from '../../utils/path';
import { isImage } from '../PathNavigator/utils';
import { isPdfDocument, isVideo } from '../../utils/content';

export function getMimeType(item: AwsItem): string {
	const fileExtension = getFileExtension(item.url);
	const mimeTypes: { [key: string]: string } = {
		aac: 'audio/aac',
		abw: 'application/x-abiword',
		avi: 'video/x-msvideo',
		bmp: 'image/bmp',
		bz: 'application/x-bzip',
		bz2: 'application/x-bzip2',
		csh: 'application/x-csh',
		css: 'text/css',
		csv: 'text/csv',
		doc: 'application/msword',
		docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		eot: 'application/vnd.ms-fontobject',
		epub: 'application/epub+zip',
		gif: 'image/gif',
		htm: 'text/html',
		html: 'text/html',
		ico: 'image/vnd.microsoft.icon',
		ics: 'text/calendar',
		jar: 'application/java-archive',
		jpeg: 'image/jpeg',
		jpg: 'image/jpeg',
		js: 'application/javascript',
		json: 'application/json',
		mid: 'audio/midi',
		midi: 'audio/midi',
		mpeg: 'video/mpeg',
		mpkg: 'application/vnd.apple.installer+xml',
		odp: 'application/vnd.oasis.opendocument.presentation',
		ods: 'application/vnd.oasis.opendocument.spreadsheet',
		odt: 'application/vnd.oasis.opendocument.text',
		oga: 'audio/ogg',
		ogv: 'video/ogg',
		ogx: 'application/ogg',
		otf: 'font/otf',
		png: 'image/png',
		pdf: 'application/pdf',
		ppt: 'application/vnd.ms-powerpoint',
		pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		rar: 'application/x-rar-compressed',
		rtf: 'application/rtf',
		sh: 'application/x-sh',
		svg: 'image/svg+xml',
		swf: 'application/x-shockwave-flash',
		tar: 'application/x-tar',
		tif: 'image/tiff',
		tiff: 'image/tiff',
		ts: 'application/typescript',
		ttf: 'font/ttf',
		txt: 'text/plain',
		vsd: 'application/vnd.visio',
		wav: 'audio/wav',
		weba: 'audio/webm',
		webm: 'video/webm',
		webp: 'image/webp',
		woff: 'font/woff',
		woff2: 'font/woff2',
		xhtml: 'application/xhtml+xml',
		xls: 'application/vnd.ms-excel',
		xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		xml: 'application/xml',
		xul: 'application/vnd.mozilla.xul+xml',
		zip: 'application/zip',
		'3gp': 'video/3gpp',
		'3g2': 'video/3gpp2',
		'7z': 'application/x-7z-compressed'
	};

	return mimeTypes[fileExtension.toLowerCase()] || 'application/octet-stream';
}

export function parseExternalItemToMediaItem(item: AwsItem | WebDAVItem): MediaItem {
	const mimeType = getMimeType(item);
	const mediaItem: MediaItem = {
		lastModified: null,
		lastModifier: null,
		mimeType,
		name: item.name,
		path: item.url,
		previewUrl: item.url,
		size: null,
		snippets: null,
		type: null
	};
	mediaItem.type = getExternalItemType(mediaItem, mimeType);
	return mediaItem;
}

export function getExternalItemType(item: MediaItem, mimeType: string): string | null {
	const image = isImage(item);
	const video = isVideo(item);
	const pdf = isPdfDocument(mimeType);
	return image ? 'Image' : video ? 'Video' : pdf ? 'pdf' : null;
}
