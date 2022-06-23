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

import React, { PropsWithChildren } from 'react';
import ErrorState, { ErrorStateProps } from '../ErrorState/ErrorState';
import ApiResponseErrorState from '../ApiResponseErrorState';
import { isApiResponse } from '../../utils/object';

export type ErrorBoundaryProps = PropsWithChildren<{
  onReset?(): void;
  errorStateProps?: ErrorStateProps;
}>;

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    // TODO: Log to an error reporting service
  }

  reset() {
    this.setState({ error: null });
  }

  render() {
    const errorStateProps = {
      ...this.props.errorStateProps,
      onBack: (e) => {
        this.props.errorStateProps?.onButtonClick?.(e);
        if (this.props.onReset) {
          this.props.onReset();
          // Move the ErrorBoundary's reset to the next cycle so any
          // clean up performed by the ErrorBoundary's children "onReset"
          // is applied and the error boundary is not re-shown immediately
          setTimeout(() => this.reset());
        } else {
          this.reset();
        }
      }
    };
    return this.state.error ? (
      isApiResponse(this.state.error) ? (
        <ApiResponseErrorState {...errorStateProps} error={this.state.error} />
      ) : (
        <ErrorState {...errorStateProps} message={this.state.error.message ?? this.state.error} />
      )
    ) : (
      this.props.children
    );
  }
}

export default ErrorBoundary;
