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
import { createStyles, makeStyles, PopoverOrigin, PopoverPosition, PopoverReference } from '@material-ui/core';
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
import Typography from '@material-ui/core/Typography';
import palette from '../../styles/palette';
import ItemDisplay from '../ItemDisplay';
import ItemPublishingTargetIcon from '../ItemPublishingTargetIcon';
import { getItemPublishingTargetText, getItemStateText } from '../ItemDisplay/utils';
import ItemStateIcon from '../ItemStateIcon';
import { SystemIconDescriptor } from '../SystemIcon';
import EmptyState from '../SystemStatus/EmptyState';
import { CSSProperties } from '@material-ui/styles';

export type ItemMegaMenuClassKey =
  | 'root'
  | 'menuMainList'
  | 'mainItem'
  | 'actionsContainer'
  | 'actionsColumn'
  | 'emptyRoot'
  | 'itemsList'
  | 'itemInfo'
  | 'itemInfoContentType'
  | 'itemEdited'
  | 'itemEditedText'
  | 'itemState'
  | 'infoItem'
  | 'menuItem'
  | 'icon';

export type ItemMegaMenuStyles = Partial<Record<ItemMegaMenuClassKey, CSSProperties>>;

export interface MenuOption {
  id: string;
  icon?: SystemIconDescriptor;
  label: ReactNode;
}

export interface ItemMegaMenuBaseProps {
  path: string;
  open: boolean;
  styles?: ItemMegaMenuStyles;
  classes?: Partial<Record<ItemMegaMenuClassKey, string>>;
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
  createStyles<ItemMegaMenuClassKey, ItemMegaMenuStyles>({
    root: (styles) => ({
      borderRadius: '12px',
      ...styles.root
    }),
    menuMainList: (styles) => ({
      padding: 0,
      ...styles.menuMainList
    }),
    mainItem: (styles) => ({
      padding: '10px 20px',
      ...styles.mainItem
    }),
    actionsContainer: (styles) => ({
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      ...styles.actionsContainer
    }),
    actionsColumn: (styles) => ({
      display: 'flex',
      flexDirection: 'column',
      flexBasis: '100%',
      flex: '1',
      '&:first-child': {
        marginRight: '60px'
      },
      ...styles.actionsColumn
    }),
    emptyRoot: (styles) => ({
      display: 'block',
      padding: '10px',
      textAlign: 'center',
      ...styles.emptyRoot
    }),
    itemsList: (styles) => ({
      padding: 0,
      ...styles.itemsList
    }),
    itemInfo: (styles) => ({
      display: 'block',
      borderBottom: `1px solid ${palette.gray.light4}`,
      ...styles.itemInfo
    }),
    itemInfoContentType: (styles) => ({
      color: theme.palette.text.secondary,
      marginBottom: '4px',
      ...styles.itemInfoContentType
    }),
    itemEdited: (styles) => ({
      paddingTop: '12px',
      borderTop: `1px solid ${palette.gray.light4}`,
      ...styles.itemEdited
    }),
    itemEditedText: (styles) => ({
      color: theme.palette.text.secondary,
      fontWeight: 600,
      ...styles.itemEditedText
    }),
    itemState: (styles) => ({
      '&> *': {
        marginRight: '5px'
      },
      ...styles.itemState
    }),
    infoItem: (styles) => ({
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'inherit'
      },
      ...styles.infoItem
    }),
    menuItem: (styles) => ({
      paddingLeft: 0,
      paddingRight: 0,
      ...styles.menuItem
    }),
    icon: (styles) => ({
      fontSize: '0.8rem',
      verticalAlign: 'middle',
      ...styles.icon
    })
  })
);

export default function ItemMegaMenu(props: ItemMegaMenuProps) {
  const {
    open,
    path,
    onClose,
    styles,
    classes: propClasses,
    anchorEl,
    anchorOrigin,
    anchorReference = 'anchorEl',
    anchorPosition
  } = props;
  const classes = useStyles(styles);
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
  const nonEditorialOptions = options.slice(1);
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
        <EmptyState
          title={
            <FormattedMessage id="contextMenu.emptyOptionsMessage" defaultMessage="No options available to display." />
          }
        />
      ) : (
        [
          <MenuItem key={0} className={clsx(classes.itemInfo, classes.infoItem, classes.mainItem)}>
            <Typography variant="body2" component="h2" className={classes.itemInfoContentType}>
              {contentTypes?.byId?.[item.contentTypeId]?.name}
            </Typography>
            <ItemDisplay item={item} showPublishingTarget={false} showWorkflowState={false} />
            <div className={classes.itemState}>
              <ItemPublishingTargetIcon item={item} className={classes.icon} />
              <Typography variant="body2" component="span">
                {getItemPublishingTargetText(item?.stateMap)}
              </Typography>
              <ItemStateIcon item={item} className={classes.icon} />
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
                  className={clsx(classes.menuItem, propClasses?.menuItem)}
                  children={option.label}
                />
              ))}
            </MenuList>
            <div className={classes.actionsColumn}>
              {nonEditorialOptions.map((section: any, i: number) => (
                <MenuList key={i} className={classes.itemsList}>
                  {section.map((option: MenuOption, y: number) => (
                    <MenuItem
                      dense
                      key={option.id}
                      divider={i !== nonEditorialOptions.length - 1 && y === section.length - 1}
                      onClick={(e) => onMenuItemClicked(option.id, e)}
                      className={clsx(classes.menuItem, propClasses?.menuItem)}
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
                id="itemMegaMenu.editedBy"
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
