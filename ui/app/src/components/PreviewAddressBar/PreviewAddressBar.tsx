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

import { FormattedMessage } from 'react-intl';
import { isBlank } from '../../utils/string';
import React, { useEffect, useState, useRef, MouseEvent, useMemo } from 'react';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { useDispatch } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import Paper from '@mui/material/Paper';
import ItemDisplay from '../ItemDisplay';
import PagesSearchAhead from '../PagesSearchAhead';
import SingleItemSelector from '../SingleItemSelector';
import { DetailedItem } from '../../models/Item';
import MoreRounded from '@mui/icons-material/MoreVertRounded';
import { getOffsetLeft, getOffsetTop } from '@mui/material/Popover';
import { withIndex, withoutIndex } from '../../utils/path';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import { getNumOfMenuOptionsForItem } from '../../utils/content';
import Tooltip from '@mui/material/Tooltip';
import { changeCurrentUrl, reloadRequest } from '../../state/actions/preview';
import { getHostToGuestBus, getHostToHostBus } from '../../utils/subjects';
import PreviewBackButton from '../PreviewBackButton';
import PreviewForwardButton from '../PreviewForwardButton';
import { usePreviewNavigation } from '../../hooks/usePreviewNavigation';
import CircularProgress from '@mui/material/CircularProgress';
import usePreviewState from '../../hooks/usePreviewState';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Alert, { alertClasses } from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import useEnv from '../../hooks/useEnv';
import { Subscription } from 'rxjs';

export interface AddressBarProps {
  site: string;
  url: string;
  item?: DetailedItem;
}

