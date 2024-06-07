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

import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import List from '@mui/material/List';
import ContentType from '../../models/ContentType';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { getHostToGuestBus } from '../../utils/subjects';
import {
  componentDragEnded,
  componentDragStarted,
  contentTypeDropTargetsRequest,
  pushIcePanelPage,
  setContentTypeFilter,
  setPreviewEditMode
} from '../../state/actions/preview';
import { DraggablePanelListItem } from '../DraggablePanelListItem/DraggablePanelListItem';
import { useDispatch } from 'react-redux';
import { batchActions } from '../../state/actions/misc';
import { createToolsPanelPage, createWidgetDescriptor } from '../../utils/state';
import { useSelection } from '../../hooks/useSelection';
import SearchBar from '../SearchBar';
import LoadingState from '../LoadingState';
import ErrorBoundary from '../ErrorBoundary';
import EmptyState from '../EmptyState';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import ListItem from '@mui/material/ListItem';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import HourglassEmptyRounded from '@mui/icons-material/HourglassEmptyRounded';
import InfoRounded from '@mui/icons-material/InfoOutlined';
import { ExpandMoreRounded } from '@mui/icons-material';
import Alert, { alertClasses } from '@mui/material/Alert';
import { nou } from '../../utils/object';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import { ItemTypeIcon } from '../ItemTypeIcon';
import { SandboxItem } from '../../models';

const translations = defineMessages({
  previewComponentsPanelTitle: {
    id: 'previewComponentsPanel.title',
    defaultMessage: 'Add Components'
  },
  browse: {
    id: 'previewComponentsPanel.browse',
    defaultMessage: 'Browse existing'
  },
  listDropTargets: {
    id: 'previewComponentsPanel.listDropTargets',
    defaultMessage: 'List drop targets'
  },
  listInPageInstances: {
    id: 'previewComponentsPanel.listInPageInstances',
    defaultMessage: 'Instances on this page'
  },
  filter: {
    defaultMessage: 'Filter...'
  }
});

type ContentTypeData = {
  allowedTypes: ContentType[];
  otherTypes: ContentType[];
};

