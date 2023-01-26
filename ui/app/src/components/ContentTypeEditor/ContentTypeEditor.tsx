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

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ContentType, LegacyContentType } from '../../models';
import useSpreadState from '../../hooks/useSpreadState';
import { FormattedMessage, useIntl } from 'react-intl';
import { asDayMonthDateTime, asLocalizedDateTime } from '../../utils/datetime';
import useLocale from '../../hooks/useLocale';
import { reversePluckProps } from '../../utils/object';
import { useContentTypePreviewImage } from '../NewContentDialog';
import { useDispatch } from 'react-redux';
import { editContentTypeTemplate } from '../../state/actions/misc';
import { GlobalAppToolbar } from '../GlobalAppToolbar';
import translations from './translations';
import { SearchBar } from '../SearchBar';
import useMount from '../../hooks/useMount';
import { fetchConfigurationJSON } from '../../services/configuration';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import useEnhancedDialogState from '../../hooks/useEnhancedDialogState';
import { editControllerActionCreator } from '../../utils/itemActions';
import DeleteContentTypeDialog from '../DeleteContentTypeDialog';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import StarIcon from '@mui/icons-material/Star';
import ListItemText from '@mui/material/ListItemText';
import getStyles from './styles';
import { EmptyState } from '../EmptyState';
import TypesAccordion from './TypesAccordion';
import ContentTypeSection from './ContentTypeSection';

export interface ContentTypeEditorProps {
  contentType: LegacyContentType;
  definition: ContentType;
}

export function ContentTypeEditor(props: ContentTypeEditorProps) {
  // const { contentType, definition } = props;
  const [contentType, setContentType] = useSpreadState(props.contentType);
  const [definition, setDefinition] = useSpreadState(props.definition);
  const { name: contentTypeId, label, lastUpdated, type } = contentType;
  const { displayTemplate } = definition;
  const imageSrc = useContentTypePreviewImage(contentTypeId);
  const locale = useLocale();
  const dispatch = useDispatch();
  const deleteContentTypeDialogState = useEnhancedDialogState();
  const { formatMessage } = useIntl();
  const siteId = useActiveSiteId();
  const [controls, setControls] = useState(null);
  const [datasources, setDatasources] = useState(null);
  const sx = getStyles();
  const [filterKeyword, setFilterKeyword] = useState('');
  const filteredControls = controls?.filter((control) => control.name.includes(filterKeyword));
  const filteredDatasources = datasources?.filter((datasource) => datasource.name.includes(filterKeyword));

  console.log('props', props);

  useMount(() => {
    fetchConfigurationJSON(siteId, 'administration/site-config-tools.xml', 'studio', 'default').subscribe(
      ({ config }) => {
        setControls(config.tools.tool.controls.control);
        setDatasources(config.tools.tool.datasources.datasource);
      }
    );
  });

  const editTemplate = () => {
    dispatch(editContentTypeTemplate({ contentTypeId }));
  };

  const editController = () => {
    dispatch(editControllerActionCreator(definition.type, definition.id));
  };

  return (
    <>
      <GlobalAppToolbar title={formatMessage(translations.newContentType)} />
      <Box display="flex">
        <Drawer sx={sx.drawer} variant="permanent" anchor="left">
          <SearchBar
            keyword={filterKeyword}
            onChange={setFilterKeyword}
            showDecoratorIcon
            showActionButton={Boolean(filterKeyword)}
          />
          {/* NOTE: Legacy content type editor loads each of the controls/datasources to retrieve data and functionality */}
          <TypesAccordion title={formatMessage(translations.controls)}>
            <List sx={{ width: '100%' }}>
              {filteredControls?.length ? (
                filteredControls?.map((control) => (
                  <ListItem key={control.name}>
                    <ListItemAvatar>
                      <StarIcon />
                    </ListItemAvatar>
                    <ListItemText primary={control.name} />
                  </ListItem>
                ))
              ) : (
                <EmptyState title={formatMessage(translations.noControlsFound)} />
              )}
            </List>
          </TypesAccordion>
          <TypesAccordion title={formatMessage(translations.datasources)}>
            <List sx={{ width: '100%' }}>
              {filteredDatasources?.length ? (
                filteredDatasources?.map((datasource) => (
                  <ListItem key={datasource.name}>
                    <ListItemAvatar>
                      <StarIcon />
                    </ListItemAvatar>
                    <ListItemText primary={datasource.name} />
                  </ListItem>
                ))
              ) : (
                <EmptyState title={formatMessage(translations.noDatasourcesFound)} />
              )}
            </List>
          </TypesAccordion>
        </Drawer>
        <Box flexGrow={1} p={2}>
          <Card sx={{ display: 'flex' }}>
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
                <Typography component="div" variant="h5">
                  {label}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Vivamus
                  sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  <FormattedMessage
                    id="contentTypeEditor.lastModified"
                    defaultMessage="Last modified on <b>{modifiedDate}</b> by abcde"
                    values={{
                      modifiedDate: asLocalizedDateTime(
                        lastUpdated,
                        locale.localeCode,
                        reversePluckProps(locale.dateTimeFormatOptions, 'hour', 'minute', 'second')
                      ),
                      b: (message) => {
                        // TODO: styles for semibold
                        return <strong>{message}</strong>;
                      }
                    }}
                  />
                </Typography>
                <Box>
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

          {definition?.sections.map((section, index) => (
            <React.Fragment key={index}>
              <ContentTypeSection {...section} fieldsDefinitions={definition.fields} />
            </React.Fragment>
          ))}
        </Box>
        <Drawer sx={sx.drawer} variant="permanent" anchor="right"></Drawer>
        <DeleteContentTypeDialog
          open={deleteContentTypeDialogState.open}
          onClose={deleteContentTypeDialogState.onClose}
          isSubmitting={deleteContentTypeDialogState.isSubmitting}
          hasPendingChanges={deleteContentTypeDialogState.hasPendingChanges}
          isMinimized={deleteContentTypeDialogState.isMinimized}
          onSubmittingAndOrPendingChange={deleteContentTypeDialogState.onSubmittingAndOrPendingChange}
          contentType={definition}
          onComplete={() => {
            deleteContentTypeDialogState.onClose();
          }}
        />
      </Box>
    </>
  );
}

export default ContentTypeEditor;
