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

import React, { PropsWithChildren, ReactNode } from 'react';
import { useActiveSiteId, useEnv, useItemsByPath, useSelection } from '../../utils/hooks';
import {
  createStyles,
  makeStyles,
  MenuProps,
  PopoverOrigin,
  PopoverPosition,
  PopoverReference
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import StandardAction from '../../models/StandardAction';
import { generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import { PopoverProps } from '@material-ui/core/Popover';
import { getRootPath, isValidCutPastePath } from '../../utils/path';
import GlobalState from '../../models/GlobalState';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import clsx from 'clsx';
import ErrorOutlineOutlinedIcon from '@material-ui/core/SvgIcon/SvgIcon';
import Typography from '@material-ui/core/Typography';
import palette from '../../styles/palette';
import ItemDisplay from '../ItemDisplay';
import ItemPublishingTargetIcon from '../ItemPublishingTargetIcon/ItemPublishingTargetIcon';
import { getItemPublishingTargetText, getItemStateText } from '../ItemDisplay/utils';
import ItemStateIcon from '../ItemStateIcon/ItemStateIcon';
import { SystemIconDescriptor } from '../SystemIcon';

export interface MenuOption {
  id: string;
  icon?: SystemIconDescriptor;
  label: ReactNode;
}

export interface ItemMegaMenuBaseProps {
  path: string;
  open: boolean;
  classes?: MenuProps['classes'] & Partial<Record<'menuItem' | 'emptyRoot', string>>;
  anchorOrigin?: PopoverOrigin;
  anchorReference?: PopoverReference;
  anchorPosition?: PopoverPosition;
}

export type ItemMegaMenuProps = PropsWithChildren<
  ItemMegaMenuBaseProps & {
    anchorEl?: PopoverProps['anchorEl'];
    onClose?(): void;
  }
>;

export interface ItemMegaMenuStateProps extends ItemMegaMenuBaseProps {
  onClose?: StandardAction;
}

export const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      borderRadius: '12px'
    },
    menuMainList: {
      padding: 0
    },
    mainItem: {
      padding: '10px 20px'
    },
    actionsContainer: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%'
    },
    actionsColumn: {
      display: 'flex',
      flexDirection: 'column',
      flexBasis: '100%',
      flex: '1',
      '&:first-child': {
        marginRight: '60px'
      }
    },
    emptyRoot: {
      display: 'block',
      padding: '10px',
      textAlign: 'center'
    },
    itemsList: {
      padding: 0
    },
    itemInfo: {
      display: 'block',
      borderBottom: `1px solid ${palette.gray.light4}`
    },
    itemInfoContentType: {
      color: theme.palette.text.secondary,
      marginBottom: '4px'
    },
    itemEdited: {
      paddingTop: '12px',
      borderTop: `1px solid ${palette.gray.light4}`
    },
    itemEditedText: {
      color: theme.palette.text.secondary,
      fontWeight: 600
    },
    itemState: {
      '&> *': {
        marginRight: '5px'
      }
    },
    infoItem: {
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'inherit'
      }
    },
    optionItem: {
      paddingLeft: 0,
      paddingRight: 0
    },
    icon: {
      fontSize: '0.8rem',
      verticalAlign: 'middle'
    }
  })
);

