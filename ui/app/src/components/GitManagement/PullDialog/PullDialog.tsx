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

import React, { useState } from 'react';
import PullDialogContainer from './PullDialogContainer';
import { EnhancedDialog } from '../../EnhancedDialog';
import { PullFromRemoteDialogProps } from './utils';
import { FormattedMessage } from 'react-intl';

export function PullDialog(props: PullFromRemoteDialogProps) {
  const {
    sandboxBranch,
    sandboxBranchError,
    remoteName,
    mergeStrategies,
    onPullSuccess,
    onPullError,
    onFetchSandboxBranch,
    ...rest
  } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const computedIsSubmitting = isSubmitting || rest.isSubmitting;
  return (
    <EnhancedDialog
      title={
        <FormattedMessage id="pullDialog.pullFrom" defaultMessage="Pull from {remoteName}" values={{ remoteName }} />
      }
      maxWidth="xs"
      {...rest}
      isSubmitting={computedIsSubmitting}
    >
      <PullDialogContainer
        sandboxBranch={sandboxBranch}
        sandboxBranchError={sandboxBranchError}
        remoteName={remoteName}
        isSubmitting={computedIsSubmitting}
        mergeStrategies={mergeStrategies}
        onPullStart={() => setIsSubmitting(true)}
        onPullSuccess={(result) => {
          setIsSubmitting(false);
          onPullSuccess?.(result);
        }}
        onPullError={(result) => {
          setIsSubmitting(false);
          onPullError?.(result);
        }}
        onFetchSandboxBranch={onFetchSandboxBranch}
      />
    </EnhancedDialog>
  );
}

export default PullDialog;
