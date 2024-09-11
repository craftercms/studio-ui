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
import Accordion from '@mui/material/Accordion';
import AccordionSummary, { accordionSummaryClasses } from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/KeyboardArrowDown';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import { getContentInstanceValueFromProp } from '../../utils/content';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import useLocale from '../../hooks/useLocale';
import { asLocalizedDateTime, convertTimeToTimezone } from '../../utils/datetime';
import AsyncVideoPlayer from '../AsyncVideoPlayer';
import { ItemHistoryEntry } from '../../models';
import CodeRounded from '@mui/icons-material/CodeRounded';
import { fromString, serialize } from '../../utils/xml';
import { MonacoWrapper } from '../MonacoWrapper';
import ContentInstanceComponents from './ContentInstanceComponents';
import RepeatGroupItems from './RepeatGroupItems';
import { hasFieldChanged } from './utils';
import Button from '@mui/material/Button';

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
            {contentTypes && values.map((field) => <CompareFieldPanel a={a} b={b} field={field} key={field.id} />)}
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

function CompareVersionsDetailsContainer(props: CompareVersionsDetailsContainerProps) {
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
  accordion?: boolean;
}

export function CompareFieldPanel(props: CompareFieldPanelProps) {
  const { a, b, field, accordion } = props;
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

  useMount(() => {
    setUnChanged(!hasFieldChanged(field, contentA, contentB));
  });

  const ContainerComponent = (accordion ? Accordion : Box) as React.ElementType;
  const containerProps = accordion
    ? {
        sx: {
          margin: 0,
          border: 0,
          boxShadow: 'none',
          '&.Mui-expanded': {
            margin: 0,
            borderBottom: '1px solid rgba(0,0,0,0.12)'
          }
        },
        slotProps: {
          transition: { mountOnEnter: true }
        }
      }
    : { sx: { p: 2 } };
  const HeaderComponent = (accordion ? AccordionSummary : Box) as React.ElementType;
  const headerProps = accordion
    ? {
        expandIcon: <ExpandMoreIcon />,
        sx: { [`.${accordionSummaryClasses.content}`]: { justifyContent: 'space-between', alignItems: 'center' } }
      }
    : { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 } };
  const ContentComponent = accordion ? AccordionDetails : Box;
  const contentProps = accordion ? { sx: { height: '200px' } } : { sx: { height: '600px' } };
  const [cleanText, setCleanText] = useState(false);

  return !unChanged ? (
    <ContainerComponent {...containerProps}>
      <HeaderComponent {...headerProps}>
        <Typography>
          <Box component="span" sx={{ fontWeight: 600 }}>
            {field.name}{' '}
          </Box>
          ({field.id})
        </Typography>
        {(fieldType === 'node-selector' || fieldType === 'repeat') && (
          <Tooltip
            title={
              compareXml ? (
                <FormattedMessage defaultMessage="Compare content" />
              ) : (
                <FormattedMessage defaultMessage="Compare xml" />
              )
            }
          >
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setCompareXml(!compareXml);
              }}
            >
              <CodeRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {fieldType === 'html' && (
          <Button
            variant="outlined"
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
      </HeaderComponent>
      <ContentComponent {...contentProps}>
        {fieldType === 'text' || fieldType === 'textarea' || fieldType === 'html' ? (
          <MonacoWrapper
            contentA={contentA}
            contentB={contentB}
            isDiff
            isHTML={fieldType === 'html'}
            cleanText={cleanText}
          />
        ) : fieldType === 'node-selector' ? (
          compareXml ? (
            <MonacoWrapper contentA={aFieldXml} contentB={bFieldXml} isDiff isHTML={false} />
          ) : (
            <ContentInstanceComponents contentA={contentA} contentB={contentB} />
          )
        ) : fieldType === 'checkbox-group' ? (
          <MonacoWrapper
            contentA={(contentA ?? []).map((item) => `${item.value_smv} (${item.key})`).join('\n')}
            contentB={(contentB ?? []).map((item) => `${item.value_smv} (${item.key})`).join('\n')}
            isDiff
          />
        ) : fieldType === 'repeat' ? (
          compareXml ? (
            <MonacoWrapper contentA={aFieldXml} contentB={bFieldXml} isHTML={false} isDiff />
          ) : (
            <RepeatGroupItems
              contentA={contentA}
              contentB={contentB}
              aXml={aFieldXml}
              bXml={bFieldXml}
              fields={field.fields}
            />
          )
        ) : (
          <CompareVersionsDetailsContainer
            contentA={contentA}
            contentB={contentB}
            renderContent={(content) =>
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
                <Typography>
                  {content ? convertTimeToTimezone(content, locale.dateTimeFormatOptions?.timeZone) : ''}
                </Typography>
              ) : fieldType === 'date-time' ? (
                <Tooltip title={content}>
                  <Typography>
                    {content
                      ? asLocalizedDateTime(
                          new Date(content).getTime(),
                          locale.localeCode,
                          locale.dateTimeFormatOptions
                        )
                      : ''}
                  </Typography>
                </Tooltip>
              ) : fieldType === 'boolean' ? (
                <Typography>
                  {content ? (
                    <FormattedMessage defaultMessage="Checked" />
                  ) : (
                    <FormattedMessage defaultMessage="Unchecked" />
                  )}
                </Typography>
              ) : fieldType === 'checkbox-group' ? (
                <Box>
                  {content.map((item) => (
                    <Typography>{item.key}</Typography>
                  ))}
                </Box>
              ) : (
                <Box>{JSON.stringify(content)}</Box>
              )
            }
          />
        )}
      </ContentComponent>
    </ContainerComponent>
  ) : (
    <></>
  );
}

export default CompareVersions;
