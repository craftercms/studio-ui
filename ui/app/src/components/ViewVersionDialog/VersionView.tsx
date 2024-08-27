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

import { ContentTypeField, ItemHistoryEntry, LookupTable } from '../../models';
import ContentType from '../../models/ContentType';
import ContentInstance from '../../models/ContentInstance';
import useLocale from '../../hooks/useLocale';
import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import { AsDayMonthDateTime } from '../VersionList';
import { FormattedMessage } from 'react-intl';
import { MonacoWrapper } from '../MonacoWrapper';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AsyncVideoPlayer from '../AsyncVideoPlayer';
import { asLocalizedDateTime, convertTimeToTimezone } from '../../utils/datetime';
import Tooltip from '@mui/material/Tooltip';
import React, { useState } from 'react';
import useItemsByPath from '../../hooks/useItemsByPath';
import palette from '../../styles/palette';
import ArrowBackIosRounded from '@mui/icons-material/ArrowBackIosRounded';
import Button from '@mui/material/Button';

interface ViewFieldPanelProps {
  content: any;
  field: ContentTypeField;
}

export function ViewFieldPanel(props: ViewFieldPanelProps) {
  const { content, field } = props;
  const locale = useLocale();
  const itemsByPath = useItemsByPath();
  const [repItemView, setRepItemView] = useState({
    item: null,
    index: null
  });

  const getItemLabel = (item) => {
    return item.craftercms?.label ?? itemsByPath?.[item.craftercms?.path]?.label ?? item.craftercms?.id ?? item.key;
  };

  return (
    <Accordion
      sx={{
        margin: 0,
        '&.Mui-expanded': {
          margin: 0,
          borderBottom: `1px solid rgba(0,0,0,0.12)`
        }
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          <Box component="span" sx={{ fontWeight: 600 }}>
            {field.name}
          </Box>{' '}
          ({field.id})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {field.type === 'html' ? (
          <MonacoWrapper contentA={content} isHTML={true} />
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
        ) : field.type === 'boolean' ? (
          <Typography>
            {content ? <FormattedMessage defaultMessage="Checked" /> : <FormattedMessage defaultMessage="Unchecked" />}
          </Typography>
        ) : field.type === 'checkbox-group' ? (
          <Box>
            {content.map((item) => (
              <Typography key={item.key}>{`${item.value_smv} (${item.key})`}</Typography>
            ))}
          </Box>
        ) : field.type === 'node-selector' ? (
          content.map((item) => {
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
                <ViewFieldPanel content={repItemView.item[field.id]} field={field} />
              ))}
            </>
          ) : (
            content.map((item, index) => {
              console.log('item', item);
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
        ) : typeof content === 'object' ? (
          JSON.stringify(content)
        ) : (
          (content ?? 'unset')
        )}
      </AccordionDetails>
    </Accordion>
  );
}

interface VersionViewProps {
  version: ItemHistoryEntry;
  contentTypes: LookupTable<ContentType>;
  content: ContentInstance;
  xml: string;
  showXml: boolean;
}

export function VersionView(props: VersionViewProps) {
  const { version, contentTypes, content, xml, showXml } = props;
  const values = Object.values(contentTypes[content.craftercms.contentTypeId].fields) as ContentTypeField[];
  return (
    <>
      <Box component="section" sx={{ margin: '0 10px 10px 10px' }}>
        <ListItemText
          primary={<AsDayMonthDateTime date={version.modifiedDate} />}
          secondary={
            <FormattedMessage
              id="historyDialog.versionNumber"
              defaultMessage="Version: <span>{versionNumber}</span>"
              values={{
                versionNumber: version.versionNumber,
                span: (msg) => <span>{msg}</span>
              }}
            />
          }
        />
      </Box>
      <Box component="section">
        {showXml ? (
          <MonacoWrapper contentA={xml} isHTML={false} sxs={{ editor: { height: '400px' } }} />
        ) : contentTypes ? (
          values.map((field, index) => <ViewFieldPanel key={index} content={content?.[field.id]} field={field} />)
        ) : null}
      </Box>
    </>
  );
}

export default VersionView;
