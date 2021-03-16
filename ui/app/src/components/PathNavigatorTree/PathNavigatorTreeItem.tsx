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
import React, { useState } from 'react';
import { DetailedItem } from '../../models/Item';
import LookupTable from '../../models/LookupTable';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Typography } from '@material-ui/core';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ItemDisplay from '../ItemDisplay';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import MoreVertRoundedIcon from '@material-ui/icons/MoreVertRounded';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import { TreeNode } from './PathNavigatorTreeUI';
import clsx from 'clsx';
import SearchBar from '../Controls/SearchBar';
import CloseIconRounded from '@material-ui/icons/CloseRounded';
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';

interface PathNavigatorTreeItemProps {
  node: TreeNode;
  itemsByPath: LookupTable<DetailedItem>;
  classes?: Partial<Record<BreadcrumbsClassKey, string>>;
  onLabelClick(event: React.MouseEvent<Element, MouseEvent>, path: string): void;
  onIconClick(path: string): void;
  onOpenItemMenu(element: Element, path: string): void;
  onFilterChange(keyword: string, path: string): void;
}

export type BreadcrumbsClassKey = 'searchRoot' | 'searchInput' | 'searchCleanButton' | 'searchCloseButton';

const translations = defineMessages({
  filter: {
    id: 'filter.placeholder',
    defaultMessage: 'Filter children...'
  }
});

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      '&:focus > $content $labelContainer': {
        background: 'none'
      }
    },
    content: {
      alignItems: 'flex-start'
    },
    labelContainer: {
      display: 'flex',
      paddingLeft: 0,
      flexWrap: 'wrap',
      '&:hover': {
        background: 'none'
      },
      '& .MuiSvgIcon-root': {
        fontSize: '1.1rem'
      }
    },
    itemDisplaySection: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      height: '26px',
      '&:hover': {
        backgroundColor: `${theme.palette.action.hover} !important`
      }
    },
    filterSection: {
      width: '100%',
      display: 'flex',
      alignItems: 'center'
    },
    noResultsSection: {
      color: theme.palette.text.secondary,
      display: 'flex',
      alignItems: 'center',
      marginBottom: '5px',
      '& svg': {
        marginRight: '5px'
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
    optionsWrapper: {
      top: 0,
      right: 0,
      visibility: 'hidden',
      position: 'absolute',
      marginLeft: 'auto',
      display: 'flex',
      height: '26px',
      alignItems: 'center'
    },
    optionsWrapperOver: {
      visibility: 'visible'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      height: '26px',
      marginLeft: '10px',
      '& span': {
        marginLeft: '10px'
      }
    },
    searchRoot: {
      margin: '5px 10px 5px 0',
      height: '25px',
      width: '100%'
    },
    searchInput: {
      fontSize: '12px',
      padding: '5px !important'
    },
    searchCloseButton: {
      marginRight: '10px'
    },
    searchCloseIcon: {
      fontSize: '12px !important'
    }
  })
);

export default function PathNavigatorTreeItem(props: PathNavigatorTreeItemProps) {
  const { node, itemsByPath, onLabelClick, onIconClick, onOpenItemMenu, onFilterChange } = props;
  const classes = useStyles();
  const [over, setOver] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [keyword, setKeyword] = useState('');
  const { formatMessage } = useIntl();
  const onMouseOver = (e) => {
    e.stopPropagation();
    setOver(true);
  };
  const onMouseLeave = (e) => {
    e.stopPropagation();
    setOver(false);
  };

  const onFilterButtonClick = () => {
    setShowFilter(!showFilter);
  };

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
      onLabelClick={(event) => onLabelClick(event, node.id)}
      onIconClick={() => onIconClick(node.id)}
      label={
        <>
          <section className={classes.itemDisplaySection} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
            <ItemDisplay
              styles={{ root: { maxWidth: over ? 'calc(100% - 50px)' : '100%', flexGrow: 1, height: '26px' } }}
              item={itemsByPath[node.id]}
              showPublishingTarget={true}
              showWorkflowState={true}
              labelTypographyProps={{ variant: 'body2' }}
            />
            <section className={clsx(classes.optionsWrapper, over && classes.optionsWrapperOver)}>
              <Tooltip title={<FormattedMessage id="words.options" defaultMessage="Options" />}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenItemMenu(e.currentTarget, node.id);
                  }}
                >
                  <MoreVertRoundedIcon />
                </IconButton>
              </Tooltip>
              {Boolean(node.children.length) && (
                <Tooltip title={<FormattedMessage id="words.filter" defaultMessage="Filter" />}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onFilterButtonClick();
                    }}
                  >
                    <SearchRoundedIcon />
                  </IconButton>
                </Tooltip>
              )}
            </section>
          </section>
          {showFilter && (
            <>
              <section className={classes.filterSection}>
                <SearchBar
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onChange={(keyword) => {
                    setKeyword(keyword);
                    onFilterChange(keyword, node.id);
                  }}
                  keyword={keyword}
                  placeholder={formatMessage(translations.filter)}
                  onActionButtonClick={(e) => {
                    e.stopPropagation();
                    setKeyword('');
                    onFilterChange('', node.id);
                  }}
                  showActionButton={keyword && true}
                  classes={{
                    root: clsx(classes.searchRoot, props.classes?.searchRoot),
                    inputInput: clsx(classes.searchInput, props.classes?.searchInput),
                    actionIcon: clsx(classes.searchCloseIcon, props.classes?.searchCleanButton)
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setKeyword('');
                    onFilterChange('', node.id);
                    setShowFilter(false);
                  }}
                  className={clsx(classes.searchCloseButton, props.classes?.searchCloseButton)}
                >
                  <CloseIconRounded />
                </IconButton>
              </section>
              {keyword && Boolean(node.id !== 'loading' && node.children.length < 1) && (
                <section className={classes.noResultsSection}>
                  <ErrorOutlineRoundedIcon />
                  <Typography variant="caption">
                    <FormattedMessage id="filter.noResults" defaultMessage="No results match your query" />
                  </Typography>
                </section>
              )}
            </>
          )}
        </>
      }
      classes={{
        root: classes.root,
        content: classes.content,
        label: classes.labelContainer,
        iconContainer: classes.iconContainer
      }}
    >
      {node.children.map((node) => (
        <PathNavigatorTreeItem
          key={node.id}
          node={node}
          itemsByPath={itemsByPath}
          onLabelClick={onLabelClick}
          onIconClick={onIconClick}
          onOpenItemMenu={onOpenItemMenu}
          onFilterChange={onFilterChange}
        />
      ))}
    </TreeItem>
  );
}
