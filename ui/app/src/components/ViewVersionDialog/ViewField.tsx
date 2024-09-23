/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import { ContentTypeField } from '../../models';
import Typography from '@mui/material/Typography';
import { MonacoWrapper } from '../MonacoWrapper';
import Box from '@mui/material/Box';
import AsyncVideoPlayer from '../AsyncVideoPlayer';
import { asLocalizedDateTime, convertTimeToTimezone } from '../../utils/datetime';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import palette from '../../styles/palette';
import Button from '@mui/material/Button';
import ArrowBackIosRounded from '@mui/icons-material/ArrowBackIosRounded';
import React, { useState } from 'react';
import ViewFieldPanel from './ViewFieldPanel';
import useItemsByPath from '../../hooks/useItemsByPath';
import useLocale from '../../hooks/useLocale';
import FieldVersionToolbar from '../CompareVersionsDialog/FieldVersionToolbar';
import { fromString, serialize } from '../../utils/xml';

interface ViewFieldProps {
  content: any;
  field: ContentTypeField;
  xml?: string;
  showToolbar?: boolean;
  contentTypeFields: ContentTypeField[];
  onSelectField?(field: ContentTypeField): void;
}

export function ViewField(props: ViewFieldProps) {
  const { content, field, contentTypeFields, xml = '', showToolbar = true, onSelectField } = props;
  const itemsByPath = useItemsByPath();
  const locale = useLocale();
  const [repItemView, setRepItemView] = useState({
    item: null,
    index: null
  });
  const fieldDoc =
    fromString(xml).querySelector(`page > ${field.id}`) ??
    fromString(xml).querySelector(`component > ${field.id}`) ??
    fromString(xml).querySelector(`item > ${field.id}`);
  const fieldXml = fieldDoc ? serialize(fieldDoc) : '';
  const [compareXml, setCompareXml] = useState(false);
  const getItemLabel = (item) => {
    return item.craftercms?.label ?? itemsByPath?.[item.craftercms?.path]?.label ?? item.craftercms?.id ?? item.key;
  };
  const [cleanText, setCleanText] = useState(false);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showToolbar && (
        <FieldVersionToolbar
          field={field}
          contentTypeFields={contentTypeFields}
          compareXml={compareXml}
          setCompareXml={setCompareXml}
          onSelectField={onSelectField}
          actions={
            <>
              {!compareXml && field.type === 'html' && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCleanText(!cleanText);
                  }}
                >
                  {cleanText ? (
                    <FormattedMessage defaultMessage="Show HTML" />
                  ) : (
                    <FormattedMessage defaultMessage="Show text" />
                  )}
                </Button>
              )}
            </>
          }
        />
      )}
      <Box sx={{ flexGrow: 1, maxHeight: 'calc(100% - 60px)' }}>
        {compareXml ? (
          <MonacoWrapper contentA={fieldXml} isHTML={true} />
        ) : (
          <>
            {!content && field.type !== 'boolean' && field.type !== 'page-nav-order' ? (
              <Typography color="textSecondary">no content set</Typography>
            ) : field.type === 'html' ? (
              <MonacoWrapper contentA={content} isHTML={true} cleanText={cleanText} />
            ) : field.type === 'image' ? (
              <Box sx={{ textAlign: 'center' }}>
                <img src={content} alt="" />
                <Typography variant="subtitle2">{content}</Typography>
              </Box>
            ) : field.type === 'video-picker' ? (
              <Box sx={{ textAlign: 'center' }}>
                <AsyncVideoPlayer playerOptions={{ src: content, controls: true, width: 400 }} />
                <Typography variant="subtitle2">{content}</Typography>
              </Box>
            ) : field.type === 'time' ? (
              <Typography>
                {content ? convertTimeToTimezone(content, locale.dateTimeFormatOptions?.timeZone) : ''}
              </Typography>
            ) : field.type === 'date-time' ? (
              <Tooltip title={content}>
                <Typography>
                  {content
                    ? asLocalizedDateTime(new Date(content).getTime(), locale.localeCode, locale.dateTimeFormatOptions)
                    : ''}
                </Typography>
              </Tooltip>
            ) : field.type === 'boolean' || field.type === 'page-nav-order' ? (
              <Typography>
                {content ? (
                  <FormattedMessage defaultMessage="Checked" />
                ) : (
                  <FormattedMessage defaultMessage="Unchecked" />
                )}
              </Typography>
            ) : field.type === 'checkbox-group' ? (
              <Box>
                {content?.map((item) => <Typography key={item.key}>{`${item.value_smv} (${item.key})`}</Typography>)}
              </Box>
            ) : field.type === 'node-selector' ? (
              content?.map((item) => {
                return (
                  <Box
                    key={item.craftercms.path}
                    sx={{
                      padding: '4px 15px',
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderRadius: '10px',
                      alignItems: 'center',
                      color: (theme) => (theme.palette.mode === 'dark' ? palette.gray.dark7 : palette.gray.medium4),
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? palette.gray.medium4 : palette.gray.light1
                    }}
                  >
                    <Typography sx={{ fontSize: '14px' }}> {getItemLabel(item)}</Typography>
                  </Box>
                );
              })
            ) : field.type === 'repeat' ? (
              repItemView.item ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIosRounded />}
                    sx={{ mb: 2 }}
                    onClick={() => setRepItemView({ item: null, index: null })}
                    fullWidth
                  >
                    <FormattedMessage defaultMessage="Go back" />
                  </Button>
                  <Typography>
                    <FormattedMessage
                      defaultMessage="Viewing rep-group item {index}"
                      values={{ index: repItemView.index }}
                    />
                  </Typography>
                  {/* Iterate the rep-group item fields */}
                  {Object.values(field.fields).map((field) => (
                    <ViewFieldPanel
                      content={repItemView.item[field.id]}
                      field={field}
                      contentTypeFields={contentTypeFields}
                      xml={fieldXml}
                    />
                  ))}
                </>
              ) : (
                content?.map((item, index) => {
                  return (
                    <Box
                      key={index}
                      sx={{
                        padding: '4px 15px',
                        marginBottom: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderRadius: '10px',
                        alignItems: 'center',
                        cursor: 'pointer',
                        color: (theme) => (theme.palette.mode === 'dark' ? palette.gray.dark7 : palette.gray.medium4),
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? palette.gray.medium4 : palette.gray.light1
                      }}
                      onClick={() => setRepItemView({ item, index })}
                    >
                      <Typography sx={{ fontSize: '14px' }}>
                        <FormattedMessage defaultMessage="Item {index}" values={{ index }} />
                      </Typography>
                    </Box>
                  );
                })
              )
            ) : (
              content
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default ViewField;