export default function ItemMegaMenu(props: ItemMegaMenuProps) {
  const {
    open,
    path,
    onClose,
    classes: propClasses,
    anchorEl,
    anchorOrigin,
    anchorReference = 'anchorEl',
    anchorPosition
  } = props;
  const classes = useStyles();
  const site = useActiveSiteId();
  const items = useItemsByPath();
  const clipboard = useSelection((state) => state.content.clipboard);
  const item = items[path];
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const onMenuItemClicked = (option: string, event: React.MouseEvent<Element, MouseEvent>) => {
    itemActionDispatcher({ site, item, option, authoringBase, dispatch, formatMessage, clipboard, event });
    onClose();
  };
  const hasClipboard =
    item &&
    clipboard &&
    clipboard.paths.length &&
    getRootPath(clipboard.sourcePath) === getRootPath(item.path) &&
    isValidCutPastePath(item.path, clipboard.sourcePath);
  const locale = useSelection<GlobalState['uiConfig']['locale']>((state) => state.uiConfig.locale);
  const options = generateSingleItemOptions(item, formatMessage, { hasClipboard });
  const editorialOptions = options[0];
  const publishingOptions = options.slice(1);
  const contentTypes = useSelection((state) => state.contentTypes);
  const editedDate = item?.sandbox.dateModified;
  const editedBy = item?.sandbox.modifier;

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={anchorOrigin}
      anchorReference={anchorReference}
      anchorPosition={anchorPosition}
      classes={{
        paper: classes.root,
        list: classes.menuMainList,
        ...propClasses
      }}
    >
      {options.flatMap((i) => i).length === 0 ? (
        <div className={clsx(classes.emptyRoot, propClasses?.emptyRoot)}>
          <ErrorOutlineOutlinedIcon fontSize="small" />
          <Typography variant="caption" display="block">
            <FormattedMessage id="contextMenu.emptyOptionsMessage" defaultMessage="No options available to display." />
          </Typography>
        </div>
      ) : (
        [
          <MenuItem key={0} className={clsx(classes.itemInfo, classes.infoItem, classes.mainItem)}>
            <Typography variant="body2" component="h2" className={classes.itemInfoContentType}>
              {contentTypes?.byId?.[item.contentTypeId]?.name}
            </Typography>
            <ItemDisplay item={item} showPublishingTarget={false} showWorkflowState={false} />
            <div className={classes.itemState}>
              <ItemPublishingTargetIcon item={item} classes={{ root: classes.icon }} />
              <Typography variant="body2" component="span">
                {getItemPublishingTargetText(item?.stateMap)}
              </Typography>
              <ItemStateIcon item={item} classes={{ root: classes.icon }} />
              <Typography variant="body2" component="span">
                {getItemStateText(item?.stateMap)}
              </Typography>
            </div>
          </MenuItem>,
          <div key={1} className={clsx(classes.mainItem, classes.actionsContainer)}>
            <MenuList className={clsx(classes.actionsColumn, classes.itemsList)}>
              {editorialOptions.map((option: MenuOption, y: number) => (
                <MenuItem
                  dense
                  key={option.id}
                  onClick={(e) => onMenuItemClicked(option.id, e)}
                  className={clsx(classes.optionItem, propClasses?.menuItem)}
                  children={option.label}
                />
              ))}
            </MenuList>
            <div className={classes.actionsColumn}>
              {publishingOptions.map((section: any, i: number) => (
                <MenuList key={i} className={classes.itemsList}>
                  {section.map((option: MenuOption, y: number) => (
                    <MenuItem
                      dense
                      key={option.id}
                      divider={i !== publishingOptions.length - 1 && y === section.length - 1}
                      onClick={(e) => onMenuItemClicked(option.id, e)}
                      className={clsx(classes.optionItem, propClasses?.menuItem)}
                      children={option.label}
                    />
                  ))}
                </MenuList>
              ))}
            </div>
          </div>,
          <MenuItem key={2} className={clsx(classes.itemEdited, classes.infoItem, classes.mainItem)}>
            <Typography variant="body2" component="h2">
              <FormattedMessage
                id="workflowCancellation.title"
                defaultMessage="{edited} {date} {byLabel} {by}"
                values={{
                  date: new Intl.DateTimeFormat(locale.localeCode, locale.dateTimeFormatOptions).format(
                    new Date(editedDate)
                  ),
                  by: editedBy,
                  edited: (
                    <span className={classes.itemEditedText}>
                      <FormattedMessage id="words.edited" defaultMessage="Edited" />
                    </span>
                  ),
                  byLabel: (
                    <span className={classes.itemEditedText}>
                      <FormattedMessage id="words.by" defaultMessage="by" />
                    </span>
                  )
                }}
              />
            </Typography>
          </MenuItem>
        ]
      )}
    </Menu>
  );
}
