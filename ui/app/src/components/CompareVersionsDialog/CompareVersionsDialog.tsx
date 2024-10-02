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

import React, { createContext, MutableRefObject, useContext, useMemo, useRef, useState } from 'react';
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
import { ViewVersionDialogProps } from '../ViewVersionDialog/utils';

export interface VersionsDialogContextProps {
  compareSlideOutState: CompareVersionsDialogProps;
  viewSlideOutState: ViewVersionDialogProps;
}

export interface VersionsDialogContextApi {
  setState: (state: Partial<VersionsDialogContextProps>) => void;
  setCompareSlideOutState: (props: Partial<CompareVersionsDialogProps>) => void;
  setViewSlideOutState: (props: Partial<ViewVersionDialogProps>) => void;
  closeSlideOuts: () => void;
}

export type VersionsDialogContextType = [VersionsDialogContextProps, MutableRefObject<VersionsDialogContextApi>];

const VersionsDialogContext = createContext<VersionsDialogContextType>(null);

export function useVersionsDialogContext() {
  const context = useContext(VersionsDialogContext);
  if (!context) {
    throw new Error('useMyContext must be used within a MyProvider');
  }
  return context;
}

export function CompareVersionsDialog(props: CompareVersionsDialogProps) {
  // region const { ... } = props
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
  // endregion
  const [compareXml, setCompareXml] = useState(false);
  const { formatMessage } = useIntl();
  const largeHeightScreen = useMediaQuery('(min-height: 880px)');
  const locale = useLocale();

  // region Dialog Context
  const [state, setState] = useState<VersionsDialogContextProps>({
    compareSlideOutState: { open: false, isFetching: false, error: null },
    viewSlideOutState: { open: false, isFetching: false, error: null }
  });
  const contextRef = useRef(null);
  const context = useMemo<VersionsDialogContextType>(() => {
    contextRef.current = {
      setState(nextState: Partial<VersionsDialogContextProps>) {
        setState({ ...state, ...nextState });
      },
      setCompareSlideOutState(props: Partial<CompareVersionsDialogProps>) {
        setState({ ...state, compareSlideOutState: { ...state.compareSlideOutState, ...props } });
      },
      setViewSlideOutState(props: Partial<ViewVersionDialogProps>) {
        setState({ ...state, viewSlideOutState: { ...state.viewSlideOutState, ...props } });
      },
      closeSlideOuts() {
        setState({
          ...state,
          compareSlideOutState: { ...state.compareSlideOutState, open: false },
          viewSlideOutState: { ...state.viewSlideOutState, open: false }
        });
      }
    };
    return [state, contextRef];
  }, [state]);
  // endregion

  // TODO: Add typings
  const onDialogClose = (event, reason) => {
    if (!(state.compareSlideOutState?.open || state.viewSlideOutState?.open)) {
      onClose?.(event, reason);
    }
    context[1].current.closeSlideOuts();
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
      <VersionsDialogContext.Provider value={context}>
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
        />
      </VersionsDialogContext.Provider>
    </EnhancedDialog>
  );
}

export default CompareVersionsDialog;
