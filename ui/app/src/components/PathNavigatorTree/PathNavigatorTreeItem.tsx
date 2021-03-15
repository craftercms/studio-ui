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

import TreeItem from '@material-ui/lab/TreeItem';
import React from 'react';
import { TreeNode } from '../Navigation/FolderBrowserTreeView';
import { DetailedItem } from '../../models/Item';
import LookupTable from '../../models/LookupTable';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ItemDisplay from '../ItemDisplay';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import MoreVertRoundedIcon from '@material-ui/icons/MoreVertRounded';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      '&:focus > $content $labelContainer': {
        backgroundColor: 'transparent'
      }
    },
    content: {},
    labelContainer: {
      display: 'flex',
      paddingLeft: 0,
      height: '26px',
      '& .options': {
        display: 'none'
      },
      '&:hover': {
        backgroundColor: `${theme.palette.action.hover} !important`,
        '& .options': {
          display: 'block'
        }
      }
    },
    iconContainer: {
      width: '26px',
      marginRight: 0,
      '& svg': {
        fontSize: '26px',
        color: theme.palette.text.secondary
      }
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      height: '26px',
      marginLeft: '10px',
      '& span': {
        marginLeft: '10px'
      }
    }
  })
);

interface PathNavigatorTreeItemProps {
  node: TreeNode;
  itemsByPath: LookupTable<DetailedItem>;
  onLabelClick(path: string): void;
  onIconClick(path: string): void;
  onOpenItemMenu(element: Element, path: string): void;
}

export default function PathNavigatorTreeItem(props: PathNavigatorTreeItemProps) {
  const { node, itemsByPath, onLabelClick, onIconClick, onOpenItemMenu } = props;
  const classes = useStyles();
  return node.id === 'loading' ? (
    <div className={classes.loading}>
      <CircularProgress size={14} />
      <Typography variant="caption" color="textSecondary">
        <FormattedMessage id="words.loading" defaultMessage="Loading" />
      </Typography>
    </div>
  ) : (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      onLabelClick={() => onLabelClick(node.id)}
      onIconClick={() => onIconClick(node.id)}
      label={
        <>
          <ItemDisplay
            styles={{ root: { maxWidth: '100%', flexGrow: 1 } }}
            item={itemsByPath[node.id]}
            showPublishingTarget={true}
            showWorkflowState={true}
            labelTypographyProps={{ variant: 'body2' }}
          />
          <section className="options">
            <Tooltip title={<FormattedMessage id="words.options" defaultMessage="Options" />}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenItemMenu(e.currentTarget, node.id);
                }}
              >
                <MoreVertRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </section>
        </>
      }
      classes={{
        root: classes.root,
        content: classes.content,
        label: classes.labelContainer,
        iconContainer: classes.iconContainer
      }}
    >
      {Array.isArray(node.children)
        ? node.children.map((node) => (
            <PathNavigatorTreeItem
              key={node.id}
              node={node}
              itemsByPath={itemsByPath}
              onLabelClick={onLabelClick}
              onIconClick={onIconClick}
              onOpenItemMenu={onOpenItemMenu}
            />
          ))
        : null}
    </TreeItem>
  );
}
