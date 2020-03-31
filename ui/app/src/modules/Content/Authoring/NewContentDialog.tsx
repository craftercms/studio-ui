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

import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import DialogContent from '@material-ui/core/DialogContent';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import DialogActions from '@material-ui/core/DialogActions';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import { palette } from '../../../styles/theme';
import { fetchLegacyContentTypes } from '../../../services/content';
import DialogHeader from '../../../components/DialogHeader';
import NewContentCard from './NewContentCard';
import NewContentSelect from './NewContentSelect';
import SearchBar from '../../../components/SearchBar';
import ContentTypesFilter from './ContentTypesFilter';
import EmptyState from '../../../components/SystemStatus/EmptyState';
import { Item } from '../../../models/Item';

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
  noResultsTitle: {
    id: 'noResults.title',
    defaultMessage: 'No Content Types Found'
  },
  noResultsSubTitle: {
    id: 'noResults.subTitle',
    defaultMessage: 'Try changing your query or browse the'
  },
  noResultsLink: {
    id: 'noResults.link',
    defaultMessage: 'full catalog.'
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
    prevImg: {
      maxWidth: '150px'
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
    }
  })
);

const defaultPreviewItem: Item = {
  name: 'Home',
  internalName: 'Home',
  uri: '/site/website/index.xml'
};

interface NewContentDialogProps {
  open: boolean;
  site: string;
  previewItem: Item;

  onDialogClose(): void;

  onTypeOpen(srcData: any, srcPath: string): any;
}

export default function NewContentDialog(props: NewContentDialogProps) {
  const { open, onDialogClose, onTypeOpen, site, previewItem: item } = props;
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const [contentTypes, setContentTypes] = useState(null);
  const [filterContentTypes, setFilterContentTypes] = useState(null);
  const [isCompact, setIsCompact] = useState(false);
  const contentTypesUrl = `/studio/api/1/services/api/1/content/get-content-at-path.bin?site=${site}&path=/config/studio/content-types`;
  const defaultPrevImgUrl = '/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg';
  const [ previewItem, setPreviewItem] = useState(item || defaultPreviewItem);
  const path = previewItem.uri.replace(/[^/]*$/, '');

  const onCompactCheck = () => setIsCompact(!isCompact);

  const onSearchChange = value => console.log(value);

  const onTypeChange = type =>
    (type !== 'all')
      ? setFilterContentTypes(contentTypes.filter(content => content.type === type))
      : setFilterContentTypes(contentTypes);

  const getPrevImg = (content) =>
    (content?.imageThumbnail)
      ? `${contentTypesUrl}${content.form}/${content.imageThumbnail}`
      : defaultPrevImgUrl;

  useEffect(() => {
    open && fetchLegacyContentTypes(site, path).subscribe(data => {
      setFilterContentTypes(data);
      setContentTypes(data);
    });
  }, [open, path, site]);

  return (
    filterContentTypes &&
    <Dialog
      open={open}
      onClose={onDialogClose}
      disableBackdropClick={true}
      fullWidth
      maxWidth={'md'}
      scroll="paper"
    >
      <DialogHeader
        title={formatMessage(translations.title)}
        subtitle={formatMessage(translations.subtitle)}
        onClose={onDialogClose}
        icon={CloseRoundedIcon}
      />
      <DialogContent dividers className={classes.dialogContent}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <NewContentSelect
              label="Parent"
              selectItem={previewItem}
              LabelIcon={InsertDriveFileOutlinedIcon}
              onEditClick={() => null}
              onParentItemClick={item => setPreviewItem(item)}
            />
          </Box>
          <Box className={classes.searchBox}>
            <SearchBar onChange={onSearchChange} keyword={previewItem.uri} autofocus />
          </Box>
        </Box>

        <Grid container spacing={3} className={classes.cardsContainer}>
          {
            !filterContentTypes.length ?
              <EmptyState
                title={formatMessage(translations.noResultsTitle)}
                subtitle={formatMessage(translations.noResultsSubTitle)}
                link={formatMessage(translations.noResultsLink)}
                onLinkClick={e => onTypeChange('all')}
                classes={{ root: classes.emptyStateRoot }}
              /> :
              filterContentTypes.map(content => (
                <Grid item key={content.name} xs={12} sm={!isCompact ? 4 : 6}>
                  <NewContentCard
                    isCompact={isCompact}
                    headerTitle={content.label}
                    subheader={content.form}
                    imgTitle={formatMessage(translations.previewImage)}
                    img={getPrevImg(content)}
                    onClick={onTypeOpen(content, path)}
                  />
                </Grid>
              ))
          }
        </Grid>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isCompact}
              onChange={onCompactCheck}
              color="primary"
            />
          }
          label={formatMessage(translations.compactInput)}
        />
        <ContentTypesFilter onTypeChange={onTypeChange} />
      </DialogActions>
    </Dialog>
  );
}
