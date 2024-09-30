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

import { CompareVersionsDialogContainerProps, hasFieldChanged } from './utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CompareFieldPanel, CompareFieldPanelAccordion } from './CompareFieldPanel';
import DialogBody from '../DialogBody/DialogBody';
import { LoadingState } from '../LoadingState';
import useSpreadState from '../../hooks/useSpreadState';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { forkJoin } from 'rxjs';
import { fetchContentByCommitId } from '../../services/content';
import { fromString } from '../../utils/xml';
import { getContentInstanceValueFromProp, parseContentXML } from '../../utils/content';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { ResizeableDrawer } from '../ResizeableDrawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import { FormattedMessage, useIntl } from 'react-intl';
import EmptyState from '../EmptyState';
import useSelection from '../../hooks/useSelection';
import { MonacoWrapper } from '../MonacoWrapper';
import ListItemText, { listItemTextClasses } from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { ItemTypeIcon } from '../ItemTypeIcon';
import palette from '../../styles/palette';
import { ErrorBoundary } from '../ErrorBoundary';
import { Badge, badgeClasses } from '@mui/material';
import Button from '@mui/material/Button';
import { getStudioContentInternalFields } from '../../utils/contentType';

export function CompareVersionsDialogContainer(props: CompareVersionsDialogContainerProps) {
  const {
    selectedA,
    selectedB,
    selectionContent: preFetchedContent,
    fields,
    versionsBranch,
    contentTypesBranch,
    compareXml,
    setCompareSubDialogState,
    setViewSubDialogState
  } = props;
  const compareVersionsBranch = versionsBranch?.compareVersionsBranch;
  const item = versionsBranch?.item;
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const { formatMessage } = useIntl();
  const [accordionView, setAccordionView] = useState(false);
  const [selectionContent, setSelectionContent] = useSpreadState(
    preFetchedContent ?? {
      a: {
        content: null,
        xml: null
      },
      b: {
        content: null,
        xml: null
      }
    }
  );
  const siteId = useActiveSiteId();
  const isCompareDataReady = useMemo(() => {
    if (preFetchedContent) {
      // Check that selectionContent is complete and synced with prefetchedContent
      return (
        selectionContent.a.content &&
        selectionContent.b.content &&
        selectionContent.a.xml === preFetchedContent.a.xml &&
        selectionContent.b.xml === preFetchedContent.b.xml
      );
    } else {
      return (
        compareVersionsBranch?.compareVersions &&
        contentTypesBranch?.byId &&
        item?.contentTypeId &&
        selectionContent.a.content &&
        selectionContent.b.content
      );
    }
  }, [
    preFetchedContent,
    compareVersionsBranch?.compareVersions,
    contentTypesBranch?.byId,
    item?.contentTypeId,
    selectionContent
  ]);
  const [selectedField, setSelectedField] = useState(null);
  const contentType = contentTypesBranch?.byId[item.contentTypeId];
  const contentTypeFields = useMemo(() => {
    return isCompareDataReady
      ? [...Object.values(fields ?? contentType.fields), ...getStudioContentInternalFields(formatMessage)]
      : [];
  }, [contentType, fields, isCompareDataReady, formatMessage]);
  const fieldIdsWithChanges = contentTypeFields
    .filter((field) =>
      hasFieldChanged(
        field,
        getContentInstanceValueFromProp(selectionContent.a.content, field.id),
        getContentInstanceValueFromProp(selectionContent.b.content, field.id)
      )
    )
    .map((field) => field.id);
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);
  const sidebarRefs = useRef({});
  const fieldsRefs = useRef({});
  contentTypeFields?.forEach((field) => {
    sidebarRefs.current[field.id] = React.createRef<HTMLDivElement>();
    fieldsRefs.current[field.id] = React.createRef<HTMLDivElement>();
  });

  useEffect(() => {
    if (preFetchedContent) {
      setSelectionContent(preFetchedContent);
    }
  }, [preFetchedContent, setSelectionContent]);

  useEffect(() => {
    // The dialog can handle 2 different set of props:
    // - selected versions of the history of an item, so we need to fetch the content we're going to diff
    // - pre-fetched content (and the fields of the content) so we don't need to fetch anything.
    if (!preFetchedContent && selectedA && selectedB) {
      forkJoin([
        fetchContentByCommitId(siteId, selectedA.path, selectedA.versionNumber),
        fetchContentByCommitId(siteId, selectedB.path, selectedB.versionNumber)
      ]).subscribe(([contentA, contentB]) => {
        setSelectionContent({
          a: {
            content: parseContentXML(fromString(contentA as string), selectedA.path, contentTypesBranch.byId, {}),
            xml: contentA as string
          },
          b: {
            content: parseContentXML(fromString(contentB as string), selectedB.path, contentTypesBranch.byId, {}),
            xml: contentB as string
          }
        });
      });
    }
  }, [preFetchedContent, selectedA, selectedB, siteId, setSelectionContent, contentTypesBranch]);

  useEffect(() => {
    if (contentTypeFields?.length) {
      setSelectedField(contentTypeFields[0]);
    }
  }, [contentTypeFields]);

  const onSelectFieldFromContent = (field) => {
    setSelectedField(field);
    sidebarRefs.current[field.id].current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSelectFieldFromList = (field) => {
    setSelectedField(field);
    if (accordionView) {
      fieldsRefs.current[field.id].current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const onToggleShowOnlyChanges = () => {
    setSelectedField(
      contentTypeFields.filter((field) => (!showOnlyChanges ? fieldIdsWithChanges.includes(field.id) : true))[0]
    );
    setShowOnlyChanges(!showOnlyChanges);
  };

  return (
    <>
      <DialogBody
        sx={{
          overflow: 'auto',
          minHeight: '50vh',
          padding: 0,
          ...(!selectedField && { display: 'flex', justifyContent: 'center', alignItems: 'center' })
        }}
      >
        {!isCompareDataReady ? (
          <LoadingState />
        ) : compareVersionsBranch?.error || contentTypesBranch?.error ? (
          <ApiResponseErrorState error={compareVersionsBranch.error ?? contentTypesBranch.error} />
        ) : compareXml ? (
          <MonacoWrapper
            contentA={selectionContent.a.xml}
            contentB={selectionContent.b.xml}
            isHTML={false}
            isDiff
            editorProps={{ height: '100%' }}
          />
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
              {contentType && (
                <Box pt={1} pb={1} pr={2} pl={2} borderBottom={1} borderColor="divider">
                  <Typography variant="body2" color="textSecondary">
                    {contentType.id}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      mt: 1
                    }}
                  >
                    <ItemTypeIcon
                      item={item}
                      sx={{ fontSize: '1.4rem', marginRight: '5px', color: palette.teal.main }}
                    />
                    <Typography>{contentType.name}</Typography>
                  </Box>
                </Box>
              )}
              <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
                {contentTypeFields
                  .filter((field) => (showOnlyChanges ? fieldIdsWithChanges.includes(field.id) : true))
                  .map((field) => (
                    <Badge
                      key={field.id}
                      color="info"
                      variant="dot"
                      invisible={showOnlyChanges || !fieldIdsWithChanges.includes(field.id)}
                      sx={{ width: '100%', [`& .${badgeClasses.badge}`]: { top: 10, right: 10 } }}
                    >
                      <ListItemButton
                        onClick={() => onSelectFieldFromList(field)}
                        selected={!accordionView && selectedField?.id === field.id}
                        ref={sidebarRefs.current[field.id]}
                      >
                        <ListItemText
                          primary={field.name}
                          secondary={`${field.id} - ${field.type}`}
                          sx={{
                            m: 0,
                            ...(!showOnlyChanges && {
                              [`.${listItemTextClasses.primary}`]: {
                                fontWeight: fieldIdsWithChanges.includes(field.id) ? 600 : 'normal'
                              }
                            })
                          }}
                        />
                      </ListItemButton>
                    </Badge>
                  ))}
              </List>
              <Box width="100%" borderTop={1} borderColor="divider">
                <Button onClick={() => onToggleShowOnlyChanges()}>
                  {showOnlyChanges ? (
                    <FormattedMessage defaultMessage="Entire version" />
                  ) : (
                    <FormattedMessage defaultMessage="Changed fields" />
                  )}
                </Button>
                <Button onClick={() => setAccordionView(!accordionView)}>
                  {accordionView ? (
                    <FormattedMessage defaultMessage="Single field" />
                  ) : (
                    <FormattedMessage defaultMessage="All fields" />
                  )}
                </Button>
              </Box>
            </ResizeableDrawer>
            <Box sx={{ marginLeft: '280px', height: '100%', overflowY: 'auto' }}>
              <ErrorBoundary>
                {accordionView ? (
                  contentTypeFields
                    .filter((field) => (showOnlyChanges ? fieldIdsWithChanges.includes(field.id) : true))
                    .map((field) => (
                      <CompareFieldPanelAccordion
                        key={field.id}
                        a={{
                          ...selectedA,
                          ...compareVersionsBranch?.compareVersions?.[0],
                          content: selectionContent.a.content,
                          xml: selectionContent.a.xml
                        }}
                        b={{
                          ...selectedB,
                          ...compareVersionsBranch?.compareVersions?.[1],
                          content: selectionContent.b.content,
                          xml: selectionContent.b.xml
                        }}
                        field={field}
                        contentTypeFields={contentTypeFields}
                        setCompareSubDialogState={setCompareSubDialogState}
                        setViewSubDialogState={setViewSubDialogState}
                        fieldRef={fieldsRefs.current[field.id]}
                        selected={selectedField?.id === field.id}
                      />
                    ))
                ) : selectedField ? (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
                    <CompareFieldPanel
                      a={{
                        ...selectedA,
                        ...compareVersionsBranch?.compareVersions?.[0],
                        content: selectionContent.a.content,
                        xml: selectionContent.a.xml
                      }}
                      b={{
                        ...selectedB,
                        ...compareVersionsBranch?.compareVersions?.[1],
                        content: selectionContent.b.content,
                        xml: selectionContent.b.xml
                      }}
                      field={selectedField}
                      contentTypeFields={contentTypeFields}
                      onSelectField={onSelectFieldFromContent}
                      setCompareSubDialogState={setCompareSubDialogState}
                      setViewSubDialogState={setViewSubDialogState}
                    />
                  </Box>
                ) : (
                  <EmptyState
                    styles={{ root: { height: '100%', margin: 0 } }}
                    title={
                      <FormattedMessage
                        id="siteTools.selectTool"
                        defaultMessage="Please select a field from the left."
                      />
                    }
                    image={`${baseUrl}/static-assets/images/choose_option.svg`}
                  />
                )}
              </ErrorBoundary>
            </Box>
          </>
        )}
      </DialogBody>
    </>
  );
}

export default CompareVersionsDialogContainer;
