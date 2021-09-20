/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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
import { useDispatch, useSelector } from 'react-redux';
import GlobalState from '../../models/GlobalState';
import { LookupTable } from '../../models/LookupTable';
import { isBlank } from '../../utils/string';
import { update } from '../../services/sites';
import { fetchSites } from '../../state/reducers/sites';
import { EditSiteDialogContainerProps } from './utils';
import { updateEditSiteDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import { EditSiteDialogUI } from './EditSiteDialogUI';

export function EditSiteDialogContainer(props: EditSiteDialogContainerProps) {
  const { site, onClose, onSaveSuccess, isSubmitting } = props;
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const sites = useSelector<GlobalState, LookupTable>((state) => state.sites.byId);
  const dispatch = useDispatch();
  const [name, setName] = useState(site.name);
  const [description, setDescription] = useState(site.description);

  function checkSiteName(event: React.ChangeEvent<HTMLInputElement>, currentSiteName: string) {
    if (
      (currentSiteName !== event.target.value &&
        sites &&
        Object.keys(sites).filter((key) => sites[key].name === event.target.value).length) ||
      event.target.value.trim() === ''
    ) {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }
  }

  const handleSubmit = (id: string, name: string, description: string) => {
    if (!isBlank(name) && !submitDisabled) {
      dispatch(
        updateEditSiteDialog({
          isSubmitting: true
        })
      );
      update({ id, name, description }).subscribe(
        (response) => {
          dispatch(
            batchActions([
              updateEditSiteDialog({
                hasPendingChanges: false,
                isSubmitting: false
              }),
              fetchSites()
            ])
          );
          onSaveSuccess?.(response);
        },
        ({ response: { response } }) => {
          dispatch(
            batchActions([
              updateEditSiteDialog({
                isSubmitting: false
              }),
              showErrorDialog({
                error: response
              })
            ])
          );
        }
      );
    }
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  const onSiteNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    checkSiteName(event, site.name);
    setName(event.target.value);
    dispatch(
      updateEditSiteDialog({
        hasPendingChanges: true
      })
    );
  };

  const onKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit(site.id, name, description);
    }
  };

  const onSiteDescriptionChange = (value: string) => {
    setDescription(value);
    dispatch(
      updateEditSiteDialog({
        hasPendingChanges: true
      })
    );
  };

  return (
    <ConditionalLoadingState isLoading={!site}>
      <EditSiteDialogUI
        siteId={site.id}
        siteName={name}
        siteDescription={description}
        onSiteNameChange={onSiteNameChange}
        onSiteDescriptionChange={onSiteDescriptionChange}
        submitting={isSubmitting}
        submitDisabled={submitDisabled}
        onKeyPress={onKeyPress}
        onSubmit={() => handleSubmit(site.id, name, description)}
        onCloseButtonClick={onCloseButtonClick}
      />
    </ConditionalLoadingState>
  );
}
