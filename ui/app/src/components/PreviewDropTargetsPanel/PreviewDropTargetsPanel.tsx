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
import { getHostToGuestBus } from '../../utils/subjects';
import { makeStyles } from 'tss-react/mui';
import { ContentTypeDropTarget } from '../../models/ContentTypeDropTarget';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import MenuItem from '@mui/material/MenuItem';
import Select, { selectClasses } from '@mui/material/Select';
import ContentType from '../../models/ContentType';
import { useDispatch } from 'react-redux';
import {
  clearDropTargets,
  clearHighlightedDropTargets,
  contentTypeDropTargetsRequest,
  scrollToDropTarget,
  setPreviewEditMode
} from '../../state/actions/preview';
import { Resource } from '../../models/Resource';
import { SuspenseWithEmptyState } from '../Suspencified/Suspencified';
import { LookupTable } from '../../models/LookupTable';
import { useSelection } from '../../hooks/useSelection';
import { useLogicResource } from '../../hooks/useLogicResource';
import { useMount } from '../../hooks/useMount';
import { getAvatarWithIconColors } from '../../utils/contentType';
import { darken, useTheme } from '@mui/material/styles';
import { ContentTypeField } from '../../icons';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import { nou } from '../../utils/object';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ListSubheader from '@mui/material/ListSubheader';
import { EntityState } from '../../models';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HourglassEmptyRounded from '@mui/icons-material/HourglassEmptyRounded';
import Alert from '@mui/material/Alert';
import { EmptyState } from '../EmptyState';
import Typography from '@mui/material/Typography';

const translations = defineMessages({
  dropTargetsPanel: {
    // Translation not used in code but powers i18n for `ui.xml`
    id: 'previewDropTargetsPanelTitle',
    defaultMessage: 'Drop Targets'
  },
  selectedContentType: {
    defaultMessage: 'Selected content type'
  },
  noResults: {
    id: 'previewDropTargetsPanel.noResults',
    defaultMessage: 'No results found.'
  },
  chooseContentType: {
    id: 'previewDropTargetsPanel.chooseContentType',
    defaultMessage: 'Please choose a content type.'
  }
});

const useStyles = makeStyles()(() => ({
  select: {
    width: '100%',
    padding: '15px 15px 0',
    '& > div': {
      width: '100%'
    }
  }
}));

