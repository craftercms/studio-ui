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
import StandardAction from '../../../models/StandardAction';
import { DetailedItem } from '../../../models/Item';
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
import { ContentTypesGrid, ContentTypesLoader } from './NewContentDialog';

const translations = defineMessages({
  title: {
    id: 'changeContentTypeDialog.title',
    defaultMessage: 'Choose Content Type'
  },
  subtitle: {
    id: 'changeContentTypeDialog.subtitle',
    defaultMessage: 'The following starter templates are available for use within this section.'
  },
  compactInput: {
    id: 'words.compact',
    defaultMessage: 'Compact'
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
    searchBox: {
      minWidth: '33%'
    },
    emptyStateImg: {
      width: 250,
      marginBottom: 17
    }
  })
);

interface ChangeContentTypeDialogBaseProps {
  open: boolean;
  item: DetailedItem;
  rootPath: string;
  compact: boolean;
  selectedContentType: string;
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
      <ChangeContentTypeDialogBody {...props} />
    </Dialog>
  );
}

function ChangeContentTypeDialogBody(props: ChangeContentTypeDialogProps) {
  const { onDismiss, item, onContentTypeSelected, compact = false, rootPath, selectedContentType } = props;
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

  const getPrevImg = (content: LegacyFormConfig) => {
    return content?.imageThumbnail
      ? `/studio/api/1/services/api/1/content/get-content-at-path.bin?site=${site}&path=/config/studio/content-types${content.form}/${content.imageThumbnail}`
      : '/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg';
  };

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
          label={formatMessage(translations.compactInput)}
        />
      </DialogFooter>
    </>
  );
}
