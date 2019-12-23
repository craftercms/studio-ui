/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import { getHostToGuestBus } from '../previewContext';
import ToolPanel from './ToolPanel';
import CloseRounded from '@material-ui/icons/CloseRounded';
import Typography from '@material-ui/core/Typography';
import { ContentTypeHelper } from '../../../utils/helpers';
import { CLEAR_SELECTED_ZONES, clearSelectForEdit } from '../../../state/actions/preview';
import { useDispatch } from 'react-redux';
import { usePreviewState } from '../../../utils/hooks';

export default function EditFormPanel() {

  const dispatch = useDispatch();
  const {
    contentTypes,
    guest: { selected, models }
  } = usePreviewState();
  const hostToGuest$ = getHostToGuestBus();

  const onBack = () => {
    dispatch(clearSelectForEdit());
    hostToGuest$.next({ type: CLEAR_SELECTED_ZONES })
  };

  if (selected.length > 1) {
    // TODO: Implement Multi-mode...
    return (
      <>
        <ToolPanel
          BackIcon={CloseRounded}
          onBack={onBack}
          title="Not Implemented.">
          <Typography>
            This condition is not yet.
          </Typography>
        </ToolPanel>
      </>
    )
  }

  // modelId: string
  // modelId: string, fieldId: string[]
  // modelId: string, fieldId: string[], index: number

  // Whole content type
  // Group of fields (non-group) of a content type
  // A field of type repeat group (an entire group) - no index, whole thing
  // A field of type repeat group with index - only that item/index
  // A set of fields of a repeat group
  // Single field
  // Set of fields

  const item = selected[0];
  const index = item.index;
  const model = models[item.modelId];

  if (index != null) {

  }

  const contentType = contentTypes.find((contentType) => contentType.id === model.craftercms.contentType);
  const title = ((item.fieldId.length > 1) || (item.fieldId.length === 0))
    ? model.craftercms.label
    : ContentTypeHelper.getField(contentType, item.fieldId[0])?.name;
  const fields = item.fieldId.map((fieldId) => ContentTypeHelper.getField(contentType, fieldId));

  return (
    <>
      <ToolPanel
        title={title}
        onBack={onBack}
        BackIcon={CloseRounded}
      >
        <Typography variant="body1" component="ul">
        {
          fields.map((field) => <li key={field.id}>{field.name}</li>)
        }
        </Typography>
      </ToolPanel>
    </>
  )
}
