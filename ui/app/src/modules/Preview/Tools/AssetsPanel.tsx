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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ToolPanel from './ToolPanel';
import {
  useActiveSiteId,
  useDebouncedInput,
  useSelection,
  useSelectorResource
} from '../../../utils/hooks';
import { MediaItem } from '../../../models/Search';
import { createStyles, fade } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SearchBar from '../../../components/Controls/SearchBar';
import { useDispatch, useSelector } from 'react-redux';
import GlobalState, { PagedEntityState } from '../../../models/GlobalState';
import TablePagination from '@material-ui/core/TablePagination';
import { fromEvent, interval } from 'rxjs';
import { filter, mapTo, share, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DRAWER_WIDTH, getHostToGuestBus } from '../previewContext';
import {
  ASSET_DRAG_ENDED,
  ASSET_DRAG_STARTED,
  fetchAssetsPanelItems
} from '../../../state/actions/preview';
import MediaCard from '../../../components/MediaCard';
import DragIndicatorRounded from '@material-ui/icons/DragIndicatorRounded';
import EmptyState from '../../../components/SystemStatus/EmptyState';
import UploadIcon from '@material-ui/icons/Publish';
import { nnou, pluckProps } from '../../../utils/object';
import { uploadDataUrl } from '../../../services/content';
import Suspencified from '../../../components/SystemStatus/Suspencified';
import palette from '../../../styles/palette';
import { Resource } from '../../../models/Resource';

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
  previousPage: {
    id: 'pagination.previousPage',
    defaultMessage: 'Previous page'
  },
  nextPage: {
    id: 'pagination.nextPage',
    defaultMessage: 'Next page'
  },
  retrieveAssets: {
    id: 'craftercms.ice.assets.retrieveAssets',
    defaultMessage: 'Retrieving Site Assets'
  }
});

const assetsPanelStyles = makeStyles(() =>
  createStyles({
    assetsPanelWrapper: {
      padding: '15px 15px 55px 15px',
      '&.dragInProgress': {
        background: 'red'
      }
    },
    search: {
      padding: '15px 15px 0px 15px'
    },
    card: {
      cursor: 'move',
      marginBottom: '16px'
    },
    pagination: {
      marginLeft: 'auto',
      position: 'fixed',
      zIndex: 1,
      bottom: 0,
      background: 'white',
      color: 'black',
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
      position: 'fixed',
      background: fade(palette.black, 0.9),
      width: `calc(${DRAWER_WIDTH}px - 1px)`,
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
      margin: 'auto'
    },
    noScroll: {
      overflow: 'hidden'
    }
  })
);

interface AssetResource {
  count: number;
  limit: number;
  pageNumber: number;
  items: Array<MediaItem>;
}

