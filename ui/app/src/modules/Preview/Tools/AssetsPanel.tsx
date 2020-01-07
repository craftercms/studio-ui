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
import { useActiveSiteId, useSelection, useStateResourceSelection } from "../../../utils/hooks";
import { MediaItem } from "../../../models/Search";
import { createStyles, fade } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import SearchBar from '../../../components/SearchBar';
import { useDispatch, useSelector } from "react-redux";
import GlobalState, { PagedEntityState } from "../../../models/GlobalState";
import TablePagination from "@material-ui/core/TablePagination";
import { Subject } from "rxjs";
import LoadingState from "../../../components/SystemStatus/LoadingState";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { DRAWER_WIDTH, getHostToGuestBus } from "../previewContext";
import { ASSET_DRAG_ENDED, ASSET_DRAG_STARTED, fetchAssetsPanelItems } from "../../../state/actions/preview";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import MediaCard from '../../../components/MediaCard';
import DragIndicatorRounded from '@material-ui/icons/DragIndicatorRounded';
import EmptyState from "../../../components/SystemStatus/EmptyState";
import UploadIcon from '@material-ui/icons/Publish';
import { nnou } from "../../../utils/object";
import Core from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import { palette } from "../../../styles/theme";
import { getRequestForgeryToken } from "../../../utils/auth";
import { dataURItoBlob } from '../../../utils/path';

const translations = defineMessages({
  assetsPanel: {
    id: 'craftercms.ice.assets.title',
    defaultMessage: 'Assets'
  },
  itemsPerPage: {
    id: 'craftercms.ice.assets.itemsPerPage',
    defaultMessage: 'Items per page:'
  },
  noResults: {
    id: 'craftercms.ice.assets.noResults',
    defaultMessage: ' No results found.'
  },
  retrieveAssets: {
    id: 'craftercms.ice.assets.retrieveAssets',
    defaultMessage: 'Retrieving Site Assets'
  },
  previousPage: {
    id: 'craftercms.ice.assets.previousPage',
    defaultMessage: 'previous page'
  },
  nextPage: {
    id: 'craftercms.ice.assets.nextPage',
    defaultMessage: 'next page'
  },
  loading: {
    id: 'craftercms.ice.assets.loading',
    defaultMessage: 'Loading'
  }
});

