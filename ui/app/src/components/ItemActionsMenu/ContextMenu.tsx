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

import React, { ElementType, ReactNode } from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import { rand } from '../PathNavigator/utils';
import Skeleton from '@material-ui/lab/Skeleton';
import { MenuProps } from '@material-ui/core/Menu/Menu';
import clsx from 'clsx';
import { SystemIconDescriptor } from '../SystemIcon';
import ItemDisplay from '../ItemDisplay';
import { DetailedItem } from '../../models/Item';
import { useSelection } from '../../utils/hooks';
import ItemPublishingTargetIcon from '../ItemPublishingTargetIcon/ItemPublishingTargetIcon';
import { getItemPublishingTargetText, getItemStateText } from '../ItemDisplay/utils';
import ItemStateIcon from '../ItemStateIcon';
import GlobalState from '../../models/GlobalState';
import palette from '../../styles/palette';

export interface ContextMenuOption {
  id: string;
  icon?: SystemIconDescriptor;
  label: ReactNode;
}

export interface ContextMenuProps extends MenuProps {
  isLoading?: boolean;
  numOfLoaderItems?: number;
  classes?: MenuProps['classes'] & Partial<Record<'menuItem' | 'emptyRoot' | 'loadingRoot', string>>;
  options: Array<Array<ContextMenuOption>>;
  item: DetailedItem;
  locale: GlobalState['uiConfig']['locale'];
  emptyState?: {
    icon?: ElementType;
    message: string;
  };
  onMenuItemClicked(optionId: string, event: React.MouseEvent<Element, MouseEvent>): void;
}

export const useStyles = makeStyles((theme) =>
  createStyles({
    emptyRoot: {
      display: 'block',
      padding: '10px',
      textAlign: 'center'
    },
    loadingRoot: {
      width: '135px',
      padding: '0 15px'
    },
    itemInfo: {
      display: 'block',
      borderBottom: `1px solid ${palette.gray.light4}`,
      marginBottom: '10px'
    },
    itemInfoContentType: {
      color: theme.palette.text.secondary
    },
    itemEdited: {
      paddingTop: '12px',
      borderTop: `1px solid ${palette.gray.light4}`,
      marginTop: '15px'
    }
  })
);

export default function ContextMenu(props: ContextMenuProps) {
  const classes = useStyles();
  const {
    options,
    item,
    locale,
    classes: propClasses,
    onMenuItemClicked,
    emptyState,
    isLoading = false,
    numOfLoaderItems = 5,
    ...menuProps
  } = props;
  const contentTypes = useSelection((state) => state.contentTypes);
  const editedDate = item?.sandbox.dateModified;
  const editedBy = item?.sandbox.modifier;

  return (
    <Menu {...menuProps} classes={propClasses}>
      {isLoading ? (
        <div className={clsx(classes.loadingRoot, propClasses?.loadingRoot)}>
          {new Array(numOfLoaderItems).fill(null).map((value, i) => (
            <Typography key={i} variant="body2" style={{ width: `${rand(85, 100)}%`, padding: '6px 0' }}>
              <Skeleton animation="wave" width="100%" />
            </Typography>
          ))}
        </div>
      ) : options.flatMap((i) => i).length === 0 ? (
        <div className={clsx(classes.emptyRoot, propClasses?.emptyRoot)}>
          <ErrorOutlineOutlinedIcon fontSize="small" />
          <Typography variant="caption" display="block">
            {emptyState?.message || (
              <FormattedMessage
                id="contextMenu.emptyOptionsMessage"
                defaultMessage="No options available to display."
              />
            )}
          </Typography>
        </div>
      ) : (
        [
          <MenuItem key={0} className={classes.itemInfo}>
            <Typography variant="body2" component="h2" className={classes.itemInfoContentType}>
              {contentTypes?.byId?.[item.contentTypeId]?.name}
            </Typography>
            <ItemDisplay item={item} showPublishingTarget={false} showWorkflowState={false} />
            <div>
              <ItemPublishingTargetIcon item={item} classes={{}} />
              <Typography variant="body2" component="span">
                {getItemPublishingTargetText(item?.stateMap)}
              </Typography>
              <ItemStateIcon item={item} classes={{}} />
              <Typography variant="body2" component="span">
                {getItemStateText(item?.stateMap)}
              </Typography>
            </div>
          </MenuItem>,
          <div style={{ columnCount: 2 }} key={1}>
            {options.map((section: any, i: number) =>
              section.map((option: ContextMenuOption, y: number) => (
                <MenuItem
                  dense
                  key={option.id}
                  divider={i !== options.length - 1 && y === section.length - 1}
                  onClick={(e) => onMenuItemClicked(option.id, e)}
                  className={propClasses?.menuItem}
                  children={option.label}
                />
              ))
            )}
          </div>,
          <MenuItem key={2} className={classes.itemEdited}>
            <Typography variant="body2" component="h2">
              <FormattedMessage
                id="workflowCancellation.title"
                defaultMessage="Edited {date} by {by}"
                values={{
                  date: new Intl.DateTimeFormat(locale.localeCode, locale.dateTimeFormatOptions).format(
                    new Date(editedDate)
                  ),
                  by: editedBy
                }}
              />
            </Typography>
          </MenuItem>
        ]
      )}
    </Menu>
  );
}
