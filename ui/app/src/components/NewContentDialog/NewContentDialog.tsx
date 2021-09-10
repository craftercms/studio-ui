/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { LegacyContentType, LegacyFormConfig } from '../../models/ContentType';
import DialogHeader from '../Dialogs/DialogHeader';
import NewContentCard, { ContentSkeletonCard } from './NewContentCard';
import SearchBar from '../Controls/SearchBar';
import ContentTypesFilter from '../../modules/Content/Authoring/ContentTypesFilter';
import DialogFooter from '../Dialogs/DialogFooter';
import { Box, Checkbox, FormControlLabel, Grid } from '@material-ui/core';
import DialogBody from '../Dialogs/DialogBody';
import SingleItemSelector from '../../modules/Content/Authoring/SingleItemSelector';
import { fetchLegacyContentTypes } from '../../services/contentTypes';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { debounceTime } from 'rxjs/operators';
import { closeNewContentDialog, newContentCreationComplete } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useSubject } from '../../utils/hooks/useSubject';
import { withoutIndex } from '../../utils/path';
import Dialog from '../Dialog';
import useStyles from './styles';
import translations from './translations';
import { ContentTypesGridProps, NewContentDialogContainerProps, NewContentDialogProps } from './utils';

export default function NewContentDialog(props: NewContentDialogProps) {
  const { open, onClose, ...rest } = props;
  return (
    <Dialog open={open} onClose={onClose}>
      <NewContentDialogContainer {...rest} />
    </Dialog>
  );
}

