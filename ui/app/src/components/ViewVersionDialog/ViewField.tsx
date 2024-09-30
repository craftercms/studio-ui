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
import Button from '@mui/material/Button';
import React, { useState } from 'react';
import useItemsByPath from '../../hooks/useItemsByPath';
import useLocale from '../../hooks/useLocale';
import FieldVersionToolbar from '../CompareVersionsDialog/FieldVersionToolbar';
import { fromString, serialize } from '../../utils/xml';
import useMonacoOptions from '../../hooks/useMonacoOptions';
import { nnou } from '../../utils/object';
import StateItem from '../CompareVersionsDialog/FieldsTypesDiffViews/StateItem';
import { ViewVersionDialogProps } from './utils';
import ContentInstance from '../../models/ContentInstance';
import useSelection from '../../hooks/useSelection';
import { countLines } from '../../utils/string';

interface ViewFieldProps {
  content: any;
  field: ContentTypeField;
  xml?: string;
  showToolbar?: boolean;
  contentTypeFields: ContentTypeField[];
  showToolbarFieldNavigation?: boolean;
  dynamicHeight?: boolean;
  onSelectField?(field: ContentTypeField): void;
  setViewSubDialogState?(props: Partial<ViewVersionDialogProps>): void;
}

const typesRenderMap = {
  text: MonacoWrapper,
  textarea: MonacoWrapper,
  html: MonacoWrapper,
  'node-selector': DefaultView,
  'checkbox-group': DefaultView,
  repeat: DefaultView,
  image: DefaultView,
  'video-picker': DefaultView,
  time: DefaultView,
  'date-time': DefaultView,
  boolean: DefaultView,
  'numeric-input': DefaultView,
  dropdown: DefaultView
};

interface DefaultViewProps {
  field: ContentTypeField;
  contentA: any;
  xml: string;
  setViewSubDialogState?(props: Partial<ViewVersionDialogProps>): void;
}

function DefaultView(props: DefaultViewProps) {
  const { field, contentA: content, xml, setViewSubDialogState } = props;
  const fieldType = field.type;
  const locale = useLocale();
  const itemsByPath = useItemsByPath();
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const getItemLabel = (item) => {
    return item.craftercms?.label ?? itemsByPath?.[item.craftercms?.path]?.label ?? item.craftercms?.id ?? item.key;
  };

  const isEmbedded = (item: ContentInstance) => {
    return item?.craftercms && !item.craftercms.path;
  };

  const onSelectStateItem = (item) => {
    const isEmbeddedComponent = isEmbedded(item);
    const fields = isEmbeddedComponent ? contentTypesBranch.byId[item.craftercms.contentTypeId].fields : field.fields;

    setViewSubDialogState({
      open: true,
      data: {
        content: item,
        xml,
        fields
      },
      title: field.name,
      subtitle: <FormattedMessage defaultMessage="{fieldId} - Repeat Group" values={{ fieldId: field.id }} />,
      onClose: () => setViewSubDialogState({ open: false })
    });
  };

  return (
    <>
      {(!content && fieldType !== 'boolean' && fieldType !== 'page-nav-order') || content?.length === 0 ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography color="textSecondary">no content set</Typography>
        </Box>
      ) : fieldType === 'image' ? (
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
        <Box sx={{ textAlign: 'center' }}>
          <Typography>
            {content ? convertTimeToTimezone(content, locale.dateTimeFormatOptions?.timeZone) : ''}
          </Typography>
        </Box>
      ) : fieldType === 'date-time' ? (
        <Box sx={{ textAlign: 'center' }}>
          <Tooltip title={content}>
            <Typography>
              {content
                ? asLocalizedDateTime(new Date(content).getTime(), locale.localeCode, locale.dateTimeFormatOptions)
                : ''}
            </Typography>
          </Tooltip>
        </Box>
      ) : fieldType === 'boolean' || field.type === 'page-nav-order' ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography>
            {content ? <FormattedMessage defaultMessage="Checked" /> : <FormattedMessage defaultMessage="Unchecked" />}
          </Typography>
        </Box>
      ) : fieldType === 'checkbox-group' ? (
        <Box sx={{ textAlign: 'center' }}>
          {content?.map((item) => <Typography key={item.key}>{`${item.value_smv} (${item.key})`}</Typography>)}
        </Box>
      ) : fieldType === 'node-selector' || fieldType === 'repeat' ? (
        <Box component="section" sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1100px', gap: '10px' }}>
            {fieldType === 'node-selector'
              ? content?.map((item) => (
                  <StateItem
                    key={item.craftercms.path}
                    state="unchanged"
                    label={
                      <>
                        {getItemLabel(item)}
                        <Box component="span" ml={1}>
                          {item.craftercms && isEmbedded(item) ? (
                            <FormattedMessage defaultMessage="(Embedded)" />
                          ) : (
                            (item.craftercms?.path ?? item.value)
                          )}
                        </Box>
                      </>
                    }
                    disableHighlight={!isEmbedded(item)}
                    hideState
                    onSelect={() => {
                      if (isEmbedded(item)) {
                        onSelectStateItem(item);
                      }
                    }}
                  />
                ))
              : content?.map((item, index) => (
                  <StateItem
                    key={index}
                    state="unchanged"
                    label={
                      <Typography sx={{ fontSize: '14px' }}>
                        <FormattedMessage defaultMessage="Item {index}" values={{ index }} />
                      </Typography>
                    }
                    onSelect={() => onSelectStateItem(item)}
                    hideState
                  />
                ))}
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>{content}</Box>
      )}
    </>
  );
}

