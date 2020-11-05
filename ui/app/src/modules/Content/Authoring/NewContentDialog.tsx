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

import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import DialogHeader from '../../../components/Dialogs/DialogHeader';
import NewContentCard from './NewContentCard';
import SearchBar from '../../../components/Controls/SearchBar';
import ContentTypesFilter from './ContentTypesFilter';
import {
  useActiveSiteId,
  useDebouncedInput,
  useLogicResource,
  useSelection,
  useUnmount
} from '../../../utils/hooks';
import DialogBody from '../../../components/Dialogs/DialogBody';
import DialogFooter from '../../../components/Dialogs/DialogFooter';
import Typography from '@material-ui/core/Typography';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { LegacyFormConfig } from '../../../models/ContentType';
import { Resource } from '../../../models/Resource';
import StandardAction from '../../../models/StandardAction';
import { useDispatch } from 'react-redux';
import SingleItemSelector from './SingleItemSelector';
import { SandboxItem } from '../../../models/Item';
import { showErrorDialog } from '../../../state/reducers/dialogs/error';
import palette from '../../../styles/palette';
import { newContentCreationComplete } from '../../../state/actions/dialogs';
import { fetchLegacyContentTypes } from '../../../services/contentTypes';

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
    dialogActions: {
      padding: '10px 22px',
      display: 'flex',
      justifyContent: 'space-between'
    },
    dialogContent: {
      padding: theme.spacing(2),
      backgroundColor: palette.gray.light0,
      overflow: 'auto',
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

interface ContentTypesGridProps {
  resource: Resource<LegacyFormConfig[] | any>;
  isCompact: boolean;
  selectedContentType?: string;

  onTypeOpen(data: LegacyFormConfig): void;

  getPrevImg(data: LegacyFormConfig): string;
}

interface NewContentDialogBaseProps {
  open: boolean;
  item: SandboxItem;
  rootPath: string;
  compact: boolean;
  type?: 'new' | 'change';
  selectedContentType?: string;
}

export type NewContentDialogProps = PropsWithChildren<NewContentDialogBaseProps & {
  onContentTypeSelected?(response?: any): any;
  onClose?(): void;
  onClosed?(): void;
  onDismiss?(): void;
}>;

export interface NewContentDialogStateProps extends NewContentDialogBaseProps {
  onContentTypeSelected?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
}

function ContentTypesGrid(props: ContentTypesGridProps) {
  const { resource, isCompact, onTypeOpen, getPrevImg, selectedContentType } = props;
  const classes = useStyles({});
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
            onClick={onTypeOpen(content)}
            isSelected={content.name === selectedContentType}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default function NewContentDialog(props: NewContentDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth
      maxWidth="md"
    >
      <NewContentDialogBody {...props} />
    </Dialog>
  );
}

function NewContentDialogBody(props: NewContentDialogProps) {
  const {
    onDismiss,
    item,
    onContentTypeSelected,
    compact,
    rootPath,
    type,
    selectedContentType
  } = props;
  const [openSelector, setOpenSelector] = useState(false);
  const defaultFilterType = (type === 'new') ? 'all' : item.systemType;
  const { formatMessage } = useIntl();
  const site = useActiveSiteId();
  const classes = useStyles({});
  const contentTypes = useRef(null);
  const dispatch = useDispatch();
  const [filterContentTypes, setFilterContentTypes] = useState([]);
  const [isCompact, setIsCompact] = useState(compact);
  const [search, setSearch] = useState('');
  const [previewItem, setPreviewItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetFilterType, setResetFilterType] = useState(defaultFilterType);
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);
  const defaultFormSrc = `${authoringBase}/legacy/form`;
  useUnmount(props.onClosed);
  const contentTypesUrl = `/studio/api/1/services/api/1/content/get-content-at-path.bin?site=${site}&path=/config/studio/content-types`;
  const defaultPrevImgUrl =
    '/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg';
  const path = previewItem?.path;
  const parentPath = previewItem?.path.endsWith('.xml') ? previewItem.path.replace(/[^/]*$/, '') : previewItem?.path;

  const contentTypesFilters = [
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
    },
    {
      label: formatMessage(translations.contentTypeQuickCreateLabel),
      type: 'quickCreate'
    },
    {
      label: formatMessage(translations.contentTypeFavoriteLabel),
      type: 'favorite'
    }
  ];
  const resource = useLogicResource(
    filterContentTypes,
    {
      shouldResolve: (source) => !!source,
      shouldReject: (source) => !source,
      shouldRenew: (source, resource) => resource.complete,
      resultSelector: (source) => source,
      errorSelector: () => 'Error'
    }
  );

  const onTypeOpen = (contentType: LegacyFormConfig) => () => {
    onContentTypeSelected?.({
      src: `${defaultFormSrc}?isNewContent=true&contentTypeId=${contentType.form}&path=${parentPath}&type=form`,
      inProgress: false,
      onSaveSuccess: newContentCreationComplete()
    });
  };

  const onCompactCheck = () => setIsCompact(!isCompact);

  const onResetFilter = useCallback(() => {
    setResetFilterType(defaultFilterType);
    setFilterContentTypes(contentTypes.current);
  }, [contentTypes]);

  const onTypeChange = useCallback(
    (type) => {
      resetFilterType && setResetFilterType('');

      type !== defaultFilterType
        ? setFilterContentTypes(contentTypes.current.filter((content) => content.type === type))
        : onResetFilter();
    },
    [contentTypes, resetFilterType, onResetFilter]
  );

  const onSearch = useCallback(
    (keyword) => {
      const formatValue = keyword.toLowerCase();

      !keyword
        ? onResetFilter()
        : setFilterContentTypes(
        contentTypes.current.filter((content) => content.label.toLowerCase().includes(formatValue))
        );
    },
    [contentTypes, onResetFilter]
  );

  const onSearch$ = useDebouncedInput(onSearch, 400);

  const onSearchChange = (keyword) => {
    setSearch(keyword);
    onSearch$.next(keyword);
  };

  const onParentItemClick = (item) => {
    setLoading(true);
    setPreviewItem(item);
  };

  const getPrevImg = (content) =>
    content?.imageThumbnail
      ? `${contentTypesUrl}${content.form}/${content.imageThumbnail}`
      : defaultPrevImgUrl;

  useEffect(() => {
    setIsCompact(compact);
  }, [compact]);

  useEffect(() => {
    if (item) setPreviewItem(item);
  }, [item]);

  useEffect(() => {
    if (path) {
      fetchLegacyContentTypes(site, path).subscribe(
        (response) => {
          setFilterContentTypes((defaultFilterType === 'all') ? response : response.filter((contenType) => contenType.type === defaultFilterType));
          contentTypes.current = (defaultFilterType === 'all') ? response : response.filter((contenType) => contenType.type === defaultFilterType);
          setLoading(false);
        },
        (response) => {
          dispatch(showErrorDialog({ error: response }));
          setFilterContentTypes(null);
        }
      );
    }
  }, [dispatch, path, site, defaultFilterType]);

  return (
    <>
      <DialogHeader
        title={formatMessage(type === 'new' ? translations.title : translations.chooseContentType)}
        subtitle={formatMessage(type === 'new' ? translations.subtitle : translations.chooseContentTypeSubtitle)}
        onDismiss={onDismiss}
      />
      <DialogBody classes={{ root: classes.dialogContent }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <SingleItemSelector
              label="Item"
              open={openSelector}
              onClose={() => setOpenSelector(false)}
              onDropdownClick={type === 'new' ? () => setOpenSelector(!openSelector) : null}
              rootPath={rootPath}
              selectedItem={previewItem}
              onItemClicked={(item) => {
                setOpenSelector(false);
                onParentItemClick(item);
              }}
            />
          </Box>
          <Box className={classes.searchBox}>
            <SearchBar onChange={onSearchChange} keyword={search} autoFocus />
          </Box>
        </Box>

        <SuspenseWithEmptyState
          resource={resource}
          withEmptyStateProps={{
            emptyStateProps: {
              classes: {
                image: classes.emptyStateImg,
                title: classes.emptyStateTitle
              },
              title: (
                <FormattedMessage
                  id="newContentDialog.emptyStateMessage"
                  defaultMessage="No Content Types Found"
                />
              ),
              subtitle: (
                <FormattedMessage
                  id="newContentDialog.emptyStateMessageSubtitle"
                  defaultMessage="Try changing your query or browse the <catalog>full catalog</catalog>."
                  values={{
                    catalog: (msg) =>
                      <Typography
                        variant="subtitle1"
                        component="a"
                        className={classes.emptyStateLink}
                        color="textSecondary"
                        onClick={() => {
                          onResetFilter();
                          setSearch('');
                        }}
                      >
                        {msg}
                      </Typography>
                  }}
                />
              )
            }
          }}
          loadingStateProps={{
            classes: {
              graphic: classes.loadingGraphic
            }
          }}
        >
          <ContentTypesGrid
            resource={resource}
            isCompact={isCompact}
            onTypeOpen={onTypeOpen}
            getPrevImg={getPrevImg}
            selectedContentType={selectedContentType}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter classes={{ root: classes.dialogActions }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isCompact || false}
              onChange={onCompactCheck}
              color="primary"
              disabled={loading}
            />
          }
          label={formatMessage(translations.compactInput)}
        />
        <ContentTypesFilter
          filters={contentTypesFilters}
          onTypeChange={onTypeChange}
          disabled={(type === 'new') ? loading : true}
          resetType={resetFilterType}
        />
      </DialogFooter>
    </>
  );
}
