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

import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import { palette } from '../../../styles/theme';
import { fetchLegacyContentTypes } from '../../../services/content';
import DialogHeader from '../../../components/DialogHeader';
import NewContentCard from './NewContentCard';
import NewContentSelect from './NewContentSelect';
import SearchBar from '../../../components/SearchBar';
import ContentTypesFilter from './ContentTypesFilter';
import { Item } from '../../../models/Item';
import {
  useDebouncedInput,
  useSelection,
  useSpreadState,
  useStateResource
} from '../../../utils/hooks';
import DialogBody from '../../../components/DialogBody';
import DialogFooter from '../../../components/DialogFooter';
import EmbeddedLegacyEditors from '../../Preview/EmbeddedLegacyEditors';
import Typography from '@material-ui/core/Typography';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { APIError, EntityState } from '../../../models/GlobalState';
import { LegacyFormConfig } from '../../../models/ContentType';
import { Resource } from '../../../models/Resource';
import StandardAction from '../../../models/StandardAction';

const translations = defineMessages({
  title: {
    id: 'newContentDialog.title',
    defaultMessage: 'Create Content'
  },
  subtitle: {
    id: 'newContentDialog.subtitle',
    defaultMessage: 'Choose a content type template for your new content item.'
  },
  previewImage: {
    id: 'previewImage.alt',
    defaultMessage: 'preview'
  },
  compactInput: {
    id: 'compactInput.label',
    defaultMessage: 'Compact'
  },
  contentTypeAll: {
    id: 'contentTypeAll.type',
    defaultMessage: 'all'
  },
  contentTypeAllLabel: {
    id: 'contentTypeAll.label',
    defaultMessage: 'Show all types'
  },
  contentTypePage: {
    id: 'contentTypePage.type',
    defaultMessage: 'page'
  },
  contentTypePageLabel: {
    id: 'contentTypePage.label',
    defaultMessage: 'Pages only'
  },
  contentTypeComponent: {
    id: 'contentTypeComponent.type',
    defaultMessage: 'component'
  },
  contentTypeComponentLabel: {
    id: 'contentTypeComponent.label',
    defaultMessage: 'Components only'
  },
  contentTypeQuickCreate: {
    id: 'contentTypeQuickCreate.type',
    defaultMessage: 'quickCreate'
  },
  contentTypeQuickCreateLabel: {
    id: 'contentTypeQuickCreate.label',
    defaultMessage: 'Quick create only'
  },
  contentTypeFavorite: {
    id: 'contentTypeFavorite.type',
    defaultMessage: 'favorite'
  },
  contentTypeFavoriteLabel: {
    id: 'contentTypeFavorite.label',
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
      minHeight: 628
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
    emptyStateRoot: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    },
    loadingRoot: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
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

const defaultPreviewItem: Item = {
  name: 'Home',
  internalName: 'Home',
  uri: '/site/website/index.xml'
};

interface ContentTypesGridProps {
  resource: Resource<LegacyFormConfig[]>;
  isCompact: boolean;
  onTypeOpen(data: LegacyFormConfig): void;
  getPrevImg(data: LegacyFormConfig): string;
}

interface NewContentDialogBaseProps {
  open: boolean;
  site: string;
  previewItem: Item;
  onSaveLegacySuccess?(response): any;
  onSaveSuccess?(response): any;
}

export type NewContentDialogProps = PropsWithChildren<
  NewContentDialogBaseProps & {
    onDialogClose?(): any;
  }
>;

export interface NewContentDialogStateProps extends NewContentDialogBaseProps {
  onDialogClose?: StandardAction;
}

function ContentTypesGrid(props: ContentTypesGridProps) {
  const { resource, isCompact, onTypeOpen, getPrevImg } = props;
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const filterContentTypes = resource.read();
  return (
    <Grid container spacing={3} className={classes.cardsContainer}>
      {filterContentTypes.map((content) => (
        <Grid item key={content.label} xs={12} sm={!isCompact ? 4 : 6}>
          <NewContentCard
            isCompact={isCompact}
            headerTitle={content.label}
            subheader={content.form}
            imgTitle={formatMessage(translations.previewImage)}
            img={getPrevImg(content)}
            onClick={onTypeOpen(content)}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default function NewContentDialog(props: NewContentDialogProps) {
  const {
    open,
    onDialogClose,
    site,
    previewItem: previewItemProp,
    onSaveLegacySuccess,
    onSaveSuccess
  } = props;
  const defaultFilterType = 'all';
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const [contentTypes, setContentTypes] = useState(null);
  const [filterContentTypes, setFilterContentTypes] = useState(null);
  const [isCompact, setIsCompact] = useState(false);
  const [search, setSearch] = useState('');
  const [previewItem, setPreviewItem] = useState(defaultPreviewItem);
  const [loading, setLoading] = useState(true);
  const [resetFilterType, setResetFilterType] = useState(defaultFilterType);
  const AUTHORING_BASE = useSelection<string>((state) => state.env.AUTHORING_BASE);
  const defaultFormSrc = `${AUTHORING_BASE}/legacy/form`;
  const [dialogConfig, setDialogConfig] = useSpreadState({
    open: false,
    src: defaultFormSrc,
    type: 'form',
    inProgress: false
  });
  const contentTypesUrl = `/studio/api/1/services/api/1/content/get-content-at-path.bin?site=${site}&path=/config/studio/content-types`;
  const defaultPrevImgUrl =
    '/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg';
  const path = previewItem.uri.replace(/[^/]*$/, '');
  const contentTypesFilters = [
    {
      label: formatMessage(translations.contentTypeAllLabel),
      type: formatMessage(translations.contentTypeAll)
    },
    {
      label: formatMessage(translations.contentTypePageLabel),
      type: formatMessage(translations.contentTypePage)
    },
    {
      label: formatMessage(translations.contentTypeComponentLabel),
      type: formatMessage(translations.contentTypeComponent)
    },
    {
      label: formatMessage(translations.contentTypeQuickCreateLabel),
      type: formatMessage(translations.contentTypeQuickCreate)
    },
    {
      label: formatMessage(translations.contentTypeFavoriteLabel),
      type: formatMessage(translations.contentTypeFavorite)
    }
  ];
  const [error, setError] = useState<APIError>(null);
  const resource = useStateResource<LegacyFormConfig[], EntityState<LegacyFormConfig>>(
    filterContentTypes,
    {
      shouldResolve: (data) => !!data,
      shouldReject: () => !!error,
      shouldRenew: (source, resource) => resource.complete,
      resultSelector: () => filterContentTypes,
      errorSelector: () => error
    }
  );

  const onTypeOpen = (srcData) => () => {
    onDialogClose();
    setDialogConfig({
      open: true,
      src: `${defaultFormSrc}?isNewContent=true&contentTypeId=${srcData.form}&path=${path}&type=form`
    });
  };

  const onCompactCheck = () => setIsCompact(!isCompact);

  const onResetFilter = useCallback(() => {
    setResetFilterType(defaultFilterType);
    setFilterContentTypes(contentTypes);
  }, [contentTypes]);

  const onTypeChange = useCallback(
    (type) => {
      resetFilterType && setResetFilterType('');

      type !== defaultFilterType
        ? setFilterContentTypes(contentTypes.filter((content) => content.type === type))
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
            contentTypes.filter((content) => content.label.toLowerCase().includes(formatValue))
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

  const emptyStateSubtitle = () => (
    <>
      <FormattedMessage
        id="newContentDialog.emptyStateMessageSubtitle"
        defaultMessage="Try changing your query or browse the"
      />{' '}
      <Typography
        variant="subtitle1"
        component="a"
        className={classes.emptyStateLink}
        color="textSecondary"
        onClick={onResetFilter}
      >
        <FormattedMessage
          id="newContentDialog.emptyStateMessageLink"
          defaultMessage="full catalog."
        />
      </Typography>
    </>
  );

  useEffect(() => {
    if (previewItemProp) setPreviewItem(previewItemProp);
  }, [previewItemProp]);

  useEffect(() => {
    open &&
      fetchLegacyContentTypes(site, path).subscribe(
        (response) => {
          setFilterContentTypes(response);
          setContentTypes(response);
          setLoading(false);
        },
        (error) => setError(error)
      );
  }, [open, path, site]);

  return (
    <>
      <Dialog open={open} onClose={onDialogClose} fullWidth maxWidth="md" scroll="paper">
        <DialogHeader
          title={formatMessage(translations.title)}
          subtitle={formatMessage(translations.subtitle)}
          onClose={onDialogClose}
          icon={CloseRoundedIcon}
        />
        <DialogBody dividers classes={{ root: classes.dialogContent }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <NewContentSelect
                label="Parent"
                selectItem={previewItem}
                LabelIcon={InsertDriveFileOutlinedIcon}
                onEditClick={() => null}
                onMenuItemClick={onParentItemClick}
              />
            </Box>
            <Box className={classes.searchBox}>
              <SearchBar onChange={onSearchChange} keyword={search} autofocus />
            </Box>
          </Box>

          <SuspenseWithEmptyState
            resource={resource}
            withEmptyStateProps={{
              emptyStateProps: {
                classes: {
                  root: classes.emptyStateRoot,
                  image: classes.emptyStateImg,
                  title: classes.emptyStateTitle
                },
                title: (
                  <FormattedMessage
                    id="newContentDialog.emptyStateMessage"
                    defaultMessage="No Content Types Found"
                  />
                ),
                subtitle: emptyStateSubtitle()
              }
            }}
            loadingStateProps={{
              classes: {
                graphic: classes.loadingGraphic,
                root: classes.loadingRoot
              }
            }}
          >
            <ContentTypesGrid
              resource={resource}
              isCompact={isCompact}
              onTypeOpen={onTypeOpen}
              getPrevImg={getPrevImg}
            />
          </SuspenseWithEmptyState>
        </DialogBody>
        <DialogFooter classes={{ root: classes.dialogActions }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isCompact}
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
            disabled={loading}
            resetType={resetFilterType}
          />
        </DialogFooter>
      </Dialog>
      {dialogConfig.open && (
        <EmbeddedLegacyEditors
          showTabs={false}
          showController={false}
          dialogConfig={dialogConfig}
          setDialogConfig={setDialogConfig}
          onSaveLegacySuccess={onSaveLegacySuccess}
          onSaveSuccess={onSaveSuccess}
        />
      )}
    </>
  );
}
