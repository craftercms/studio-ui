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

import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import EmptyState from '../EmptyState/EmptyState';
import { FormattedMessage } from 'react-intl';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import ItemDisplay from '../ItemDisplay';
import ItemStateIcon from '../ItemStateIcon/ItemStateIcon';
import { getItemPublishingTargetText, getItemStateText, isInWorkflow } from '../ItemDisplay/utils';
import React, { ReactNode } from 'react';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Popover, { PopoverOrigin, PopoverPosition, PopoverProps, PopoverReference } from '@mui/material/Popover';
import palette from '../../styles/palette';
import { SystemIconDescriptor } from '../SystemIcon';
import { DetailedItem } from '../../models/Item';
import { ContextMenuOption } from '../ContextMenu/ContextMenu';
import GlobalState from '../../models/GlobalState';
import Skeleton from '@mui/material/Skeleton';
import { CSSProperties } from '@mui/styles';
import ItemPublishingTargetIcon from '../ItemPublishingTargetIcon/ItemPublishingTargetIcon';

export type ItemMegaMenuUIClassKey =
  | 'root'
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
  | 'itemDisplayRoot'
  | 'itemTypeIcon'
  | 'itemTypography'
  | 'icon';

export type ItemMegaMenuUIStyles = Partial<Record<ItemMegaMenuUIClassKey, CSSProperties>>;

export interface MenuOption {
  id: string;
  icon?: SystemIconDescriptor;
  label: ReactNode;
}

export interface ItemMegaMenuUIProps {
  open: boolean;
  styles?: ItemMegaMenuUIStyles;
  classes?: Partial<Record<ItemMegaMenuUIClassKey, string>>;
  isLoading?: boolean;
  numOfLoaderItems?: number;
  item: DetailedItem;
  options: ContextMenuOption[][];
  editorialOptions: ContextMenuOption[];
  nonEditorialOptions: ContextMenuOption[][];
  anchorEl?: PopoverProps['anchorEl'];
  anchorOrigin?: PopoverOrigin;
  anchorReference?: PopoverReference;
  anchorPosition?: PopoverPosition;
  contentType: string;
  locale: GlobalState['uiConfig']['locale'];
  onClose?(): void;
  onMenuItemClicked(option: string, event: React.MouseEvent<Element, MouseEvent>): void;
}

const useStyles = makeStyles((theme) =>
  createStyles<ItemMegaMenuUIClassKey, ItemMegaMenuUIStyles>({
    root: (styles) => ({
      maxWidth: 400,
      borderRadius: '12px',
      ...styles.root
    }),
    mainItem: (styles) => ({
      padding: '10px 20px',
      ...styles.mainItem
    }),
    actionsContainer: (styles) => ({
      display: 'flex',
      flexDirection: 'row',
      padding: '10px',
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
      backgroundColor: 'inherit !important',
      '&:hover': {
        backgroundColor: 'inherit'
      },
      ...styles.infoItem
    }),
    menuItem: (styles) => ({
      minWidth: '100px',
      ...styles.menuItem
    }),
    itemDisplayRoot: (styles) => ({
      marginBottom: 5,
      ...styles.itemDisplayRoot
    }),
    itemTypeIcon: (styles) => ({
      color: palette.teal.main,
      marginRight: '2px',
      ...styles.itemTypeIcon
    }),
    itemTypography: (styles) => ({
      color: theme.palette.text.primary,
      ...styles.itemTypography
    }),
    icon: (styles) => ({
      fontSize: '0.8rem',
      verticalAlign: 'middle',
      ...styles.icon
    })
  })
);

