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

// In some browsers, the iframe is blocking the mouse events causing the resizing of toolPanels to malfunction. By
// disabling pointer events and user select on the iframe, we can allow the resize to work as expected.
export function blockPreviewIframePointerEvents(block: boolean) {
  const previewIframe = document.getElementById('crafterCMSPreviewIframe');
  if (previewIframe) {
    previewIframe.style.pointerEvents = block ? 'none' : '';
    previewIframe.style.userSelect = block ? 'none' : '';
  }
}
