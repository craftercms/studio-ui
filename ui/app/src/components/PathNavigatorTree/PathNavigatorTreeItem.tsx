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

import TreeItem from '@mui/lab/TreeItem';
import React, { useState } from 'react';
import { DetailedItem } from '../../models/Item';
import LookupTable from '../../models/LookupTable';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography } from '@mui/material';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import ItemDisplay from '../ItemDisplay';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { TreeNode } from './PathNavigatorTreeUI';
import clsx from 'clsx';
import SearchBar from '../Controls/SearchBar';
import CloseIconRounded from '@mui/icons-material/CloseRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import Button from '@mui/material/Button';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';

interface PathNavigatorTreeItemProps {
  node: TreeNode;
  itemsByPath: LookupTable<DetailedItem>;
  keywordByPath: LookupTable<string>;
  totalByPath: LookupTable<number>;
  childrenByParentPath: LookupTable<string[]>;
  classes?: Partial<Record<BreadcrumbsClassKey, string>>;
  onLabelClick(event: React.MouseEvent<Element, MouseEvent>, path: string): void;
  onIconClick(path: string): void;
  onOpenItemMenu(element: Element, path: string): void;
  onFilterChange(keyword: string, path: string): void;
  onMoreClick(path: string): void;
}

export type BreadcrumbsClassKey = 'searchRoot' | 'searchInput' | 'searchCleanButton' | 'searchCloseButton';

const translations = defineMessages({
  filter: {
    id: 'pathNavigatorTreeItemFilter.placeholder',
    defaultMessage: 'Filter children...'
  },
  expand: {
    id: 'words.expand',
    defaultMessage: 'Expand'
  },
  collapse: {
    id: 'words.collapse',
    defaultMessage: 'Collapse'
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
      alignItems: 'flex-start',
      paddingRight: 0,
      '&:hover': {
        background: 'none'
      }
    },
    labelContainer: {
      display: 'flex',
      paddingLeft: 0,
      flexWrap: 'wrap',
      overflow: 'hidden',
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
      minHeight: '23.5px',
      '&:hover': {
        backgroundColor: `${theme.palette.action.hover} !important`
      }
    },
    filterSection: {
      width: '100%',
      display: 'flex',
      alignItems: 'center'
    },
    empty: {
      color: theme.palette.text.secondary,
      display: 'flex',
      alignItems: 'center',
      minHeight: '23.5px',
      marginLeft: '10px',
      '& svg': {
        marginRight: '5px',
        fontSize: '1.1rem'
      }
    },
    more: {
      color: theme.palette.text.primary,
      display: 'flex',
      alignItems: 'center',
      minHeight: '23.5px',
      marginLeft: '10px'
    },
    iconContainer: {
      width: '26px',
      marginRight: 0,
      '& svg': {
        fontSize: '23.5px !important',
        color: theme.palette.text.secondary
      }
    },
    focused: {
      background: 'none !important'
    },
    optionsWrapper: {
      top: 0,
      right: 0,
      visibility: 'hidden',
      position: 'absolute',
      marginLeft: 'auto',
      display: 'flex',
      minHeight: '23.5px',
      alignItems: 'center'
    },
    optionsWrapperOver: {
      visibility: 'visible'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      minHeight: '23.5px',
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
    },
    iconButton: {
      padding: '2px 3px'
    }
  })
);

