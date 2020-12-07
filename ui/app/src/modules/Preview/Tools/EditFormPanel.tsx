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

import React, { useCallback, useEffect } from 'react';
import { getHostToGuestBus } from '../previewContext';
import ToolPanel from './ToolPanel';
import CloseRounded from '@material-ui/icons/CloseRounded';
import Typography from '@material-ui/core/Typography';
import { CLEAR_SELECTED_ZONES, clearSelectForEdit } from '../../../state/actions/preview';
import { useDispatch } from 'react-redux';
import { useActiveSiteId, usePreviewState, useSelection } from '../../../utils/hooks';
import { defineMessages, useIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { findParentModelId, nnou } from '../../../utils/object';
import { popPiece } from '../../../utils/string';
import * as ModelHelper from '../../../utils/model';
import { showCodeEditorDialog, showEditDialog } from '../../../state/actions/dialogs';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import DialogHeader from '../../../components/Dialogs/DialogHeader';
import { getField } from '../../../utils/contentType';

const translations = defineMessages({
  openComponentForm: {
    id: 'previewEditFormTool.openComponentForm',
    defaultMessage: 'Edit'
  },
  editTemplate: {
    id: 'previewEditFormTool.editTemplate',
    defaultMessage: 'Edit Template'
  },
  editController: {
    id: 'previewEditFormTool.editController',
    defaultMessage: 'Edit Controller'
  }
});

const styles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      margin: theme.spacing(1),
      position: 'absolute',
      top: 64 + theme.spacing(1),
      left: theme.spacing(1),
      zIndex: theme.zIndex.drawer,
      width: 250
    },
    formWrapper: {
      textAlign: 'center',
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column',
      '& button': {
        margin: '10px 20px'
      }
    },
    closeButton: {
      position: 'absolute',
      top: '10px',
      right: '10px'
    }
  })
);

function createBackHandler(dispatch) {
  const hostToGuest$ = getHostToGuestBus();
  return () => {
    dispatch(clearSelectForEdit());
    hostToGuest$.next({ type: CLEAR_SELECTED_ZONES });
  };
}

export default function EditFormPanel(props) {
  const classes = styles();
  return (
    <Grow in={props.open}>
      <Paper elevation={4} className={classes.root}>
        {props.open && <EditFormPanelBody />}
      </Paper>
    </Grow>
  );
}

function EditFormPanelBody() {
  const dispatch = useDispatch();
  const {
    guest: { selected, models, childrenMap }
  } = usePreviewState();
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const contentTypes = contentTypesBranch.byId ? Object.values(contentTypesBranch.byId) : null;
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const classes = styles();
  const onBack = createBackHandler(dispatch);
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);
  const defaultSrc = `${authoringBase}/legacy/form?`;

  const item = selected[0];
  const model = models[item.modelId];
  const contentType = contentTypesBranch.byId[model.craftercms.contentTypeId];
  const fieldId = item.fieldId[0];
  const field = getField(contentType, fieldId);
  let title;
  let selectedId;

  if (field.type === 'node-selector' && nnou(item.index)) {
    let component;
    if (nnou(fieldId) && fieldId.includes('.')) {
      const aux = ModelHelper.extractCollectionItem(model, fieldId, item.index);
      component = models[aux];
    } else {
      const id = ModelHelper.value(model, fieldId)[item.index];
      component = models[id];
    }
    selectedId = component.craftercms.id;
    title = `${component.craftercms.label} (${contentTypesBranch.byId[component.craftercms.contentTypeId].name})`;
  } else {
    selectedId = item.modelId;
    title = field.name;
  }

  const path = ModelHelper.prop(models[selectedId], 'path');
  const selectedContentType = ModelHelper.prop(models[selectedId], 'contentTypeId');

  const getSrc = useCallback(
    (type: string) => {
      switch (type) {
        case 'form': {
          if (path) {
            return `${defaultSrc}site=${site}&path=${path}&type=form`;
          } else {
            let parentPath;
            if (model === models[selectedId]) {
              let parentId = findParentModelId(model.craftercms.id, childrenMap, models);
              parentPath = models[parentId].craftercms.path;
            } else {
              parentPath = models[model.craftercms.id].craftercms.path;
            }
            return `${defaultSrc}site=${site}&path=${parentPath}&isHidden=true&modelId=${selectedId}&type=form`;
          }
        }
        case 'template': {
          const template = contentTypes.find((contentType) => contentType.id === selectedContentType).displayTemplate;
          return `${defaultSrc}site=${site}&path=${template}&type=template`;
        }
        case 'controller': {
          let pageName = popPiece(selectedContentType, '/');
          let groovyPath = `/scripts/pages/${pageName}.groovy`;
          return `${defaultSrc}site=${site}&path=${groovyPath}&type=controller`;
        }
      }
    },
    [childrenMap, contentTypes, defaultSrc, model, models, path, selectedContentType, selectedId, site]
  );

  function openDialog(type: string) {
    if (type === 'form') {
      dispatch(
        showEditDialog({
          src: getSrc(type)
        })
      );
    } else {
      dispatch(
        showCodeEditorDialog({
          src: getSrc(type)
        })
      );
    }
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

  if (selected.length > 1) {
    // TODO: Implement Multi-mode...
    return (
      <>
        <ToolPanel BackIcon={CloseRounded} onBack={onBack} title="Not Implemented.">
          <Typography>This condition is not yet.</Typography>
        </ToolPanel>
      </>
    );
  }

  return (
    <>
      <DialogHeader title={title} onDismiss={onBack} />
      <div className={classes.formWrapper}>
        <Button variant="outlined" color="primary" onClick={(e) => openDialog('form')}>
          {formatMessage(translations.openComponentForm)}
        </Button>
        <Button variant="outlined" color="primary" onClick={(e) => openDialog('template')}>
          {formatMessage(translations.editTemplate)}
        </Button>
        {selectedContentType.includes('/page') && (
          <Button variant="outlined" color="primary" onClick={(e) => openDialog('controller')}>
            {formatMessage(translations.editController)}
          </Button>
        )}
      </div>
    </>
  );
}
