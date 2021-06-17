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

import { FormattedMessage } from 'react-intl';
import { isBlank } from '../../utils/string';
import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import RefreshRounded from '@material-ui/icons/RefreshRounded';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import ItemDisplay from '../ItemDisplay';
import PagesSearchAhead from '../PagesSearchAhead';
import SingleItemSelector from '../../modules/Content/Authoring/SingleItemSelector';
import { DetailedItem } from '../../models/Item';
import MoreRounded from '@material-ui/icons/MoreVertRounded';
// @ts-ignore
import { getOffsetLeft, getOffsetTop } from '@material-ui/core/Popover/Popover';
import { withIndex } from '../../utils/path';
import { batchActions } from '../../state/actions/misc';
import { completeDetailedItem } from '../../state/actions/content';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import { getNumOfMenuOptionsForItem } from '../../utils/content';
import Tooltip from '@material-ui/core/Tooltip';
import { changeCurrentUrl, RELOAD_REQUEST } from '../../state/actions/preview';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import { usePreviewState } from '../../utils/hooks';

export interface AddressBarProps {
  site: string;
  url: string;
  item?: DetailedItem;
}

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

export function PreviewAddressBar(props: AddressBarProps) {
  const classes = useAddressBarStyles();
  const { site = '', item } = props;
  const noSiteSet = isBlank(site);
  const { computedUrl = '' } = usePreviewState();
  const [internalUrl, setInternalUrl] = useState(computedUrl);
  const [openSelector, setOpenSelector] = useState(false);
  const [focus, setFocus] = useState(false);
  const disabled = noSiteSet || !item;

  useEffect(() => {
    computedUrl && setInternalUrl(computedUrl);
  }, [computedUrl]);

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
      batchActions([
        completeDetailedItem({ path }),
        showItemMegaMenu({
          path: path,
          anchorReference: 'anchorPosition',
          anchorPosition: { top, left },
          loaderItems: getNumOfMenuOptionsForItem(item)
        })
      ])
    );
  };

  const onUrlChange = (url: string) => {
    dispatch(changeCurrentUrl(url));
  };

  const onRefresh = () => {
    getHostToGuestBus().next({ type: RELOAD_REQUEST });
  };

  return (
    <>
      <Tooltip title={<FormattedMessage id="previewAddressBar.reloadButtonLabel" defaultMessage="Reload this page" />}>
        <IconButton onClick={onRefresh}>
          <RefreshRounded />
        </IconButton>
      </Tooltip>
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
      <Tooltip title={Boolean(item) ? <FormattedMessage id="words.options" defaultMessage="Options" /> : ''}>
        <IconButton onClick={onOptions} disabled={!item}>
          <MoreRounded />
        </IconButton>
      </Tooltip>
    </>
  );
}

export default PreviewAddressBar;
