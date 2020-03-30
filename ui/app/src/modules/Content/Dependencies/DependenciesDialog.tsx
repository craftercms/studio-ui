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

import React, { useEffect, useState } from 'react';
import DependenciesDialogUI from './DependenciesDialogUI';
import { Item } from '../../../models/Item';
import { getDependant, getSimpleDependencies } from '../../../services/dependencies';
import { useActiveSiteId, useSelection, useSpreadState } from '../../../utils/hooks';
import { FormattedMessage } from 'react-intl';
import { isAsset, isCode, isEditableAsset } from '../../../utils/content';

const dialogInitialState = {
  selectedOption: 'depends-on',
  dependantItems: [],
  dependencies: [],
  compactView: false,
  showTypes: 'all-deps'
};

const assetsTypes = {
  'all-deps': {
    label: <FormattedMessage id="dependenciesDialog.allDeps" defaultMessage="Show all dependencies"/>,
    filter: () => true
  },
  'content-items': {
    label: <FormattedMessage id="dependenciesDialog.contentItems" defaultMessage="Content items only"/>,
    filter: (dependency: Item) => {
      return ((dependency.isComponent && !dependency.isAsset) || dependency.isPage)
    }
  },
  'assets': {
    label: <FormattedMessage id="dependenciesDialog.assets" defaultMessage="Assets only"/>,
    filter: (dependency: Item) => isAsset(dependency.uri)
  },
  'code': {
    label: <FormattedMessage id="dependenciesDialog.code" defaultMessage="Code only"/>,
    filter: (dependency: Item) => isCode(dependency.uri)
  }
};

interface DependenciesDialogProps {
  item: Item;
  dependenciesSelection: string;
}

function DependenciesDialog(props: DependenciesDialogProps) {
  const { item, dependenciesSelection } = props;
  const [dialog, setDialog] = useSpreadState({
    ...dialogInitialState,
    item,
    selectedOption: dependenciesSelection
  });
  const [deps, setDeps] = useState([]);
  const [open, setOpen] = useState(true);
  const [apiState, setApiState] = useSpreadState({
    error: false,
    global: false,
    errorResponse: null
  });
  const siteId = useActiveSiteId();
  const AUTHORING_BASE = useSelection<string>(state => state.env.AUTHORING_BASE);
  const defaultFormSrc = `${AUTHORING_BASE}/legacy/form`;
  const [editDialogConfig, setEditDialogConfig] = useSpreadState({
    open: false,
    src: defaultFormSrc,
    type: 'form',
    inProgress: false
  });
  const handleEditorDisplay = item => {
    let type = 'controller';

    if ((item.isComponent && !item.isAsset) || item.isPage) {
      type = 'form'
    } else if (item.contentType === 'renderingTemplate') {
      type = 'template';
    }
    let src = `${defaultFormSrc}?site=${siteId}&path=${item.uri}&type=${type}`;

    setEditDialogConfig(
      {
        open: true,
        src,
        type: 'form'
      });
  };

  function handleErrorBack() {
    setApiState({ error: false, global: false });
  }

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    getDependant(siteId, dialog.item.uri).subscribe(
      (response) => {
        setApiState({ error: false });
        setDialog({ dependantItems: response });
        dialog.selectedOption === 'depends-on' && setDeps(response);
      },
      (response) => {
        if (response) {
          setApiState({ error: true, errorResponse: (response.response) ? response.response : response });
        }
      }
    );

    getSimpleDependencies(siteId, dialog.item.uri).subscribe(
      (response) => {
        setApiState({ error: false });
        setDialog({ dependencies: response });
        dialog.selectedOption === 'depends-on-me' && setDeps(response);
      },
      (response) => {
        if (response) {
          setApiState({ error: true, errorResponse: (response.response) ? response.response : response });
        }
      }
    )


  }, [dialog.item]);

  useEffect(() => {
    if (dialog.selectedOption === 'depends-on') {
      setDeps(dialog.dependantItems);
    } else {
      setDeps(dialog.dependencies);
    }
  }, [dialog.selectedOption]);

  return (
    <DependenciesDialogUI
      dependencies={deps}
      state={dialog}
      setState={setDialog}
      open={open}
      apiState={apiState}
      handleErrorBack={handleErrorBack}
      handleClose={handleClose}
      isEditableItem={isEditableAsset}
      assetsTypes={assetsTypes}
      editDialogConfig={editDialogConfig}
      setEditDialogConfig={setEditDialogConfig}
      handleEditorDisplay={handleEditorDisplay}
    />
  )
}

export default DependenciesDialog;
