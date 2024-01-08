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
import React, { useEffect, useState } from 'react';
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
import { withIndex } from '../../utils/path';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import { getNumOfMenuOptionsForItem } from '../../utils/content';
import Tooltip from '@mui/material/Tooltip';
import { changeCurrentUrl, reloadRequest } from '../../state/actions/preview';
import { getHostToGuestBus } from '../../utils/subjects';
import PreviewBackButton from '../PreviewBackButton';
import PreviewForwardButton from '../PreviewForwardButton';
import { usePreviewNavigation } from '../../hooks/usePreviewNavigation';

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
  const { currentUrlPath = '' } = usePreviewNavigation();
  const [internalUrl, setInternalUrl] = useState(currentUrlPath);
  const [openSelector, setOpenSelector] = useState(false);
  const [focus, setFocus] = useState(false);
  const disabled = noSiteSet || !item;
  const dispatch = useDispatch();

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
    getHostToGuestBus().next({ type: reloadRequest.type });
  };

  useEffect(() => {
    currentUrlPath && setInternalUrl(currentUrlPath);
  }, [currentUrlPath]);

  return (
    <>
      <PreviewBackButton />
      <PreviewForwardButton />
      <Tooltip title={<FormattedMessage defaultMessage="Reload this page (r)" />}>
        <span>
          <IconButton onClick={onRefresh} size="large" disabled={disabled}>
            <RefreshRounded />
          </IconButton>
        </span>
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
        <SingleItemSelector
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
          classes={{ popoverRoot: classes.selectorPopoverRoot }}
          buttonSize="medium"
        />
      </Paper>
      <Tooltip title={Boolean(item) ? <FormattedMessage defaultMessage="Options (a)" /> : ''}>
        <IconButton onClick={onOptions} disabled={!item} size="large" id="previewAddressBarActionsMenuButton">
          <MoreRounded />
        </IconButton>
      </Tooltip>
    </>
  );
}

export default PreviewAddressBar;