export default function PathNavigatorTreeItem(props: PathNavigatorTreeItemProps) {
  const {
    node,
    itemsByPath,
    keywordByPath,
    totalByPath,
    childrenByParentPath,
    onLabelClick,
    onIconClick,
    onOpenItemMenu,
    onFilterChange,
    onMoreClick
  } = props;
  const classes = useStyles();
  const [over, setOver] = useState(false);
  const [showFilter, setShowFilter] = useState(Boolean(keywordByPath[node.id]));
  const [keyword, setKeyword] = useState(keywordByPath[node.id] ?? '');
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

  const onCloseFilterBox = () => {
    if (keyword) {
      setKeyword('');
      onFilterChange('', node.id);
    }
  };

  switch (node.id) {
    case 'loading': {
      return (
        <div className={classes.loading}>
          <CircularProgress size={14} />
          <Typography variant="caption" color="textSecondary">
            <FormattedMessage id="words.loading" defaultMessage="Loading" />
          </Typography>
        </div>
      );
    }
    case 'empty': {
      return (
        <section className={classes.empty}>
          <ErrorOutlineRoundedIcon />
          <Typography variant="caption">
            <FormattedMessage id="filter.noResults" defaultMessage="No results match your query" />
          </Typography>
        </section>
      );
    }
    case 'more': {
      return (
        <section className={classes.more}>
          <Button
            color="primary"
            size="small"
            onClick={() => {
              onMoreClick(node.parentPath);
            }}
          >
            <FormattedMessage
              id="pathNavigatorTree.moreLinkLabel"
              defaultMessage="{count, plural, one {...{count} more item} other {...{count} more items}}"
              values={{
                count: totalByPath[node.parentPath] - childrenByParentPath[node.parentPath].length
              }}
            />
          </Button>
        </section>
      );
    }
    default: {
      return (
        <TreeItem
          key={node.id}
          nodeId={node.id}
          expandIcon={
            <ArrowRightRoundedIcon
              role="button"
              aria-label={formatMessage(translations.expand)}
              aria-hidden="false"
              onClick={() => onIconClick(node.id)}
            />
          }
          collapseIcon={
            <ArrowDropDownRoundedIcon
              role="button"
              aria-label={formatMessage(translations.collapse)}
              aria-hidden="false"
              onClick={() => onIconClick(node.id)}
            />
          }
          label={
            <>
              <section
                role="button"
                onClick={(event) => onLabelClick(event, node.id)}
                className={classes.itemDisplaySection}
                onMouseOver={onMouseOver}
                onMouseLeave={onMouseLeave}
              >
                <ItemDisplay
                  styles={{
                    root: {
                      width: over ? 'calc(100% - 60px)' : '100%',
                      minHeight: '23.5px'
                    }
                  }}
                  item={itemsByPath[node.id]}
                  labelTypographyProps={{ variant: 'body2' }}
                />
                <section className={clsx(classes.optionsWrapper, over && classes.optionsWrapperOver)}>
                  <Tooltip title={<FormattedMessage id="words.options" defaultMessage="Options" />}>
                    <IconButton
                      size="small"
                      className={classes.iconButton}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpenItemMenu(e.currentTarget, node.id);
                      }}
                    >
                      <MoreVertRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  {(Boolean(node.children.length) || showFilter) && (
                    <Tooltip title={<FormattedMessage id="words.filter" defaultMessage="Filter" />}>
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onCloseFilterBox();
                          onFilterButtonClick();
                        }}
                      >
                        <SearchRoundedIcon color={showFilter ? 'primary' : 'action'} />
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
                        onCloseFilterBox();
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
                        onCloseFilterBox();
                        setShowFilter(false);
                      }}
                      className={clsx(classes.searchCloseButton, props.classes?.searchCloseButton)}
                    >
                      <CloseIconRounded />
                    </IconButton>
                  </section>
                </>
              )}
            </>
          }
          classes={{
            root: classes.root,
            content: classes.content,
            label: classes.labelContainer,
            iconContainer: classes.iconContainer,
            focused: classes.focused
          }}
        >
          {node.children.map((node) => (
            <PathNavigatorTreeItem
              key={node.id}
              node={node}
              itemsByPath={itemsByPath}
              keywordByPath={keywordByPath}
              totalByPath={totalByPath}
              childrenByParentPath={childrenByParentPath}
              onLabelClick={onLabelClick}
              onIconClick={onIconClick}
              onOpenItemMenu={onOpenItemMenu}
              onFilterChange={onFilterChange}
              onMoreClick={onMoreClick}
            />
          ))}
        </TreeItem>
      );
    }
  }
}
