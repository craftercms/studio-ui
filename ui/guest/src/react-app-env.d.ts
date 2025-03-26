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
type IsPreReact19 = 2 extends Parameters<React.FunctionComponent<any>>['length'] ? true : false;
type ReactJSXElement = true extends IsPreReact19 ? JSX.Element : React.JSX.Element;

type CustomElementProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

// React v18
namespace JSX {
  interface IntrinsicElements {
    'craftercms-asset-uploader-mask': CustomElementProps;
    'craftercms-field-instance-switcher': CustomElementProps;
    'craftercms-asset-uploader-mask-container': CustomElementProps;
  }
}

// React v19
declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'craftercms-asset-uploader-mask': CustomElementProps;
      'craftercms-field-instance-switcher': CustomElementProps;
      'craftercms-asset-uploader-mask-container': CustomElementProps;
    }
  }
}
