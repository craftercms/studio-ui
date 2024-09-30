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
import { ContentTypeField } from '../../models/ContentType';
import React, { RefObject, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { getContentInstanceValueFromProp } from '../../utils/content';
import Tooltip from '@mui/material/Tooltip';
import useLocale from '../../hooks/useLocale';
import { asLocalizedDateTime, convertTimeToTimezone } from '../../utils/datetime';
import AsyncVideoPlayer from '../AsyncVideoPlayer';
import { fromString, serialize } from '../../utils/xml';
import { MonacoWrapper } from '../MonacoWrapper';
import ContentInstanceComponents from './FieldsTypesDiffViews/ContentInstanceComponents';
import RepeatGroupItems from './FieldsTypesDiffViews/RepeatGroupItems';
import { CompareVersionsDialogProps, hasFieldChanged } from './utils';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CompareArrowsIcon from '@mui/icons-material/CompareArrowsRounded';
import FieldVersionToolbar from './FieldVersionToolbar';
import { ViewVersionDialogProps } from '../ViewVersionDialog/utils';
import useMonacoOptions from '../../hooks/useMonacoOptions';
import ViewField from '../ViewVersionDialog/ViewField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary, { accordionSummaryClasses } from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import AccordionDetails from '@mui/material/AccordionDetails';
import { countLines } from '../../utils/string';
import { ErrorBoundary } from '../ErrorBoundary';

interface CompareVersionsDetailsContainerProps {
  contentA: ContentInstance;
  contentB: ContentInstance;
  renderContent: (content) => React.ReactNode;
  noContent?: React.ReactNode;
  verticalLayout?: boolean;
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
  dynamicHeight?: boolean;
  onSelectField?(field: ContentTypeField): void;
  setCompareSubDialogState?(props: CompareVersionsDialogProps): void;
  setViewSubDialogState?(props: ViewVersionDialogProps): void;
  showFieldsNavigation?: boolean;
}

interface CompareFieldPanelAccordionProps extends CompareFieldPanelProps {
  selected: boolean;
  fieldRef: RefObject<HTMLDivElement>;
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

function DefaultDiffView(props: CompareVersionsDetailsContainerProps) {
  const {
    contentA,
    contentB,
    renderContent,
    noContent = (
      <Box>
        <Typography color="textSecondary">no content set</Typography>
      </Box>
    ),
    verticalLayout = false
  } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        alignItems: verticalLayout ? 'center' : 'flex-start',
        justifyContent: 'space-around',
        flexDirection: verticalLayout ? 'column' : 'row',
        '> div': {
          flexGrow: verticalLayout && 1
        }
      }}
    >
      {contentA ? renderContent(contentA) : noContent}
      {verticalLayout && <Divider sx={{ width: '100%', mt: 1, mb: 1 }} />}
      {contentB ? renderContent(contentB) : noContent}
    </Box>
  );
}

