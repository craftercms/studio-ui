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

import React, { useEffect, useState } from 'react';
import { getHostToGuestBus } from '../previewContext';
import ToolPanel from './ToolPanel';
import CloseRounded from '@material-ui/icons/CloseRounded';
import Typography from '@material-ui/core/Typography';
import { ContentTypeHelper } from '../../../utils/helpers';
import {
  CLEAR_SELECTED_ZONES,
  clearSelectForEdit,
  EMBEDDED_LEGACY_FORM_CLOSE,
  RELOAD_REQUEST
} from '../../../state/actions/preview';
import { useDispatch } from 'react-redux';
import { useActiveSiteId, useOnMount, usePreviewState, useSelection } from '../../../utils/hooks';
import { defineMessages, useIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import { nnou } from '../../../utils/object';
import { forEach } from '../../../utils/array';
import { LookupTable } from '../../../models/LookupTable';

const translations = defineMessages({
  openComponentForm: {
    id: 'craftercms.edit.openComponentForm',
    defaultMessage: 'Open Component Form'
  }
});

const styles = makeStyles(() => createStyles({
  formWrapper: {
    textAlign: 'center',
    padding: '20px 0'
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px'
  },
  iframe: {
    height: '100%'
  }
}));

function createBackHandler(dispatch) {
  const hostToGuest$ = getHostToGuestBus();
  return () => {
    dispatch(clearSelectForEdit());
    hostToGuest$.next({ type: CLEAR_SELECTED_ZONES })
  };
}

function findParentModelId(modelId: string, childrenMap: LookupTable<Array<string>>, models: any) {
  const parentId = forEach(
    Object.entries(childrenMap),
    ([id, children]) => {
      if (
        nnou(children) &&
        (id !== modelId) &&
        children.includes(modelId)
      ) {
        return id;
      }
    },
    null
  );
  return nnou(parentId)
    // If it has a path, it is not embedded and hence the parent
    // Otherwise, need to keep looking.
    ? nnou(models[parentId].craftercms.path)
      ? parentId
      : findParentModelId(parentId, childrenMap, models)
    // No parent found for this model
    : null;
}

export default function EditFormPanel() {

  const dispatch = useDispatch();
  const { guest: { selected, models, childrenMap } } = usePreviewState();
  const contentTypesBranch = useSelection(state => state.contentTypes);
  const contentTypes = contentTypesBranch.byId ? Object.values(contentTypesBranch.byId) : null;
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const classes = styles({});
  const onBack = createBackHandler(dispatch);
  const [open, setOpen] = useState(false);
  const AUTHORING_BASE = useSelection<string>(state => state.env.AUTHORING_BASE);
  const [src, setSrc] = useState(null);

  const item = selected[0];
  const model = models[item.modelId];

  const contentType = contentTypes.find((contentType) => contentType.id === model.craftercms.contentType);
  const title = ((item.fieldId.length > 1) || (item.fieldId.length === 0))
    ? model.craftercms.label
    : ContentTypeHelper.getField(contentType, item.fieldId[0])?.name;

  function openEditForm() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.keyCode === 27) {
        createBackHandler(dispatch)();
      }
    };
    document.addEventListener('keydown', handler, false);
    return () => document.removeEventListener('keydown', handler, false);
  }, [dispatch]);

  useOnMount(() => {
    try {
      const fieldId = item.fieldId[0];
      const selectedId = (item.index !== undefined) ? model[fieldId][item.index] : item.modelId;
      const path = models[selectedId].craftercms.path || false;

      //if the item is shared
      if (path) {
        setSrc(`${AUTHORING_BASE}/legacy/form?site=${site}&path=${path}`);
      } else {
        let parentPath;
        if (model === models[selectedId]) {
          let parentId = findParentModelId(model.craftercms.id, childrenMap, models);
          parentPath = models[parentId].craftercms.path;
        } else {
          parentPath = models[model.craftercms.id].craftercms.path;
        }
        setSrc(`${AUTHORING_BASE}/legacy/form?site=${site}&path=${parentPath}&isHidden=true&modelId=${selectedId}`);
      }

      window.addEventListener('message', (e) => {
        if (e && e.data && e.data.type === EMBEDDED_LEGACY_FORM_CLOSE) {
          setOpen(false);
          getHostToGuestBus().next({ type: RELOAD_REQUEST })
        }
      }, false);
    } catch {
      console.log('No supported yet.')
    }


  });

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

  return (
    <>
      <ToolPanel
        title={title}
        onBack={onBack}
        BackIcon={CloseRounded}
      >
        <div className={classes.formWrapper}>
          <Button
            variant="outlined"
            color="primary"
            onClick={openEditForm}
          >
            {formatMessage(translations.openComponentForm)}
          </Button>
        </div>
      </ToolPanel>
      <Dialog fullScreen open={open} onClose={handleClose}>
        <iframe src={src} title='cstudio-embedded-legacy-form' className={classes.iframe}/>
      </Dialog>
    </>
  )
}
