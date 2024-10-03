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
import { ContentInstanceComponentsDiffResult, getItemDiffStatus } from '../utils';
import { diffArrays } from 'diff/lib/diff/array.js';
import Box from '@mui/material/Box';
import { EmptyState } from '../../EmptyState';
import LookupTable from '../../../models/LookupTable';
import { areObjectsEqual } from '../../../utils/object';
import useSelection from '../../../hooks/useSelection';
import { ContentTypeField } from '../../../models';
import DiffCollectionItem from './DiffCollectionItem';
import { mockContentInstance } from '../../../utils/content';
import { useVersionsDialogContext } from '../VersionsDialogContext';

interface ContentInstanceComponentsProps {
  contentA: ContentInstance[];
  contentB: ContentInstance[];
  aXml: string;
  bXml: string;
  field: ContentTypeField;
}

export function ContentInstanceComponents(props: ContentInstanceComponentsProps) {
  const { contentA, contentB, aXml, bXml, field } = props;
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const [diff, setDiff] = useState<ContentInstanceComponentsDiffResult[]>(null);
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
  const [, contextApiRef] = useVersionsDialogContext();

  const getItemLabel = (item: ContentInstance): string => {
    return item.craftercms?.label ?? itemsByPath?.[item.craftercms?.path]?.label ?? item.craftercms?.id ?? item.key;
  };

  const isEmbedded = (item: ContentInstance): boolean => {
    return item?.craftercms && !item.craftercms.path;
  };

  const getEmbeddedVersions = (
    id: string
  ): {
    embeddedA: ContentInstance;
    embeddedB: ContentInstance;
  } => {
    return {
      embeddedA: contentA?.find((item) => item.craftercms?.id === id),
      embeddedB: contentB?.find((item) => item.craftercms?.id === id)
    };
  };

  const embeddedItemChanged = (id: string): boolean => {
    const { embeddedA, embeddedB } = getEmbeddedVersions(id);
    return !areObjectsEqual(embeddedA ?? {}, embeddedB ?? {});
  };

  const isEmbeddedWithChanges = (id: string): boolean => {
    return isEmbedded(contentById[id]) && embeddedItemChanged(id);
  };

  const onCompareEmbedded = (id: string) => {
    const { embeddedA, embeddedB } = getEmbeddedVersions(id);
    const fields = contentTypesBranch.byId[(embeddedA ?? embeddedB).craftercms.contentTypeId].fields;
    // It may happen that one of the embedded components we're comparing is null (doesn't exist at a specific version),
    // in that scenario we use a mock (empty) content instance.
    contextApiRef.current.setCompareSlideOutState({
      open: true,
      selectionContent: {
        a: {
          content: embeddedA ?? mockContentInstance,
          xml: aXml
        },
        b: {
          content: embeddedB ?? mockContentInstance,
          xml: bXml
        }
      },
      fields,
      title: field.name,
      subtitle: <FormattedMessage defaultMessage="{fieldId}" values={{ fieldId: field.id }} />,
      onClose: () => contextApiRef.current.closeSlideOuts()
    });
  };

  const onViewEmbedded = (id: string) => {
    const { embeddedA } = getEmbeddedVersions(id);
    const fields = contentTypesBranch.byId[embeddedA.craftercms.contentTypeId].fields;
    contextApiRef.current.setViewSlideOutState({
      open: true,
      data: {
        content: embeddedA,
        xml: aXml,
        fields
      },
      title: field.name,
      subtitle: <FormattedMessage defaultMessage="{fieldId}" values={{ fieldId: field.id }} />,
      onClose: () => contextApiRef.current.closeSlideOuts()
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
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1100px', gap: '10px' }}>
        {diff?.length ? (
          diff.map((part) =>
            part.value.map((id) => (
              <DiffCollectionItem
                key={id}
                state={isEmbeddedWithChanges(id) ? 'changed' : getItemDiffStatus(part)}
                primaryText={getItemLabel(contentById[id])}
                secondaryText={
                  contentById[id].craftercms &&
                  (isEmbedded(contentById[id]) ? (
                    <FormattedMessage defaultMessage="Embedded" />
                  ) : (
                    (contentById[id].craftercms?.path ?? contentById[id].value)
                  ))
                }
                onSelect={() => {
                  if (isEmbedded(contentById[id])) {
                    isEmbeddedWithChanges(id) ? onCompareEmbedded(id) : onViewEmbedded(id);
                  }
                }}
                disableHighlight={!isEmbedded(contentById[id])}
              />
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