export default function AssetsPanel() {
  const classes = assetsPanelStyles({});
  const initialKeyword = useSelection((state) => state.preview.assets.query.keywords);
  const toolsPanelWidth = useSelection<number>((state) => state.preview.toolsPanelWidth);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [dragInProgress, setDragInProgress] = useState(false);
  const hostToGuest$ = getHostToGuestBus();
  const dispatch = useDispatch();
  const resource = useSelectorResource<AssetResource, PagedEntityState<MediaItem>>(
    (state) => state.preview.assets,
    {
      shouldRenew: (source, resource) => resource.complete,
      shouldResolve: (source) => !source.isFetching && nnou(source.page[source.pageNumber]),
      shouldReject: (source) => nnou(source.error),
      errorSelector: (source) => source.error,
      resultSelector: (source) => {
        const items = source.page[source.pageNumber].map((id) => source.byId[id]);
        return {
          ...pluckProps(source, 'count', 'query.limit' as 'limit', 'pageNumber'),
          items
        } as AssetResource;
      }
    }
  );
  const { guestBase, xsrfArgument } = useSelector<GlobalState, GlobalState['env']>(
    (state) => state.env
  );
  const { formatMessage } = useIntl();
  const site = useActiveSiteId();
  const elementRef = useRef();

  const onDragStart = (mediaItem: MediaItem) =>
    hostToGuest$.next({
      type: ASSET_DRAG_STARTED,
      payload: mediaItem
    });

  const onDragEnd = () =>
    hostToGuest$.next({
      type: ASSET_DRAG_ENDED
    });

  const onDragDrop = useCallback(
    (e) => {
      const file = e.dataTransfer.files[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onloadend = function () {
        uploadDataUrl(
          site,
          {
            ...pluckProps(file, 'name', 'type'),
            dataUrl: reader.result
          },
          '/static-assets/images/',
          xsrfArgument
        ).subscribe(
          () => {
          },
          () => {
          },
          () => {
            dispatch(fetchAssetsPanelItems({}));
          }
        );
      };
      reader.readAsDataURL(file);
      setDragInProgress(false);
    },
    [xsrfArgument, dispatch, site]
  );

  useEffect(() => {
    const subscription = fromEvent(elementRef.current, 'dragenter')
      .pipe(filter((e: any) => e.dataTransfer?.types.includes('Files')))
      .subscribe((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragInProgress(true);
      });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (dragInProgress) {
      const dragover$ = fromEvent(elementRef.current, 'dragover').pipe(
        tap((e: any) => {
          e.preventDefault();
          e.stopPropagation();
        }),
        share()
      );
      const dragoverSubscription = dragover$.subscribe();
      const dragleaveSubscription = fromEvent(elementRef.current, 'dragleave')
        .pipe(
          switchMap(() => interval(100).pipe(takeUntil(dragover$))),
          mapTo(false)
        )
        .subscribe(setDragInProgress);
      const dropSubscription = fromEvent(elementRef.current, 'drop')
        .pipe(filter((e: any) => e.dataTransfer?.types.includes('Files')))
        .subscribe((e) => {
          e.preventDefault();
          e.stopPropagation();
          onDragDrop(e);
        });
      return () => {
        dragoverSubscription.unsubscribe();
        dragleaveSubscription.unsubscribe();
        dropSubscription.unsubscribe();
      };
    }
  }, [dragInProgress, onDragDrop]);

  const onSearch = useCallback(
    (keywords: string) => dispatch(fetchAssetsPanelItems({ keywords, offset: 0 })),
    [dispatch]
  );

  const onSearch$ = useDebouncedInput(onSearch, 400);

  function onPageChanged(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    newPage: number
  ) {
    dispatch(fetchAssetsPanelItems({ offset: newPage }));
  }

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  return (
    <ToolPanel
      title={translations.assetsPanel}
      classes={dragInProgress ? { body: classes.noScroll } : null}
    >
      <div ref={elementRef}>
        <div className={classes.search}>
          <SearchBar
            onActionButtonClick={() => handleSearchKeyword('')}
            onChange={handleSearchKeyword}
            keyword={keyword}
          />
        </div>
        <Suspencified loadingStateProps={{ title: formatMessage(translations.retrieveAssets) }}>
          {dragInProgress && (
            <div className={classes.uploadOverlay}>
              <UploadIcon style={{ pointerEvents: 'none' }} className={classes.uploadIcon} />
            </div>
          )}
          <AssetsPanelUI
            classes={classes}
            assetsResource={resource}
            width={toolsPanelWidth}
            onPageChanged={onPageChanged}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            guestBase={guestBase}
          />
        </Suspencified>
      </div>
    </ToolPanel>
  );
}

interface AssetsPanelUIProps {
  guestBase: string;
  width: number;
  classes?: Partial<Record<'assetsPanelWrapper' | 'pagination' | 'toolbar' | 'card' | 'noResultsImage' | 'noResultsTitle', string>>;
  assetsResource: Resource<AssetResource>;
  onPageChanged(e: React.MouseEvent<HTMLButtonElement>, page: number): void;
  onDragStart(mediaItem: MediaItem): void;
  onDragEnd(): void;
}

export function AssetsPanelUI(props:AssetsPanelUIProps) {
  const { classes, assetsResource, onPageChanged, onDragStart, onDragEnd, guestBase, width } = props;
  const assets = assetsResource.read();
  const { count, pageNumber, items, limit } = assets;
  const { formatMessage } = useIntl();

  return (
    <div className={classes.assetsPanelWrapper}>
      <TablePagination
        className={classes.pagination}
        style={{ width: width - 1 }}
        classes={{ root: classes.pagination, selectRoot: 'hidden', toolbar: classes.toolbar }}
        component="div"
        labelRowsPerPage=""
        count={count}
        rowsPerPage={limit}
        page={pageNumber}
        backIconButtonProps={{
          'aria-label': formatMessage(translations.previousPage)
        }}
        nextIconButtonProps={{
          'aria-label': formatMessage(translations.nextPage)
        }}
        onChangePage={(e: React.MouseEvent<HTMLButtonElement>, page: number) =>
          onPageChanged(e, page * limit)
        }
      />
      {items.map((item: MediaItem) => {
        return (
          <MediaCard
            key={item.path}
            item={item}
            previewAppBaseUri={guestBase}
            hasSubheader={false}
            avatar={DragIndicatorRounded}
            classes={{ root: classes.card }}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        );
      })}
      {count === 0 && (
        <EmptyState
          title={formatMessage(translations.noResults)}
          classes={{ image: classes.noResultsImage, title: classes.noResultsTitle }}
        />
      )}
    </div>
  );
}
