/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ViewToolbar from '../../components/ViewToolbar';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import RefreshRounded from '@material-ui/icons/RefreshRounded';
import GlobalNavOpenerButton from '../../components/Navigation/GlobalNavOpenerButton';
import CustomMenu from '../../components/Icons/CustomMenu';
import {
  changeCurrentUrl,
  closeTools,
  openTools,
  RELOAD_REQUEST,
  setPreviewEditMode
} from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import {
  useActiveSiteId,
  useEnv,
  usePermissions,
  usePreviewGuest,
  usePreviewState,
  useSelection,
  useSiteList
} from '../../utils/hooks';
import { getHostToGuestBus } from './previewContext';
import { isBlank } from '../../utils/string';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import QuickCreate from './QuickCreate';
import { changeSite } from '../../state/reducers/sites';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import withStyles from '@material-ui/core/styles/withStyles';
import palette from '../../styles/palette';
import SingleItemSelector from '../Content/Authoring/SingleItemSelector';
import { DetailedItem } from '../../models/Item';
import PagesSearchAhead from '../../components/Navigation/PagesSearchAhead';
import clsx from 'clsx';
import { generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import ActionsGroup from '../../components/ActionsGroup';
import Skeleton from '@material-ui/lab/Skeleton';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { setSiteCookie } from '../../utils/auth';

const translations = defineMessages({
  openToolsPanel: {
    id: 'openToolsPanel.label',
    defaultMessage: 'Open tools panel'
  },
  toggleEditMode: {
    id: 'previewToolbar.toggleEditMode',
    defaultMessage: 'Toggle edit mode'
  },
  toggleSidebarTooltip: {
    id: 'common.toggleSidebarTooltip',
    defaultMessage: 'Toggle sidebar'
  },
  reload: {
    id: 'words.reload',
    defaultMessage: 'Reload'
  },
  itemMenu: {
    id: 'previewToolbar.itemMenu',
    defaultMessage: 'Item menu'
  }
});

const foo = () => void 0;

export const EditSwitch = withStyles({
  checked: {
    color: palette.green.tint
  }
})(Switch);

const useAddressBarStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      placeContent: 'center space-between'
    },
    addressBarInput: {
      width: 400,
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.background.default
    },
    addressBarInputFocused: {
      border: `1px solid ${theme.palette.primary.main}`
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
    siteSwitcherSelectMenu: {
      maxWidth: 110
    },
    siteSwitcherMenuItem: {
      maxWidth: 390,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'block'
    },
    iconButton: {},
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
    }
  })
);

interface AddressBarProps {
  site: string;
  url: string;
  item?: DetailedItem;
  onSiteChange: (siteId: string) => any;
  onUrlChange: (value: string) => any;
  onRefresh: (e) => any;
  sites: { id: string; name: string }[];
}

export function AddressBar(props: AddressBarProps) {
  const classes = useAddressBarStyles();
  const { formatMessage } = useIntl();
  const { site, url = '', sites = [], item, onSiteChange = foo, onUrlChange = foo, onRefresh = foo } = props;
  const noSiteSet = isBlank(site);
  const [internalUrl, setInternalUrl] = useState(url);
  const path = useSelection<string>((state) => state.preview.guest?.path);
  const [openSelector, setOpenSelector] = useState(false);
  const [focus, setFocus] = useState(false);

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

  const onSiteChangeInternal = (value) => !isBlank(value) && value !== site && onSiteChange(value);

  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const legacyFormSrc = `${authoringBase}/legacy/form?`;
  const clipboard = useSelection((state) => state.content.clipboard);
  const onMenuItemClicked = (option: string) =>
    itemActionDispatcher({ site, item, option, legacyFormSrc, dispatch, formatMessage, clipboard });
  const permissions = usePermissions()?.[path];
  const actions = generateSingleItemOptions(item, permissions, formatMessage)?.flatMap((options) => options);

  return (
    <>
      <IconButton className={classes.iconButton} title={formatMessage(translations.reload)} onClick={onRefresh}>
        <RefreshRounded />
      </IconButton>
      <Paper
        variant={focus ? 'elevation' : 'outlined'}
        elevation={focus ? 2 : 0}
        className={clsx(classes.addressBarInput, focus && classes.addressBarInputFocused)}
      >
        <Select
          value={site}
          classes={{ select: classes.input, selectMenu: classes.siteSwitcherSelectMenu }}
          onChange={({ target: { value } }) => onSiteChangeInternal(value)}
          displayEmpty
        >
          {noSiteSet && (
            <MenuItem value="">
              <FormattedMessage id="previewToolBar.siteSelectorNoSiteSelected" defaultMessage="Choose site" />
            </MenuItem>
          )}
          {sites.map(({ id, name }) => (
            <MenuItem key={id} value={id} className={classes.siteSwitcherMenuItem}>
              {name}
            </MenuItem>
          ))}
        </Select>
        <PagesSearchAhead
          value={internalUrl}
          placeholder={noSiteSet ? '' : '/'}
          disabled={noSiteSet}
          onEnter={(value) => onUrlChange(value)}
          classes={{
            input: classes.input
          }}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
        <SingleItemSelector
          disabled={noSiteSet}
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

export default function ToolBar() {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const editMode = useSelection((state) => state.preview.editMode);
  const sites = useSiteList();
  const { computedUrl, showToolsPanel } = usePreviewState();
  const guest = usePreviewGuest();
  const modelId = guest?.modelId;
  const models = guest?.models;
  const items = useSelection((state) => state.content.items.byPath);
  const item = items?.[models?.[modelId]?.craftercms.path];
  const { previewChoice } = usePreviewState();
  const { authoringBase } = useEnv();

  // region permissions
  const permissions = usePermissions();
  const write = permissions?.[item?.path]?.['write'];
  const createContent = permissions?.[item?.path]?.['create_content'];
  // endregion

  return (
    <ViewToolbar>
      <section>
        <GlobalNavOpenerButton />
        <Tooltip title={formatMessage(translations.toggleSidebarTooltip)}>
          <IconButton
            aria-label={formatMessage(translations.openToolsPanel)}
            onClick={() => dispatch(showToolsPanel ? closeTools() : openTools())}
          >
            <CustomMenu />
          </IconButton>
        </Tooltip>
        <QuickCreate disabled={!createContent} />
        <Tooltip title={!write ? '' : formatMessage(translations.toggleEditMode)}>
          <EditSwitch
            disabled={!write}
            color="default"
            checked={editMode}
            onChange={(e) => {
              dispatch(setPreviewEditMode({ editMode: e.target.checked }));
            }}
          />
        </Tooltip>
        <AddressBar
          site={site ?? ''}
          sites={sites}
          url={computedUrl}
          item={item}
          onSiteChange={(site) => {
            if (previewChoice[site] === '2') {
              dispatch(changeSite(site));
            } else {
              setSiteCookie(site);
              setTimeout(() => (window.location.href = `${authoringBase}/preview`));
            }
          }}
          onUrlChange={(url) => dispatch(changeCurrentUrl(url))}
          onRefresh={() => getHostToGuestBus().next({ type: RELOAD_REQUEST })}
        />
      </section>
      <section>
        <GlobalNavOpenerButton sitesRailPosition="left" icon="apps" />
      </section>
    </ViewToolbar>
  );
}
