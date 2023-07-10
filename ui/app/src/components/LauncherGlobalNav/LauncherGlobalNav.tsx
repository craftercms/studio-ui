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

import LauncherTile, { LauncherTileProps } from '../LauncherTile';
import { getSimplifiedVersion } from '../../utils/string';
import React, { useEffect, useState } from 'react';
import TranslationOrText from '../../models/TranslationOrText';
import { FormattedMessage, useIntl } from 'react-intl';
import { LauncherSectionUI, LauncherSectionUIStyles } from '../LauncherSection';
import { getLauncherSectionLink, urlMapping } from '../LauncherSection/utils';
import { messages } from '../LauncherSection/utils';
import { closeLauncher } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';
import ApiResponseErrorState from '../ApiResponseErrorState';
import { globalMenuMessages } from '../../env/i18n-legacy';
import Skeleton from '@mui/material/Skeleton';
import { useEnv } from '../../hooks/useEnv';
import { useSystemVersion } from '../../hooks/useSystemVersion';
import { useGlobalNavigation } from '../../hooks/useGlobalNavigation';
import { ConfirmDialog } from '../ConfirmDialog';
import { batchActions } from '../../state/actions/misc';
import { unblockGlobalMenuNavigation } from '../../state/actions/system';

export interface LauncherGlobalNavProps {
  title?: TranslationOrText;
  onTileClicked?(e: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>, id: string, label: string): any;
  tileStyles?: LauncherTileProps['styles'];
  sectionStyles?: LauncherSectionUIStyles;
}

function LauncherGlobalNav(props: LauncherGlobalNavProps) {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();
  const version = useSystemVersion();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { items, error, blockNavigation } = useGlobalNavigation();
  const [nextRoute, setNextRoute] = useState('');
  const onTileClicked = blockNavigation
    ? (e, itemId) => {
        const link = getLauncherSectionLink(itemId, authoringBase);
        setNextRoute(link);
        setShowConfirmDialog(true);
      }
    : props.onTileClicked ?? (() => dispatch(closeLauncher()));
  const [activeItemId, setActiveItemId] = useState('');

  const onConfirmOk = () => {
    setShowConfirmDialog(false);
    dispatch(batchActions([closeLauncher(), unblockGlobalMenuNavigation()]));
    window.location.replace(nextRoute);
  };

  useEffect(() => {
    const idLookup = {};
    Object.entries(urlMapping).forEach(([id, hash]) => (idLookup[hash] = id));
    function hashchange() {
      const hash = window.location.hash;
      setActiveItemId(idLookup[hash]);
    }
    hashchange();
    window.addEventListener('hashchange', hashchange, false);
  }, []);
  if (!error && !items) {
    const style = { margin: 5, width: 120, height: 100, display: 'inline-flex' };
    return (
      <>
        <Skeleton style={style} />
        <Skeleton style={style} />
        <Skeleton style={style} />
        <Skeleton style={style} />
      </>
    );
  } else if (error) {
    return <ApiResponseErrorState error={error.response ?? error} />;
  }
  return (
    <>
      <LauncherSectionUI styles={props.sectionStyles} title={props.title ?? formatMessage(messages.global)}>
        {items.map((item) => (
          <LauncherTile
            key={item.id}
            active={activeItemId === item.id}
            title={globalMenuMessages[item.id] ? formatMessage(globalMenuMessages[item.id]) : item.id}
            icon={item.icon}
            link={!blockNavigation ? getLauncherSectionLink(item.id, authoringBase) : null}
            onClick={(e: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>) =>
              onTileClicked(e, item.id, item.label)
            }
            styles={props.tileStyles}
          />
        ))}
        <LauncherTile
          title={formatMessage(messages.docs)}
          icon={{ id: 'craftercms.icons.Docs' }}
          link={`https://docs.craftercms.org/en/${getSimplifiedVersion(version)}/index.html`}
          target="_blank"
          styles={props.tileStyles}
        />
      </LauncherSectionUI>
      <ConfirmDialog
        open={showConfirmDialog}
        title={<FormattedMessage defaultMessage="You have unsaved changes. Discard changes?" />}
        onOk={onConfirmOk}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
}

export default LauncherGlobalNav;
