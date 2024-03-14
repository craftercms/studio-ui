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

import React from 'react';
import { BrokenReferencesDialogContainerProps } from './utils';
import { FormattedMessage } from 'react-intl';
import { EmptyState } from '../EmptyState';
import BrokenReferencesDialogUI from './BrokenReferencesDialogUI';
import { useDispatch } from 'react-redux';
import { fetchBrokenReferences, showEditDialog } from '../../state/actions/dialogs';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import useEnv from '../../hooks/useEnv';

export function BrokenReferencesDialogContainer(props: BrokenReferencesDialogContainerProps) {
  const { references, onClose, onContinue } = props;
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { authoringBase } = useEnv();

  const onContinueClick = (e) => {
    onClose(e, null);
    onContinue();
  };

  const onEditReferenceClick = (path: string) => {
    dispatch(showEditDialog({ path, authoringBase, site, onSaveSuccess: fetchBrokenReferences() }));
  };

  return references.length > 0 ? (
    <BrokenReferencesDialogUI
      references={references}
      onContinue={onContinueClick}
      onEditReferenceClick={onEditReferenceClick}
      onClose={(e) => onClose(e, null)}
    />
  ) : (
    <EmptyState title={<FormattedMessage defaultMessage="There won't be broken references" />} />
  );
}

export default BrokenReferencesDialogContainer;
