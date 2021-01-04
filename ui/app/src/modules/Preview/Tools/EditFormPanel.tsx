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

import React, { useCallback } from 'react';
import ToolPanel from './ToolPanel';
import CloseRounded from '@material-ui/icons/CloseRounded';
import Typography from '@material-ui/core/Typography';
import { useDispatch } from 'react-redux';
import { useActiveSiteId, usePreviewState, useSelection } from '../../../utils/hooks';
import { defineMessages, useIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { findParentModelId, nnou } from '../../../utils/object';
import { popPiece } from '../../../utils/string';
import * as ModelHelper from '../../../utils/model';
import { showCodeEditorDialog, showEditDialog } from '../../../state/actions/dialogs';
import DialogHeader from '../../../components/Dialogs/DialogHeader';
import { getField } from '../../../utils/contentType';
import DialogBody from '../../../components/Dialogs/DialogBody';
import Dialog from '@material-ui/core/Dialog';

interface EditFormPanelProps {
  open: boolean;
  onDismiss: () => void;
}

interface EditFormPanelBodyProps {
  classes: any;
  onDismiss: () => void;
}

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

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      margin: theme.spacing(1),
      position: 'absolute',
      top: 100,
      left: '50%',
      zIndex: theme.zIndex.drawer,
      width: 250,
      marginLeft: -125
    },
    header: {
      borderTopLeftRadius: theme.shape.borderRadius,
      borderTopRightRadius: theme.shape.borderRadius
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

export default function EditFormPanel(props: EditFormPanelProps) {
  const classes = useStyles();
  return (
    <Dialog open={props.open} maxWidth="xs" fullWidth onClose={props.onDismiss}>
      {props.open && <EditFormPanelBody classes={classes} onDismiss={props.onDismiss} />}
    </Dialog>
  );
}

function EditFormPanelBody(props: EditFormPanelBodyProps) {
  const { classes, onDismiss } = props;
  const dispatch = useDispatch();
  const {
    guest: { selected, models, childrenMap, modelIdByPath }
  } = usePreviewState();
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const contentTypes = contentTypesBranch.byId ? Object.values(contentTypesBranch.byId) : null;
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);
  const defaultSrc = `${authoringBase}/legacy/form?`;

  const item = selected[0];
  const fieldId = item.fieldId[0];
  let model = models[item.modelId];
  let contentType = contentTypesBranch.byId[model.craftercms.contentTypeId];
  const levelDescriptorPath = model.craftercms.sourceMap?.[fieldId];
  // is isInheritedField
  if (levelDescriptorPath) {
    const modelId = modelIdByPath[levelDescriptorPath];
    model = models[modelId];
    contentType = contentTypesBranch.byId[model.craftercms.contentTypeId];
  }

  const field = fieldId ? getField(contentType, fieldId) : null;
  let title;
  let selectedId;

  if (nnou(field)) {
    if (field.type === 'node-selector' && nnou(item.index)) {
      let component;
      if (nnou(fieldId) && fieldId.includes('.')) {
        const aux = ModelHelper.extractCollectionItem(model, fieldId, item.index);
        component = models[aux];
      } else {
        const id = ModelHelper.value(model, fieldId)[item.index];
        component = models[id];
      }
      if (component) {
        selectedId = component.craftercms.id;
        title = `${component.craftercms.label} (${contentTypesBranch.byId[component.craftercms.contentTypeId].name})`;
      } else {
        selectedId = item.modelId;
        title = field.name;
      }
    } else {
      selectedId = item.modelId;
      title = field.name;
    }
  } else {
    selectedId = item.modelId;
    title = `${model.craftercms.label} (${contentType.name})`;
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
    onDismiss();
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

  if (selected.length > 1) {
    // TODO: Implement Multi-mode...
    return (
      <>
        <ToolPanel BackIcon={CloseRounded} title="Not Implemented.">
          <Typography>This condition is not implemented yet.</Typography>
        </ToolPanel>
      </>
    );
  }

  return (
    <>
      <DialogHeader title={title} onDismiss={onDismiss} className={classes.header} />
      <DialogBody className={classes.formWrapper}>
        <Button variant="outlined" color="primary" onClick={(e) => openDialog('form')}>
          {formatMessage(translations.openComponentForm)}
        </Button>
        <Button variant="outlined" color="primary" onClick={(e) => openDialog('template')}>
          {formatMessage(translations.editTemplate)}
        </Button>
        {/* TODO: should use type instead of content type id string inspection */}
        {selectedContentType.includes('/page') && (
          <Button variant="outlined" color="primary" onClick={(e) => openDialog('controller')}>
            {formatMessage(translations.editController)}
          </Button>
        )}
      </DialogBody>
    </>
  );
}
