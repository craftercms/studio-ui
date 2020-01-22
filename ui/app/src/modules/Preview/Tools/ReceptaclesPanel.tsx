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
import { defineMessages } from 'react-intl';
import { getHostToGuestBus } from "../previewContext";
import { SHOW_RECEPTACLES_BY_CONTENT_TYPE } from "../../../state/actions/preview";
import { useSelection } from '../../../utils/hooks';
import { createStyles, makeStyles } from "@material-ui/core";
import { Receptacle } from '../../../models/Receptacle';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Avatar from "@material-ui/core/Avatar";
import MoveToInboxIcon from '@material-ui/icons/MoveToInbox';

const translations = defineMessages({
  receptaclesPanel: {
    id: 'craftercms.ice.receptacles.title',
    defaultMessage: 'Receptacles'
  }
});

const useStyles = makeStyles((theme) => createStyles({}));

export default function ReceptaclesPanel() {
  const classes = useStyles({});
  const hostToGuest$ = getHostToGuestBus();
  const receptaclesBranch = useSelection(state => state.preview.receptacles);
  const receptacles = receptaclesBranch.byId ? Object.values(receptaclesBranch.byId) : null;

  useEffect(() => {
    console.log('SHOW_RECEPTACLES_BY_CONTENT_TYPE');
    hostToGuest$.next({
      type: SHOW_RECEPTACLES_BY_CONTENT_TYPE,
      payload: receptaclesBranch.selectedContentType
    });
  }, [hostToGuest$, receptaclesBranch.selectedContentType]);

  const onSelectedDropZone = (receptacle: Receptacle) => {
    console.log(receptacle);
  };

  return (
    <ToolPanel title={translations.receptaclesPanel}>
      {/*<Select*/}
      {/*  value={receptaclesContentType}*/}
      {/*  displayEmpty*/}
      {/*  className={classes.Select}*/}
      {/*  onChange={(event: any) => handleSelectChange(event.target.value)}*/}
      {/*  disabled={isFetching}*/}
      {/*>*/}
      {/*  <MenuItem value="" disabled>{formatMessage(translations.selectContentType)}</MenuItem>*/}
      {/*  {*/}
      {/*    contentTypes.map((contentType: ContentType, i: number) => {*/}
      {/*      return <MenuItem value={contentType.id} key={i}>{contentType.name}</MenuItem>*/}
      {/*    })*/}
      {/*  }*/}
      {/*</Select>*/}
      <List>
        {
          receptacles && receptacles.map((receptacle: Receptacle) =>
            <ListItem key={receptacle.id} button onClick={() => onSelectedDropZone(receptacle)}>
              <ListItemAvatar>
                <Avatar>
                  <MoveToInboxIcon/>
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
