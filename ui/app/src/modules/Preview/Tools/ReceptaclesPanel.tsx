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
import ToolPanel from './ToolPanel';
import { defineMessages, useIntl } from 'react-intl';
import { getHostToGuestBus } from '../previewContext';
import { useMount, useSelection, useLogicResource } from '../../../utils/hooks';
import { createStyles, makeStyles } from '@material-ui/core';
import { ContentTypeReceptacle } from '../../../models/ContentTypeReceptacle';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Avatar from '@material-ui/core/Avatar';
import MoveToInboxRounded from '@material-ui/icons/MoveToInboxRounded';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ContentType from '../../../models/ContentType';
import { useDispatch } from 'react-redux';
import {
  CLEAR_HIGHLIGHTED_RECEPTACLES,
  clearReceptacles,
  CONTENT_TYPE_RECEPTACLES_REQUEST,
  SCROLL_TO_RECEPTACLE
} from '../../../state/actions/preview';
import { Resource } from '../../../models/Resource';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { LookupTable } from '../../../models/LookupTable';

const translations = defineMessages({
  receptaclesPanel: {
    id: 'previewContentTypeReceptaclesTool.title',
    defaultMessage: '{name} Receptacles'
  },
  selectContentType: {
    id: 'previewContentTypeReceptaclesTool.selectContentType',
    defaultMessage: 'Select content type'
  }
});

const useStyles = makeStyles((theme) => createStyles({
  select: {
    width: '100%',
    padding: '15px',
    '& > div': {
      width: '100%'
    }
  }
}));

export default function ReceptaclesPanel() {
  const classes = useStyles({});
  const hostToGuest$ = getHostToGuestBus();
  const receptaclesBranch = useSelection(state => state.preview.receptacles);
  const contentTypesBranch = useSelection(state => state.contentTypes);
  const selectedContentTypeName = contentTypesBranch.byId[receptaclesBranch.selectedContentType]?.name;
  const contentTypes = contentTypesBranch.byId ? Object.values(contentTypesBranch.byId).filter((contentType) => contentType.type === 'component') : null;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  useMount(() => {
    return () => {
      dispatch(clearReceptacles());
      hostToGuest$.next({
        type: CLEAR_HIGHLIGHTED_RECEPTACLES
      });
    };
  });

  const onSelectedDropZone = (receptacle: ContentTypeReceptacle) => {
    hostToGuest$.next({
      type: SCROLL_TO_RECEPTACLE,
      payload: receptacle
    });
  };

  function handleSelectChange(contentTypeId: string) {
    hostToGuest$.next({
      type: CONTENT_TYPE_RECEPTACLES_REQUEST,
      payload: contentTypeId
    });
  }

  const receptacleResource = useLogicResource<ContentTypeReceptacle[], { selectedContentType: string, byId: LookupTable<ContentTypeReceptacle> }>(receptaclesBranch, {
    shouldResolve: (source) => Boolean(source.selectedContentType) && Boolean(source.byId),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => Object.values(source.byId).filter((receptacle) => receptacle.contentTypeId === receptaclesBranch.selectedContentType),
    errorSelector: (source) => null
  });

  return (
    <ToolPanel
      title={formatMessage(translations.receptaclesPanel, { name: selectedContentTypeName })}
    >
      <div className={classes.select}>
        <Select
          value={receptaclesBranch.selectedContentType || ''}
          displayEmpty
          onChange={(event: any) => handleSelectChange(event.target.value)}
        >
          <MenuItem value="" disabled>{formatMessage(translations.selectContentType)}</MenuItem>
          {
            contentTypes.map((contentType: ContentType, i: number) => {
              return <MenuItem value={contentType.id} key={i}>{contentType.name}</MenuItem>;
            })
          }
        </Select>
      </div>
      <List>
        <SuspenseWithEmptyState resource={receptacleResource}>
          <ReceptaclesList
            resource={receptacleResource}
            onSelectedDropZone={onSelectedDropZone}
          />
        </SuspenseWithEmptyState>
      </List>
    </ToolPanel>
  );
}

interface ReceptaclesListProps {
  resource: Resource<ContentTypeReceptacle[]>;
  onSelectedDropZone(receptacle: ContentTypeReceptacle): void;
}

function ReceptaclesList(props: ReceptaclesListProps) {
  const receptacles = props.resource.read();
  return (
    <>
      {
        receptacles?.map((receptacle: ContentTypeReceptacle) =>
          <ListItem key={receptacle.id} button onClick={() => props.onSelectedDropZone(receptacle)}>
            <ListItemAvatar>
              <Avatar>
                <MoveToInboxRounded />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={receptacle.label}
            />
          </ListItem>
        )
      }
    </>
  );
}