export function CompareFieldPanel(props: CompareFieldPanelProps) {
  const {
    a,
    b,
    field,
    contentTypeFields,
    onSelectField,
    setCompareSubDialogState,
    setViewSubDialogState,
    showFieldsNavigation = true,
    dynamicHeight
  } = props;
  const [unChanged, setUnChanged] = useState(true);
  const fieldType = field.type;
  const locale = useLocale();
  const [compareXml, setCompareXml] = useState(false);
  const aFieldDoc =
    fromString(a.xml).querySelector(`page > ${field.id}`) ??
    fromString(a.xml).querySelector(`component > ${field.id}`) ??
    fromString(a.xml).querySelector(`item > ${field.id}`);
  const bFieldDoc =
    fromString(b.xml).querySelector(`page > ${field.id}`) ??
    fromString(b.xml).querySelector(`component > ${field.id}`) ??
    fromString(b.xml).querySelector(`item > ${field.id}`);
  const aFieldXml = aFieldDoc ? serialize(aFieldDoc) : '';
  const bFieldXml = bFieldDoc ? serialize(bFieldDoc) : '';
  const contentA = getContentInstanceValueFromProp(a.content, field.id);
  const contentB = getContentInstanceValueFromProp(b.content, field.id);
  const [cleanText, setCleanText] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareModeDisabled, setCompareModeDisabled] = useState(false);
  const {
    options: xmlEditorOptions,
    toggleIgnoreTrimWhitespace,
    toggleRenderSideBySide,
    toggleDiffWordWrap
  } = useMonacoOptions();
  const longerXmlContent = aFieldXml.length > bFieldXml.length ? aFieldXml : bFieldXml;
  const monacoEditorHeight = !dynamicHeight ? '100%' : countLines(longerXmlContent) < 15 ? '200px' : '600px';
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
    compareMode,
    verticalLayout: fieldType === 'image' || fieldType === 'video-picker',
    renderContent: null,
    field,
    setCompareSubDialogState,
    setViewSubDialogState,
    setCompareModeDisabled,
    editorProps: { options: xmlEditorOptions, height: monacoEditorHeight }
  };

  if (DiffComponent === DefaultDiffView) {
    diffComponentProps.renderContent = (content) =>
      fieldType === 'image' ? (
        <Box sx={{ height: 'calc(50% - 9px)', textAlign: 'center' }}>
          <img src={content} alt="" style={{ maxHeight: '100%' }} />
        </Box>
      ) : fieldType === 'video-picker' ? (
        <Box sx={{ textAlign: 'center' }}>
          <AsyncVideoPlayer playerOptions={{ src: content, controls: true, width: 400 }} />
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

  useEffect(() => {
    setUnChanged(!hasFieldChanged(field, contentA, contentB));
  }, [contentA, contentB, field]);

  return !unChanged ? (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <FieldVersionToolbar
        field={field}
        contentTypeFields={contentTypeFields}
        compareXml={compareXml}
        setCompareXml={setCompareXml}
        showCleanText={cleanText}
        setShowCleanText={setCleanText}
        onSelectField={onSelectField}
        showFieldsNavigation={showFieldsNavigation}
        actions={
          <>
            {!compareXml && fieldType === 'repeat' && (
              <Button
                onClick={() => setCompareMode(!compareMode)}
                startIcon={<CompareArrowsIcon />}
                disabled={compareModeDisabled}
              >
                <FormattedMessage defaultMessage="Compare" />
              </Button>
            )}
            {(compareXml || typesDiffMap[fieldType] === MonacoWrapper) && (
              <>
                <Button onClick={() => toggleIgnoreTrimWhitespace()}>
                  {xmlEditorOptions.ignoreTrimWhitespace ? (
                    <FormattedMessage defaultMessage="Show whitespace" />
                  ) : (
                    <FormattedMessage defaultMessage="Hide whitespace" />
                  )}
                </Button>
                <Button onClick={() => toggleRenderSideBySide()}>
                  {xmlEditorOptions.renderSideBySide ? (
                    <FormattedMessage defaultMessage="Unified view" />
                  ) : (
                    <FormattedMessage defaultMessage="Split view" />
                  )}
                </Button>
                <Button onClick={() => toggleDiffWordWrap()}>
                  {xmlEditorOptions.diffWordWrap === 'on' ? (
                    <FormattedMessage defaultMessage="No Wrap" />
                  ) : (
                    <FormattedMessage defaultMessage="Wrap" />
                  )}
                </Button>
              </>
            )}
          </>
        }
      />
      <Box sx={{ flexGrow: 1, maxHeight: 'calc(100% - 60px)' }}>
        {compareXml ? (
          <MonacoWrapper
            contentA={aFieldXml}
            contentB={bFieldXml}
            isDiff
            isHTML={false}
            editorProps={diffComponentProps.editorProps}
          />
        ) : (
          <ErrorBoundary key={field.id}>
            <DiffComponent {...diffComponentProps} />
          </ErrorBoundary>
        )}
      </Box>
    </Box>
  ) : (
    <ViewField
      content={contentA}
      field={field}
      contentTypeFields={contentTypeFields}
      xml={a.xml}
      onSelectField={onSelectField}
      setViewSubDialogState={setViewSubDialogState}
      showToolbarFieldNavigation={showFieldsNavigation}
      dynamicHeight={dynamicHeight}
    />
  );
}

export function CompareFieldPanelAccordion(props: CompareFieldPanelAccordionProps) {
  const { fieldRef, selected, ...rest } = props;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (selected) {
      setExpanded(true);
    }
  }, [selected, setExpanded]);

  return (
    <Accordion
      ref={fieldRef}
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        margin: 0,
        border: 0,
        boxShadow: 'none',
        '&.Mui-expanded': {
          margin: 0,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`
        }
      }}
      slotProps={{ transition: { mountOnEnter: true } }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ [`.${accordionSummaryClasses.content}`]: { justifyContent: 'space-between', alignItems: 'center' } }}
      >
        <Typography>
          <Box component="span" sx={{ fontWeight: 600 }}>
            {props.field.name}{' '}
          </Box>
          ({props.field.id})
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ maxHeight: '600px' }}>
        <CompareFieldPanel {...rest} showFieldsNavigation={false} dynamicHeight />
      </AccordionDetails>
    </Accordion>
  );
}

export default CompareFieldPanel;
