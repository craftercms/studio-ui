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
       path.includes('.ftl')
    || path.includes('.css')
    || path.includes('.js')
    || path.includes('.groovy')
    || path.includes('.txt')
    || path.includes('.html')
    || path.includes('.hbs')
    || path.includes('.xml')
    || path.includes('.tmpl')
    || path.includes('.htm')
  );
}

export function decodeHTML(html) {
  var txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}


export default {
  isEditableAsset,
  decodeHTML
};
