/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect, useMemo, useState } from 'react';
import ToolPanel from './ToolPanel';
import { defineMessages, FormattedMessage } from 'react-intl';
import LoadingState from '../../../components/SystemStatus/LoadingState';
import Avatar from '@material-ui/core/Avatar';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ContentType from '../../../models/ContentType';
import { getInitials } from '../../../utils/string';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import DeleteRounded from '@material-ui/icons/DeleteRounded';
import DragIndicatorRounded from '@material-ui/icons/DragIndicatorRounded';
import MoreVertRounded from '@material-ui/icons/MoreVertRounded';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { getHostToGuestBus } from '../previewContext';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import { palette } from '../../../styles/theme';
import { Typography } from '@material-ui/core';
import DeleteRoundedTilted from '../../../components/Icons/DeleteRoundedTilted';
import {
  TRASHED,
  COMPONENT_DRAG_ENDED,
  COMPONENT_DRAG_STARTED,
} from '../../../state/actions/preview';
import { useSelector } from 'react-redux';
import GlobalState from '../../../models/GlobalState';

const translations = defineMessages({
  componentsPanel: {
    id: 'craftercms.ice.components.title',
    defaultMessage: 'Components'
  }
});

const useStyles = makeStyles((theme) => createStyles({
  root: {},
  noWrapping: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'block'
  },
  component: {
    cursor: 'move'
  },

  avatarRootOver: {
    color: 'black',
    background: 'white'
  },

  rubbishBin: {
    height: 250,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: palette.orange.main,
    margin: theme.spacing(1),
    position: 'absolute',
    left: theme.spacing(1),
    right: theme.spacing(1),
    bottom: theme.spacing(1),
    color: palette.white
  },
  rubbishIcon: {
    width: '100%',
    height: '50%',
    color: palette.white
  },
  rubbishIconHover: {
    transform: ''
  }

}));

export default function ComponentsPanel() {

  const classes = useStyles({});
  const [menuContext, setMenuContext] = useState<{ anchor: Element, contentType: ContentType }>();
  const { contentTypes, guest } = useSelector<GlobalState, any>(state => state.preview);
  const hostToGuest$ = getHostToGuestBus();
  const componentTypes = useMemo(
    () => contentTypes?.filter((contentType) => contentType.type === 'component'),
    [contentTypes]
  );

  const onDragStart = (contentType) => hostToGuest$.next({
    type: COMPONENT_DRAG_STARTED,
    payload: contentType
  });

  const onDragEnd = () => hostToGuest$.next({
    type: COMPONENT_DRAG_ENDED
  });

  const onTrash = () => hostToGuest$.next({ type: TRASHED });

  return (
    <ToolPanel title={translations.componentsPanel}>

      {componentTypes ? (
        <List className={classes.root}>
          {
            componentTypes.map((contentType) =>
              <Component
                key={contentType.id}
                contentType={contentType}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onMenu={(anchor, contentType) => setMenuContext({ anchor, contentType })}
              />
            )
          }
        </List>
      ) : (
        <LoadingState title="Retrieving Page Model" graphicProps={{ width: 150 }}/>
      )}

      <Menu
        open={!!menuContext}
        anchorEl={menuContext?.anchor}
        onClose={onMenuClose}
      >
        <MenuItem onClick={onMenuOptionClicked}>List in-page instances</MenuItem>
        <MenuItem onClick={onMenuOptionClicked}>Browse "shared" instances</MenuItem>
        <MenuItem onClick={onMenuOptionClicked}>List welcoming receptacles</MenuItem>
      </Menu>

      <RubbishBin
        in={guest?.itemBeingDragged}
        onTrash={onTrash}
      />

    </ToolPanel>
  );

  function onMenuClose() {
    setMenuContext(null);
  }

  function onMenuOptionClicked() {
    setMenuContext(null);
  }

}

interface ComponentProps {
  contentType: ContentType;
  onDragStart?: (...args: any) => any;
  onDragEnd?: (...args: any) => any;
  onMenu: (anchor: Element, contentType: ContentType) => any;
}

function Component(props: ComponentProps) {
  const classes = useStyles({});
  const {
    onMenu,
    contentType,
    onDragStart = (e) => void null,
    onDragEnd = (e) => void null
  } = props;
  const [over, setOver] = useState(false);
  return (
    <>
      <ListItem
        key={contentType.id}
        className={classes.component}
        draggable
        onDragStart={() => onDragStart(contentType)}
        onDragEnd={() => onDragEnd(contentType)}
        onMouseEnter={() => setOver(true)}
        onMouseLeave={() => setOver(false)}
      >
        <ListItemAvatar>
          <Avatar classes={{ root: over ? classes.avatarRootOver : '' }}>
            {over ? <DragIndicatorRounded/> : getInitials(contentType.name)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={contentType.name}
          secondary={contentType.id}
          classes={{ primary: classes.noWrapping, secondary: classes.noWrapping }}
        />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="delete" onClick={(e) => onMenu(e.currentTarget, contentType)}>
            <MoreVertRounded/>
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    </>
  );
}

function RubbishBin(props: any) {
  const classes = useStyles({});
  const [over, setOver] = useState(false);
  const [trashed, setTrashed] = useState(false);
  useEffect(() => {
    if (props.in) {
      setOver(false);
      setTrashed(false);
    }
  }, [props.in]);
  return (
    <Grow in={props.in}>
      <Paper
        elevation={2}
        className={classes.rubbishBin}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setTrashed(true);
          props.onTrash?.();
        }}
      >
        {
          (over)
            ? <DeleteRoundedTilted className={classes.rubbishIcon}/>
            : <DeleteRounded className={classes.rubbishIcon}/>
        }
        <Typography variant="caption">
          {
            (trashed) ? (
              <FormattedMessage
                id="ice.rubbishBin.itemTrashed"
                defaultMessage="Trashed!"
              />
            ) : (
              <FormattedMessage
                id="ice.rubbishBin.dropToTrash"
                defaultMessage="Drop Here To Trash"
              />
            )
          }
        </Typography>
      </Paper>
    </Grow>
  );
}
