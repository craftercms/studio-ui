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

import React, { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import ToolPanel from './ToolPanel';
import { useActiveSiteId } from "../../../utils/hooks";
import { SearchItem } from "../../../models/Search";
import { search } from "../../../services/search";
import { setRequestForgeryToken } from "../../../utils/auth";
import { Card, createStyles } from "@material-ui/core";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import MoreVertRounded from '@material-ui/icons/MoreVertRounded';
import makeStyles from "@material-ui/core/styles/makeStyles";
import cardTitleStyles from "../../../styles/card";
import { palette } from "../../../styles/theme";
import DragIndicatorRounded from '@material-ui/icons/DragIndicatorRounded';
import SearchBar from '../../../components/SearchBar';
import CardMedia from "@material-ui/core/CardMedia";
import clsx from "clsx";
import CardActionArea from "@material-ui/core/CardActionArea";
import { useSelector } from "react-redux";
import GlobalState from "../../../models/GlobalState";
import MediaCard from "../../../components/MediaCard";

const translations = defineMessages({
  assetsPanel: {
    id: 'craftercms.ice.assets.title',
    defaultMessage: 'Assets'
  }
});

const initialSearchParameters = {
  filters: {
    'mime-type': ['image/png', 'image/jpeg']
  }
};

const assetsPanelStyles = makeStyles(() => createStyles({
  assetsPanelWrapper: {
    padding: '15px'
  },
  search: {
    marginBottom: '20px'
  },
  card: {
    cursor: 'move',
    marginBottom: '10px',
  }
}));

export default function AssetsPanel() {
  const classes = assetsPanelStyles({});
  const activeSite = useActiveSiteId();
  const [assets, setAssets] = useState(null);
  const { GUEST_BASE } = useSelector<GlobalState, GlobalState['env']>(state => state.env);

  setRequestForgeryToken();

  useEffect(() => {
    search(activeSite, initialSearchParameters).subscribe(({ items }) => {
      setAssets(items);
    })
  }, [activeSite]);

  return (
    <ToolPanel title={translations.assetsPanel}>
      <div className={classes.assetsPanelWrapper}>
        <SearchBar
          onChange={() => {}}
          keyword={''}
          classes={{ root: classes.search }}
        />
        {
          assets?.map((item: SearchItem) =>
            <MediaCard
              key={item.path}
              item={item}
              previewAppBaseUri={GUEST_BASE}
              hasCheckbox={false}
              hasSubheader={false}
              avatar={DragIndicatorRounded}
              classes={{ root: classes.card }}
            />
          )
        }
      </div>
    </ToolPanel>
  );
}
