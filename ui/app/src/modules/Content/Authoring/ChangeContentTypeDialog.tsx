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

import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { LegacyContentType, LegacyFormConfig } from '../../../models/ContentType';
import StandardAction from '../../../models/StandardAction';
import { DetailedItem } from '../../../models/Item';
import palette from '../../../styles/palette';
import { useActiveSiteId, useLogicResource, useSubject } from '../../../utils/hooks';
import DialogHeader from '../../../components/Dialogs/DialogHeader';
import DialogFooter from '../../../components/Dialogs/DialogFooter';
import { Box, Checkbox, FormControlLabel } from '@material-ui/core';
import DialogBody from '../../../components/Dialogs/DialogBody';
import SingleItemSelector from './SingleItemSelector';
import SearchBar from '../../../components/Controls/SearchBar';
import { fetchLegacyContentTypes } from '../../../services/contentTypes';
import { showErrorDialog } from '../../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { debounceTime } from 'rxjs/operators';
import ContentTypesFilter from './ContentTypesFilter';
import { ContentTypesGrid } from './NewContentDialog';

const translations = defineMessages({
  title: {
    id: 'newContentDialog.title',
    defaultMessage: 'Create Content'
  },
  chooseContentType: {
    id: 'newContentDialog.chooseContentType',
    defaultMessage: 'Choose Content Type'
  },
  chooseContentTypeSubtitle: {
    id: 'newContentDialog.chooseContentTypeSubtitle',
    defaultMessage: 'The following starter templates are available for use within this section.'
  },
  subtitle: {
    id: 'newContentDialog.subtitle',
    defaultMessage: 'Choose a content type template for your new content item.'
  },
  compactInput: {
    id: 'words.compact',
    defaultMessage: 'Compact'
  },
  contentTypeAllLabel: {
    id: 'newContentDialog.contentTypeAllLabel',
    defaultMessage: 'Show all types'
  },
  contentTypePageLabel: {
    id: 'newContentDialog.contentTypePageLabel',
    defaultMessage: 'Pages only'
  },
  contentTypeComponentLabel: {
    id: 'newContentDialog.contentTypeComponentLabel',
    defaultMessage: 'Components only'
  },
  contentTypeQuickCreateLabel: {
    id: 'newContentDialog.contentTypeQuickCreateLabel',
    defaultMessage: 'Quick create only'
  },
  contentTypeFavoriteLabel: {
    id: 'newContentDialog.contentTypeFavoriteLabel',
    defaultMessage: 'Favorites only'
  }
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    compact: {
      marginRight: 'auto',
      paddingLeft: '20px'
    },
    dialogContent: {
      minHeight: 455
    },
    cardsContainer: {
      marginTop: 14
    },
    submitBtn: {
      marginLeft: 17
    },
    searchBox: {
      minWidth: '33%'
    },
    emptyStateLink: {
      cursor: 'pointer',
      textDecoration: 'underline'
    },
    emptyStateImg: {
      width: 250,
      marginBottom: 17
    },
    loadingGraphic: {
      width: 250
    },
    emptyStateTitle: {
      color: palette.gray.medium6
    }
  })
);

interface ChangeContentTypeDialogBaseProps {
  open: boolean;
  item: DetailedItem;
  rootPath: string;
  compact: boolean;
}

export type ChangeContentTypeDialogProps = PropsWithChildren<
  ChangeContentTypeDialogBaseProps & {
    onContentTypeSelected?(response?: any): any;
    onClose?(): void;
    onClosed?(): void;
    onDismiss?(): void;
  }
>;

export interface ChangeContentTypeDialogStateProps extends ChangeContentTypeDialogBaseProps {
  onContentTypeSelected?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
}

export default function ChangeContentTypeDialog(props: ChangeContentTypeDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="md">
      <ChangeContentTypeDialogWrapper {...props} />
    </Dialog>
  );
}

function ChangeContentTypeDialogWrapper(props: ChangeContentTypeDialogProps) {
  const { onDismiss, item, onContentTypeSelected, compact = false, rootPath } = props;
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const classes = useStyles({});

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

  const onSelectedContentType = (contentType: LegacyFormConfig) => {};

  useEffect(() => {
    if (selectedItem.path) {
      fetchLegacyContentTypes(site, selectedItem.path).subscribe(
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
    useMemo(() => ({ contentTypes, selectedFilter, debounceKeyword }), [
      contentTypes,
      selectedFilter,
      debounceKeyword
    ]),
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

  return (
    <>
      <DialogHeader
        title={formatMessage(translations.title)}
        subtitle={formatMessage(translations.subtitle)}
        onDismiss={onDismiss}
      />
      <DialogBody classes={{ root: classes.dialogContent }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <SingleItemSelector
              label="Item"
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
            <SearchBar onChange={onSearch} keyword={keyword} autoFocus />
          </Box>
        </Box>
        <SuspenseWithEmptyState resource={resource}>
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
          control={
            <Checkbox
              checked={isCompact}
              onChange={() => setIsCompact(!isCompact)}
              color="primary"
            />
          }
          label={formatMessage(translations.compactInput)}
        />
        <ContentTypesFilter
          filters={filters}
          selected={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </DialogFooter>
    </>
  );
}