export function ViewField(props: ViewFieldProps) {
  const {
    content,
    field,
    contentTypeFields,
    xml = '',
    showToolbar = true,
    showToolbarFieldNavigation = true,
    dynamicHeight,
    onSelectField,
    setViewSubDialogState
  } = props;
  const fieldDoc =
    fromString(xml).querySelector(`page > ${field.id}`) ??
    fromString(xml).querySelector(`component > ${field.id}`) ??
    fromString(xml).querySelector(`item > ${field.id}`);
  const fieldXml = fieldDoc ? serialize(fieldDoc) : '';
  const [viewXml, setViewXml] = useState(false);
  const [cleanText, setCleanText] = useState(false);
  const { options: xmlEditorOptions, toggleWordWrap } = useMonacoOptions();
  const monacoEditorHeight = !dynamicHeight ? '100%' : countLines(xml) < 15 ? '200px' : '600px';
  const ViewComponent = typesRenderMap[field.type] ?? DefaultView;
  const viewComponentProps = {
    contentA: content,
    xml: fieldXml,
    field,
    isHTML: true,
    cleanText,
    editorProps: {
      options: xmlEditorOptions,
      height: monacoEditorHeight
    },
    setViewSubDialogState
  };

  return (
    <>
      {showToolbar && (
        <FieldVersionToolbar
          field={field}
          contentTypeFields={contentTypeFields}
          compareXml={viewXml}
          setCompareXml={setViewXml}
          showCleanText={cleanText}
          setShowCleanText={setCleanText}
          onSelectField={onSelectField}
          showFieldsNavigation={showToolbarFieldNavigation}
          actions={
            (ViewComponent === MonacoWrapper || viewXml) && (
              <Button onClick={() => toggleWordWrap()}>
                {xmlEditorOptions.wordWrap === 'on' ? (
                  <FormattedMessage defaultMessage="No Wrap" />
                ) : (
                  <FormattedMessage defaultMessage="Wrap" />
                )}
              </Button>
            )
          }
        />
      )}
      <Box sx={{ flexGrow: 1, maxHeight: 'calc(100% - 60px)' }}>
        {viewXml ? (
          <MonacoWrapper contentA={fieldXml} isHTML={true} editorProps={viewComponentProps.editorProps} />
        ) : nnou(ViewComponent) ? (
          <ViewComponent {...viewComponentProps} />
        ) : (
          <></>
        )}
      </Box>
    </>
  );
}

export default ViewField;
