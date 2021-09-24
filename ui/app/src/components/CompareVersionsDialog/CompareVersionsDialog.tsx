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

import React from 'react';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { CompareVersionsDialogProps } from './utils';
import CompareVersionsDialogContainer from './CompareVersionsDialogContainer';
import EnhancedDialog from '../EnhancedDialog/EnhancedDialog';
import { FormattedMessage, useIntl } from 'react-intl';
import { AsDayMonthDateTime } from '../VersionList';
import { compareVersion } from '../../state/reducers/versions';
import { translations } from './translations';
import { useDispatch } from 'react-redux';

export const useStyles = makeStyles(() =>
  createStyles({
    dialogBody: {
      overflow: 'auto',
      minHeight: '50vh'
    },
    noPadding: {
      padding: 0
    },
    singleItemSelector: {
      marginBottom: '10px'
    },
    typography: {
      lineHeight: '1.5'
    }
  })
);

export default function CompareVersionsDialog(props: CompareVersionsDialogProps) {
  const isSelectMode = props.selectedA && !props.selectedB;
  const isCompareMode = props.selectedA && props.selectedB;
  const {
    selectedA,
    selectedB,
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
      title={<FormattedMessage id="compareVersionsDialog.headerTitle" defaultMessage="Compare item versions" />}
      dialogHeaderProps={{
        subtitle: isSelectMode ? (
          <FormattedMessage
            id="compareVersionsDialog.headerSubtitleCompareTo"
            defaultMessage="Select a revision to compare to “{selectedA}”"
            values={{ selectedA: <AsDayMonthDateTime date={selectedA.lastModifiedDate} /> }}
          />
        ) : (
          !isCompareMode && (
            <FormattedMessage
              id="compareVersionsDialog.headerSubtitleCompare"
              defaultMessage="Select a revision to compare"
            />
          )
        ),
        leftActions: isCompareMode
          ? [
              {
                icon: 'BackIcon',
                onClick: () => dispatch(compareVersion({ id: versionsBranch.selected[0] })),
                'aria-label': formatMessage(translations.backToSelectRevision)
              }
            ]
          : null,
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
