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

import { ContentTypeField, InstanceRecord, Primitive } from '../../models';
import Typography from '@mui/material/Typography';
import { MonacoWrapper } from '../MonacoWrapper';
import Box from '@mui/material/Box';
import AsyncVideoPlayer from '../AsyncVideoPlayer';
import { asLocalizedDateTime, convertUtcTimeToTimezone } from '../../utils/datetime';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import useItemsByPath from '../../hooks/useItemsByPath';
import useLocale from '../../hooks/useLocale';
import { fromString, serialize } from '../../utils/xml';
import { nnou } from '../../utils/object';
import DiffCollectionItem from '../CompareVersionsDialog/FieldsTypesDiffViews/DiffCollectionItem';
import ContentInstance from '../../models/ContentInstance';
import useSelection from '../../hooks/useSelection';
import { countLines } from '../../utils/string';
import { initialFieldViewState, useVersionsDialogContext } from '../CompareVersionsDialog/VersionsDialogContext';

interface ContentFieldViewProps {
  content: Primitive;
  field: ContentTypeField;
  xml?: string;
  showToolbar?: boolean;
  contentTypeFields: ContentTypeField[];
  showToolbarFieldNavigation?: boolean;
  dynamicHeight?: boolean;
  onSelectField?(field: ContentTypeField): void;
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
  contentA: Primitive;
  xml: string;
}

function DefaultView(props: DefaultViewProps) {
  const { field, contentA: content, xml } = props;
  const fieldType = field.type;
  const locale = useLocale();
  const itemsByPath = useItemsByPath();
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const [, contextApiRef] = useVersionsDialogContext();
  const getItemLabel = (item: ContentInstance): string => {
    return item.craftercms?.label ?? itemsByPath?.[item.craftercms?.path]?.label ?? item.craftercms?.id ?? item.key;
  };

  const isEmbedded = (item: ContentInstance): boolean => {
    return item?.craftercms && !item.craftercms.path;
  };

  const onSelectStateItem = (item: ContentInstance) => {
    const isEmbeddedComponent = isEmbedded(item);
    const fields = isEmbeddedComponent ? contentTypesBranch.byId[item.craftercms.contentTypeId].fields : field.fields;

    contextApiRef.current.setViewSlideOutState({
      open: true,
      data: {
        content: item,
        xml,
        fields
      },
      title: field.name,
      subtitle: <FormattedMessage defaultMessage="{fieldId} - Repeat Group" values={{ fieldId: field.id }} />,
      onClose: () => contextApiRef.current.closeSlideOuts()
    });
  };

  return (
    <>
      {(!content && fieldType !== 'boolean' && fieldType !== 'page-nav-order') ||
      (content as Primitive[])?.length === 0 ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography color="textSecondary">no content set</Typography>
        </Box>
      ) : fieldType === 'image' ? (
        <Box sx={{ textAlign: 'center' }}>
          <img src={content as string} alt="" />
          <Typography variant="subtitle2">{content as string}</Typography>
        </Box>
      ) : fieldType === 'video-picker' ? (
        <Box sx={{ textAlign: 'center' }}>
          <AsyncVideoPlayer playerOptions={{ src: content as string, controls: true, width: 400 }} />
          <Typography variant="subtitle2">{content as string}</Typography>
        </Box>
      ) : fieldType === 'time' ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography>
            {content ? convertUtcTimeToTimezone(content as string, locale.dateTimeFormatOptions?.timeZone) : ''}
          </Typography>
        </Box>
      ) : fieldType === 'date-time' ? (
        <Box sx={{ textAlign: 'center' }}>
          <Tooltip title={content as string}>
            <Typography>
              {content
                ? asLocalizedDateTime(
                    new Date(content as string).getTime(),
                    locale.localeCode,
                    locale.dateTimeFormatOptions
                  )
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
          {(content as InstanceRecord[])?.map((item) => (
            <Typography key={item.key as string}>{`${item.value_smv} (${item.key})`}</Typography>
          ))}
        </Box>
      ) : fieldType === 'node-selector' || fieldType === 'repeat' ? (
        <Box component="section" sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1100px', gap: '10px' }}>
            {fieldType === 'node-selector'
              ? (content as ContentInstance[])?.map((item) => (
                  <DiffCollectionItem
                    key={item.craftercms.path}
                    state="unchanged"
                    primaryText={getItemLabel(item)}
                    secondaryText={
                      item.craftercms && isEmbedded(item) ? (
                        <FormattedMessage defaultMessage="Embedded" />
                      ) : (
                        (item.craftercms?.path ?? item.value)
                      )
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
              : (content as ContentInstance[])?.map((item, index) => (
                  <DiffCollectionItem
                    key={index}
                    state="unchanged"
                    primaryText={<FormattedMessage defaultMessage="Item {index}" values={{ index }} />}
                    onSelect={() => onSelectStateItem(item)}
                    hideState
                  />
                ))}
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>{content as string}</Box>
      )}
    </>
  );
}

export function ContentFieldView(props: ContentFieldViewProps) {
  const { content, field, xml = '', dynamicHeight } = props;
  const fieldDoc =
    fromString(xml).querySelector(`page > ${field.id}`) ??
    fromString(xml).querySelector(`component > ${field.id}`) ??
    fromString(xml).querySelector(`item > ${field.id}`);
  const fieldXml = fieldDoc ? serialize(fieldDoc) : '';
  const [{ fieldsViewState }] = useVersionsDialogContext();
  const viewState = fieldsViewState[field.id] ?? initialFieldViewState;
  const { compareXml: viewXml, cleanText, xmlEditorOptions } = viewState;
  const monacoEditorHeight = !dynamicHeight ? '100%' : countLines(fieldXml ?? '') < 15 ? '200px' : '600px';
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
    }
  };

  return (
    <Box sx={{ flexGrow: 1, maxHeight: 'calc(100% - 60px)' }}>
      {viewXml ? (
        <MonacoWrapper contentA={fieldXml} isHTML={true} editorProps={viewComponentProps.editorProps} />
      ) : nnou(ViewComponent) ? (
        <ViewComponent {...viewComponentProps} />
      ) : null}
    </Box>
  );
}

export default ContentFieldView;