export default function ItemMegaMenuUI(props: ItemMegaMenuUIProps) {
  const {
    open,
    styles,
    item,
    isLoading = false,
    numOfLoaderItems = 5,
    options,
    editorialOptions,
    nonEditorialOptions,
    anchorEl,
    anchorOrigin,
    anchorReference,
    anchorPosition,
    contentType,
    locale,
    onClose,
    onMenuItemClicked,
    classes: propClasses
  } = props;
  const classes = useStyles(styles);
  const isFolder = item?.systemType === 'folder';
  const inWorkflow = isInWorkflow(item?.stateMap);
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={anchorOrigin}
      anchorReference={anchorReference}
      anchorPosition={anchorPosition}
      classes={{
        paper: classes.root,
        ...propClasses
      }}
    >
      <section className={clsx(classes.itemInfo, classes.infoItem, classes.mainItem)}>
        <Typography variant="body2" className={classes.itemInfoContentType}>
          {isLoading ? <Skeleton animation="wave" /> : contentType}
        </Typography>
        {isLoading ? (
          <Skeleton animation="wave" />
        ) : (
          <ItemDisplay
            item={item}
            labelComponent="h2"
            showPublishingTarget={false}
            showWorkflowState={false}
            classes={{ root: classes.itemDisplayRoot, icon: classes.itemTypeIcon }}
            labelTypographyProps={{
              className: classes.itemTypography
            }}
          />
        )}
        {isLoading ? (
          <Skeleton animation="wave" />
        ) : (
          <div className={classes.itemState}>
            {/* @see https://github.com/craftercms/craftercms/issues/5442 */}
            {!isFolder &&
              (inWorkflow ? (
                <>
                  <ItemStateIcon item={item} className={classes.icon} />
                  <Typography variant="body2" component="span">
                    {getItemStateText(item?.stateMap, { user: item?.lockOwner })}
                  </Typography>
                </>
              ) : (
                <>
                  <ItemPublishingTargetIcon item={item} className={classes.icon} />
                  <Typography variant="body2" component="span">
                    {getItemPublishingTargetText(item?.stateMap)}
                  </Typography>
                </>
              ))}
          </div>
        )}
      </section>
      {isLoading ? (
        <div className={clsx(classes.actionsContainer)}>
          {new Array(2).fill(null).map((value, i) => (
            <MenuList key={i} className={clsx(classes.actionsColumn, classes.itemsList)}>
              {new Array(Math.ceil(numOfLoaderItems / 2)).fill(null).map((value, j) => (
                <MenuItem key={j} className={clsx(classes.menuItem, propClasses?.menuItem)}>
                  <Skeleton animation="wave" width="100%" />
                </MenuItem>
              ))}
            </MenuList>
          ))}
        </div>
      ) : options.flatMap((i) => i).length === 0 ? (
        <EmptyState
          title={
            <FormattedMessage id="contextMenu.emptyOptionsMessage" defaultMessage="No options available to display." />
          }
        />
      ) : (
        <div className={clsx(classes.actionsContainer)}>
          <MenuList className={clsx(classes.actionsColumn, classes.itemsList)}>
            {editorialOptions.map((option: MenuOption, y: number) => (
              <MenuItem
                dense
                autoFocus={y === 0}
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
        </div>
      )}
      <section className={clsx(classes.itemEdited, classes.infoItem, classes.mainItem)}>
        {isLoading ? (
          <Skeleton animation="wave" width="100%" />
        ) : (
          <Typography variant="body2">
            <FormattedMessage
              id="itemMegaMenu.editedBy"
              defaultMessage="{edited} {date} {byLabel} {by}"
              values={{
                date: new Intl.DateTimeFormat(locale.localeCode, locale.dateTimeFormatOptions).format(
                  new Date(item?.sandbox.dateModified)
                ),
                by: item?.sandbox.modifier,
                edited: (
                  <span className={classes.itemEditedText}>
                    <FormattedMessage id="words.edited" defaultMessage="Edited" />
                  </span>
                ),
                byLabel: item?.sandbox.modifier ? (
                  <span className={classes.itemEditedText}>
                    <FormattedMessage id="words.by" defaultMessage="By" />
                  </span>
                ) : (
                  ''
                )
              }}
            />
          </Typography>
        )}
      </section>
    </Popover>
  );
}
