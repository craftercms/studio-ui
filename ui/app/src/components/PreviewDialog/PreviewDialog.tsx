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

import React, { useState } from 'react';
import { PreviewDialogContainer } from './PreviewDialogContainer';
import { backgroundModes, PreviewDialogProps } from './utils';
import EnhancedDialog from '../EnhancedDialog';
import { useIntl } from 'react-intl';
import { translations } from './translations';
import { getStoredPreviewBackgroundMode, setStoredPreviewBackgroundMode } from '../../utils/state';
import useActiveUser from '../../hooks/useActiveUser';

export function PreviewDialog(props: PreviewDialogProps) {
  const { title, subtitle = props.url, type, url, path, content, mode, mimeType, ...rest } = props;
  const { username } = useActiveUser();
  const [backgroundModeIndex, setBackgroundModeIndex] = useState(getStoredPreviewBackgroundMode(username) ?? 0);
  const { formatMessage } = useIntl();

  return (
    <EnhancedDialog
      maxWidth="xl"
      title={title}
      dialogHeaderProps={{
        subtitle: <span title={subtitle}>{subtitle}</span>,
        subtitleTypographyProps: {
          noWrap: true
        },
        sxs: {
          subtitleWrapper: {
            maxWidth: '100%'
          }
        },
        rightActions: [
          (type === 'image' || type === 'video') && {
            icon: { id: '@mui/icons-material/ColorLensOutlined' },
            onClick: () => {
              const index = (backgroundModeIndex + 1) % backgroundModes.length;
              setBackgroundModeIndex(index);
              setStoredPreviewBackgroundMode(username, index);
            },
            tooltip: formatMessage(translations.toggleBackgroundColor)
          }
        ].filter(Boolean)
      }}
      {...rest}
    >
      <PreviewDialogContainer
        type={type}
        title={title}
        url={url}
        path={path}
        content={content}
        mode={mode}
        mimeType={mimeType}
        backgroundModeIndex={backgroundModeIndex}
      />
    </EnhancedDialog>
  );
}

export default PreviewDialog;
