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
import useSpreadState from '../../hooks/useSpreadState';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import { DialogHeader } from '../DialogHeader';
import ViewVersionDialogContainer from '../ViewVersionDialog/ViewVersionDialogContainer';
import { ViewVersionDialogProps } from '../ViewVersionDialog/utils';
import { Backdrop } from '@mui/material';

const compareSubDialogInitialState = {
  open: false,
  isFetching: false,
  error: null
};

const viewSubDialogInitialState = {
  open: false,
  isFetching: false,
  error: null
};

export function CompareVersionsDialog(props: CompareVersionsDialogProps) {
  const [compareXml, setCompareXml] = useState(false);
  const {
    subtitle,
    selectedA,
    selectedB,
    leftActions,
    rightActions,
    versionsBranch,
    isFetching,
    error,
    disableItemSwitching,
    contentTypesBranch,
    selectionContent,
    fields,
    TransitionComponent = Slide,
    TransitionProps,
    onClose,
    ...rest
  } = props;
  const { formatMessage } = useIntl();
  const largeHeightScreen = useMediaQuery('(min-height: 880px)');
  const locale = useLocale();

  const [compareSubDialogState, setCompareSubDialogState] =
    useSpreadState<CompareVersionsDialogProps>(compareSubDialogInitialState);
  const [viewSubDialogState, setViewSubDialogState] = useSpreadState<ViewVersionDialogProps>(viewSubDialogInitialState);

  const onDialogClose = (event, reason) => {
    setCompareSubDialogState(compareSubDialogInitialState);
    setViewSubDialogState(viewSubDialogInitialState);
    onClose?.(event, reason);
  };

  return (
    <EnhancedDialog
      title={<FormattedMessage defaultMessage="Compare Versions" />}
      subtitle={
        subtitle ?? (
          <>
            <AsDayMonthDateTime date={selectedA?.modifiedDate} locale={locale} />
            <CompareArrowsIcon fontSize="small" />
            <AsDayMonthDateTime date={selectedB?.modifiedDate} locale={locale} />
          </>
        )
      }
      dialogHeaderProps={{
        leftActions,
        rightActions: [
          ...(!selectionContent
            ? [
                {
                  icon: { id: '@mui/icons-material/TextSnippetOutlined' },
                  text: formatMessage(translations.compareContent),
                  onClick: () => setCompareXml(false),
                  sx: {
                    color: (theme) => (!compareXml ? theme.palette.primary.main : theme.palette.text.secondary),
                    fontSize: 14
                  }
                },
                {
                  icon: { id: '@mui/icons-material/CodeRounded' },
                  text: formatMessage(translations.compareXml),
                  onClick: () => setCompareXml(true),
                  sx: {
                    color: (theme) => (compareXml ? theme.palette.primary.main : theme.palette.text.secondary),
                    fontSize: 14
                  }
                }
              ]
            : []),
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
      TransitionComponent={TransitionComponent}
      TransitionProps={TransitionProps}
      sx={{
        [`.${dialogClasses.paper}`]: {
          height: largeHeightScreen ? 'calc(100% - 200px)' : 'calc(100% - 60px)',
          maxHeight: '1000px',
          width: 'calc(100% - 64px)',
          overflow: 'hidden'
        }
      }}
      onClose={onDialogClose}
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
        selectionContent={selectionContent}
        fields={fields}
        setCompareSubDialogState={setCompareSubDialogState}
        setViewSubDialogState={setViewSubDialogState}
      />

      {/* Sub-views for inner views */}
      <Backdrop
        open={compareSubDialogState.open || viewSubDialogState.open}
        sx={{ /* position: 'absolute', */ zIndex: 1200 }}
        onClick={() => {
          setCompareSubDialogState({ open: false });
          setViewSubDialogState({ open: false });
        }}
      />
      {/* region Compare */}
      <Drawer
        open={compareSubDialogState.open}
        anchor="right"
        variant="persistent"
        sx={{
          '& > .MuiDrawer-root': {
            position: 'absolute'
          },
          '& > .MuiPaper-root': {
            width: '90%',
            position: 'absolute'
          }
        }}
      >
        <Box display="flex" flexDirection="column" height="100%">
          <DialogHeader
            title={compareSubDialogState.title}
            subtitle={compareSubDialogState.subtitle}
            onCloseButtonClick={(e) => compareSubDialogState.onClose(e, null)}
          />
          <CompareVersionsDialogContainer {...compareSubDialogState} compareXml={false} />
        </Box>
      </Drawer>
      {/* endregion */}
      {/* region View */}
      <Drawer
        open={viewSubDialogState.open}
        anchor="right"
        variant="persistent"
        sx={{
          '& > .MuiDrawer-root': {
            position: 'absolute'
          },
          '& > .MuiPaper-root': {
            width: '90%',
            position: 'absolute'
          }
        }}
      >
        <DialogHeader
          title={viewSubDialogState.title}
          subtitle={viewSubDialogState.subtitle}
          onCloseButtonClick={(e) => viewSubDialogState.onClose(e, null)}
        />
        <ViewVersionDialogContainer {...viewSubDialogState} showXml={false} />
      </Drawer>
      {/* endregion */}
    </EnhancedDialog>
  );
}

export default CompareVersionsDialog;
