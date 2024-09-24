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
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import ViewField from './ViewField';

export function ViewVersionDialogContainer(props: ViewVersionDialogContainerProps) {
  const { version, contentTypesBranch, showXml, data: preFetchedData, error, setViewSubDialogState } = props;
  const [content, setContent] = useState(preFetchedData?.content);
  const [xml, setXml] = useState(preFetchedData?.xml);
  const siteId = useActiveSiteId();
  const fields = useMemo(() => {
    return content
      ? Object.values(preFetchedData?.fields ?? contentTypesBranch.byId[content.craftercms.contentTypeId].fields)
      : [];
  }, [content, contentTypesBranch?.byId, preFetchedData?.fields]);
  const isViewDateReady = content && xml;
  const [selectedField, setSelectedField] = useState(null);
  const sidebarRefs = useRef({});
  fields?.forEach((field) => {
    sidebarRefs.current[field.id] = React.createRef<HTMLDivElement>();
  });

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

  const onSelectField = (field) => {
    setSelectedField(field);
    sidebarRefs.current[field.id].current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <DialogBody sx={{ overflow: 'auto', minHeight: '50vh', p: 0 }}>
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
                  onClick={() => setSelectedField(field)}
                  selected={selectedField?.id === field.id}
                  ref={sidebarRefs.current[field.id]}
                >
                  <ListItemText primary={field.name} secondary={`${field.id} - ${field.type}`} sx={{ m: 0 }} />
                </ListItemButton>
              ))}
            </List>
          </ResizeableDrawer>
          <Box sx={{ marginLeft: '280px', height: '100%' }}>
            {selectedField && (
              <ViewField
                content={content && getContentInstanceValueFromProp(content, selectedField.id)}
                field={selectedField}
                contentTypeFields={fields}
                xml={xml}
                onSelectField={onSelectField}
                setViewSubDialogState={setViewSubDialogState}
              />
            )}
          </Box>
        </>
      )}
    </DialogBody>
  );
}

export default ViewVersionDialogContainer;
