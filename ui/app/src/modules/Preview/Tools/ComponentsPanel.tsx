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
import List from '@material-ui/core/List';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ContentType from '../../../models/ContentType';
import DeleteRounded from '@material-ui/icons/DeleteRounded';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { getHostToGuestBus } from '../previewContext';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import { palette } from '../../../styles/theme';
import { Typography } from '@material-ui/core';
import DeleteRoundedTilted from '../../../components/Icons/DeleteRoundedTilted';
import { COMPONENT_DRAG_ENDED, COMPONENT_DRAG_STARTED, TRASHED } from '../../../state/actions/preview';
import { usePreviewState, useStateResourceSelection } from '../../../utils/hooks';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { EntityState } from '../../../models/GlobalState';
import { nnou } from '../../../utils/object';
import { Component } from './Component';

const translations = defineMessages({
  componentsPanel: {
    id: 'craftercms.ice.components.title',
    defaultMessage: 'Components'
  }
});

const useStyles = makeStyles((theme) => createStyles({
  root: {},
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
  const { guest } = usePreviewState();
  const resource = useStateResourceSelection<ContentType[], EntityState<ContentType>>(
    state => state.contentTypes,
    {
      shouldRenew: (source, resource) => resource.complete,
      shouldResolve: source => (!source.isFetching) && nnou(source.byId),
      shouldReject: source => nnou(source.error),
      errorSelector: source => source.error,
      resultSelector: source => Object.values(source.byId)
    }
  );

  return (
    <ToolPanel title={translations.componentsPanel}>
      <ErrorBoundary>
        <React.Suspense
          fallback={
            <LoadingState
              // @ts-ignore
              title={
                <FormattedMessage
                  id="componentsPanel.suspenseStateMessage"
                  defaultMessage="Retrieving Page Model"
                />
              }
              graphicProps={{ width: 150 }}
            />
          }
        >
          <ComponentsPanelUI
            classes={classes}
            componentTypesResource={resource}
            itemBeingDragged={guest?.itemBeingDragged}
          />
        </React.Suspense>
      </ErrorBoundary>
    </ToolPanel>
  );

}

export function ComponentsPanelUI(props) {

  const { itemBeingDragged, classes, componentTypesResource } = props;

  const contentTypes = componentTypesResource.read();

  const hostToGuest$ = getHostToGuestBus();
  const [menuContext, setMenuContext] = useState<{ anchor: Element, contentType: any }>();
  const componentTypes = useMemo(
    () => contentTypes.filter((contentType) => contentType.type === 'component'),
    [contentTypes]
  );

  const onDragStart = (contentType) => hostToGuest$.next({ type: COMPONENT_DRAG_STARTED, payload: contentType });

  const onDragEnd = () => hostToGuest$.next({ type: COMPONENT_DRAG_ENDED });

  const onTrash = () => hostToGuest$.next({ type: TRASHED });

  const onMenuClose = () => setMenuContext(null);

  const onMenuOptionClicked = () => setMenuContext(null);

  return (
    <>
      <List className={classes.root}>
        {
          componentTypes.map((contentType) =>
            <Component
              key={contentType.id}
              primaryText={contentType.name}
              secondaryText={contentType.id}
              item={contentType}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onMenu={(anchor, contentType) => setMenuContext({ anchor, contentType })}
            />
          )
        }
      </List>

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
        in={itemBeingDragged}
        onTrash={onTrash}
      />

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
