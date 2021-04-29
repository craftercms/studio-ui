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

import { defineMessages, useIntl } from 'react-intl';
import { isBlank } from '../../utils/string';
import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useEnv, useSelection } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { AllItemActions, generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import IconButton from '@material-ui/core/IconButton';
import RefreshRounded from '@material-ui/icons/RefreshRounded';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import ItemDisplay from '../ItemDisplay';
import PagesSearchAhead from '../PagesSearchAhead';
import SingleItemSelector from '../../modules/Content/Authoring/SingleItemSelector';
import { DetailedItem } from '../../models/Item';
import ActionsGroup from '../ActionsGroup';
import Skeleton from '@material-ui/lab/Skeleton';

const useAddressBarStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      placeContent: 'center space-between'
    },
    addressBarInput: {
      width: 300,
      padding: '2px 2px 2px 10px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.background.default
    },
    addressBarInputFocused: {
      border: `2px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.background.paper
    },
    inputContainer: {
      marginLeft: theme.spacing(1)
    },
    input: {
      border: 'none',
      background: 'transparent',
      '&:focus:invalid, &:focus': {
        border: 'none',
        boxShadow: 'none'
      }
    },
    divider: {
      height: 28,
      margin: 4
    },
    selectorPopoverRoot: {
      width: 400,
      marginLeft: '4px'
    },
    hidden: {
      visibility: 'hidden'
    },
    itemActionSkeleton: {
      width: 40,
      margin: '0 5px'
    },
    itemDisplayWrapper: {
      width: '100%',
      overflow: 'hidden',
      cursor: 'pointer',
      display: 'flex'
    },
    itemPreviewUrl: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      marginLeft: '4px'
    },
    itemDisplaySkeleton: {
      marginLeft: '5px',
      width: '100%'
    }
  })
);

const translations = defineMessages({
  reload: {
    id: 'words.reload',
    defaultMessage: 'Reload'
  }
});

export interface AddressBarProps {
  site: string;
  url: string;
  item?: DetailedItem;
  onUrlChange: (value: string) => any;
  onRefresh: (e) => any;
}

export function AddressBar(props: AddressBarProps) {
  const classes = useAddressBarStyles();
  const { formatMessage } = useIntl();
  const { site, url = '', item, onUrlChange, onRefresh } = props;
  const noSiteSet = isBlank(site);
  const [internalUrl, setInternalUrl] = useState(url);
  const [openSelector, setOpenSelector] = useState(false);
  const [focus, setFocus] = useState(false);
  const disabled = noSiteSet || !item;

  useEffect(() => {
    url && setInternalUrl(url);
  }, [url]);

  const theme = useTheme();
  const [numOfVisibleActions, setNumOfVisibleActions] = useState(5);
  const isSmallScreen = useMediaQuery(theme.breakpoints.only('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.only('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.only('lg'));
  useEffect(() => {
    setNumOfVisibleActions(isSmallScreen ? 1 : isMediumScreen ? 4 : isLargeScreen ? 8 : 15);
  }, [isSmallScreen, isMediumScreen, isLargeScreen]);

  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const clipboard = useSelection((state) => state.content.clipboard);
  const onMenuItemClicked = (option: AllItemActions, event: React.MouseEvent<HTMLLIElement, MouseEvent>) =>
    itemActionDispatcher({
      site,
      item,
      option,
      authoringBase,
      dispatch,
      formatMessage,
      clipboard,
      event
    });
  const actions = generateSingleItemOptions(item, formatMessage)?.flatMap((options) => options);

  return (
    <>
      <IconButton title={formatMessage(translations.reload)} onClick={onRefresh}>
        <RefreshRounded />
      </IconButton>
      <Paper
        variant={focus ? 'elevation' : 'outlined'}
        elevation={focus ? 2 : 0}
        className={clsx(classes.addressBarInput, focus && classes.addressBarInputFocused)}
      >
        {!focus && item && (
          <div className={classes.itemDisplayWrapper} onClick={() => setFocus(true)}>
            <ItemDisplay item={item} styles={{ root: { maxWidth: '100%' } }} showNavigableAsLinks={false} />
          </div>
        )}
        {(focus || !item) && (
          <PagesSearchAhead
            value={internalUrl}
            placeholder={noSiteSet ? '' : '/'}
            disabled={disabled}
            onEnter={onUrlChange}
            classes={{
              input: classes.input
            }}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        )}
        <SingleItemSelector
          disabled={disabled}
          rootPath="/site/website/index.xml"
          selectedItem={item as DetailedItem}
          open={openSelector}
          onClose={() => setOpenSelector(false)}
          onDropdownClick={() => setOpenSelector(!openSelector)}
          onItemClicked={(item) => {
            setOpenSelector(false);
            setInternalUrl(item.previewUrl);
            onUrlChange(item.previewUrl);
          }}
          hideUI
          classes={{
            popoverRoot: classes.selectorPopoverRoot
          }}
        />
      </Paper>
      {item ? (
        <ActionsGroup max={numOfVisibleActions} actions={actions} onActionClicked={onMenuItemClicked} />
      ) : (
        <>
          <Skeleton animation="pulse" className={classes.itemActionSkeleton} />
          <Skeleton animation="pulse" className={classes.itemActionSkeleton} />
          <Skeleton animation="pulse" className={classes.itemActionSkeleton} />
          <Skeleton animation="pulse" className={classes.itemActionSkeleton} />
          <Skeleton animation="pulse" variant="circle" width="25px" height="25px" />
        </>
      )}
    </>
  );
}

export default AddressBar;