function NewContentDialogContainer(props: NewContentDialogContainerProps) {
  const { onClose, item, onContentTypeSelected, compact = false, rootPath } = props;
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const classes = useStyles();
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);

  const [isCompact, setIsCompact] = useState(compact);
  const [openSelector, setOpenSelector] = useState(false);
  const [selectedItem, setSelectedItem] = useState(item);
  const [contentTypes, setContentTypes] = useState<LegacyContentType[]>();
  const [keyword, setKeyword] = useState('');
  const [debounceKeyword, setDebounceKeyword] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    {
      label: formatMessage(translations.contentTypeAllLabel),
      type: 'all'
    },
    {
      label: formatMessage(translations.contentTypePageLabel),
      type: 'page'
    },
    {
      label: formatMessage(translations.contentTypeComponentLabel),
      type: 'component'
    }
  ];

  const getPrevImg = (content: LegacyFormConfig) => {
    return content?.imageThumbnail
      ? `/studio/api/1/services/api/1/content/get-content-at-path.bin?site=${site}&path=/config/studio/content-types${content.form}/${content.imageThumbnail}`
      : '/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg';
  };

  const onSelectedContentType = (contentType: LegacyFormConfig) => {
    const path = withoutIndex(selectedItem.path);
    onContentTypeSelected?.({
      authoringBase,
      path,
      isNewContent: true,
      contentTypeId: contentType.form,
      onSaveSuccess: batchActions([closeNewContentDialog(), newContentCreationComplete()])
    });
  };

  useEffect(() => {
    if (selectedItem.path) {
      // TODO: https://github.com/craftercms/craftercms/issues/4473
      const path =
        selectedItem.systemType === 'folder' && !selectedItem.path.endsWith('/')
          ? `${selectedItem.path}/`
          : selectedItem.path;

      fetchLegacyContentTypes(site, path).subscribe(
        (response) => {
          setContentTypes(response);
        },
        (response) => {
          dispatch(showErrorDialog({ error: response }));
        }
      );
    }
  }, [dispatch, selectedItem, site]);

  const resource = useLogicResource(
    useMemo(() => ({ contentTypes, selectedFilter, debounceKeyword }), [contentTypes, selectedFilter, debounceKeyword]),
    {
      shouldResolve: ({ contentTypes }) => Boolean(contentTypes),
      shouldReject: () => null,
      shouldRenew: (source, resource) => resource.complete,
      resultSelector: ({ contentTypes, debounceKeyword, selectedFilter }) => {
        return contentTypes.filter(
          (contentType) =>
            contentType.label.toLowerCase().includes(debounceKeyword.toLowerCase()) &&
            (selectedFilter === 'all' || contentType.type === selectedFilter)
        );
      },
      errorSelector: () => null
    }
  );

  const onSearch$ = useSubject<string>();

  useEffect(() => {
    onSearch$.pipe(debounceTime(400)).subscribe((keywords) => {
      setDebounceKeyword(keywords);
    });
  });

  const onSearch = (keyword: string) => {
    onSearch$.next(keyword);
    setKeyword(keyword);
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  return (
    <>
      <DialogHeader
        title={formatMessage(translations.title)}
        subtitle={formatMessage(translations.subtitle)}
        onCloseButtonClick={onCloseButtonClick}
      />
      <DialogBody classes={{ root: classes.dialogContent }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <SingleItemSelector
              label={<FormattedMessage id="words.item" defaultMessage="Item" />}
              open={openSelector}
              onClose={() => setOpenSelector(false)}
              onDropdownClick={() => setOpenSelector(!openSelector)}
              rootPath={rootPath}
              selectedItem={selectedItem}
              canSelectFolders
              onItemClicked={(item) => {
                setOpenSelector(false);
                setSelectedItem(item);
              }}
            />
          </Box>
          <Box className={classes.searchBox}>
            <SearchBar onChange={onSearch} keyword={keyword} autoFocus showActionButton={Boolean(keyword)} />
          </Box>
        </Box>
        <SuspenseWithEmptyState
          resource={resource}
          suspenseProps={{
            fallback: <ContentTypesLoader isCompact={isCompact} />
          }}
          withEmptyStateProps={{
            emptyStateProps: {
              classes: {
                image: classes.emptyStateImg
              },
              title: (
                <FormattedMessage id="newContentDialog.emptyStateMessage" defaultMessage="No Content Types Found" />
              )
            }
          }}
        >
          <ContentTypesGrid
            resource={resource}
            isCompact={isCompact}
            onTypeOpen={onSelectedContentType}
            getPrevImg={getPrevImg}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter>
        <FormControlLabel
          className={classes.compact}
          control={<Checkbox checked={isCompact} onChange={() => setIsCompact(!isCompact)} color="primary" />}
          label={formatMessage(translations.compactInput)}
        />
        <ContentTypesFilter filters={filters} selected={selectedFilter} onFilterChange={setSelectedFilter} />
      </DialogFooter>
    </>
  );
}

export function ContentTypesLoader(props: { numOfItems?: number; isCompact: boolean }) {
  const { numOfItems = 6, isCompact } = props;
  const items = new Array(numOfItems).fill(null);
  return (
    <Grid container spacing={3} style={{ marginTop: '14px' }}>
      {items.map((value, i) => (
        <Grid item key={i} xs={12} sm={!isCompact ? 4 : 6}>
          <ContentSkeletonCard isCompact={isCompact} />
        </Grid>
      ))}
    </Grid>
  );
}

export function ContentTypesGrid(props: ContentTypesGridProps) {
  const { resource, isCompact, onTypeOpen, getPrevImg, selectedContentType } = props;
  const classes = useStyles();
  const filterContentTypes = resource.read();
  return (
    <Grid container spacing={3} className={classes.cardsContainer}>
      {filterContentTypes.map((content) => (
        <Grid item key={content.label} xs={12} sm={!isCompact ? 4 : 6}>
          <NewContentCard
            isCompact={isCompact}
            headerTitle={content.label}
            subheader={content.form}
            img={getPrevImg(content)}
            onClick={() => onTypeOpen(content)}
            isSelected={content.name === selectedContentType}
          />
        </Grid>
      ))}
    </Grid>
  );
}
