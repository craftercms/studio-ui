/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import ContentInstance from '../../models/ContentInstance';
import { LookupTable } from '../../models/LookupTable';
import ContentType, { ContentTypeField } from '../../models/ContentType';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ListItemText from '@mui/material/ListItemText';
import { AsDayMonthDateTime } from '../VersionList';
import Paper from '@mui/material/Paper';
import useMount from '../../hooks/useMount';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { getContentInstanceValueFromProp } from '../../utils/content';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import useLocale from '../../hooks/useLocale';
import { asLocalizedDateTime, convertTimeToTimezone } from '../../utils/datetime';
import AsyncVideoPlayer from '../AsyncVideoPlayer';
import { ItemHistoryEntry } from '../../models';
import { fromString, serialize } from '../../utils/xml';
import { MonacoWrapper } from '../MonacoWrapper';
import ContentInstanceComponents from './FieldsTypesDiffViews/ContentInstanceComponents';
import RepeatGroupItems from './FieldsTypesDiffViews/RepeatGroupItems';
import { hasFieldChanged } from './utils';
import Button from '@mui/material/Button';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import Divider from '@mui/material/Divider';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export interface CompareVersionsItem extends ItemHistoryEntry {
  xml: string;
  content: ContentInstance;
}

interface CompareVersionsProps {
  a: CompareVersionsItem;
  b: CompareVersionsItem;
  contentTypeId: string;
  contentTypes: LookupTable<ContentType>;
  compareXml: boolean;
}

export function CompareVersions(props: CompareVersionsProps) {
  const { a, b, contentTypes, contentTypeId, compareXml } = props;
  const values = Object.values(contentTypes[contentTypeId].fields) as ContentTypeField[];

  return (
    <Box
      sx={{
        p: 1,
        background: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.background.default
      }}
    >
      <Box
        component="section"
        sx={{
          display: 'flex',
          justifyContent: 'space-around'
        }}
      >
        <Box
          sx={{
            flexBasis: '50%',
            margin: '0 10px 10px 10px',
            '& .primaryText': {
              color: (theme) => theme.palette.text.primary
            }
          }}
        >
          <ListItemText
            primary={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <AsDayMonthDateTime date={a.modifiedDate} />
              </Box>
            }
            secondary={
              <FormattedMessage
                id="historyDialog.versionNumber"
                defaultMessage="Version: <span>{versionNumber}</span>"
                values={{
                  versionNumber: a.versionNumber,
                  span: (msg) => <span className="primaryText">{msg}</span>
                }}
              />
            }
          />
        </Box>
        <Box
          sx={{
            flexBasis: '50%',
            margin: '0 10px 10px 10px',
            '& .primaryText': {
              color: (theme) => theme.palette.text.primary
            }
          }}
        >
          <ListItemText
            primary={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <AsDayMonthDateTime date={b.modifiedDate} />
              </Box>
            }
            secondary={
              <FormattedMessage
                id="historyDialog.versionNumber"
                defaultMessage="Version: <span>{versionNumber}</span>"
                values={{
                  versionNumber: b.versionNumber,
                  span: (msg) => <span className="primaryText">{msg}</span>
                }}
              />
            }
          />
        </Box>
      </Box>
      <Box
        component="section"
        sx={{
          background: (theme) => theme.palette.background.paper
        }}
      >
        {compareXml ? (
          <MonacoWrapper
            contentA={a.xml}
            contentB={b.xml}
            isHTML={false}
            isDiff
            sxs={{ editor: { height: '400px' } }}
          />
        ) : (
          <Paper>
            {/* {contentTypes && values.map((field) => <CompareFieldPanel a={a} b={b} field={field} key={field.id} />)}*/}
          </Paper>
        )}
      </Box>
    </Box>
  );
}

interface CompareVersionsDetailsContainerProps {
  contentA: ContentInstance;
  contentB: ContentInstance;
  renderContent: (content) => React.ReactNode;
  noContent?: React.ReactNode;
}

function DefaultDiffView(props: CompareVersionsDetailsContainerProps) {
  const {
    contentA,
    contentB,
    renderContent,
    noContent = (
      <Box>
        <Typography color="textSecondary">no content set</Typography>
      </Box>
    )
  } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        '& img': {
          maxHeight: '200px'
        }
      }}
    >
      {contentA ? renderContent(contentA) : noContent}
      {contentB ? renderContent(contentB) : noContent}
    </Box>
  );
}

interface CompareFieldPanelProps {
  a: {
    xml: string;
    content: ContentInstance;
  };
  b: {
    xml: string;
    content: ContentInstance;
  };
  field: ContentTypeField;
  contentTypeFields: ContentTypeField[];
  accordion?: boolean;
  onSelectNextField?: (fieldId: string) => void;
  onSelectPreviousField?: (fieldId: string) => void;
}

const typesDiffMap = {
  text: MonacoWrapper,
  textarea: MonacoWrapper,
  html: MonacoWrapper,
  'node-selector': ContentInstanceComponents,
  'checkbox-group': MonacoWrapper,
  repeat: RepeatGroupItems,
  image: DefaultDiffView,
  'video-picker': DefaultDiffView,
  time: DefaultDiffView,
  'date-time': DefaultDiffView,
  boolean: DefaultDiffView,
  'numeric-input': DefaultDiffView,
  dropdown: DefaultDiffView
};

