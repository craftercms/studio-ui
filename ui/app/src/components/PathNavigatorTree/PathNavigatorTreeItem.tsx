/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
import { makeStyles } from 'tss-react/mui';
import ItemDisplay from '../ItemDisplay';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SearchBar from '../SearchBar/SearchBar';
import CloseIconRounded from '@mui/icons-material/CloseRounded';
import Button from '@mui/material/Button';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import { isBlank } from '../../utils/string';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import { lookupItemByPath } from '../../utils/content';

export interface PathNavigatorTreeItemProps {
  path: string;
  itemsByPath: LookupTable<DetailedItem>;
  keywordByPath: LookupTable<string>;
  totalByPath: LookupTable<number>;
  childrenByParentPath: LookupTable<string[]>;
  active?: Record<string, boolean>;
  classes?: Partial<Record<PathNavigatorTreeBreadcrumbsClassKey, string>>;
  showNavigableAsLinks?: boolean;
  showPublishingTarget?: boolean;
  showWorkflowState?: boolean;
  showItemMenu?: boolean;
  onLabelClick(event: React.MouseEvent<Element, MouseEvent>, path: string): void;
  onIconClick(path: string): void;
  onOpenItemMenu?(element: Element, path: string): void;
  onFilterChange(keyword: string, path: string): void;
  onMoreClick(path: string): void;
}

export type PathNavigatorTreeBreadcrumbsClassKey =
  | 'searchRoot'
  | 'searchInput'
  | 'searchCleanButton'
  | 'searchCloseButton';

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

