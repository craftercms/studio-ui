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

import { ContentTypeField } from '../../models/ContentType';
import React, { ElementType, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { getContentInstanceValueFromProp } from '../../utils/content';
import Tooltip from '@mui/material/Tooltip';
import useLocale from '../../hooks/useLocale';
import { asLocalizedDateTime, convertUtcTimeToTimezone } from '../../utils/datetime';
import AsyncVideoPlayer from '../AsyncVideoPlayer';
import { fromString, serialize } from '../../utils/xml';
import { MonacoWrapper } from '../MonacoWrapper';
import ContentInstanceComponents from './FieldsTypesDiffViews/ContentInstanceComponents';
import RepeatGroupItems from './FieldsTypesDiffViews/RepeatGroupItems';
import { hasFieldChanged, SelectionContentVersion } from './utils';
import ContentFieldView from '../ViewVersionDialog/ContentFieldView';
import { countLines } from '../../utils/string';
import { ErrorBoundary } from '../ErrorBoundary';
import { initialFieldViewState, useVersionsDialogContext } from './VersionsDialogContext';
import DefaultFieldDiffView from './FieldsTypesDiffViews/DefaultFieldDiffView';

export interface CompareFieldPanelProps {
  a: SelectionContentVersion;
  b: SelectionContentVersion;
  field: ContentTypeField;
  contentTypeFields: ContentTypeField[];
  accordion?: boolean;
  dynamicHeight?: boolean;
  onSelectField?(field: ContentTypeField): void;
  showFieldsNavigation?: boolean;
}

export const typesDiffMap: Record<string, ElementType> = {
  text: MonacoWrapper,
  textarea: MonacoWrapper,
  html: MonacoWrapper,
  'node-selector': ContentInstanceComponents,
  'checkbox-group': MonacoWrapper,
  repeat: RepeatGroupItems,
  image: DefaultFieldDiffView,
  'video-picker': DefaultFieldDiffView,
  time: DefaultFieldDiffView,
  'date-time': DefaultFieldDiffView,
  boolean: DefaultFieldDiffView,
  'numeric-input': DefaultFieldDiffView,
  dropdown: DefaultFieldDiffView
};

export function CompareFieldPanel(props: CompareFieldPanelProps) {
  const { a, b, field, contentTypeFields, onSelectField, showFieldsNavigation = true, dynamicHeight } = props;
  const [unchanged, setUnchanged] = useState<boolean>(true);
  const fieldType = field.type;
  const locale = useLocale();
  const versionAXmlDoc = fromString(a.xml);
  const versionBXmlDoc = fromString(b.xml);
  const versionAFieldDoc =
    versionAXmlDoc.querySelector(`page > ${field.id}`) ??
    versionAXmlDoc.querySelector(`component > ${field.id}`) ??
    versionAXmlDoc.querySelector(`item > ${field.id}`);
  const versionBFieldDoc =
    versionBXmlDoc.querySelector(`page > ${field.id}`) ??
    versionBXmlDoc.querySelector(`component > ${field.id}`) ??
    versionBXmlDoc.querySelector(`item > ${field.id}`);
  const versionAFieldXml = versionAFieldDoc ? serialize(versionAFieldDoc) : '';
  const versionBFieldXml = versionBFieldDoc ? serialize(versionBFieldDoc) : '';
  const contentA = getContentInstanceValueFromProp(a.content, field.id);
  const contentB = getContentInstanceValueFromProp(b.content, field.id);
  const longerXmlContent = versionAFieldXml.length > versionBFieldXml.length ? versionAFieldXml : versionBFieldXml;
  const monacoEditorHeight = dynamicHeight ? (countLines(longerXmlContent) < 15 ? '200px' : '600px') : '100%';
  const DiffComponent = typesDiffMap[fieldType] ?? DefaultFieldDiffView;
  const [{ fieldsViewState }, contextApiRef] = useVersionsDialogContext();
  const viewState = fieldsViewState[field.id] ?? initialFieldViewState;
  const { compareXml, cleanText, xmlEditorOptions, compareMode } = viewState;
  const setCompareModeDisabled = useMemo(
    () => (disabled: boolean) => {
      contextApiRef.current.setFieldViewState(field.id, {
        compareModeDisabled: disabled
      });
    },
    [contextApiRef, field.id]
  );
  const diffComponentProps = {
    contentA:
      fieldType !== 'checkbox-group'
        ? contentA
        : (contentA ?? []).map((item) => `${item.value_smv} (${item.key})`).join('\n'),
    contentB:
      fieldType !== 'checkbox-group'
        ? contentB
        : (contentB ?? []).map((item) => `${item.value_smv} (${item.key})`).join('\n'),
    aXml: versionAFieldXml,
    bXml: versionBFieldXml,
    isDiff: true,
    isHTML: fieldType === 'html',
    fields: field.fields,
    cleanText,
    compareMode,
    verticalLayout: fieldType === 'image' || fieldType === 'video-picker',
    renderContent: null,
    field,
    setCompareModeDisabled,
    editorProps: { options: xmlEditorOptions, height: monacoEditorHeight }
  };

  if (DiffComponent === DefaultFieldDiffView) {
    diffComponentProps.renderContent = (content) =>
      fieldType === 'image' ? (
        <Box sx={{ height: 'calc(50% - 9px)', textAlign: 'center' }}>
          <img src={content} alt="" style={{ maxHeight: 'calc(100% - 20px)' }} />
          <Typography variant="subtitle2">{content}</Typography>
        </Box>
      ) : fieldType === 'video-picker' ? (
        <Box sx={{ textAlign: 'center' }}>
          <AsyncVideoPlayer playerOptions={{ src: content, controls: true, width: 400 }} />
        </Box>
      ) : fieldType === 'time' ? (
        <Typography>
          {content ? convertUtcTimeToTimezone(content, locale.dateTimeFormatOptions?.timeZone) : ''}
        </Typography>
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
    setUnchanged(!hasFieldChanged(field, contentA, contentB));
  }, [contentA, contentB, field]);

  return (
    <Box height="calc(100% - 70px)" display="flex" flexDirection="column">
      {unchanged ? (
        <ContentFieldView
          content={contentA}
          field={field}
          contentTypeFields={contentTypeFields}
          xml={a.xml}
          onSelectField={onSelectField}
          showToolbarFieldNavigation={showFieldsNavigation}
          dynamicHeight={dynamicHeight}
        />
      ) : (
        <>
          {compareXml ? (
            <MonacoWrapper
              contentA={versionAFieldXml}
              contentB={versionBFieldXml}
              isDiff
              isHTML={false}
              editorProps={diffComponentProps.editorProps}
            />
          ) : (
            <ErrorBoundary key={field.id}>
              <DiffComponent {...diffComponentProps} />
            </ErrorBoundary>
          )}
        </>
      )}
    </Box>
  );
}

export default CompareFieldPanel;
