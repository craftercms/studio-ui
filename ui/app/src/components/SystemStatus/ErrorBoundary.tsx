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

import React, { PropsWithChildren } from 'react';
import ErrorState, { ErrorStateProps } from './ErrorState';

export type ErrorBoundaryProps = PropsWithChildren<{
  errorStateProps?: Omit<ErrorStateProps, 'error'>;
}>;

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    // TODO: Log to an error reporting service
  }

  render() {
    return this.state.error ? (
      <ErrorState
        {...this.props.errorStateProps}
        error={{ message: this.state.error.message || this.state.error }}
      />
    ) : (
      this.props.children
    );
  }
}

export default ErrorBoundary;
