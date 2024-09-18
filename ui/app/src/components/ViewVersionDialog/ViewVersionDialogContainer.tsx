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
import React, { useEffect, useState } from 'react';
import { fetchContentByCommitId } from '../../services/content';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { getContentInstanceValueFromProp, parseContentXML } from '../../utils/content';
import { fromString } from '../../utils/xml';
import { ContentTypeField } from '../../models';
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
  const { version, contentTypesBranch, showXml, error } = props;
  const [content, setContent] = useState(null);
  const [xml, setXml] = useState(null);
  const siteId = useActiveSiteId();
  const fields = content
    ? (Object.values(contentTypesBranch.byId[content.craftercms.contentTypeId].fields) as ContentTypeField[])
    : [];
  const isViewDateReady = content && xml;
  const [selectedField, setSelectedField] = useState(null);

  useEffect(() => {
    if (version) {
      fetchContentByCommitId(siteId, version.path, version.versionNumber).subscribe((content) => {
        setContent(parseContentXML(fromString(content as string), version.path, contentTypesBranch.byId, {}));
        setXml(content);
      });
    }
  }, [version, siteId, contentTypesBranch]);

  return (
    <DialogBody sx={{ overflow: 'auto', minHeight: '50vh', p: 0 }}>
      {!isViewDateReady ? (
        <LoadingState />
      ) : error ? (
        <ApiResponseErrorState error={error} />
      ) : showXml ? (
        <MonacoWrapper contentA={xml} isHTML={false} sxs={{ editor: { height: '100%' } }} />
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
                  // ref={sidebarRefs.current[field.id]}
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
              />
            )}
            {/* {fields?.map((field, index) => {
              return (
                <ViewFieldPanel
                  key={index}
                  content={content ? getContentInstanceValueFromProp(content, field.id) : null}
                  field={field}
                />
              );
            })}*/}
          </Box>
        </>
      )}
    </DialogBody>
  );
}

export default ViewVersionDialogContainer;
