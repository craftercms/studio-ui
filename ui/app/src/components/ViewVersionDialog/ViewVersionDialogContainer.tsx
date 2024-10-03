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

import { ViewVersionDialogContainerProps } from './utils';
import DialogBody from '../DialogBody/DialogBody';
import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchContentByCommitId } from '../../services/content';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { getContentInstanceValueFromProp, parseContentXML } from '../../utils/content';
import { fromString } from '../../utils/xml';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { LoadingState } from '../LoadingState';
import { MonacoWrapper } from '../MonacoWrapper';
import Box from '@mui/material/Box';
import { ResizeableDrawer } from '../ResizeableDrawer';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import ContentFieldView from './ContentFieldView';
import { FormattedMessage, useIntl } from 'react-intl';
import { getStudioContentInternalFields } from '../../utils/contentType';
import FieldVersionToolbar from '../CompareVersionsDialog/FieldVersionToolbar';
import {
  initialFieldViewState,
  useVersionsDialogContext,
  VersionsDialogContextProps
} from '../CompareVersionsDialog/VersionsDialogContext';
import Button from '@mui/material/Button';
import { ErrorBoundary } from '../ErrorBoundary';
import { FieldAccordionPanel } from '../CompareVersionsDialog/FieldAccordionPanel';
import { ContentTypeField } from '../../models';

const VersionDialogContext = createContext(null);

export function ViewVersionDialogContainer(props: ViewVersionDialogContainerProps) {
  const { version, contentTypesBranch, showXml, data: preFetchedData, error } = props;
  const [content, setContent] = useState(preFetchedData?.content);
  const [xml, setXml] = useState(preFetchedData?.xml);
  const siteId = useActiveSiteId();
  const { formatMessage } = useIntl();
  const fields = useMemo(() => {
    return content && (preFetchedData?.fields || contentTypesBranch?.byId[content.craftercms.contentTypeId].fields)
      ? [
          ...Object.values(preFetchedData?.fields ?? contentTypesBranch?.byId[content.craftercms.contentTypeId].fields),
          ...(content.crafterms ? getStudioContentInternalFields(formatMessage) : [])
        ]
      : [];
  }, [content, contentTypesBranch?.byId, formatMessage, preFetchedData?.fields]);
  const isViewDateReady = content && xml;
  const [selectedField, setSelectedField] = useState(null);
  const context = useMemo(() => ({ content, fields }), [content, fields]);
  const sidebarRefs = useRef({});
  const fieldsRefs = useRef({});
  const [{ fieldsViewState }] = useVersionsDialogContext();
  const fieldsViewStateRef = useRef<VersionsDialogContextProps['fieldsViewState']>();
  fieldsViewStateRef.current = fieldsViewState;
  const [accordionView, setAccordionView] = useState(false);

  useEffect(() => {
    if (preFetchedData) {
      setContent(preFetchedData.content);
      setXml(preFetchedData.xml);
    }
  }, [preFetchedData]);

  useEffect(() => {
    if (version) {
      fetchContentByCommitId(siteId, version.path, version.versionNumber).subscribe((content) => {
        setContent(parseContentXML(fromString(content as string), version.path, contentTypesBranch.byId, {}));
        setXml(content as string);
      });
    }
  }, [version, siteId, contentTypesBranch]);

  useEffect(() => {
    if (fields?.length) {
      setSelectedField(fields[0]);
    }
  }, [fields]);

  useEffect(() => {
    fields?.forEach((field) => {
      sidebarRefs.current[field.id] = React.createRef<HTMLDivElement>();
      fieldsRefs.current[field.id] = React.createRef<HTMLDivElement>();
      fieldsViewStateRef.current[field.id] = initialFieldViewState;
    });
  }, [fields]);

  const onSelectField = (field: ContentTypeField) => {
    setSelectedField(field);
    sidebarRefs.current[field.id].current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSelectFieldFromList = (field: ContentTypeField) => {
    if (accordionView) {
      fieldsRefs.current[field.id].current?.scrollIntoView({ behavior: 'smooth' });
    }
    setSelectedField(field);
  };

  return (
    <DialogBody sx={{ overflow: 'auto', minHeight: '50vh', p: 0 }}>
      <VersionDialogContext.Provider value={context}>
        {!isViewDateReady ? (
          <LoadingState />
        ) : error ? (
          <ApiResponseErrorState error={error} />
        ) : showXml ? (
          <MonacoWrapper contentA={xml} isHTML={false} editorProps={{ height: '100%' }} />
        ) : (
          <>
            <ResizeableDrawer
              open={true}
              width={280}
              styles={{
                drawerBody: {
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'inherit'
                },
                drawerPaper: {
                  overflow: 'hidden',
                  position: 'absolute'
                }
              }}
            >
              <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
                {fields.map((field) => (
                  <ListItemButton
                    key={field.id}
                    onClick={() => onSelectFieldFromList(field)}
                    selected={selectedField?.id === field.id}
                    ref={sidebarRefs.current[field.id]}
                  >
                    <ListItemText primary={field.name} secondary={`${field.id} - ${field.type}`} sx={{ m: 0 }} />
                  </ListItemButton>
                ))}
              </List>
              <Box width="100%" borderTop={1} borderColor="divider">
                <Button onClick={() => setAccordionView(!accordionView)}>
                  {accordionView ? (
                    <FormattedMessage defaultMessage="Single field" />
                  ) : (
                    <FormattedMessage defaultMessage="All fields" />
                  )}
                </Button>
              </Box>
            </ResizeableDrawer>
            <Box sx={{ marginLeft: '280px', height: '100%', overflowY: 'auto', p: 2 }}>
              <ErrorBoundary>
                {accordionView ? (
                  fields.map((field) => (
                    <FieldAccordionPanel
                      key={field.id}
                      field={field}
                      fieldRef={fieldsRefs.current[field.id]}
                      selected={selectedField?.id === field.id}
                      summary={
                        <FieldVersionToolbar
                          field={field}
                          showFieldsNavigation={false}
                          contentTypeFields={fields}
                          isDiff={false}
                          justContent={true}
                        />
                      }
                      details={
                        <ContentFieldView
                          content={content && getContentInstanceValueFromProp(content, field.id)}
                          field={field}
                          contentTypeFields={fields}
                          xml={xml}
                          onSelectField={onSelectField}
                          dynamicHeight
                        />
                      }
                    />
                  ))
                ) : selectedField ? (
                  <>
                    <FieldVersionToolbar
                      field={selectedField}
                      contentTypeFields={fields}
                      isDiff={false}
                      onSelectField={onSelectField}
                    />
                    <Box height="calc(100% - 60px)" display="flex" flexDirection="column">
                      <ContentFieldView
                        content={content && getContentInstanceValueFromProp(content, selectedField.id)}
                        field={selectedField}
                        contentTypeFields={fields}
                        xml={xml}
                        onSelectField={onSelectField}
                      />
                    </Box>
                  </>
                ) : (
                  <></>
                )}
              </ErrorBoundary>
            </Box>
          </>
        )}
      </VersionDialogContext.Provider>
    </DialogBody>
  );
}

export default ViewVersionDialogContainer;
