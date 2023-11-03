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

import React from 'react';

declare global {
  interface Window {
    tinymce: any;
    ace: AceAjax.Ace;
  }
  type CrafterCMSCustomElementProps = React.DetailedHTMLProps<
    Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> & { class?: string },
    HTMLDivElement
  >;
  namespace JSX {
    interface IntrinsicElements {
      'craftercms-zone-marker': CrafterCMSCustomElementProps;
      'craftercms-asset-uploader-mask-container': CrafterCMSCustomElementProps;
      'craftercms-asset-uploader-mask': CrafterCMSCustomElementProps;
      'craftercms-field-instance-switcher': CrafterCMSCustomElementProps;
    }
  }
}
