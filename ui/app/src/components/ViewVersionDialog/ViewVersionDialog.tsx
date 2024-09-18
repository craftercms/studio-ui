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
import { makeStyles } from 'tss-react/mui';
import { ViewVersionDialogProps } from './utils';
import ViewVersionDialogContainer from './ViewVersionDialogContainer';
import EnhancedDialog from '../EnhancedDialog/EnhancedDialog';
import { FormattedMessage, useIntl } from 'react-intl';
import translations from '../CompareVersionsDialog/translations';
import Slide from '@mui/material/Slide';
import { dialogClasses } from '@mui/material/Dialog';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AsDayMonthDateTime } from '../VersionList';
import useLocale from '../../hooks/useLocale';

export const getLegacyDialogStyles = makeStyles()(() => ({
  iframe: {
    border: 'none',
    height: '80vh'
  }
}));

export function ViewVersionDialog(props: ViewVersionDialogProps) {
  const { rightActions, leftActions, contentTypesBranch, error, isFetching, version, ...rest } = props;
  const [showXml, setShowXml] = useState(false);
  const { formatMessage } = useIntl();
  const largeHeightScreen = useMediaQuery('(min-height: 880px)');
  const locale = useLocale();

  return (
    <EnhancedDialog
      title={<FormattedMessage id="viewVersionDialog.headerTitle" defaultMessage="Viewing item version" />}
      subtitle={<AsDayMonthDateTime date={version?.modifiedDate} locale={locale} />}
      dialogHeaderProps={{
        leftActions,
        rightActions: [
          {
            icon: { id: '@mui/icons-material/CodeRounded' },
            onClick: () => setShowXml(!showXml),
            'aria-label': showXml ? formatMessage(translations.compareContent) : formatMessage(translations.compareXml)
          },
          ...(rightActions ?? [])
        ]
      }}
      maxWidth="xl"
      TransitionComponent={Slide}
      sx={{
        [`.${dialogClasses.paper}`]: {
          height: largeHeightScreen ? 'calc(100% - 200px)' : 'calc(100% - 60px)',
          maxHeight: '1000px',
          width: 'calc(100% - 64px)',
          overflow: 'hidden'
        }
      }}
      {...rest}
    >
      <ViewVersionDialogContainer
        version={version}
        contentTypesBranch={contentTypesBranch}
        error={error}
        isFetching={isFetching}
        showXml={showXml}
      />
    </EnhancedDialog>
  );
}

export default ViewVersionDialog;
