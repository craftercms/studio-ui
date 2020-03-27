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
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import DialogContent from '@material-ui/core/DialogContent';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import DialogActions from '@material-ui/core/DialogActions';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { palette } from '../../../styles/theme';
import { fetchLegacyContentTypes } from '../../../services/content';
import DialogHeader from '../../../components/DialogHeader';
import NewContentCard from './NewContentCard';
import NewContentSelect from './NewContentSelect';
import SearchBar from '../../../components/SearchBar';

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
    }
  })
);


interface NewContentDialogProps {
  open: boolean;
  path: string;
  site: string;

  onDialogClose(): void;

  onTypeOpen(srcData: any, srcPath: string): any;
}

export default function NewContentDialog(props: NewContentDialogProps) {
  const { open, onDialogClose, onTypeOpen, site, path } = props;
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const defaultPath = '/site/website';
  const [contextPath, setContextPath] = useState(`${defaultPath}/`);
  const [selectContent, setSelectContent] = useState(null);
  const [contentTypes, setContentTypes] = useState(null);
  const [isCompact, setIsCompact] = useState(false);
  const contentTypesUrl = `/studio/api/1/services/api/1/content/get-content-at-path.bin?site=${site}&path=/config/studio/content-types`;
  const defaultPrevImgUrl = '/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg';

  const onListItemClick = (contentData) => () => setSelectContent(contentData);

  const onCompactCheck = () => setIsCompact(!isCompact);

  const onSearchChange = value => setContextPath(value);

  const getPrevImg = (content) =>
    (content?.imageThumbnail)
      ? `${contentTypesUrl}${content.form}/${content.imageThumbnail}`
      : defaultPrevImgUrl;

  useEffect(() => {
    setContextPath(`${defaultPath}${!path ? '/' : path}`);
  }, [path]);

  useEffect(() => {
    open && fetchLegacyContentTypes(site, contextPath).subscribe(data => {
      setContentTypes(data);
      setSelectContent(data[0]);
    });
  }, [open, contextPath, site]);

  return (
    contentTypes &&
    <Dialog
      open={open}
      onClose={onDialogClose}
      disableBackdropClick={true}
      fullWidth
      maxWidth={'md'}
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
            <NewContentSelect />
          </Box>
          <Box className={classes.searchBox}>
            <SearchBar onChange={onSearchChange} keyword={contextPath} autofocus />
          </Box>
        </Box>

        <Grid container spacing={3} className={classes.cardsContainer}>
          {
            contentTypes.map(content => (
              <Grid item key={content.name} xs={12} sm={!isCompact ? 4 : 6}>
                <NewContentCard
                  isCompact={isCompact}
                  headerTitle={content.label}
                  subheader={content.form}
                  imgTitle={formatMessage(translations.previewImage)}
                  img={getPrevImg(content)}
                  onClick={onListItemClick(content)}
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
        <FormGroup row>
          <Button variant="contained" onClick={onDialogClose}>
            <FormattedMessage
              id="newContentDialog.cancel"
              defaultMessage={`Cancel`}
            />
          </Button>

          <Button
            className={classes.submitBtn}
            color="primary"
            variant="contained"
            onClick={onTypeOpen(selectContent, contextPath)}
          >
            <FormattedMessage
              id="newContentDialog.submit"
              defaultMessage={`Open Type`}
            />
          </Button>
        </FormGroup>
      </DialogActions>
    </Dialog>
  );
}
