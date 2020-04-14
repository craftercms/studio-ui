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

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import makeStyles from '@material-ui/styles/makeStyles';
import { Theme } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import { palette } from '../styles/theme';
import { LegacyItem } from '../models/Item';
import TreeItem from '@material-ui/lab/TreeItem';
import { TreeView } from '@material-ui/lab';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { LookupTable } from '../models/LookupTable';
import DialogTitle, { DialogTitleProps } from './DialogTitle';


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
    background: palette.white,
    border: '1px solid rgba(0, 0, 0, .125)',
    minHeight: '30vh'
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
            event.preventDefault()
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
      {Array.isArray(nodes.children) ? nodes.children.map(node => renderTree(node)) : null}
    </TreeItem>
  );

  return (
    <section className={classes.simpleItemsSelectionRoot}>
      <header className={classes.simpleItemsSelectionHeader}>
        <Link
          component="button"
          variant="body2"
          onClick={toggleSelectAll}
        >
          {expanded.length === selected.length ? formatMessage(messages.deselectAll) : formatMessage(messages.selectAll)}
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
  )
}

const dialogStyles = makeStyles((theme: Theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(2),
    backgroundColor: palette.gray.light0
  },
  dialogActionsRoot: {
    margin: 0,
    padding: theme.spacing(1)
  }
}));

interface CopyItemsDialogProps extends DialogTitleProps {
  open: boolean;
  item: LegacyItem;

  onOk(item: Partial<LegacyItem>): void;
}

export default function CopyItemsDialog(props: CopyItemsDialogProps) {
  const { open, onOk, onClose, title, subtitle, item } = props;
  const { formatMessage } = useIntl();
  const classes = dialogStyles({});
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
      parentsId.forEach(id => {
        if (!_selected.includes(id)) {
          _selected.push(id)
        }
      });
      _selected.push(nodes.uri)
    } else {
      const childrenId = getChildrenId(nodes.uri, children);
      childrenId.forEach(id => {
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
      getParentsId(parents[id], parents, ids)
    }
    return ids;
  }

  function getChildrenId(id: string, children: LookupTable<Array<string>>, ids: string[] = []) {
    if (children[id]) {
      children[id].forEach(childId => {
        ids.push(childId);
        getChildrenId(childId, children, ids)
      })
    }
    return ids;
  }

  function getChildrenTree(id: string, children: LookupTable<Array<string>>, tree: any = {}) {
    if (children[id]) {
      tree.children = [];
      tree.uri = id;
      children[id].forEach(childId => {
        if (selected.includes(childId)) {
          let item = getChildrenTree(childId, children);
          if (item.children.length) {
            tree.children.push(item);
          } else {
            tree.children.push({ uri: item.uri });
          }
        }
      })
    }
    return tree;
  }

  const toggleSelectAll = () => {
    if (expanded.length === selected.length) {
      setSelected([]);
    } else {
      setSelected(expanded);
    }
  };

  const onCopy = () => {
    let CopyItem: Partial<LegacyItem> = {};
    CopyItem = getChildrenTree(item.uri, children);
    onOk(CopyItem);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableBackdropClick={true}
    >
      {
        title &&
        <DialogTitle title={title} subtitle={subtitle} onClose={onClose}/>
      }
      <DialogContent dividers classes={{ root: classes.dialogContentRoot }}>
        <ItemSelectorTree
          item={item}
          selected={selected}
          expanded={expanded}
          handleSelect={handleSelect}
          toggleSelectAll={toggleSelectAll}
        />
      </DialogContent>
      <DialogActions classes={{ root: classes.dialogActionsRoot }}>
        <Button onClick={onClose} variant="contained">
          {formatMessage(messages.cancel)}
        </Button>
        <Button onClick={onCopy} variant="contained" color="primary">
          {formatMessage(messages.copy)}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
