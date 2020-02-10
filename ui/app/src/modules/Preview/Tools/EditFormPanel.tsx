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
import { ContentTypeHelper, ModelHelper } from '../../../utils/helpers';
import {
  CLEAR_SELECTED_ZONES,
  clearSelectForEdit,
  EMBEDDED_LEGACY_CHILD_FORM_RENDERED,
  EMBEDDED_LEGACY_FORM_CLOSE,
  EMBEDDED_LEGACY_FORM_RENDERED
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
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import LoadingState from '../../../components/SystemStatus/LoadingState';
import clsx from 'clsx';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

const translations = defineMessages({
  openComponentForm: {
    id: 'craftercms.edit.openComponentForm',
    defaultMessage: 'Open Component Form'
  },
  contentForm: {
    id: 'craftercms.edit.contentForm',
    defaultMessage: 'Content Form'
  },
  loadingForm: {
    id: 'craftercms.edit.loadingForm',
    defaultMessage: 'Loading form...'
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
    height: '0',
    border: 0,
    '&.complete': {
      height: '100%'
    }
  },
  appBar: {
    background: '#7e9dbb'
  },
  loadingRoot: {
    height: 'calc(100% - 104px)',
    justifyContent: 'center'
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
  const [loading, setLoading] = useState(true);

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
      let selectedId;
      if (fieldId) {
        selectedId = ModelHelper.extractCollectionItem(model, fieldId, item.index);
        selectedId = (typeof selectedId === 'string' && item.index !== undefined) ? selectedId : item.modelId;
      } else {
        selectedId = item.modelId;
      }

      const path = ModelHelper.prop(models[selectedId], 'path');

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

      const messages = fromEvent(window, 'message').pipe(
        filter((e: any) => e.data && e.data.type)
      );

      const messagesSubscription = messages.subscribe((e: any) => {
        switch (e.data.type) {
          case EMBEDDED_LEGACY_FORM_CLOSE: {
            setOpen(false);
            break;
          }
          case EMBEDDED_LEGACY_FORM_RENDERED: {
            if (path) setLoading(false);
            break;
          }
          case EMBEDDED_LEGACY_CHILD_FORM_RENDERED: {
            if (!path) setLoading(false);
            break;
          }
          default:
            break;
        }
      });

      return () => {
        messagesSubscription.unsubscribe();
      };
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
        <AppBar position="static" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6">
              {formatMessage(translations.contentForm)}
            </Typography>
          </Toolbar>
        </AppBar>
        {
          loading &&
          <LoadingState
            title={formatMessage(translations.loadingForm)}
            graphicProps={{ width: 150 }}
            classes={{ root: classes.loadingRoot }}
          />
        }
        <iframe
          src={src}
          title="Embedded Legacy Form"
          className={clsx(classes.iframe, !loading && 'complete')}
        />
      </Dialog>
    </>
  )
}