const useStyles = makeStyles<void, 'content' | 'labelContainer'>()((theme, _params, classes) => ({
  root: {
    [`&:focus > .${classes.content} .${classes.labelContainer}`]: {
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
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.action.hover : theme.palette.grey['A200']
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
  },
  active: {
    backgroundColor: theme.palette.action.selected
  }
}));

export function PathNavigatorTreeItem(props: PathNavigatorTreeItemProps) {
  const {
    path,
    itemsByPath,
    keywordByPath,
    totalByPath,
    childrenByParentPath,
    active = {},
    showNavigableAsLinks = true,
    showPublishingTarget = true,
    showWorkflowState = true,
    showItemMenu = true,
    onLabelClick,
    onIconClick,
    onOpenItemMenu,
    onFilterChange,
    onMoreClick
  } = props;
  const { classes, cx } = useStyles();
  const [over, setOver] = useState(false);
  const [showFilter, setShowFilter] = useState(Boolean(keywordByPath[path]));
  const [keyword, setKeyword] = useState(keywordByPath[path] ?? '');
  const { formatMessage } = useIntl();
  const item = lookupItemByPath(path, itemsByPath);
  const children = lookupItemByPath(path, childrenByParentPath) ?? [];

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

  const onClearKeywords = () => {
    if (keyword) {
      setKeyword('');
      onFilterChange('', path);
    }
  };

  const onContextMenu = (e) => {
    if (onOpenItemMenu) {
      e.preventDefault();
      onOpenItemMenu(e.currentTarget.querySelector('[data-item-menu]'), path);
    }
  };

  // Children for TreeItem set here this way instead of as JSX children below since, because there
  // are multiple blocks, that would cause all nodes to have an "open" icon even if they have no children.
  const propsForTreeItem = { children: [] };
  if (children.length) {
    propsForTreeItem.children = children.map((path) => (
      <PathNavigatorTreeItem
        key={path}
        path={path}
        itemsByPath={itemsByPath}
        keywordByPath={keywordByPath}
        totalByPath={totalByPath}
        childrenByParentPath={childrenByParentPath}
        active={active}
        onLabelClick={onLabelClick}
        onIconClick={onIconClick}
        onOpenItemMenu={onOpenItemMenu}
        onFilterChange={onFilterChange}
        onMoreClick={onMoreClick}
        showNavigableAsLinks={showNavigableAsLinks}
        showPublishingTarget={showPublishingTarget}
        showWorkflowState={showWorkflowState}
        showItemMenu={showItemMenu}
      />
    ));
    children.length < totalByPath[path] &&
      propsForTreeItem.children.push(
        <section key="more" className={classes.more}>
          <Button
            color="primary"
            size="small"
            onClick={() => {
              onMoreClick(path);
            }}
          >
            <FormattedMessage
              id="pathNavigatorTree.moreLinkLabel"
              defaultMessage="{count, plural, one {...{count} more item} other {...{count} more items}}"
              values={{ count: totalByPath[path] - children.length }}
            />
          </Button>
        </section>
      );
  } else if (totalByPath[path] > 0 && !childrenByParentPath.length) {
    propsForTreeItem.children.push(
      <div key="loading" className={classes.loading}>
        <CircularProgress size={14} />
        <Typography variant="caption" color="textSecondary">
          <FormattedMessage id="words.loading" defaultMessage="Loading" />
        </Typography>
      </div>
    );
  } else if (!isBlank(keywordByPath[path]) && totalByPath[path] === 0) {
    propsForTreeItem.children.push(
      <section key="noResults" className={classes.empty}>
        <ErrorOutlineRounded />
        <Typography variant="caption">
          <FormattedMessage id="filter.noResults" defaultMessage="No results match your query" />
        </Typography>
      </section>
    );
  }
  return (
    // region <TreeItem ... />
    <TreeItem
      key={path}
      nodeId={path}
      expandIcon={
        // region
        <ArrowRightRoundedIcon
          role="button"
          aria-label={formatMessage(translations.expand)}
          aria-hidden="false"
          onClick={() => onIconClick(path)}
        />
        // endregion
      }
      collapseIcon={
        // region
        <ArrowDropDownRoundedIcon
          role="button"
          aria-label={formatMessage(translations.collapse)}
          aria-hidden="false"
          onClick={() => onIconClick(path)}
        />
        // endregion
      }
      label={
        <>
          <section
            role="button"
            onClick={(event) => onLabelClick(event, path)}
            className={classes.itemDisplaySection}
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseLeave}
            onContextMenu={onContextMenu}
          >
            <ItemDisplay
              styles={{
                root: {
                  flex: 1,
                  minWidth: 0,
                  minHeight: '23.5px'
                }
              }}
              item={item}
              labelTypographyProps={{ variant: 'body2' }}
              showNavigableAsLinks={showNavigableAsLinks}
              showPublishingTarget={showPublishingTarget}
              showWorkflowState={showWorkflowState}
            />
            {over && showItemMenu && onOpenItemMenu && (
              <Tooltip title={<FormattedMessage id="words.options" defaultMessage="Options" />}>
                <IconButton
                  size="small"
                  className={classes.iconButton}
                  data-item-menu
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenItemMenu(e.currentTarget, path);
                  }}
                >
                  <MoreVertRoundedIcon />
                </IconButton>
              </Tooltip>
            )}
            {over && (showFilter || Boolean(item.childrenCount)) && (
              <Tooltip title={<FormattedMessage id="words.filter" defaultMessage="Filter" />}>
                <IconButton
                  size="small"
                  className={classes.iconButton}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClearKeywords();
                    onFilterButtonClick();
                  }}
                >
                  <SearchRoundedIcon color={showFilter ? 'primary' : 'action'} />
                </IconButton>
              </Tooltip>
            )}
          </section>
          {showFilter && (
            <section className={classes.filterSection}>
              <SearchBar
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onChange={(keyword) => {
                  setKeyword(keyword);
                  onFilterChange(keyword, path);
                }}
                keyword={keyword}
                placeholder={formatMessage(translations.filter)}
                onActionButtonClick={(e, input) => {
                  e.stopPropagation();
                  onClearKeywords();
                  input.focus();
                }}
                showActionButton={keyword && true}
                classes={{
                  root: cx(classes.searchRoot, props.classes?.searchRoot),
                  inputInput: cx(classes.searchInput, props.classes?.searchInput),
                  actionIcon: cx(classes.searchCloseIcon, props.classes?.searchCleanButton)
                }}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearKeywords();
                  setShowFilter(false);
                }}
                className={cx(classes.searchCloseButton, props.classes?.searchCloseButton)}
              >
                <CloseIconRounded />
              </IconButton>
            </section>
          )}
        </>
      }
      classes={{
        root: classes.root,
        content: classes.content,
        label: cx(classes.labelContainer, active[path] && classes.active),
        iconContainer: classes.iconContainer,
        focused: classes.focused
      }}
      {...propsForTreeItem}
    />
    // endregion
  );
}

export default PathNavigatorTreeItem;