const useAddressBarStyles = makeStyles()((theme: Theme) => ({
  toolbar: {
    placeContent: 'center space-between'
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
}));

export function PreviewAddressBar(props: AddressBarProps) {
  const { classes } = useAddressBarStyles();
  const { site = '', item } = props;
  const noSiteSet = isBlank(site);
  const { error } = usePreviewState();
  const { currentUrlPath = '' } = usePreviewNavigation();
  const [internalUrl, setInternalUrl] = useState(currentUrlPath);
  const [openSelector, setOpenSelector] = useState(false);
  const [focus, setFocus] = useState(false);
  const dispatch = useDispatch();
  const rootPath = '/site/website/index.xml';
  // If the current item is not a page (e.g. a component), selectedItem will be null
  // The SingleItemSelector's selectedItem prop is optional, if it doesn't exist, it handles actions using the rootPath.
  const selectedItem = useMemo(() => {
    if (item && item.path.includes(withoutIndex(rootPath))) {
      return item;
    } else {
      return null;
    }
  }, [item]);
  const disableItemMenuButton = !item || Boolean(error);

  const onOptions = (e) => {
    const anchorRect = e.currentTarget.getBoundingClientRect();
    const top = anchorRect.top + getOffsetTop(anchorRect, 'top');
    const left = anchorRect.left + getOffsetLeft(anchorRect, 'left');
    let path = item.path;
    if (path === '/site/website') {
      path = withIndex(item.path);
    }
    dispatch(
      showItemMegaMenu({
        path: path,
        anchorReference: 'anchorPosition',
        anchorPosition: { top, left },
        loaderItems: getNumOfMenuOptionsForItem(item)
      })
    );
  };

  const onUrlChange = (url: string) => {
    dispatch(changeCurrentUrl(url));
  };

  const onRefresh = () => {
    const action = reloadRequest();
    getHostToGuestBus().next(action);
    getHostToHostBus().next(action);
  };

  useEffect(() => {
    currentUrlPath && setInternalUrl(currentUrlPath);
  }, [currentUrlPath]);

  // region XB communication detection

  let { xbDetectionTimeoutMs } = usePreviewState();
  const timeoutRef = useRef<any>();
  const [alertLevel, setAlertLevel] = useState(0);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);
  const openPopover = Boolean(popoverAnchorEl);
  const { authoringBase } = useEnv();

  const handlePopoverHover = (event: MouseEvent<HTMLElement>) => {
    clearTimeout(timeoutRef.current);
  };
  const handlePopoverOpen = (event: MouseEvent<HTMLElement>) => {
    clearTimeout(timeoutRef.current);
    setPopoverAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    timeoutRef.current = setTimeout(() => {
      setPopoverAnchorEl(null);
    }, 800);
  };

  useEffect(() => {
    if (!item && xbDetectionTimeoutMs > 0) {
      let timeout: NodeJS.Timeout, subscription: Subscription;
      let beginStatusTimer = () => {
        timeout = setTimeout(() => {
          setAlertLevel(1);
          timeout = setTimeout(() => {
            setAlertLevel(2);
          }, xbDetectionTimeoutMs);
        }, xbDetectionTimeoutMs);
      };
      subscription = getHostToHostBus().subscribe((action) => {
        if (action.type === reloadRequest.type) {
          clearTimeout(timeout);
          setAlertLevel(0);
          beginStatusTimer();
        }
      });
      beginStatusTimer();
      return () => {
        clearTimeout(timeout);
        setAlertLevel(0);
        subscription.unsubscribe();
      };
    } else {
      setPopoverAnchorEl(null);
    }
  }, [item, xbDetectionTimeoutMs]);

  // endregion

  return (
    <>
      <PreviewBackButton />
      <PreviewForwardButton />
      <Tooltip title={noSiteSet ? '' : <FormattedMessage defaultMessage="Reload this page (r)" />}>
        <IconButton onClick={noSiteSet ? undefined : onRefresh} size="large" disabled={noSiteSet}>
          <RefreshRounded />
        </IconButton>
      </Tooltip>
      <Paper
        variant={focus ? 'elevation' : 'outlined'}
        elevation={focus ? 2 : 0}
        sx={(theme) => ({
          width: '300px',
          borderRadius: 8,
          padding: '2px 2px 2px 10px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: theme.palette.background.default,
          borderColor: theme.palette.mode === 'light' ? theme.palette.divider : theme.palette.grey[700],
          ...(focus && {
            border: `2px solid ${theme.palette.primary.main}`,
            backgroundColor: theme.palette.background.paper
          })
        })}
      >
        {!focus && item && (
          <div className={classes.itemDisplayWrapper} onClick={() => setFocus(true)}>
            <ItemDisplay item={item} styles={{ root: { maxWidth: '100%' } }} showNavigableAsLinks={false} />
          </div>
        )}
        {(focus || !item) && (
          <PagesSearchAhead
            autoFocus={focus}
            value={internalUrl}
            placeholder={noSiteSet ? '' : '/'}
            onEnter={onUrlChange}
            classes={{ input: classes.input }}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        )}
        <Tooltip title={disableItemMenuButton ? '' : <FormattedMessage defaultMessage="Options (a)" />}>
          <IconButton
            onClick={onOptions}
            disabled={disableItemMenuButton}
            sx={error ? { visibility: 'hidden' } : undefined}
            size="medium"
            id="previewAddressBarActionsMenuButton"
          >
            <MoreRounded sx={alertLevel === 2 ? { visibility: 'hidden' } : undefined} />
            {!item && !error && (
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  position: 'absolute',
                  alignItems: 'center',
                  placeContent: 'center',
                  pointerEvents: 'all'
                }}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
              >
                {alertLevel === 2 ? (
                  <ErrorOutlineOutlined color="error" />
                ) : (
                  <CircularProgress
                    sx={{ position: 'absolute', pointerEvents: 'all' }}
                    color={alertLevel ? (alertLevel === 1 ? 'warning' : 'error') : 'primary'}
                  />
                )}
              </Box>
            )}
          </IconButton>
        </Tooltip>
      </Paper>
      <SingleItemSelector
        rootPath={rootPath}
        selectedItem={selectedItem}
        open={openSelector}
        onClose={() => setOpenSelector(false)}
        onDropdownClick={() => setOpenSelector(!openSelector)}
        onItemClicked={(item) => {
          setOpenSelector(false);
          setInternalUrl(item.previewUrl);
          onUrlChange(item.previewUrl);
        }}
        hideUI
        classes={{ popoverRoot: classes.selectorPopoverRoot }}
        tooltip="Navigation"
      />
      <Popover
        // Avoid backdrop from blocking the interaction with other elements
        sx={{ pointerEvents: 'none' }}
        open={openPopover}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        slotProps={{
          paper: {
            sx: { pointerEvents: 'all' },
            onMouseEnter: handlePopoverHover,
            onMouseLeave: handlePopoverClose
          }
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Alert
          severity={alertLevel ? (alertLevel === 1 ? 'warning' : 'error') : 'info'}
          action={
            <Button href={`${authoringBase}/help/preview-missing-app-connection`} target="_blank">
              <FormattedMessage defaultMessage="Learn more" />
            </Button>
          }
          sx={{ [`.${alertClasses.icon},.${alertClasses.message}`]: { display: 'flex', alignItems: 'center' } }}
        >
          <FormattedMessage defaultMessage="Awaiting a connection from the Preview application" />
        </Alert>
      </Popover>
    </>
  );
}

export default PreviewAddressBar;
