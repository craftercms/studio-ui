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

import React, {
  Fragment,
  ElementType,
  // FunctionComponent,
  PropsWithChildren,
  Suspense,
  SuspenseProps
} from 'react';
import { ErrorBoundary, ErrorBoundaryProps } from '../ErrorBoundary';
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
    isEmpty?(value: unknown): boolean;
    emptyStateProps?: EmptyStateProps;
  }
>;

type SuspenseBoundaryProps = PropsWithChildren<{
  suspenseProps?: SuspenseProps;
  loadingStateProps?: LoadingStateProps;
  errorBoundaryProps?: ErrorBoundaryProps;
}>;

// TODO: Is there a way for TS config to demand the props from the "component" to "componentProps"?
interface SuspencifiedProps<
  ResourceType = unknown,
  // CompleteComponentProps extends PropsWithResource<ResourceType> = PropsWithResource<ResourceType>,
  // ComponentProps extends Partial<CompleteComponentProps> = {},
  // ComponentType extends ElementType<CompleteComponentProps> = FunctionComponent<CompleteComponentProps>,
  ComponentProps = {},
  ComponentType extends ElementType = ElementType
> extends SuspenseBoundaryProps {
  component: ComponentType;
  componentProps?: ComponentProps;
  resource: Resource<ResourceType>;
}

export function WithEmptyState(props: SuspenseWithEmptyStateProps) {
  const {
    children,
    isEmpty = (value: any[]) => value.length === 0,
    resource,
    emptyStateProps = {
      title: (
        <FormattedMessage
          id="withEmptyState.defaultEmptyStateMessage"
          defaultMessage="No results found"
        />
      )
    }
  } = props;
  const value = resource.read();
  return <Fragment>{isEmpty(value) ? <EmptyState {...emptyStateProps} /> : children}</Fragment>;
}

export function Suspencified(props: SuspencifiedProps) {
  const { component: Component, componentProps, resource } = props;
  return (
    <SuspenseBoundary {...props}>
      <Component resource={resource} {...componentProps} />
    </SuspenseBoundary>
  );
}

export function SuspenseWithEmptyState(
  props: SuspencifiedProps & { withEmptyStateProps?: Partial<SuspenseWithEmptyStateProps> }
) {
  const { component: Component, componentProps, resource, withEmptyStateProps } = props;
  return (
    <SuspenseBoundary {...props}>
      <WithEmptyState resource={resource} {...withEmptyStateProps}>
        <Component resource={resource} {...componentProps} />
      </WithEmptyState>
    </SuspenseBoundary>
  );
}

export function SuspenseBoundary(props: SuspenseBoundaryProps) {
  const { children, loadingStateProps, errorBoundaryProps, suspenseProps } = props;
  return (
    <ErrorBoundary {...errorBoundaryProps}>
      <Suspense
        fallback={<LoadingState {...loadingStateProps} />}
        {...suspenseProps}
        children={children}
      />
    </ErrorBoundary>
  );
}

export default Suspencified;
