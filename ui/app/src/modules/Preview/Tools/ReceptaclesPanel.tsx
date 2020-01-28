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

import React, { useEffect } from 'react';
import ToolPanel from './ToolPanel';
import { defineMessages, useIntl } from 'react-intl';
import { getHostToGuestBus } from '../previewContext';
import { listWelcomingReceptacles, REVEAL_CONTENT_TYPE_RECEPTACLES } from '../../../state/actions/preview';
import { useSelection } from '../../../utils/hooks';
import { createStyles, makeStyles } from '@material-ui/core';
import { Receptacle } from '../../../models/Receptacle';
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

const translations = defineMessages({
  receptaclesPanel: {
    id: 'craftercms.ice.contentTypeReceptacles.title',
    defaultMessage: 'Receptacles'
  },
  selectContentType: {
    id: 'craftercms.ice.contentTypeReceptacles.selectContentType',
    defaultMessage: 'Select content type'
  },
});

const useStyles = makeStyles((theme) => createStyles({
  select: {
    width: '100%',
    marginTop: '15px'
  },
}));

export default function ReceptaclesPanel() {
  const classes = useStyles({});
  const hostToGuest$ = getHostToGuestBus();
  const receptaclesBranch = useSelection(state => state.preview.receptacles);
  const receptacles = receptaclesBranch.byId ? Object.values(receptaclesBranch.byId).filter((receptacle) => receptacle.contentType === receptaclesBranch.selectedContentType) : null;
  const contentTypesBranch = useSelection(state => state.contentTypes);
  const contentTypes = contentTypesBranch.byId ? Object.values(contentTypesBranch.byId).filter((contentType) => contentType.type === 'component') : null;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('REVEAL_CONTENT_TYPE_RECEPTACLES');
    revealContentTypeReceptacles(receptaclesBranch.selectedContentType);
  }, [receptaclesBranch.selectedContentType]);

  const onSelectedDropZone = (receptacle: Receptacle) => {
    console.log(receptacle);
  };

  function handleSelectChange(value: string) {
    revealContentTypeReceptacles(value);
  }

  const revealContentTypeReceptacles = (contentType: string) => {
    dispatch(listWelcomingReceptacles(contentType));
    hostToGuest$.next({
      type: REVEAL_CONTENT_TYPE_RECEPTACLES,
      payload: contentType
    });
  };

  return (
    <ToolPanel title={translations.receptaclesPanel}>
      <Select
        value={receptaclesBranch.selectedContentType}
        displayEmpty
        className={classes.select}
        onChange={(event: any) => handleSelectChange(event.target.value)}
      >
        <MenuItem value="" disabled>{formatMessage(translations.selectContentType)}</MenuItem>
        {
          contentTypes.map((contentType: ContentType, i: number) => {
            return <MenuItem value={contentType.id} key={i}>{contentType.name}</MenuItem>
          })
        }
      </Select>
      <List>
        {
          receptacles?.map((receptacle: Receptacle) =>
            <ListItem key={receptacle.id} button onClick={() => onSelectedDropZone(receptacle)}>
              <ListItemAvatar>
                <Avatar>
                  <MoveToInboxRounded/>
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={receptacle.label}
              />
            </ListItem>
          )
        }
      </List>
    </ToolPanel>
  );
}
