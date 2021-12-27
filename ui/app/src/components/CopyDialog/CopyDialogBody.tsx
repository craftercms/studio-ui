/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { useIntl } from 'react-intl';
import { LookupTable } from '../../models/LookupTable';
import { LegacyItem } from '../../models';
import React, { useEffect, useState } from 'react';
import DialogBody from '../DialogBody';
import { ItemSelectorTree } from './CopyDialogItemSelectorTree';
import DialogFooter from '../DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { CopyDialogBaseProps, CopyDialogCallbacks, messages } from './utils';
import { fetchLegacyItemsTree } from '../../services/content';
import Typography from '@mui/material/Typography';
import { EnhancedDialogProps } from '../EnhancedDialog';
import { useDispatch } from 'react-redux';
import { updateCopyDialog } from '../../state/actions/dialogs';

export interface CopyDialogBodyProps
  extends CopyDialogCallbacks,
    Pick<CopyDialogBaseProps, 'site' | 'item'>,
    Pick<EnhancedDialogProps, 'onClose'> {
  disabled: boolean;
}

export function CopyDialogBody(props: CopyDialogBodyProps) {
  const { onOk, item, site, onClose, disabled } = props;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [data, setData] = useState<{
    item: LegacyItem;
    parents: LookupTable<string>;
    children: LookupTable<Array<string>>;
    paths: string[];
  }>(null);

  const [selected, setSelected] = useState([]);

  const onItemSelected = (checked: boolean, node: LegacyItem) => {
    if (checked) {
      const nextSelected = [...selected, node.uri];
      if (data.parents[node.uri] && !selected.includes(data.parents[node.uri])) {
        nextSelected.push(data.parents[node.uri]);
      }
      setSelected(nextSelected);
    } else {
      setSelected(selected.filter((path) => path !== node.uri && !data.children[node.uri]?.includes(path)));
    }
  };

  const onToggleSelectAll = () => {
    if (data.paths.length === selected.length) {
      setSelected([]);
    } else {
      setSelected(data.paths);
    }
  };

  const onCopy = () => {
    onOk?.({ paths: selected });
  };

  useEffect(() => {
    // Disable dismissing the dialog until the data has finished fetching. The call is expensive; don't want people
    // dismissing by mistake.
    dispatch(updateCopyDialog({ isSubmitting: true }));
    fetchLegacyItemsTree(site, item.path, { depth: 1000, order: 'default' }).subscribe({
      next(item: LegacyItem) {
        let paths = [];
        let children = {};
        let parents = {};
        function process(parent: LegacyItem) {
          paths.push(parent.uri);
          if (parent.children.length) {
            children[parent.uri] = [];
            parent.children.forEach((item: LegacyItem) => {
              parents[item.uri] = parent.uri;
              children[parent.uri].push(item.uri);
              if (item.children) {
                process(item);
              }
            });
          }
        }
        process(item);
        setSelected(paths);
        setData({ item, parents, children, paths });
        dispatch(updateCopyDialog({ isSubmitting: false }));
      }
    });
  }, [dispatch, item.path, site]);

  return (
    <>
      <DialogBody minHeight>
        {data ? (
          <ItemSelectorTree
            item={data.item}
            paths={data.paths}
            selected={selected}
            handleSelect={onItemSelected}
            toggleSelectAll={onToggleSelectAll}
          />
        ) : (
          <Typography children={formatMessage(messages.fetching) + '...'} />
        )}
      </DialogBody>
      <DialogFooter>
        <SecondaryButton disabled={disabled} onClick={(e) => onClose(e, null)}>
          {formatMessage(messages.cancel)}
        </SecondaryButton>
        <PrimaryButton disabled={disabled || selected.length === 0} autoFocus onClick={onCopy}>
          {formatMessage(messages.copy)}
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

export default CopyDialogBody;
