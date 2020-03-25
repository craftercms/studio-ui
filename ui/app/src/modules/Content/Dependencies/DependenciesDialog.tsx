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
import { useActiveSiteId, useSpreadState } from '../../../utils/hooks';

const dialogInitialState = {
  selectedOption: 'depends-on',
  dependantItems: [],
  dependencies: []
};

const editableAssets = [    // TODO: how are go going to keep track of this? Should this be somewhere else?
  'ftl',
  'css',
  'js',
  'groovy',
  'txt',
  'html',
  'hbs',
  'xml'
];

interface DependenciesDialogProps {
  item: Item;
  dependenciesSelection: string;
  handleDependencyEdit: Function;
}

function DependenciesDialog(props: DependenciesDialogProps) {
  const { item, dependenciesSelection, handleDependencyEdit } = props;
  const [dialog, setDialog] = useSpreadState({ ...dialogInitialState, selectedOption: dependenciesSelection });
  const [deps, setDeps] = useState([]);
  const [open, setOpen] = useState(true);
  const [apiState, setApiState] = useSpreadState({
    error: false,
    global: false,
    errorResponse: null
  });
  const siteId = useActiveSiteId();

  function handleErrorBack() {
    setApiState({ error: false, global: false });
  }

  const handleClose = () => {
    setOpen(false);
  };

  const isEditableItem = (item: Item) => {
    const extension = item.uri.substring(item.uri.lastIndexOf('.') + 1);  // +1 to remove the period
    return editableAssets.includes(extension);
  };

  useEffect(() => {
    getDependant(siteId, item.uri).subscribe(
      (response) => {
        setApiState({ error: false });
        setDialog({ dependantItems: response });
      },
      (response) => {
        if (response) {
          setApiState({ error: true, errorResponse: (response.response) ? response.response : response });
        }
      }
    );

    getSimpleDependencies(siteId, item.uri).subscribe(
      (response) => {
        setApiState({ error: false });
        setDialog({ dependencies: response });
      },
      (response) => {
        if (response) {
          setApiState({ error: true, errorResponse: (response.response) ? response.response : response });
        }
      }
    )

  }, [item]);

  useEffect(() => {
    if (dialog.selectedOption === 'depends-on') {
      setDeps(dialog.dependantItems);
    } else {
      setDeps(dialog.dependencies);
    }
  }, [dialog.selectedOption]);

  return (
    <DependenciesDialogUI
      item={item}
      dependencies={deps}
      state={dialog}
      setState={setDialog}
      open={open}
      apiState={apiState}
      handleErrorBack={handleErrorBack}
      handleClose={handleClose}
      handleDependencyEdit={handleDependencyEdit}
      isEditableItem={isEditableItem}
    />
  )
}

export default DependenciesDialog;
