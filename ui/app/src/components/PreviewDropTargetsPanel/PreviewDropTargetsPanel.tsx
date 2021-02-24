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

import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import { useLogicResource, useMount, useSelection } from '../../utils/hooks';
import { createStyles, makeStyles } from '@material-ui/core';
import { ContentTypeDropTarget } from '../../models/ContentTypeDropTarget';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Avatar from '@material-ui/core/Avatar';
import MoveToInboxRounded from '@material-ui/icons/MoveToInboxRounded';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ContentType from '../../models/ContentType';
import { useDispatch } from 'react-redux';
import {
  CLEAR_HIGHLIGHTED_DROP_TARGETS,
  clearDropTargets,
  CONTENT_TYPE_DROP_TARGETS_REQUEST,
  SCROLL_TO_DROP_TARGET,
  setPreviewEditMode
} from '../../state/actions/preview';
import { Resource } from '../../models/Resource';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { LookupTable } from '../../models/LookupTable';

const translations = defineMessages({
  dropTargetsPanel: {
    id: 'previewDropTargetsPanel.title',
    defaultMessage: 'Drop Targets'
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

const useStyles = makeStyles((theme) =>
  createStyles({
    select: {
      width: '100%',
      padding: '15px',
      '& > div': {
        width: '100%'
      }
    }
  })
);

export default function PreviewDropTargetsPanel() {
  const classes = useStyles({});
  const hostToGuest$ = getHostToGuestBus();
  const dropTargetsBranch = useSelection((state) => state.preview.dropTargets);
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const editMode = useSelection((state) => state.preview.editMode);
  const contentTypes = contentTypesBranch.byId
    ? Object.values(contentTypesBranch.byId).filter((contentType) => contentType.type === 'component')
    : null;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  useMount(() => {
    return () => {
      dispatch(clearDropTargets());
      hostToGuest$.next({
        type: CLEAR_HIGHLIGHTED_DROP_TARGETS
      });
    };
  });

  const onSelectedDropZone = (dropTarget: ContentTypeDropTarget) => {
    if (!editMode) {
      dispatch(setPreviewEditMode({ editMode: true }));
    }
    hostToGuest$.next({
      type: SCROLL_TO_DROP_TARGET,
      payload: dropTarget
    });
  };

  function handleSelectChange(contentTypeId: string) {
    hostToGuest$.next({
      type: CONTENT_TYPE_DROP_TARGETS_REQUEST,
      payload: contentTypeId
    });
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
          onChange={(event: any) => handleSelectChange(event.target.value)}
        >
          <MenuItem value="" disabled>
            {formatMessage(translations.selectContentType)}
          </MenuItem>
          {contentTypes?.map((contentType: ContentType, i: number) => {
            return (
              <MenuItem value={contentType.id} key={i}>
                {contentType.name}
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
  return (
    <>
      {dropTargets?.map((dropTarget: ContentTypeDropTarget) => (
        <ListItem key={dropTarget.id} button onClick={() => props.onSelectedDropZone(dropTarget)}>
          <ListItemAvatar>
            <Avatar>
              <MoveToInboxRounded />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={dropTarget.label} />
        </ListItem>
      ))}
    </>
  );
}
