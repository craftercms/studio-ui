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
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import makeStyles from '@material-ui/styles/makeStyles';
import { Link, Theme } from '@material-ui/core';
import { palette } from '../styles/theme';
import { LegacyItem } from '../models/Item';
import TreeItem from '@material-ui/lab/TreeItem';
import { TreeView } from '@material-ui/lab';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { LookupTable } from '../models/LookupTable';


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

const dialogTitleStyles = makeStyles((theme: Theme) => ({
  titleRoot: {
    margin: 0,
    padding: '13px 20px 11px',
    background: palette.white
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10
  },
  subtitle: {
    fontSize: '14px',
    lineHeight: '18px',
    paddingRight: '35px'
  },
  closeIcon: {}
}));

interface DialogTitleProps {
  title: string;
  subtitle?: string;

  onClose(): void;
}

//TODO: Extract this to be used on others components
function DialogTitle(props: DialogTitleProps) {
  const classes = dialogTitleStyles({});
  const { onClose, title, subtitle } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.titleRoot}>
      <div className={classes.title}>
        <Typography variant="h6">{title}</Typography>
        {onClose ? (
          <IconButton aria-label="close" onClick={onClose} className={classes.closeIcon}>
            <CloseIcon/>
          </IconButton>
        ) : null}
      </div>
      {
        subtitle &&
        <Typography variant="subtitle1" className={classes.subtitle}>{subtitle}</Typography>
      }
    </MuiDialogTitle>
  );
}

const simpleItemsSelectionsStyles = makeStyles((theme: Theme) => ({
  simpleItemsSelectionRoot: {
    background: palette.white,
    border: '1px solid rgba(0, 0, 0, .125)'
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

function SimpleItemsSelection(props: any) {
  const { formatMessage } = useIntl();
  const classes = simpleItemsSelectionsStyles({});
  const { item, selected, expanded, handleSelect, toggleSelectAll } = props;

  const renderTree = (nodes: LegacyItem) => (
    <TreeItem
      onFocus={(event) => {
        event.stopPropagation();
        event.preventDefault()
      }}
      key={nodes.uri}
      nodeId={nodes.uri}
      label={
        <FormControlLabel
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
    const _select = [...selected];
    if (checked) {
      const parentsId = getParentsId(nodes.uri, parents);
      parentsId.forEach(id => {
        if (!_select.includes(id)) {
          _select.push(id)
        }
      });
      _select.push(nodes.uri)
    } else {
      const childrenId = getChildrenId(nodes.uri, children);
      childrenId.forEach(id => {
        let index = _select.indexOf(id);
        if (index) {
          _select.splice(index, 1);
        }
      });
      _select.splice(_select.indexOf(nodes.uri), 1);
    }
    setSelected(_select);
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
        <SimpleItemsSelection item={item} selected={selected} expanded={expanded} handleSelect={handleSelect}
                              toggleSelectAll={toggleSelectAll}/>
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