export function PreviewDropTargetsPanel() {
  const { classes } = useStyles();
  const hostToGuest$ = getHostToGuestBus();
  const dropTargetsBranch = useSelection((state) => state.preview.dropTargets);
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const editMode = useSelection((state) => state.preview.editMode);
  const contentTypes = contentTypesBranch.byId
    ? Object.values(contentTypesBranch.byId).filter((contentType) => contentType.type === 'component')
    : null;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [listMode, setListMode] = useState(true);
  const allowedTypesData = useSelection((state) => state.preview.guest?.allowedContentTypes);
  const awaitingGuestCheckIn = nou(allowedTypesData);
  const allowedContentTypes = useMemo(() => {
    const allowedTypes: ContentType[] = [];
    if (!contentTypes || !allowedTypesData) return allowedTypes;
    contentTypes.forEach((contentType) => {
      allowedTypesData[contentType.id] && allowedTypes.push(contentType);
    });
    return allowedTypes;
  }, [allowedTypesData, contentTypes]);

  useMount(() => {
    return () => {
      dispatch(clearDropTargets());
      hostToGuest$.next({
        type: clearHighlightedDropTargets.type
      });
    };
  });

  const onSelectedDropZone = (dropTarget: ContentTypeDropTarget) => {
    if (!editMode) {
      dispatch(setPreviewEditMode({ editMode: true }));
    }
    hostToGuest$.next({
      type: scrollToDropTarget.type,
      payload: dropTarget
    });
  };

  function handleSelectChange(contentTypeId: string) {
    hostToGuest$.next(contentTypeDropTargetsRequest({ contentTypeId }));
  }

  const resetState = () => {
    setListMode(true);
    dispatch(clearDropTargets());
    hostToGuest$.next(clearHighlightedDropTargets());
  };

  const dropTargetsResource = useLogicResource<
    ContentTypeDropTarget[],
    { selectedContentType: string; byId: LookupTable<ContentTypeDropTarget> }
  >(dropTargetsBranch, {
    shouldResolve: (source) => source.selectedContentType === null || Boolean(source.byId),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) =>
      source.byId
        ? Object.values(source.byId).filter(
            (dropTarget) => dropTarget.contentTypeId === dropTargetsBranch.selectedContentType
          )
        : [],
    errorSelector: (source) => null
  });

  return awaitingGuestCheckIn ? (
    <Alert severity="info" variant="outlined" icon={<HourglassEmptyRounded />} sx={{ border: 0 }}>
      <FormattedMessage defaultMessage="Waiting for the preview application to load." />
    </Alert>
  ) : allowedContentTypes.length ? (
    listMode ? (
      <>
        <ListSubheader>
          <FormattedMessage defaultMessage="Compatible types" />
        </ListSubheader>
        {allowedContentTypes?.map((contentType: ContentType, i: number) => {
          return (
            <ListItemButton
              key={i}
              onClick={() => {
                setListMode(false);
                handleSelectChange(contentType.id);
              }}
            >
              <ContentTypeItem contentType={contentType} />
            </ListItemButton>
          );
        })}
      </>
    ) : (
      <>
        <Box className={classes.select} display="flex" alignItems="center">
          <FormControl>
            <InputLabel>{formatMessage(translations.selectedContentType)}</InputLabel>
            <Select
              value={dropTargetsBranch.selectedContentType || ''}
              label={formatMessage(translations.selectedContentType)}
              sx={{
                [`& .${selectClasses.select}`]: {
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden'
                }
              }}
              onChange={(event) => {
                event.stopPropagation();
                handleSelectChange(event.target.value);
              }}
            >
              <ListSubheader>
                <FormattedMessage defaultMessage="Compatible types" />
              </ListSubheader>
              {allowedContentTypes?.map((contentType: ContentType, i: number) => {
                return (
                  <MenuItem value={contentType.id} key={i}>
                    <ContentTypeItem contentType={contentType} />
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          {dropTargetsBranch?.selectedContentType && (
            <Tooltip title={<FormattedMessage defaultMessage="Cancel selection" />}>
              <IconButton edge="end" sx={{ ml: 0.625 }} onClick={() => resetState()}>
                <CloseRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <List>
          <SuspenseWithEmptyState
            resource={dropTargetsResource}
            withEmptyStateProps={{
              emptyStateProps: {
                title: dropTargetsBranch.selectedContentType
                  ? formatMessage(translations.noResults)
                  : formatMessage(translations.chooseContentType)
              }
            }}
          >
            <DropTargetsList resource={dropTargetsResource} onSelectedDropZone={onSelectedDropZone} />
          </SuspenseWithEmptyState>
        </List>
      </>
    )
  ) : (
    <EmptyState title="No drop targets were found on the current view." sxs={{ title: { textAlign: 'center' } }} />
  );
}

interface ContentTypeItemContentProps {
  contentType: ContentType;
}

function ContentTypeItem(props: ContentTypeItemContentProps) {
  const { contentType } = props;
  const theme = useTheme();
  const { backgroundColor, textColor } = getAvatarWithIconColors(contentType.name, theme, darken);

  return (
    <>
      <ListItemIcon sx={{ minWidth: 'unset !important' }}>
        <Box
          sx={{
            flexShrink: 0,
            width: '24px',
            height: '24px',
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor,
            borderColor: textColor,
            borderStyle: 'solid',
            borderWidth: '1px'
          }}
        />
      </ListItemIcon>
      <ListItemText primaryTypographyProps={{ noWrap: true }} title={contentType.name}>
        {contentType.name}
      </ListItemText>
    </>
  );
}

interface DropTargetsListProps {
  resource: Resource<ContentTypeDropTarget[]>;
  onSelectedDropZone(dropTarget: ContentTypeDropTarget): void;
}

function DropTargetsList(props: DropTargetsListProps) {
  const dropTargets = props.resource.read();
  return dropTargets?.map((dropTarget: ContentTypeDropTarget) => (
    <ListItemButton key={dropTarget.id} onClick={() => props.onSelectedDropZone(dropTarget)}>
      <ListItemIcon>
        <ContentTypeField />
      </ListItemIcon>
      <ListItemText primary={dropTarget.label} />
    </ListItemButton>
  ));
}

export default PreviewDropTargetsPanel;
