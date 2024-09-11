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

import { CompareVersionsDialogContainerProps } from './utils';
import React, { useEffect, useState } from 'react';
import { CompareFieldPanel } from './CompareVersions';
import DialogBody from '../DialogBody/DialogBody';
import { LoadingState } from '../LoadingState';
import useSpreadState from '../../hooks/useSpreadState';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { forkJoin } from 'rxjs';
import { fetchContentByCommitId } from '../../services/content';
import { fromString } from '../../utils/xml';
import { parseContentXML } from '../../utils/content';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { ContentTypeField } from '../../models';
import { ResizeableDrawer } from '../ResizeableDrawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import { FormattedMessage } from 'react-intl';
import EmptyState from '../EmptyState';
import useSelection from '../../hooks/useSelection';
import { MonacoWrapper } from '../MonacoWrapper';

export function CompareVersionsDialogContainer(props: CompareVersionsDialogContainerProps) {
  const { selectedA, selectedB, versionsBranch, contentTypesBranch, compareXml } = props;
  const { compareVersionsBranch, item } = versionsBranch;
  const compareMode = selectedA && selectedB;
  const [selectionContent, setSelectionContent] = useSpreadState({
    contentA: null,
    contentB: null,
    contentAXml: null,
    contentBXml: null
  });
  const siteId = useActiveSiteId();
  const isCompareDataReady =
    compareVersionsBranch?.compareVersions &&
    contentTypesBranch?.byId &&
    item?.contentTypeId &&
    selectionContent.contentA &&
    selectionContent.contentB;
  // TODO: I need to filter this to only show fields with changes.
  const contentTypeFields = Object.values(contentTypesBranch.byId[item.contentTypeId].fields) as ContentTypeField[];
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);

  useEffect(() => {
    if (selectedA && selectedB) {
      forkJoin([
        fetchContentByCommitId(siteId, selectedA.path, selectedA.versionNumber),
        fetchContentByCommitId(siteId, selectedB.path, selectedB.versionNumber)
      ]).subscribe(([contentA, contentB]) => {
        setSelectionContent({
          contentA: parseContentXML(fromString(contentA as string), selectedA.path, contentTypesBranch.byId, {}),
          contentB: parseContentXML(fromString(contentB as string), selectedB.path, contentTypesBranch.byId, {}),
          contentAXml: contentA,
          contentBXml: contentB
        });
      });
    }
  }, [selectedA, selectedB, siteId, setSelectionContent, contentTypesBranch.byId]);
  const [selectedField, setSelectedField] = useState(null);

  return (
    <>
      <DialogBody
        sx={{
          overflow: 'auto',
          minHeight: '50vh',
          ...(compareMode && { padding: 0 }),
          ...(!selectedField && { display: 'flex', justifyContent: 'center', alignItems: 'center' })
        }}
      >
        {!isCompareDataReady ? (
          <LoadingState />
        ) : compareVersionsBranch.error || contentTypesBranch.error ? (
          <ApiResponseErrorState error={compareVersionsBranch.error ?? contentTypesBranch.error} />
        ) : compareXml ? (
          <MonacoWrapper
            contentA={selectionContent.contentAXml}
            contentB={selectionContent.contentBXml}
            isHTML={false}
            isDiff
            sxs={{ editor: { height: '50vh' } }}
          />
        ) : (
          <>
            <ResizeableDrawer
              open={true}
              width={280}
              styles={{
                drawerBody: {
                  overflowY: 'inherit'
                },
                drawerPaper: {
                  overflow: 'auto',
                  position: 'absolute'
                }
              }}
            >
              <List>
                {contentTypeFields.map((field) => (
                  <ListItemButton
                    key={field.id}
                    onClick={() => setSelectedField(field)}
                    selected={selectedField?.id === field.id}
                  >
                    <Typography>
                      {field.name} ({field.id})
                    </Typography>
                  </ListItemButton>
                ))}
              </List>
            </ResizeableDrawer>
            <Box sx={{ marginLeft: '280px' }}>
              {selectedField ? (
                <CompareFieldPanel
                  a={{
                    ...selectedA,
                    ...compareVersionsBranch.compareVersions?.[0],
                    content: selectionContent.contentA,
                    xml: selectionContent.contentAXml
                  }}
                  b={{
                    ...selectedB,
                    ...compareVersionsBranch.compareVersions?.[1],
                    content: selectionContent.contentB,
                    xml: selectionContent.contentBXml
                  }}
                  field={selectedField}
                />
              ) : (
                <EmptyState
                  styles={{ root: { height: '100%', margin: 0 } }}
                  title={
                    <FormattedMessage id="siteTools.selectTool" defaultMessage="Please select a field from the left." />
                  }
                  image={`${baseUrl}/static-assets/images/choose_option.svg`}
                />
              )}
            </Box>
          </>
        )}
      </DialogBody>
    </>
  );
}

export default CompareVersionsDialogContainer;
