/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import { ErrorBoundary } from '../ErrorBoundary';
import LoadingState from './LoadingState';

// TODO: Need to figure the TS config to carry the props from the "component" to "componentProps"
// interface SuspencifiedProps<ComponentType extends React.ElementType = 'div', ComponentProps = {}> {
//   component: ComponentType;
//   componentProps?: object;
//   loadingStateProps?: object;
//   resource: any;
// }

export function Suspencified(props) {
  const { component: Component, componentProps, loadingStateProps, errorStateProps, resource } = props;
  return (
    <ErrorBoundary {...errorStateProps}>
      <React.Suspense
        fallback={
          <LoadingState graphicProps={{ width: 150 }} {...loadingStateProps} />
        }
      >
        <Component resource={resource} {...componentProps} />
      </React.Suspense>
    </ErrorBoundary>
  )
}
