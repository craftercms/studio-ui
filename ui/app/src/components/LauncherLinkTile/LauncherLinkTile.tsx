/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { useActiveSiteId, useEnv, usePossibleTranslation, usePreviewState } from '../../utils/hooks';
import LauncherTile from '../LauncherTile';
import React from 'react';
import { SystemIconDescriptor } from '../SystemIcon';
import TranslationOrText from '../../models/TranslationOrText';
import { getSystemLink, SystemLinkId } from '../LauncherSection/utils';
import { useDispatch } from 'react-redux';
import { closeLauncher, showPreviewDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';

export interface LauncherLinkTileProps {
  title: TranslationOrText;
  icon: SystemIconDescriptor;
  link?: string;
  systemLinkId?: SystemLinkId;
}

const LauncherLinkTile = (props: LauncherLinkTileProps) => {
  const { icon, systemLinkId, link } = props;
  const { authoringBase } = useEnv();
  const { previewChoice } = usePreviewState();
  const site = useActiveSiteId();
  const dispatch = useDispatch();

  const title = usePossibleTranslation(props.title);

  const onClick = (e) => {
    e.preventDefault();
    if (systemLinkId === 'siteDashboard') {
      dispatch(
        batchActions([
          closeLauncher(),
          showPreviewDialog({
            type: 'page',
            title,
            url: `${getSystemLink({ systemLinkId, authoringBase, previewChoice, site })}?mode=embedded`,
            dialogProps: {
              fullWidth: true,
              maxWidth: 'xl'
            }
          })
        ])
      );
    }
  };

  return (
    <LauncherTile
      icon={icon}
      title={usePossibleTranslation(title)}
      onClick={systemLinkId === 'siteDashboard' ? onClick : null}
      link={link ?? getSystemLink({ systemLinkId, authoringBase, previewChoice, site })}
    />
  );
};

export default LauncherLinkTile;
