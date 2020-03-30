/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export function isEditableAsset(path: string) {
  return (
    path.endsWith('.ftl')
    || path.endsWith('.css')
    || path.endsWith('.js')
    || path.endsWith('.groovy')
    || path.endsWith('.txt')
    || path.endsWith('.html')
    || path.endsWith('.hbs')
    || path.endsWith('.xml')
    || path.endsWith('.tmpl')
    || path.endsWith('.htm')
  );
}

export function isAsset(path: string) {
  return (
    path.endsWith('.jpg')
    || path.endsWith('.png')
    || path.endsWith('.pdf')
    || path.endsWith('.doc')
    || path.endsWith('.docx')
    || path.endsWith('.xls')
    || path.endsWith('.xlsx')
    || path.endsWith('.ppt')
    || path.endsWith('.pptx')
    || path.endsWith('.mp4')
    || path.endsWith('.avi')
    || path.endsWith('.webm')
    || path.endsWith('.mpg')
  );
}

export function isCode(path: string) {
  return (
    path.endsWith('.ftl')
    || path.endsWith('.css')
    || path.endsWith('.js')
    || path.endsWith('.groovy')
    || path.endsWith('.html')
    || path.endsWith('.hbs')
    || path.endsWith('.tmpl')
    || path.endsWith('.htm')
  );
}

export function isImage(path: string) {
  return (
    path.endsWith('.jpg')
    || path.endsWith('.png')
  );
}

export default {
  isEditableAsset
};
