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
import { defineMessages, useIntl } from 'react-intl';
import ToolPanel from './ToolPanel';
import { useActiveSiteId } from "../../../utils/hooks";
import { SearchItem, SearchResult } from "../../../models/Search";
import { search } from "../../../services/search";
import { setRequestForgeryToken } from "../../../utils/auth";
import { createStyles } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import DragIndicatorRounded from '@material-ui/icons/DragIndicatorRounded';
import SearchBar from '../../../components/SearchBar';
import { useSelector } from "react-redux";
import GlobalState from "../../../models/GlobalState";
import MediaCard from "../../../components/MediaCard";
import TablePagination from "@material-ui/core/TablePagination";
import { Subject } from "rxjs";
import LoadingState from "../../../components/SystemStatus/LoadingState";
import Typography from "@material-ui/core/Typography";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

const translations = defineMessages({
  assetsPanel: {
    id: 'craftercms.ice.assets.title',
    defaultMessage: 'Assets'
  },
  itemsPerPage: {
    id: 'search.itemsPerPage',
    defaultMessage: 'Items per page:'
  },
  noResults: {
    id: 'search.noResults',
    defaultMessage: ' No results found.'
  },
  retrieveAssets: {
    id: 'search.retrieveAssets',
    defaultMessage: 'Retrieving Site Assets'
  }
});

const initialSearchParameters = {
  keywords: '',
  offset: 0,
  limit: 10,
  filters: {
    'mime-type': ['image/png', 'image/jpeg', 'image/gif', 'video/mp4']
  }
};

const assetsPanelStyles = makeStyles(() => createStyles({
  assetsPanelWrapper: {
    padding: '15px'
  },
  search: {},
  card: {
    cursor: 'move',
    marginBottom: '16px',
  },
  pagination: {
    marginLeft: 'auto',
    '& p': {
      padding: 0
    },
    '& svg': {
      top: 'inherit'
    },
    '& .hidden': {
      display: 'none'
    }
  },
  noResults: {
    margin: '10px 0'
  }
}));

export default function AssetsPanel() {
  const classes = assetsPanelStyles({});
  const activeSite = useActiveSiteId();
  const [assets, setAssets] = useState<SearchResult>(null);
  const { GUEST_BASE } = useSelector<GlobalState, GlobalState['env']>(state => state.env);
  const [searchParameters, setSearchParameters] = useState(initialSearchParameters);
  const { formatMessage } = useIntl();
  const onSearch$ = useMemo(() => new Subject<string>(), []);

  setRequestForgeryToken();

  useEffect(() => {
    search(activeSite, searchParameters).subscribe((response) => {
      setAssets(response);
    })
  }, [activeSite, searchParameters]);

  useEffect(() => {
    const subscription = onSearch$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((keywords: string) => {
      setSearchParameters({ ...searchParameters, keywords})
    });
    return () => subscription.unsubscribe();
  }, [onSearch$]);

  function handleChangePage(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) {
    setSearchParameters({ ...searchParameters, offset: newPage * searchParameters.limit })
  }

  function handleSearchKeyword(keyword: string) {
    onSearch$.next(keyword);
  }


  return (
    <ToolPanel title={translations.assetsPanel}>
      <div className={classes.assetsPanelWrapper}>
        {
          assets ? (
            <>
              <SearchBar
                onChange={handleSearchKeyword}
                classes={{ root: classes.search }}
              />
              {
                assets.total ? (
                  <>
                    <TablePagination
                      className={classes.pagination}
                      classes={{ root: classes.pagination, selectRoot: 'hidden' }}
                      component="div"
                      labelRowsPerPage=""
                      count={assets.total}
                      rowsPerPage={searchParameters.limit}
                      page={searchParameters.offset / searchParameters.limit}
                      backIconButtonProps={{
                        'aria-label': 'previous page',
                      }}
                      nextIconButtonProps={{
                        'aria-label': 'next page',
                      }}
                      onChangePage={handleChangePage}
                    />
                    {
                      assets.items.map((item: SearchItem) =>
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
                  </>
                ) : (
                  <Typography variant="body2" color="textSecondary" className={classes.noResults}>
                    {
                      formatMessage(translations.noResults)
                    }
                  </Typography>
                )
              }
            </>
          ) : (
            <LoadingState title={formatMessage(translations.retrieveAssets)} graphicProps={{ width: 150 }}/>
          )
        }
      </div>
    </ToolPanel>
  );
}