export function PreviewComponentsPanel() {
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const allowedTypesData = useSelection((state) => state.preview.guest?.allowedContentTypes);
  const awaitingGuestCheckIn = nou(allowedTypesData);
  const [keyword, setKeyword] = useState('');
  const { formatMessage } = useIntl();
  const contentTypeData: ContentTypeData = useMemo(() => {
    const allowedTypes: ContentType[] = [];
    const otherTypes: ContentType[] = [];
    const result = { allowedTypes, otherTypes };
    if (!contentTypesBranch.byId || !allowedTypesData) return result;
    const lowerCaseKeyword = keyword.trim().toLowerCase();
    const typeLookup = contentTypesBranch.byId;
    for (const id in typeLookup) {
      const contentType = typeLookup[id];
      if (
        // Skip pages
        contentType.type === 'page' ||
        // Keyword isn't blank and the type name nor id match the keyword
        (lowerCaseKeyword !== '' &&
          !contentType.name.toLowerCase().includes(lowerCaseKeyword) &&
          !id.toLowerCase().includes(lowerCaseKeyword))
      ) {
        continue;
      }
      // if contentType.type === 'component' ...
      if (allowedTypesData.embedded?.[id] || allowedTypesData.shared?.[id] || allowedTypesData.sharedExisting?.[id]) {
        allowedTypes.push(contentType);
      } else {
        otherTypes.push(contentType);
      }
    }
    return result;
  }, [contentTypesBranch.byId, keyword, allowedTypesData]);
  const dispatch = useDispatch();
  // region Context Menu
  const [menuContext, setMenuContext] = useState<{ anchor: Element; contentType: ContentType }>();
  const onMenuClose = () => setMenuContext(null);
  const onBrowseSharedInstancesClicked = () => {
    dispatch(
      batchActions([
        setContentTypeFilter(menuContext.contentType.id),
        pushIcePanelPage(
          createToolsPanelPage(
            formatMessage({ defaultMessage: 'Existing {name}' }, { name: menuContext.contentType.name }),
            [createWidgetDescriptor({ id: 'craftercms.components.PreviewBrowseComponentsPanel' })],
            'icePanel'
          )
        )
      ])
    );
  };
  const onListInPageInstancesClick = () => {
    dispatch(
      batchActions([
        setContentTypeFilter(menuContext.contentType.id),
        pushIcePanelPage(
          createToolsPanelPage(
            formatMessage({ defaultMessage: 'Instances of {name}' }, { name: menuContext.contentType.name }),
            [createWidgetDescriptor({ id: 'craftercms.components.PreviewInPageInstancesPanel' })],
            'icePanel'
          )
        )
      ])
    );
  };
  const onListDropTargetsClick = () => {
    dispatch(
      pushIcePanelPage(
        createToolsPanelPage(
          formatMessage({ defaultMessage: 'Drop Targets for {name}' }, { name: menuContext.contentType.name }),
          [createWidgetDescriptor({ id: 'craftercms.components.PreviewDropTargetsPanel' })],
          'icePanel'
        )
      )
    );
    getHostToGuestBus().next({
      type: contentTypeDropTargetsRequest.type,
      payload: menuContext.contentType.id
    });
  };
  // endregion
  // region Drag and Drop
  const editMode = useSelection((state) => state.preview.editMode);
  const [isBeingDragged, setIsBeingDragged] = useState<string | null>(null);
  const onDragStart = (contentType: ContentType) => {
    if (!editMode) {
      dispatch(setPreviewEditMode({ editMode: true }));
    }
    getHostToGuestBus().next({ type: componentDragStarted.type, payload: contentType });
    setIsBeingDragged(contentType.id);
  };
  const onDragEnd = () => {
    getHostToGuestBus().next({ type: componentDragEnded.type });
    setIsBeingDragged(null);
  };
  // endregion
  return (
    <ErrorBoundary>
      <Box sx={{ padding: (theme) => `${theme.spacing(1)} ${theme.spacing(1)} 0` }}>
        <SearchBar
          placeholder={formatMessage(translations.filter)}
          showActionButton={Boolean(keyword)}
          onChange={setKeyword}
          keyword={keyword}
          autoFocus
        />
      </Box>
      {contentTypesBranch.isFetching ? (
        <LoadingState
          title={<FormattedMessage id="componentsPanel.suspenseStateMessage" defaultMessage="Retrieving Page Model" />}
        />
      ) : (
        <>
          {/* **** */}
          <Box sx={{ pt: 1 }}>
            {awaitingGuestCheckIn ? (
              <Alert severity="info" variant="outlined" icon={<HourglassEmptyRounded />} sx={{ border: 0 }}>
                <FormattedMessage defaultMessage="Awaiting for the preview application..." />
              </Alert>
            ) : contentTypeData.allowedTypes.length ? (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    placeContent: 'space-between',
                    alignItems: 'center',
                    px: 1.6,
                    py: 1.5
                  }}
                >
                  <Typography variant="overline">
                    <FormattedMessage defaultMessage="Compatible Types" />
                  </Typography>
                  <Tooltip
                    arrow
                    title={
                      <FormattedMessage defaultMessage="The compatible types are those configured by project developers to be accepted by the content model" />
                    }
                  >
                    <IconButton size="small">
                      <InfoRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <List sx={{ pt: 0 }}>
                  {contentTypeData.allowedTypes.map((contentType) => (
                    <DraggablePanelListItem
                      key={contentType.id}
                      primaryText={contentType.name}
                      onDragStart={() => onDragStart(contentType)}
                      onDragEnd={onDragEnd}
                      onMenu={(anchor) => setMenuContext({ anchor, contentType })}
                      isBeingDragged={isBeingDragged === contentType.id}
                    />
                  ))}
                </List>
              </>
            ) : (
              <EmptyState
                sxs={{ title: { textAlign: 'center' } }}
                title={
                  keyword ? (
                    <FormattedMessage defaultMessage='No types match "{keyword}"' values={{ keyword }} />
                  ) : (
                    <FormattedMessage defaultMessage="No compatible types were detected on the current preview" />
                  )
                }
                subtitle={
                  keyword ? undefined : (
                    <FormattedMessage defaultMessage="Developers can modify the content model to allow for types to be used where required" />
                  )
                }
              />
            )}
          </Box>
          {/* **** */}
          {contentTypeData.otherTypes.length > 0 && (
            <Accordion square disableGutters elevation={0} sx={{ background: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography variant="overline">
                  <FormattedMessage defaultMessage="Other Types" />
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <Alert
                  severity="info"
                  variant="outlined"
                  sx={{ width: '100%', border: 'none', py: 0, [`.${alertClasses.icon}`]: { mr: 1 } }}
                >
                  <FormattedMessage defaultMessage="Usage of these types is not configured for the current content model" />
                </Alert>
                <List dense>
                  {contentTypeData.otherTypes.map((type) => (
                    <ListItem key={type.id}>
                      <ListItemText primary={type.name} />
                      <ListItemSecondaryAction sx={{ right: '10px' }}>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          size="small"
                          onClick={(e) => setMenuContext({ anchor: e.currentTarget, contentType: type })}
                        >
                          <MoreVertRounded />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
          {/* **** */}
        </>
      )}
      <Menu open={Boolean(menuContext)} anchorEl={menuContext?.anchor} onClose={onMenuClose}>
        <Box
          sx={{
            px: 2,
            py: 1,
            mb: 1,
            maxWidth: 300,
            borderColor: 'divider',
            borderWidth: 1,
            borderBottomStyle: 'solid'
          }}
        >
          <Typography variant="body2" title={menuContext?.contentType.id} noWrap>
            {menuContext?.contentType.id ?? <Skeleton variant="text" />}
          </Typography>
          <Typography sx={{ display: 'flex', alignItems: 'center', placeContent: 'space-between' }}>
            {menuContext?.contentType.name ?? <Skeleton variant="text" width="100px" />}
            <ItemTypeIcon
              item={{ systemType: menuContext?.contentType.type ?? '', mimeType: '' } as SandboxItem}
              sx={{ ml: 0.7, color: 'action.active' }}
            />
          </Typography>
        </Box>
        <MenuItem onClick={onListInPageInstancesClick}>{formatMessage(translations.listInPageInstances)}</MenuItem>
        <MenuItem onClick={onBrowseSharedInstancesClicked}>{formatMessage(translations.browse)}</MenuItem>
        <MenuItem onClick={onListDropTargetsClick}>{formatMessage(translations.listDropTargets)}</MenuItem>
      </Menu>
    </ErrorBoundary>
  );
}

export default PreviewComponentsPanel;
