/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { LegacyContentType } from '../../models';
import useSpreadState from '../../hooks/useSpreadState';
import { FormattedMessage, useIntl } from 'react-intl';
import { asLocalizedDateTime } from '../../utils/datetime';
import useLocale from '../../hooks/useLocale';
import { reversePluckProps } from '../../utils/object';
import { useContentTypePreviewImage } from '../NewContentDialog';
import { useDispatch } from 'react-redux';
import { editContentTypeTemplate } from '../../state/actions/misc';
import { GlobalAppToolbar } from '../GlobalAppToolbar';
import translations from './translations';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import useEnhancedDialogState from '../../hooks/useEnhancedDialogState';
import { editControllerActionCreator } from '../../utils/itemActions';
import DeleteContentTypeDialog from '../DeleteContentTypeDialog';
import getStyles from './styles';
import ContentTypeSection from './ContentTypeSection';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import IconButton from '@mui/material/IconButton';
import { fetchContentType } from '../../services/contentTypes';
import CreateContentTypeFieldDialog from '../CreateContentTypeFieldDialog/CreateContentTypeFieldDialog';

export interface ContentTypeEditorProps {
  config: LegacyContentType;
  onGoBack(): void;
}

export function ContentTypeEditor(props: ContentTypeEditorProps) {
  const { onGoBack } = props;
  const [config, setConfig] = useSpreadState(props.config);
  const [formDefinition, setFormDefinition] = useSpreadState(null);
  const { name: contentTypeId, label, lastUpdated, type } = config;
  const imageSrc = useContentTypePreviewImage(contentTypeId);
  const locale = useLocale();
  const dispatch = useDispatch();
  const deleteContentTypeDialogState = useEnhancedDialogState();
  const createFieldDialogState = useEnhancedDialogState();
  const { formatMessage } = useIntl();
  const siteId = useActiveSiteId();
  const sx = getStyles();

  // region effects
  useEffect(() => {
    if (config) {
      fetchContentType(siteId, config.name).subscribe((definition) => {
        setFormDefinition(definition);
      });
    }
  }, [config, setFormDefinition, siteId]);
  // endregion

  const editTemplate = () => {
    dispatch(editContentTypeTemplate({ contentTypeId }));
  };

  const editController = () => {
    dispatch(editControllerActionCreator(formDefinition.type, formDefinition.id));
  };

  const openCreateFieldDialog = () => {
    createFieldDialogState.onOpen();
  };

  return (
    <>
      <GlobalAppToolbar
        title={formatMessage(translations.newContentType)}
        startContent={
          <IconButton onClick={() => onGoBack()}>
            <ArrowBackOutlinedIcon />
          </IconButton>
        }
      />
      <Box display="flex">
        {/* TODO: add loading/error views */}
        {formDefinition && (
          <>
            <Box flexGrow={1} p={2} sx={sx.body}>
              <Card sx={sx.contentTypeInfo}>
                <CardMedia component="img" sx={{ width: 208 }} image={imageSrc} />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography variant="body1">
                      {type === 'component' ? (
                        <FormattedMessage id="words.component" defaultMessage="Component" />
                      ) : (
                        <FormattedMessage id="words.page" defaultMessage="Page" />
                      )}
                      &nbsp;• {contentTypeId}
                    </Typography>
                    <Typography component="div" variant="h6" sx={sx.semibold}>
                      {label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="div">
                      <FormattedMessage
                        id="contentTypeEditor.lastModified"
                        defaultMessage="Last modified on <b>{modifiedDate}</b>"
                        values={{
                          modifiedDate: asLocalizedDateTime(
                            lastUpdated,
                            locale.localeCode,
                            reversePluckProps(locale.dateTimeFormatOptions, 'hour', 'minute', 'second')
                          ),
                          b: (message) => {
                            return <strong>{message}</strong>;
                          }
                        }}
                      />
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button variant="text" disabled>
                        <FormattedMessage id="contentTypeEditor.editProperties" defaultMessage="Edit Properties" />
                      </Button>
                      <Button variant="text" onClick={editTemplate}>
                        <FormattedMessage id="contentTypeEditor.editTemplate" defaultMessage="Edit Template" />
                      </Button>
                      <Button variant="text" onClick={editController}>
                        <FormattedMessage id="contentTypeEditor.editController" defaultMessage="Edit Controller" />
                      </Button>
                      <Button variant="text" color="error">
                        <FormattedMessage id="contentTypeEditor.deleteType" defaultMessage="Delete Type" />
                      </Button>
                    </Box>
                  </CardContent>
                </Box>
              </Card>

              {formDefinition?.sections.map((section, index) => (
                <React.Fragment key={index}>
                  <ContentTypeSection
                    {...section}
                    fieldsDefinitions={formDefinition.fields}
                    onAddField={openCreateFieldDialog}
                  />
                </React.Fragment>
              ))}
              <Box display="flex" justifyContent="center">
                <Button variant="outlined" sx={{ borderStyle: 'dashed !important', borderRadius: '4px' }}>
                  <FormattedMessage id="contentTypeEditor.addSection" defaultMessage="Add Section" />
                </Button>
              </Box>
            </Box>
            <CreateContentTypeFieldDialog
              open={createFieldDialogState.open}
              onClose={createFieldDialogState.onClose}
              isSubmitting={createFieldDialogState.isSubmitting}
              hasPendingChanges={createFieldDialogState.hasPendingChanges}
              isMinimized={createFieldDialogState.isMinimized}
            />
            <DeleteContentTypeDialog
              open={deleteContentTypeDialogState.open}
              onClose={deleteContentTypeDialogState.onClose}
              isSubmitting={deleteContentTypeDialogState.isSubmitting}
              hasPendingChanges={deleteContentTypeDialogState.hasPendingChanges}
              isMinimized={deleteContentTypeDialogState.isMinimized}
              onSubmittingAndOrPendingChange={deleteContentTypeDialogState.onSubmittingAndOrPendingChange}
              contentType={formDefinition}
              onComplete={() => {
                deleteContentTypeDialogState.onClose();
              }}
            />
          </>
        )}
      </Box>
    </>
  );
}

export default ContentTypeEditor;
