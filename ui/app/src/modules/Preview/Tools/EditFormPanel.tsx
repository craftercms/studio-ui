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
import { CLEAR_SELECTED_ZONES, clearSelectForEdit } from '../../../state/actions/preview';
import { useDispatch } from 'react-redux';
import { useActiveSiteId, usePreviewState, useSelection } from '../../../utils/hooks';
import { defineMessages, useIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
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

  const item = selected[0];
  const index = item.index;
  const model = models[item.modelId];

  if (index != null) {

  }

  //selected Item data

  //TODO: este es shared
  // /studio/form?site=editorialviejo&form=/component/feature
  // &path=/site/components/features/fbabf5a8-4bcb-411a-0242-a74f6e8e570c.xml
  // &isInclude=null
  // &iceComponent=true
  // &edit=true
  // &editorId=1c5da642-e7cb-e4d1-636d-c343ca04618a

  debugger;
  //this needs to be on one useEffect item dependency;
  const fieldId = item.fieldId[0];
  const selectedId = (item.index !== undefined) ? model[fieldId][item.index] : item.modelId;
  const path = models[selectedId].craftercms.path || false;
  let src = null;
  let childSrc = null;
  if (path) {
    const contentTypeId = models[selectedId].craftercms.contentType;
    src = `${AUTHORING_BASE}/form?site=${site}&form=${contentTypeId}&path=${path}&isInclude=null&iceComponent=true&edit=true&editorId=123`;
  } else {
    //model.crafter.id === id of the parent?
    //selectedId === id of the son
    //we need to know who contains this [model.craftercms.id]
    console.log(model.craftercms.id);
    //console.log(childrenMap);
    //console.log(findParentModelId(model.craftercms.id, childrenMap, models));
    const parentPath = models[model.craftercms.id].craftercms.path;
    const parentContentTypeId = models[model.craftercms.id].craftercms.contentType;
    const childContentTypeId = models[selectedId].craftercms.contentType;
    // TODO: debemos abrir el form padre si es embedded
    // /studio/form?site=editorialviejo&form=/page/home
    // &path=/site/website/index.xml
    // &isInclude=null
    // & iceComponent=true
    // &edit=true
    // &editorId=8a8690ad-71ba-1b10-059f-6576d216a39a

    src = `${AUTHORING_BASE}/form?site=${site}&form=${parentContentTypeId}&path=${parentPath}&isInclude=null&iceComponent=true&edit=true&editorId=123`;

    // TODO: debemos abrir el form hijo
    // /studio/form?site=editorialviejo&form=/component/feature
    // &path=a89386c4-a205-2681-2db1-c3606f714411
    // &isInclude=true
    // &iceComponent=true
    // &edit=true
    // &editorId=dafdcd9d-3893-0a38-9c05-58b9083dabd0
    //childSrc = `${AUTHORING_BASE}/form?site=${site}&form=${childContentTypeId}&path=${selectedId}&isInclude=true&iceComponent=true&edit=true&editorId=123`;
  }



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

  return (
    <>
      <ToolPanel
        title={title}
        onBack={onBack}
        BackIcon={CloseRounded}
      >
        <div className={classes.formWrapper}>
          <Button variant="outlined" color="primary"
                  onClick={openEditForm}>{formatMessage(translations.openComponentForm)}</Button>
        </div>
      </ToolPanel>
      <Dialog fullScreen open={open} onClose={handleClose}>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={handleClose}
        >
          <CloseIcon/>
        </IconButton>
        <iframe src={src} title='form' className={classes.iframe}/>
      </Dialog>
      <Dialog fullScreen open={open && childSrc} onClose={handleClose}>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={handleClose}
        >
          <CloseIcon/>
        </IconButton>
        <iframe src={childSrc} title='childForm' className={classes.iframe}/>
      </Dialog>
    </>
  )
}
