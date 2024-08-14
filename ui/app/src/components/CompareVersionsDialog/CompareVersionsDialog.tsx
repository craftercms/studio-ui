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

import React from 'react';
import { CompareVersionsDialogProps } from './utils';
import CompareVersionsDialogContainer from './CompareVersionsDialogContainer';
import EnhancedDialog from '../EnhancedDialog/EnhancedDialog';
import { FormattedMessage, useIntl } from 'react-intl';
import { AsDayMonthDateTime } from '../VersionList';
import { compareVersion } from '../../state/actions/versions';
import { translations } from './translations';
import { useDispatch } from 'react-redux';

export function CompareVersionsDialog(props: CompareVersionsDialogProps) {
  const isSelectMode = props.selectedA && !props.selectedB;
  const isCompareMode = props.selectedA && props.selectedB;
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

  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  return (
    <EnhancedDialog
      title={
        isSelectMode ? (
          <FormattedMessage
            id="compareVersionsDialog.headerSubtitleCompareTo"
            defaultMessage="Select a revision to compare to “{selectedA}”"
            values={{ selectedA: <AsDayMonthDateTime date={selectedA.modifiedDate} /> }}
          />
        ) : isCompareMode ? (
          <FormattedMessage
            defaultMessage="Comparing “{selectedA}” with “{selectedB}”"
            values={{
              selectedA: <AsDayMonthDateTime date={selectedA.modifiedDate} />,
              selectedB: <AsDayMonthDateTime date={selectedB.modifiedDate} />
            }}
          />
        ) : (
          <FormattedMessage
            id="compareVersionsDialog.headerSubtitleCompare"
            defaultMessage="Select a revision to compare"
          />
        )
      }
      dialogHeaderProps={{
        subtitle: !isCompareMode && (
          <FormattedMessage id="compareVersionsDialog.headerTitle" defaultMessage="Compare item versions" />
        ),
        leftActions: isCompareMode
          ? [
              {
                icon: { id: '@mui/icons-material/ArrowBackIosRounded' },
                onClick: () => dispatch(compareVersion({ id: versionsBranch.selected[0] })),
                'aria-label': formatMessage(translations.backToSelectRevision)
              }
            ]
          : leftActions,
        rightActions
      }}
      maxWidth={isCompareMode ? 'xl' : 'md'}
      {...rest}
    >
      <CompareVersionsDialogContainer
        versionsBranch={versionsBranch}
        isFetching={isFetching}
        error={error}
        disableItemSwitching={disableItemSwitching}
        contentTypesBranch={contentTypesBranch}
        selectedA={selectedA}
        selectedB={selectedB}
      />
    </EnhancedDialog>
  );
}

export default CompareVersionsDialog;