export function CompareFieldPanel(props: CompareFieldPanelProps) {
  const { a, b, field, contentTypeFields, onSelectNextField, onSelectPreviousField } = props;
  const [unChanged, setUnChanged] = useState(true);
  const fieldType = field.type;
  const locale = useLocale();
  const [compareXml, setCompareXml] = useState(false);
  const aFieldDoc =
    fromString(a.xml).querySelector(`page > ${field.id}`) ?? fromString(a.xml).querySelector(`component > ${field.id}`);
  const bFieldDoc =
    fromString(b.xml).querySelector(`page > ${field.id}`) ?? fromString(b.xml).querySelector(`component > ${field.id}`);
  const aFieldXml = aFieldDoc ? serialize(aFieldDoc) : '';
  const bFieldXml = bFieldDoc ? serialize(bFieldDoc) : '';
  const contentA = getContentInstanceValueFromProp(a.content, field.id);
  const contentB = getContentInstanceValueFromProp(b.content, field.id);
  const currentFieldIndex = contentTypeFields.findIndex((f) => f.id === field.id);
  const nextField = contentTypeFields[currentFieldIndex + 1] || contentTypeFields[0];
  const previousField = contentTypeFields[currentFieldIndex - 1] || contentTypeFields[contentTypeFields.length - 1];
  const [cleanText, setCleanText] = useState(false);
  const showDivider = (fieldType === 'html' || fieldType === 'repeat') && !compareXml;

  const DiffComponent = typesDiffMap[fieldType] ?? DefaultDiffView;
  const diffComponentProps = {
    contentA:
      fieldType !== 'checkbox-group'
        ? contentA
        : (contentA ?? []).map((item) => `${item.value_smv} (${item.key})`).join('\n'),
    contentB:
      fieldType !== 'checkbox-group'
        ? contentB
        : (contentB ?? []).map((item) => `${item.value_smv} (${item.key})`).join('\n'),
    aXml: aFieldXml,
    bXml: bFieldXml,
    isDiff: true,
    isHTML: fieldType === 'html',
    fields: field.fields,
    cleanText,
    renderContent: null
  };

  if (DiffComponent === DefaultDiffView) {
    diffComponentProps.renderContent = (content) =>
      fieldType === 'image' ? (
        <Box sx={{ textAlign: 'center' }}>
          <img src={content} alt="" />
          <Typography variant="subtitle2">{content}</Typography>
        </Box>
      ) : fieldType === 'video-picker' ? (
        <Box sx={{ textAlign: 'center' }}>
          <AsyncVideoPlayer playerOptions={{ src: content, controls: true, width: 400 }} />
          <Typography variant="subtitle2">{content}</Typography>
        </Box>
      ) : fieldType === 'time' ? (
        <Typography>{content ? convertTimeToTimezone(content, locale.dateTimeFormatOptions?.timeZone) : ''}</Typography>
      ) : fieldType === 'date-time' ? (
        <Tooltip title={content}>
          <Typography>
            {content
              ? asLocalizedDateTime(new Date(content).getTime(), locale.localeCode, locale.dateTimeFormatOptions)
              : ''}
          </Typography>
        </Tooltip>
      ) : fieldType === 'boolean' ? (
        <Typography>
          {content ? <FormattedMessage defaultMessage="Checked" /> : <FormattedMessage defaultMessage="Unchecked" />}
        </Typography>
      ) : fieldType === 'checkbox-group' ? (
        <Box>
          {content.map((item) => (
            <Typography>{item.key}</Typography>
          ))}
        </Box>
      ) : (
        <Box>{JSON.stringify(content)}</Box>
      );
  }

  useMount(() => {
    setUnChanged(!hasFieldChanged(field, contentA, contentB));
  });

  return !unChanged ? (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {contentTypeFields.length > 1 && (
          <Button startIcon={<ChevronLeftRoundedIcon />} onClick={() => onSelectPreviousField(field.id)}>
            {previousField.name}
          </Button>
        )}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexGrow: 1,
            pb: 1,
            pt: 1,
            pl: 2,
            pr: 2,
            ml: 2,
            mr: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`
          }}
        >
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 'bold' }}>{field.name}</Typography>
            <InfoOutlinedIcon sx={{ ml: 2, color: (theme) => theme.palette.text.secondary }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!compareXml && fieldType === 'html' && (
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
            {/* TODO: compare button for repeat-group diff */}
            {/* <Button>
              <FormattedMessage defaultMessage="Compare" />
            </Button> */}
            {showDivider && (
              <Divider orientation="vertical" sx={{ display: 'inline-flex', height: '25px', ml: 2, mr: 2 }} />
            )}
            <IconButton size="small" onClick={() => setCompareXml(false)} color={compareXml ? 'default' : 'primary'}>
              <TextSnippetOutlinedIcon />
            </IconButton>
            <IconButton size="small" onClick={() => setCompareXml(true)} color={compareXml ? 'primary' : 'default'}>
              <CodeOutlinedIcon />
            </IconButton>
          </Box>
        </Paper>
        {contentTypeFields.length > 1 && (
          <Button endIcon={<NavigateNextRoundedIcon />} onClick={() => onSelectNextField(field.id)}>
            {nextField.name}
          </Button>
        )}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {compareXml ? (
          <MonacoWrapper contentA={aFieldXml} contentB={bFieldXml} isDiff isHTML={false} />
        ) : (
          <DiffComponent {...diffComponentProps} />
        )}
      </Box>
    </Box>
  ) : (
    <></>
  );
}

export default CompareVersions;
