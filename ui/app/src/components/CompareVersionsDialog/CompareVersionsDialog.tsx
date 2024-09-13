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
import { CompareVersionsDialogProps } from './utils';
import CompareVersionsDialogContainer from './CompareVersionsDialogContainer';
import EnhancedDialog from '../EnhancedDialog/EnhancedDialog';
import { dialogClasses } from '@mui/material/Dialog';
import { FormattedMessage, useIntl } from 'react-intl';
import { AsDayMonthDateTime } from '../VersionList';
import Slide from '@mui/material/Slide';
import { translations } from './translations';
import useMediaQuery from '@mui/material/useMediaQuery';
import useLocale from '../../hooks/useLocale';
import CompareArrowsIcon from '@mui/icons-material/CompareArrowsRounded';

export function CompareVersionsDialog(props: CompareVersionsDialogProps) {
  const [compareXml, setCompareXml] = useState(false);
  const {
    selectedA,
    selectedB,
    leftActions,
    rightActions,
    versionsBranch,
    isFetching,
    error,
    disableItemSwitching,
    contentTypesBranch,
    ...rest
  } = props;
  const { formatMessage } = useIntl();
  const largeHeightScreen = useMediaQuery('(min-height: 880px)');
  const locale = useLocale();

  return (
    <EnhancedDialog
      title={<FormattedMessage defaultMessage="Compare Versions" />}
      subtitle={
        <>
          <AsDayMonthDateTime date={selectedA?.modifiedDate} locale={locale} />
          <CompareArrowsIcon fontSize="small" />
          <AsDayMonthDateTime date={selectedB?.modifiedDate} locale={locale} />
        </>
      }
      dialogHeaderProps={{
        leftActions,
        rightActions: [
          {
            icon: { id: '@mui/icons-material/CodeRounded' },
            onClick: () => setCompareXml(!compareXml),
            'aria-label': compareXml
              ? formatMessage(translations.compareContent)
              : formatMessage(translations.compareXml)
          },
          ...(rightActions ?? [])
        ],
        sxs: {
          subtitle: {
            display: 'flex',
            color: (theme) => theme.palette.text.secondary,
            alignItems: 'center',
            gap: 1
          }
        }
      }}
      maxWidth="xl"
      TransitionComponent={Slide}
      sx={{
        [`.${dialogClasses.paper}`]: {
          height: largeHeightScreen ? 'calc(100% - 200px)' : 'calc(100% - 60px)',
          maxHeight: '1000px'
        }
      }}
      {...rest}
    >
      <CompareVersionsDialogContainer
        versionsBranch={versionsBranch}
        isFetching={isFetching}
        error={error}
        disableItemSwitching={disableItemSwitching}
        contentTypesBranch={contentTypesBranch}
        selectedA={selectedB}
        selectedB={selectedA}
        compareXml={compareXml}
      />
    </EnhancedDialog>
  );
}

export default CompareVersionsDialog;
