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
import { diffArrays, getItemDiffStatus } from '../utils';
import Box from '@mui/material/Box';
import palette from '../../../styles/palette';
import Typography from '@mui/material/Typography';
import { EmptyState } from '../../EmptyState';

interface ContentInstanceComponentsProps {
  contentA: ContentInstance[];
  contentB: ContentInstance[];
}

export function ContentInstanceComponents(props: ContentInstanceComponentsProps) {
  const { contentA, contentB } = props;
  const [diff, setDiff] = useState(null);
  const itemsByPath = useItemsByPath();
  const contentById = useMemo(() => {
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

  const getItemLabel = (item) => {
    return item.craftercms?.label ?? itemsByPath?.[item.craftercms?.path]?.label ?? item.craftercms?.id ?? item.key;
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
        flexDirection: 'column',
        width: '100%'
      }}
    >
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
            >
              <Typography sx={{ fontSize: '14px' }}> {getItemLabel(contentById[id])}</Typography>
              {getItemDiffStatus(part) === 'unchanged' && (
                <Typography sx={{ fontSize: '14px' }}>
                  <FormattedMessage defaultMessage="unchanged" />
                </Typography>
              )}
            </Box>
          ))
        )
      ) : (
        <EmptyState title={<FormattedMessage defaultMessage="No items" />} />
      )}
    </Box>
  );
}

export default ContentInstanceComponents;
