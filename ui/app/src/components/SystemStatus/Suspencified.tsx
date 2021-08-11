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

import React, { Fragment, PropsWithChildren, Suspense, SuspenseProps } from 'react';
import { ErrorBoundary, ErrorBoundaryProps } from './ErrorBoundary';
import LoadingState, { LoadingStateProps } from './LoadingState';
import { Resource } from '../../models/Resource';
import EmptyState, { EmptyStateProps } from './EmptyState';
import { FormattedMessage } from 'react-intl';

export type PropsWithResource<ResourceType = unknown, Props = {}> = PropsWithChildren<
  {
    resource: Resource<ResourceType>;
  } & Props
>;

type SuspenseWithEmptyStateProps<ResourceType = unknown> = PropsWithChildren<
  PropsWithResource<ResourceType> & {
    isEmpty?(value: ResourceType): boolean;
    emptyStateProps?: Partial<EmptyStateProps>;
  }
>;

type SuspencifiedProps = PropsWithChildren<{
  suspenseProps?: SuspenseProps;
  loadingStateProps?: LoadingStateProps;
  errorBoundaryProps?: ErrorBoundaryProps;
}>;

export function WithEmptyState<ResourceType = unknown[]>(props: SuspenseWithEmptyStateProps<ResourceType>) {
  const { children, isEmpty = (value: ResourceType) => (value as any).length === 0, resource, emptyStateProps } = props;
  const value = resource.read();
  const finalEmptyStateProps: EmptyStateProps = {
    title: <FormattedMessage id="withEmptyState.defaultEmptyStateMessage" defaultMessage="No results found" />,
    ...emptyStateProps
  };
  return <Fragment>{isEmpty(value) ? <EmptyState {...finalEmptyStateProps} /> : children}</Fragment>;
}

export function Suspencified(props: SuspencifiedProps) {
  const { children, loadingStateProps, errorBoundaryProps, suspenseProps } = props;
  return (
    <ErrorBoundary {...errorBoundaryProps}>
      <Suspense fallback={<LoadingState {...loadingStateProps} />} {...suspenseProps} children={children} />
    </ErrorBoundary>
  );
}

export function SuspenseWithEmptyState<ResourceType = unknown>(
  props: SuspencifiedProps & {
    resource: Resource<ResourceType>;
    withEmptyStateProps?: Partial<SuspenseWithEmptyStateProps<ResourceType>>;
  }
) {
  const { children, withEmptyStateProps, resource } = props;
  return (
    <Suspencified {...props}>
      <WithEmptyState resource={resource} {...withEmptyStateProps}>
        {children}
      </WithEmptyState>
    </Suspencified>
  );
}

export default Suspencified;
