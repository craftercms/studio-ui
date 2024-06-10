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

import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { getHostToGuestBus } from '../../utils/subjects';
import { makeStyles } from 'tss-react/mui';
import { ContentTypeDropTarget } from '../../models/ContentTypeDropTarget';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
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

const translations = defineMessages({
  dropTargetsPanel: {
    id: 'previewDropTargetsPanel.title',
    defaultMessage: 'Component Drop Targets'
  },
  selectContentType: {
    id: 'previewDropTargetsPanel.selectContentType',
    defaultMessage: 'Select content type'
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
    padding: '15px',
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
  const theme = useTheme();

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

  return (
    <>
      <div className={classes.select}>
        <Select
          value={dropTargetsBranch.selectedContentType || ''}
          displayEmpty
          onChange={(event: any) => {
            event.stopPropagation();
            handleSelectChange(event.target.value);
          }}
        >
          <MenuItem value="" disabled>
            {formatMessage(translations.selectContentType)}
          </MenuItem>
          {contentTypes?.map((contentType: ContentType, i: number) => {
            const { backgroundColor, textColor } = getAvatarWithIconColors(
              contentTypesBranch.byId[contentType.id].name,
              theme,
              darken
            );
            return (
              <MenuItem value={contentType.id} key={i}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      mr: 1,
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
                  <Box sx={{ flexShrink: 1, flexGrow: 1, textOverflow: 'ellipsis' }} title={contentType.name}>
                    {contentType.name}
                  </Box>
                </Box>
              </MenuItem>
            );
          })}
        </Select>
      </div>
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
