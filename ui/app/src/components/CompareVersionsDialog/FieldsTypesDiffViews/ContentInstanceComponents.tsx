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

import ContentInstance from '../../../models/ContentInstance';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import useItemsByPath from '../../../hooks/useItemsByPath';
import { CompareVersionsDialogProps, diffArrays, getItemDiffStatus } from '../utils';
import Box from '@mui/material/Box';
import palette from '../../../styles/palette';
import Typography from '@mui/material/Typography';
import { EmptyState } from '../../EmptyState';
import LookupTable from '../../../models/LookupTable';
import { areObjectsEqual } from '../../../utils/object';
import useSelection from '../../../hooks/useSelection';
import { ContentTypeField } from '../../../models';

interface ContentInstanceComponentsProps {
  contentA: ContentInstance[];
  contentB: ContentInstance[];
  aXml: string;
  bXml: string;
  field: ContentTypeField;
  setCompareSubDialogState?(props: Partial<CompareVersionsDialogProps>): void;
}

export function ContentInstanceComponents(props: ContentInstanceComponentsProps) {
  const { contentA, contentB, aXml, bXml, field, setCompareSubDialogState } = props;
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const [diff, setDiff] = useState(null);
  const itemsByPath = useItemsByPath();
  const contentById: LookupTable<ContentInstance> = useMemo(() => {
    const byId = {};
    [...(contentA ?? []), ...(contentB ?? [])].forEach((item) => {
      if (item.craftercms?.id) {
        byId[item.craftercms.id] = item;
      } else {
        byId[item.key] = item;
      }
    });
    return byId;
  }, [contentA, contentB]);

  const getItemLabel = (item: ContentInstance) => {
    return item.craftercms?.label ?? itemsByPath?.[item.craftercms?.path]?.label ?? item.craftercms?.id ?? item.key;
  };

  const isEmbedded = (item: ContentInstance) => {
    return item?.craftercms && !item.craftercms.path;
  };

  const getEmbeddedVersions = (id: string) => {
    return {
      embeddedA: contentA.find((item) => item.craftercms?.id === id),
      embeddedB: contentB.find((item) => item.craftercms?.id === id)
    };
  };

  const embeddedItemChanged = (id) => {
    const { embeddedA, embeddedB } = getEmbeddedVersions(id);
    return !areObjectsEqual(embeddedA, embeddedB);
  };

  const onCompareEmbedded = (id: string) => {
    const { embeddedA, embeddedB } = getEmbeddedVersions(id);
    const fields = contentTypesBranch.byId[embeddedA.craftercms.contentTypeId].fields;
    setCompareSubDialogState?.({
      open: true,
      selectionContent: {
        a: {
          content: embeddedA,
          xml: aXml
        },
        b: {
          content: embeddedB,
          xml: bXml
        }
      },
      fields,
      title: field.name,
      subtitle: <FormattedMessage defaultMessage="{fieldId}" values={{ fieldId: field.id }} />,
      onClose: () => setCompareSubDialogState({ open: false })
    });
  };

  useEffect(() => {
    setDiff(
      diffArrays(
        (contentA ?? []).map((item) => item.craftercms?.id ?? item.key),
        (contentB ?? []).map((item) => item.craftercms?.id ?? item.key)
      )
    );
  }, [contentA, contentB]);

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1100px' }}>
        {diff?.length ? (
          diff.map((part) =>
            part.value.map((id, index) => (
              <Box
                sx={{
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8.5px 10px',
                  borderRadius: '5px',
                  alignItems: 'center',
                  '&.unchanged': {
                    color: (theme) =>
                      theme.palette.mode === 'dark'
                        ? theme.palette.getContrastText(palette.gray.medium4)
                        : palette.gray.medium4,
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? palette.gray.medium4 : palette.gray.light1
                  },
                  '&.new': {
                    color: palette.green.shade,
                    backgroundColor: palette.green.highlight,
                    width: '50%',
                    marginLeft: 'auto'
                  },
                  '&.changed': {
                    color: palette.yellow.shade,
                    backgroundColor: palette.yellow.highlight
                  },
                  '&.deleted': {
                    color: palette.red.shade,
                    backgroundColor: palette.red.highlight,
                    width: '50%',
                    marginRight: 'auto'
                  },
                  '&:last-child': {
                    marginBottom: 0
                  }
                }}
                className={getItemDiffStatus(part) ?? ''}
                key={`${id}-${index}`}
                onClick={() => {
                  if (isEmbedded(contentById[id]) && embeddedItemChanged(id)) {
                    onCompareEmbedded(id);
                  }
                }}
              >
                <Box component="span" display="inline-flex" width="100%">
                  <Typography sx={{ fontSize: '14px' }} noWrap title={getItemLabel(contentById[id])}>
                    {getItemLabel(contentById[id])}
                  </Typography>
                  {contentById[id].craftercms && (
                    <Typography sx={{ fontSize: '14px', ml: 1 }} noWrap>
                      {isEmbedded(contentById[id]) ? (
                        <FormattedMessage defaultMessage="(Embedded)" />
                      ) : (
                        (contentById[id].craftercms?.path ?? contentById[id].value)
                      )}
                    </Typography>
                  )}
                </Box>
                {isEmbedded(contentById[id]) && embeddedItemChanged(id) && (
                  <Typography variant="caption">
                    <FormattedMessage defaultMessage="Changed" />
                  </Typography>
                )}
              </Box>
            ))
          )
        ) : (
          <EmptyState title={<FormattedMessage defaultMessage="No items" />} />
        )}
      </Box>
    </Box>
  );
}

export default ContentInstanceComponents;
