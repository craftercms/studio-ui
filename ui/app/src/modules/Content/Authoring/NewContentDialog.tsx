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
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { LegacyContentType, LegacyFormConfig } from '../../../models/ContentType';
import { Resource } from '../../../models/Resource';
import StandardAction from '../../../models/StandardAction';
import { DetailedItem } from '../../../models/Item';
import { useActiveSiteId, useLogicResource, useSelection, useSubject } from '../../../utils/hooks';
import DialogHeader from '../../../components/Dialogs/DialogHeader';
import DialogFooter from '../../../components/Dialogs/DialogFooter';
import { Box, Checkbox, FormControlLabel, Grid } from '@material-ui/core';
import DialogBody from '../../../components/Dialogs/DialogBody';
import SingleItemSelector from './SingleItemSelector';
import SearchBar from '../../../components/Controls/SearchBar';
import { fetchLegacyContentTypes } from '../../../services/contentTypes';
import { showErrorDialog } from '../../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import NewContentCard from './NewContentCard';
import { debounceTime } from 'rxjs/operators';
import ContentTypesFilter from './ContentTypesFilter';
import { closeNewContentDialog, newContentCreationComplete } from '../../../state/actions/dialogs';
import { batchActions } from '../../../state/actions/misc';

const translations = defineMessages({
  title: {
    id: 'newContentDialog.title',
    defaultMessage: 'Create Content'
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
    searchBox: {
      minWidth: '33%'
    },
    emptyStateImg: {
      width: 250,
      marginBottom: 17
    }
  })
);

interface ContentTypesGridProps {
  resource: Resource<LegacyFormConfig[] | any>;
  isCompact: boolean;
  selectedContentType?: string;

  onTypeOpen(data: LegacyFormConfig): void;

  getPrevImg(data: LegacyFormConfig): string;
}

interface NewContentDialogBaseProps {
  open: boolean;
  item: DetailedItem;
  rootPath: string;
  compact: boolean;
}

export type NewContentDialogProps = PropsWithChildren<
  NewContentDialogBaseProps & {
    onContentTypeSelected?(response?: any): any;
    onClose?(): void;
    onClosed?(): void;
    onDismiss?(): void;
  }
>;

export interface NewContentDialogStateProps extends NewContentDialogBaseProps {
  onContentTypeSelected?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
}

export default function NewContentDialog(props: NewContentDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="md">
      <NewContentDialogWrapper {...props} />
    </Dialog>
  );
}

function NewContentDialogWrapper(props: NewContentDialogProps) {
  const { onDismiss, item, onContentTypeSelected, compact = false, rootPath } = props;
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const classes = useStyles({});
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);
  const defaultFormSrc = `${authoringBase}/legacy/form`;

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
    const path = selectedItem?.path.endsWith('.xml')
      ? selectedItem.path.replace(/[^/]*$/, '')
      : selectedItem?.path;
    onContentTypeSelected?.({
      src: `${defaultFormSrc}?isNewContent=true&contentTypeId=${contentType.form}&path=${path}&type=form`,
      onSaveSuccess: batchActions([closeNewContentDialog(), newContentCreationComplete()])
    });
  };

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
            <SearchBar
              onChange={onSearch}
              keyword={keyword}
              autoFocus
              showActionButton={Boolean(keyword)}
            />
          </Box>
        </Box>
        <SuspenseWithEmptyState
          resource={resource}
          withEmptyStateProps={{
            emptyStateProps: {
              classes: {
                image: classes.emptyStateImg
              },
              title: (
                <FormattedMessage
                  id="newContentDialog.emptyStateMessage"
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