const assetsPanelStyles = makeStyles(() => createStyles({
  assetsPanelWrapper: {
    padding: '15px 15px 55px 15px',
    '&.dragInProgress': {
      background: 'red'
    }
  },
  search: {
    padding: '15px 15px 0px 15px',
  },
  card: {
    cursor: 'move',
    marginBottom: '16px',
  },
  pagination: {
    marginLeft: 'auto',
    position: 'fixed',
    zIndex: 1,
    bottom: 0,
    background: 'white',
    color: 'black',
    width: `calc(${DRAWER_WIDTH}px - 1px)`,
    left: 0,
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
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
  toolbar: {
    padding: 0,
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: '20px',
    '& .MuiTablePagination-spacer': {
      display: 'none'
    },
    '& .MuiTablePagination-spacer + p': {
      display: 'none'
    }
  },
  noResultsImage: {
    width: '150px'
  },
  noResultsTitle: {
    fontSize: 'inherit',
    marginTop: '10px'
  },
  uploadOverlay: {
    position: 'absolute',
    background: fade(palette.black, 0.9),
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    zIndex: 2
  },
  uploadIcon: {
    fontSize: '8em',
    color: palette.gray.light5,
    margin: 'auto',
  }
}));

interface AssetResource {
  total: number;
  limit: number;
  pageNumber: number;
  items: Array<MediaItem>;
}

export default function AssetsPanel() {
  const classes = assetsPanelStyles({});
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const initialKeyword = useSelection(state => state.preview.assets.query.keywords);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [dragInProgress, setDragInProgress] = useState(false);
  const hostToGuest$ = getHostToGuestBus();
  const dispatch = useDispatch();
  const resource = useStateResourceSelection<AssetResource, PagedEntityState<MediaItem>>(state => state.preview.assets, {
    shouldRenew: (source, resource) => resource.complete,
    shouldResolve: source => (!source.isFetching) && nnou(source.byId),
    shouldReject: source => nnou(source.error),
    errorSelector: source => source.error,
    resultSelector: source => {
      const items = source.page[source.pageNumber].map((id) => source.byId[id]);
      return {
        total: source.count,
        limit: source.query.limit,
        pageNumber: source.pageNumber,
        items
      }
    }
  });
  const { GUEST_BASE } = useSelector<GlobalState, GlobalState['env']>(state => state.env);
  const { formatMessage } = useIntl();
  const site = useActiveSiteId();

  const onDragStart = (mediaItem: MediaItem) => hostToGuest$.next({
    type: ASSET_DRAG_STARTED,
    payload: mediaItem
  });

  const onDragEnd = () => hostToGuest$.next({
    type: ASSET_DRAG_ENDED
  });

  const onDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    const uppy = Core({ autoProceed: true });
    const uploadAssetUrl = `/studio/asset-upload?_csrf=${getRequestForgeryToken()}`;
    uppy.use(XHRUpload, { endpoint: uploadAssetUrl });

    uppy.on('complete', (result) => {
      if (result.successful.length) {
        console.log('Upload Success');
      } else {
        console.log('Failed');
      }
    });

    reader.onloadend = function () {
      const blob = dataURItoBlob(reader.result);
      uppy.setMeta({ site, path: `/static-assets/images/` });
      uppy.addFile({
        name: file.name,
        type: file.type,
        data: blob,
      });
    };
    reader.readAsDataURL(file);
    setDragInProgress(false);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  //listener for dragenter
  document.addEventListener("dragenter", function (event) {
    //it is a file from desktop??
    if (event.dataTransfer.types.includes('Files')) {
      setDragInProgress(true);
    }
  }, false);

  document.addEventListener("dragleave", function (event) {
    //needs to know if it left the page
    //setDragInProgress(false);
  }, false);

  useEffect(() => {
    const subscription = onSearch$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((keywords: string) => {
      dispatch(fetchAssetsPanelItems({ keywords }));
    });
    return () => subscription.unsubscribe();
  }, [dispatch, onSearch$]);

  function onPageChanged(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) {
    dispatch(fetchAssetsPanelItems({ offset: newPage }));
  }

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  return (
    <ToolPanel title={translations.assetsPanel}>
      <ErrorBoundary>
        <div className={classes.search}>
          <SearchBar
            onChange={handleSearchKeyword}
            keyword={keyword}
          />
        </div>
        <React.Suspense
          fallback={
            <LoadingState
              title={formatMessage(translations.loading)}
              graphicProps={{ width: 150 }}
            />
          }
        >
          {
            dragInProgress &&
            <div className={classes.uploadOverlay} onDrop={onDragDrop} onDragOver={onDragOver}>
              <UploadIcon className={classes.uploadIcon}/>
            </div>
          }
          <AssetsPanelUI
            classes={classes}
            assetsResource={resource}
            onPageChanged={onPageChanged}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            GUEST_BASE={GUEST_BASE}
            onDragDrop={onDragDrop}
            dragInProgress={dragInProgress}
          />
        </React.Suspense>
      </ErrorBoundary>
    </ToolPanel>
  );
}


export function AssetsPanelUI(props) {
  const {
    classes,
    assetsResource,
    onPageChanged,
    onDragStart,
    onDragEnd,
    GUEST_BASE
  } = props;
  const assets: AssetResource = assetsResource.read();
  const { total, pageNumber, items, limit } = assets;
  const { formatMessage } = useIntl();

  return (
    <div className={classes.assetsPanelWrapper}>
      <TablePagination
        className={classes.pagination}
        classes={{ root: classes.pagination, selectRoot: 'hidden', toolbar: classes.toolbar }}
        component="div"
        labelRowsPerPage=""
        count={total}
        rowsPerPage={limit}
        page={pageNumber}
        backIconButtonProps={{
          'aria-label': formatMessage(translations.previousPage),
        }}
        nextIconButtonProps={{
          'aria-label': formatMessage(translations.nextPage),
        }}
        onChangePage={(e: React.MouseEvent<HTMLButtonElement>, page: number) => onPageChanged(e, page * limit)}
      />
      {
        items.map((item: MediaItem) => {
            return (
              <MediaCard
                key={item.path}
                item={item}
                previewAppBaseUri={GUEST_BASE}
                hasSubheader={false}
                avatar={DragIndicatorRounded}
                classes={{ root: classes.card }}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            )
          }
        )
      }
      {
        total === 0 &&
        <EmptyState
          title={formatMessage(translations.noResults)}
          classes={{ image: classes.noResultsImage, title: classes.noResultsTitle }}
        />
      }
    </div>
  )
}
