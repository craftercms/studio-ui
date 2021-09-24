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

import { ChangeContentTypeDialogContainerProps } from './utils';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useDispatch } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import { LegacyContentType, LegacyFormConfig } from '../../models/ContentType';
import { fetchLegacyContentTypes } from '../../services/contentTypes';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useSubject } from '../../utils/hooks/useSubject';
import { debounceTime } from 'rxjs/operators';
import DialogBody from '../Dialogs/DialogBody';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import SingleItemSelector from '../SingleItemSelector';
import { FormattedMessage } from 'react-intl';
import SearchBar from '../Controls/SearchBar';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { ContentTypesGrid, ContentTypesLoader } from '../NewContentDialog';
import DialogFooter from '../Dialogs/DialogFooter';
import { Theme } from '@mui/material/styles';

import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    compact: {
      marginRight: 'auto',
      paddingLeft: '20px'
    },
    dialogContent: {
      minHeight: 455
    },
    searchBox: {
      minWidth: '33%'
    },
    emptyStateImg: {
      width: 250,
      marginBottom: 17
    }
  })
);

export function ChangeContentTypeDialogContainer(props: ChangeContentTypeDialogContainerProps) {
  const { item, onContentTypeSelected, compact = false, rootPath, selectedContentType } = props;
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const classes = useStyles({});

  const [isCompact, setIsCompact] = useState(compact);
  const [openSelector, setOpenSelector] = useState(false);
  const [selectedItem, setSelectedItem] = useState(item);
  const [contentTypes, setContentTypes] = useState<LegacyContentType[]>();
  const [keyword, setKeyword] = useState('');
  const [debounceKeyword, setDebounceKeyword] = useState('');

  const getPrevImg = (content: LegacyFormConfig) =>
    content?.imageThumbnail
      ? `/studio/api/1/services/api/1/content/get-content-at-path.bin?site=${site}&path=/config/studio/content-types${content.form}/${content.imageThumbnail}`
      : '/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg';

  const onSelectedContentType = (contentType: LegacyFormConfig) => {
    onContentTypeSelected?.({
      newContentTypeId: contentType.form
    });
  };

  useEffect(() => {
    if (selectedItem.path) {
      fetchLegacyContentTypes(site, selectedItem.path).subscribe(
        (response) => {
          setContentTypes(response.filter((contentType) => contentType.type === selectedItem.systemType));
        },
        (response) => {
          dispatch(showErrorDialog({ error: response }));
        }
      );
    }
  }, [dispatch, selectedItem, site]);

  const resource = useLogicResource(
    useMemo(() => ({ contentTypes, debounceKeyword }), [contentTypes, debounceKeyword]),
    {
      shouldResolve: ({ contentTypes }) => Boolean(contentTypes),
      shouldReject: () => null,
      shouldRenew: (source, resource) => resource.complete,
      resultSelector: ({ contentTypes, debounceKeyword }) => {
        return contentTypes.filter((contentType) =>
          contentType.label.toLowerCase().includes(debounceKeyword.toLowerCase())
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

  return (
    <>
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
            fallback: <ContentTypesLoader numOfItems={6} isCompact={isCompact} />
          }}
          withEmptyStateProps={{
            emptyStateProps: {
              classes: {
                image: classes.emptyStateImg
              },
              title: (
                <FormattedMessage
                  id="changeContentTypeDialog.emptyStateMessage"
                  defaultMessage="No Content Types Found"
                />
              )
            }
          }}
        >
          <ContentTypesGrid
            resource={resource}
            isCompact={isCompact}
            onTypeOpen={onSelectedContentType}
            getPrevImg={getPrevImg}
            selectedContentType={selectedContentType}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter>
        <FormControlLabel
          className={classes.compact}
          control={<Checkbox checked={isCompact} onChange={() => setIsCompact(!isCompact)} color="primary" />}
          label={<FormattedMessage id="words.compact" defaultMessage="Compact" />}
        />
      </DialogFooter>
    </>
  );
}

export default ChangeContentTypeDialogContainer;
