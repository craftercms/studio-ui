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

import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import {
  fetchAudiencesPanelModel,
  setActiveTargetingModel,
  updateAudiencesPanelModel
} from '../../state/actions/preview';
import GlobalState from '../../models/GlobalState';
import ContentInstance from '../../models/ContentInstance';
import { ConditionalLoadingState } from '../LoadingState/LoadingState';
import { AudiencesPanelUI } from './AudiencesPanelUI';
import LookupTable from '../../models/LookupTable';
import { ContentTypeField } from '../../models/ContentType';
import EmptyState from '../EmptyState/EmptyState';
import { useSelection } from '../../hooks/useSelection';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';

const translations = defineMessages({
  audiencesPanel: {
    id: 'previewAudiencesPanel.title',
    defaultMessage: 'Audience Targeting'
  },
  audiencesPanelLoading: {
    id: 'previewAudiencesPanel.loading',
    defaultMessage: 'Retrieving targeting options'
  }
});

export interface PreviewAudiencesPanelProps {
  fields: LookupTable<ContentTypeField>;
}

export function PreviewAudiencesPanel(props: PreviewAudiencesPanelProps) {
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { fields } = props;
  const panelState = useSelection<GlobalState['preview']['audiencesPanel']>((state) => state.preview.audiencesPanel);
  const hasNoFields = !fields || Object.values(fields).length === 0;

  useEffect(() => {
    if (site && panelState.isFetching === null && !hasNoFields) {
      dispatch(fetchAudiencesPanelModel({ fields }));
    }
  }, [site, panelState, dispatch, fields, hasNoFields]);

  const onChange = (model: ContentInstance) => {
    dispatch(updateAudiencesPanelModel(model));
  };

  const saveModel = () => {
    dispatch(setActiveTargetingModel());
  };

  if (hasNoFields) {
    return <EmptyState title="Audience targeting has not been configured." />;
  }

  return (
    <ConditionalLoadingState
      isLoading={panelState.isApplying || panelState.isFetching === null || panelState.isFetching !== false}
      title={formatMessage(translations.audiencesPanelLoading)}
    >
      <AudiencesPanelUI
        model={panelState.model}
        fields={fields}
        modelApplying={panelState.isApplying}
        modelApplied={panelState.applied}
        onChange={onChange}
        onSaveModel={saveModel}
      />
    </ConditionalLoadingState>
  );
}

export default PreviewAudiencesPanel;
