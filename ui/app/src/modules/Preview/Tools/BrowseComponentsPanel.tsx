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

import React from 'react';
import ToolPanel from './ToolPanel';
import { defineMessages, FormattedMessage } from 'react-intl';
import { usePreviewState, useStateResourceSelection } from "../../../utils/hooks";
import ContentType from "../../../models/ContentType";
import { EntityState } from "../../../models/GlobalState";
import { nnou } from "../../../utils/object";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import LoadingState from "../../../components/SystemStatus/LoadingState";
import { ComponentsPanelUI } from "./ComponentsPanel";
import { createStyles, makeStyles } from "@material-ui/core";
import { palette } from "../../../styles/theme";

const translations = defineMessages({
  browse: {
    id: 'craftercms.ice.browse.title',
    defaultMessage: 'Browse components'
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

export default function BrowseComponentsPanel() {

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
    <ToolPanel title={translations.browse}>
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

function BrowsePanelUI(props) {

}
