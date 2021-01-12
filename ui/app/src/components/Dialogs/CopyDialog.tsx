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

import React, { PropsWithChildren, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import { LegacyItem } from '../../models/Item';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { LookupTable } from '../../models/LookupTable';
import StandardAction from '../../models/StandardAction';
import { useUnmount } from '../../utils/hooks';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from './DialogHeader';
import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';

const messages = defineMessages({
  copy: {
    id: 'copyItems.copy',
    defaultMessage: 'Copy'
  },
  cancel: {
    id: 'copyItems.cancel',
    defaultMessage: 'Cancel'
  },
  selectAll: {
    id: 'copyItems.selectAll',
    defaultMessage: 'Select All'
  },
  deselectAll: {
    id: 'copyItems.deselectAll',
    defaultMessage: 'Deselect All'
  }
});

const simpleItemsSelectionsStyles = makeStyles((theme: Theme) => ({
  simpleItemsSelectionRoot: {
    border: '1px solid rgba(0, 0, 0, .125)',
    background: theme.palette.background.paper,
    flexGrow: 1
  },
  simpleItemsSelectionHeader: {
    padding: '10px 10px 0 10px'
  },
  treeViewRoot: {
    padding: '10px 14px'
  },
  treeItemRoot: {},
  treeItemContent: {},
  treeItemIconContainer: {
    display: 'none'
  },
  treeItemCheckbox: {
    padding: '4px'
  },
  treeItemLabel: {
    background: 'none !important',
    display: 'flex',
    alignItems: 'center'
  },
  labelText: {}
}));

interface ItemSelectorTreeProps {
  item: LegacyItem;
  selected: string[];
  expanded: string[];

  handleSelect(checked: boolean, item: LegacyItem): void;

  toggleSelectAll(): void;
}

interface CopyBaseProps {
  title: string;
  subtitle?: string;
  open: boolean;
  item: LegacyItem;
}

export type CopyDialogProps = PropsWithChildren<
  CopyBaseProps & {
    onClose(): void;
    onClosed?(): void;
    onOk?(response: { paths: string[] }): void;
  }
>;

export interface CopyDialogStateProps extends CopyBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onOk?: StandardAction;
}

function ItemSelectorTree(props: ItemSelectorTreeProps) {
  const { formatMessage } = useIntl();
  const classes = simpleItemsSelectionsStyles({});
  const { item, selected, expanded, handleSelect, toggleSelectAll } = props;

  const renderTree = (nodes: LegacyItem) => (
    <TreeItem
      key={nodes.uri}
      nodeId={nodes.uri}
      label={
        <FormControlLabel
          onFocus={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          control={
            <Checkbox
              color="primary"
              checked={selected.includes(nodes.uri)}
              className={classes.treeItemCheckbox}
              onChange={(event) => handleSelect(event.currentTarget.checked, nodes)}
            />
          }
          label={nodes.internalName || nodes.uri}
        />
      }
      classes={{
        root: classes.treeItemRoot,
        content: classes.treeItemContent,
        iconContainer: classes.treeItemIconContainer,
        label: classes.treeItemLabel
      }}
    >
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  );

  return (
    <section className={classes.simpleItemsSelectionRoot}>
      <header className={classes.simpleItemsSelectionHeader}>
        <Link component="button" variant="body2" onClick={toggleSelectAll}>
          {expanded.length === selected.length
            ? formatMessage(messages.deselectAll)
            : formatMessage(messages.selectAll)}
        </Link>
      </header>
      <TreeView
        className={classes.treeViewRoot}
        defaultCollapseIcon={null}
        expanded={expanded}
        onNodeToggle={null}
        disableSelection={true}
        defaultExpandIcon={null}
      >
        {renderTree(item)}
      </TreeView>
    </section>
  );
}

export default function CopyDialog(props: CopyDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <CopyDialogUI {...props} />
    </Dialog>
  );
}

function CopyDialogUI(props: CopyDialogProps) {
  const { onOk, onClose, title, subtitle, item, onClosed } = props;
  const { formatMessage } = useIntl();
  let parents: LookupTable<string> = {};
  let children: LookupTable<Array<string>> = {};
  let expanded: string[] = [];
  getUri(item);
  parents[item.uri] = null;

  function getUri(parent: LegacyItem) {
    expanded.push(parent.uri);
    children[parent.uri] = [];
    parent.children.forEach((item: LegacyItem) => {
      children[parent.uri].push(item.uri);
      parents[item.uri] = parent.uri;
      if (item.children) {
        getUri(item);
      }
    });
  }

  const [selected, setSelected] = useState(expanded);

  const handleSelect = (checked: boolean, nodes: LegacyItem) => {
    const _selected = [...selected];
    if (checked) {
      const parentsId = getParentsId(nodes.uri, parents);
      parentsId.forEach((id) => {
        if (!_selected.includes(id)) {
          _selected.push(id);
        }
      });
      _selected.push(nodes.uri);
    } else {
      const childrenId = getChildrenId(nodes.uri, children);
      childrenId.forEach((id) => {
        let index = _selected.indexOf(id);
        if (index >= 0) {
          _selected.splice(index, 1);
        }
      });
      _selected.splice(_selected.indexOf(nodes.uri), 1);
    }
    setSelected(_selected);
  };

  function getParentsId(id: string, parents: LookupTable<string>, ids: string[] = []) {
    if (parents[id]) {
      ids.push(parents[id]);
      getParentsId(parents[id], parents, ids);
    }
    return ids;
  }

  function getChildrenId(id: string, children: LookupTable<Array<string>>, ids: string[] = []) {
    if (children[id]) {
      children[id].forEach((childId) => {
        ids.push(childId);
        getChildrenId(childId, children, ids);
      });
    }
    return ids;
  }

  const toggleSelectAll = () => {
    if (expanded.length === selected.length) {
      setSelected([]);
    } else {
      setSelected(expanded);
    }
  };

  const onCopy = () => {
    onOk?.({ paths: selected });
  };

  useUnmount(onClosed);

  return (
    <>
      <DialogHeader title={title} subtitle={subtitle} onDismiss={onClose} />
      <DialogBody style={{ minHeight: '30vh' }}>
        <ItemSelectorTree
          item={item}
          selected={selected}
          expanded={expanded}
          handleSelect={handleSelect}
          toggleSelectAll={toggleSelectAll}
        />
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose}>{formatMessage(messages.cancel)}</SecondaryButton>
        <PrimaryButton onClick={onCopy}>{formatMessage(messages.copy)}</PrimaryButton>
      </DialogFooter>
    </>
  );
}
