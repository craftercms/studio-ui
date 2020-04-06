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

import React, { useEffect, useState, PropsWithChildren } from 'react';
import DependenciesDialogUI from './DependenciesDialogUI';
import { Item } from '../../../models/Item';
import { getDependant, getSimpleDependencies } from '../../../services/dependencies';
import { useActiveSiteId, useSelection, useSpreadState, useStateResource } from '../../../utils/hooks';
import { FormattedMessage } from 'react-intl';
import { isAsset, isCode, isEditableAsset } from '../../../utils/content';
import { forkJoin } from 'rxjs';
import { APIError } from '../../../models/GlobalState';
import StandardAction from '../../../models/StandardAction';

const dialogInitialState = {
  selectedOption: 'depends-on',
  dependantItems: null,
  dependencies: null,
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
    filter: (dependency: Item) => ((dependency.isComponent && !dependency.isAsset) || dependency.isPage)
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

interface DependenciesDialogBaseProps {
  open: boolean;
  item?: Item;
  dependenciesSelection?: string;
}

export type DependenciesDialogProps = PropsWithChildren<
  DependenciesDialogBaseProps & {
    onClose(): any;
  }
>;

export interface DependenciesDialogStateProps extends DependenciesDialogBaseProps {
  onClose?: StandardAction
}

function DependenciesDialog(props: DependenciesDialogProps) {
  const { open, item, dependenciesSelection, onClose } = props;
  const [dialog, setDialog] = useSpreadState({
    ...dialogInitialState,
    item,
    selectedOption: dependenciesSelection
  });
  const [deps, setDeps] = useState(null);
  const [error, setError] = useState<APIError>(null);
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

  const resource = useStateResource<Item[], Item[]>(
    deps,
    {
      shouldResolve: (deps) => Boolean(deps),
      shouldReject: () => Boolean(error),
      shouldRenew: (source, resource) => resource.complete,
      resultSelector: () => deps,
      errorSelector: () => error
    }
  );

  const handleClose = () => {
    onClose?.();
  };

  useEffect(() => {
    setDialog({ item });
  },[item]);

  useEffect(() => {
    setDialog({ selectedOption: dependenciesSelection });
  },[dependenciesSelection]);

  useEffect(() => {
    if(dialog.item) {
      forkJoin({
        dependant: getDependant(siteId, dialog.item.uri),
        dependencies: getSimpleDependencies(siteId, dialog.item.uri)
      }).subscribe(
        ({dependant, dependencies}) => {
          setDialog({ dependantItems: dependant, dependencies });
          setDeps(dialog.selectedOption === 'depends-on' ? dependant: dependencies);
        },
        (error) => setError(error)
      );
    }
  }, [dialog.item, setError, setDialog, siteId]);

  useEffect(() => {
    if (dialog.selectedOption === 'depends-on') {
      setDeps(dialog.dependantItems);
    } else {
      setDeps(dialog.dependencies);
    }
  }, [dialog.selectedOption, dialog.dependantItems, dialog.dependencies]);

  return (
    <DependenciesDialogUI
      resource={resource}
      state={dialog}
      setState={setDialog}
      open={open}
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
