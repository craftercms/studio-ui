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

import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ContentType, LegacyContentType } from '../../models';
import useSpreadState from '../../hooks/useSpreadState';
import { FormattedMessage } from 'react-intl';
import { asDayMonthDateTime, asLocalizedDateTime } from '../../utils/datetime';
import useLocale from '../../hooks/useLocale';
import { reversePluckProps } from '../../utils/object';
import { useContentTypePreviewImage } from '../NewContentDialog';
import { useDispatch } from 'react-redux';
import { editContentTypeTemplate } from '../../state/actions/misc';

export interface ContentTypeEditorProps {
  contentType: LegacyContentType;
  definition: ContentType;
}

const drawerWidth = 240;

export function ContentTypeEditor(props: ContentTypeEditorProps) {
  // const { contentType, definition } = props;
  const [contentType, setContentType] = useSpreadState(props.contentType);
  const [definition, setDefinition] = useSpreadState(props.definition);
  const { name: contentTypeId, label, lastUpdated, type } = contentType;
  const { displayTemplate } = definition;
  const imageSrc = useContentTypePreviewImage(contentTypeId);
  const locale = useLocale();
  const dispatch = useDispatch();

  console.log('props', props);

  const editTemplate = () => {
    dispatch(editContentTypeTemplate({ contentTypeId }));
  };

  return (
    <Box display="flex">
      <Drawer
        sx={{
          width: drawerWidth,
          p: 2,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box'
          }
        }}
        variant="permanent"
        anchor="left"
      >
        hello
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 2 }}>
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
                Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Vivamus sagittis
                lacus vel augue laoreet rutrum faucibus dolor auctor.
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
                <Button variant="text">
                  <FormattedMessage id="contentTypeEditor.editController" defaultMessage="Edit Controller" />
                </Button>
                <Button variant="text" color="error">
                  <FormattedMessage id="contentTypeEditor.deleteType" defaultMessage="Delete Type" />
                </Button>
              </Box>
            </CardContent>
          </Box>
        </Card>
      </Box>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth
          }
        }}
        variant="permanent"
        anchor="right"
      >
        bye
      </Drawer>
    </Box>
  );
}

export default ContentTypeEditor;
