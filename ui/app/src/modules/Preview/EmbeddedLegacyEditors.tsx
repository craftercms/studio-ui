/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CreateIcon from '@material-ui/icons/Create';
import { useDispatch } from 'react-redux';
import LoadingState from '../../components/SystemStatus/LoadingState';
import clsx from 'clsx';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import { useSelection, useSpreadState } from '../../utils/hooks';
import { defineMessages, useIntl } from 'react-intl';
import {
  EDIT_FORM_CHANGE_TAB,
  EMBEDDED_LEGACY_FORM_CLOSE,
  EMBEDDED_LEGACY_FORM_FAILURE,
  EMBEDDED_LEGACY_FORM_PENDING_CHANGES,
  EMBEDDED_LEGACY_FORM_RENDERED,
  EMBEDDED_LEGACY_FORM_SAVE,
  RELOAD_REQUEST
} from '../../state/actions/preview';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { getHostToGuestBus } from './previewContext';
import ErrorDialog from '../../components/SystemStatus/ErrorDialog';
import { ApiResponse } from '../../models/ApiResponse';
import StandardAction from '../../models/StandardAction';
import { updateEditConfig } from '../../state/reducers/dialogs/edit';
import { popPiece } from '../../utils/string';
import ContentInstance from '../../models/ContentInstance';

const translations = defineMessages({
  contentForm: {
    id: 'craftercms.edit.contentForm',
    defaultMessage: 'Content Form'
  },
  template: {
    id: 'craftercms.edit.template',
    defaultMessage: 'Template'
  },
  controller: {
    id: 'craftercms.edit.controller',
    defaultMessage: 'Controller'
  },
  loadingForm: {
    id: 'craftercms.edit.loadingForm',
    defaultMessage: 'Loading...'
  }
});

const styles = makeStyles(() =>
  createStyles({
    iframe: {
      'height': '0',
      'border': 0,
      '&.complete': {
        height: '100%'
      }
    },
    loadingRoot: {
      height: 'calc(100% - 104px)',
      justifyContent: 'center'
    },
    edited: {
      width: '12px',
      height: '12px',
      marginLeft: '5px'
    }
  })
);

function filterBy(filter: string, changes: object, currentTab: string): Array<string> {
  let array = [];
  Object.keys(changes).forEach((key) => {
    if (changes[key][filter] && key !== currentTab) {
      array.push(key);
    }
  });
  return array;
}

interface EmbeddedLegacyEditorsBaseProps {
  open?: boolean;
  src?: string;
  type?: string;
  inProgress?: boolean;
  showController?: boolean;
  showTabs?: boolean;
  itemModel?: ContentInstance;
  embeddedParentPath?: string;
}

export type EmbeddedLegacyEditorsProps = PropsWithChildren<EmbeddedLegacyEditorsBaseProps & {
  onSaveSuccess?(response?: any): any;
  onClose?(): any;
  onDismiss?(): any;
}>;

export interface EmbeddedLegacyEditorsStateProps extends EmbeddedLegacyEditorsBaseProps {
  onSaveSuccess?: StandardAction;
  onClose?: StandardAction;
  onDismiss?: StandardAction;
}

export default function EmbeddedLegacyEditors(props: EmbeddedLegacyEditorsProps) {
  const {
    open,
    src,
    type,
    inProgress,
    showController = false,
    showTabs = true,
    itemModel,
    embeddedParentPath,
    onSaveSuccess,
    onDismiss,
    onClose,
  } = props;
  const { formatMessage } = useIntl();
  const classes = styles({});
  const iframeRef = useRef(null);
  const dispatch = useDispatch();
  const [error, setError] = useState<ApiResponse>(null);
  const contentTypesBranch = useSelection(state => state.contentTypes);

  const [tabsState, setTabsState] = useSpreadState({
    form: { loaded: false, pendingChanges: false },
    template: { loaded: false, pendingChanges: false },
    controller: { loaded: false, pendingChanges: false }
  });

  const messages = fromEvent(window, 'message').pipe(filter((e: any) => e.data && e.data.type));

  const onErrorClose = () => {
    setError(null);
    closeEmbeddedLegacyForm(false);
  };

  const getPath = useCallback((type?: string) => {
    switch (type) {
      case 'publish':
      case 'form': {
        if (embeddedParentPath) return embeddedParentPath;
        return itemModel.craftercms.path;
      }
      case 'template': {
        return contentTypesBranch.byId[itemModel.craftercms.contentType].displayTemplate;
      }
      case 'controller': {
        let pageName = popPiece(itemModel.craftercms.contentType, '/');
        return `/scripts/pages/${pageName}.groovy`;
      }
      default: {
        return itemModel.craftercms.path;
      }
    }
  }, [contentTypesBranch.byId, embeddedParentPath, itemModel]);

  const handleTabChange = useCallback((event: React.ChangeEvent<{}>, type: string) => {
    let inProgress = !tabsState[type].loaded;
    const config = { type, inProgress };
    dispatch(updateEditConfig(config));
    iframeRef.current.contentWindow.postMessage(
      {
        type: EDIT_FORM_CHANGE_TAB,
        tab: type,
        path: getPath(type)
      },
      '*'
    );

  }, [getPath, tabsState, dispatch]);

  const closeEmbeddedLegacyForm = useCallback((refresh: boolean, tab?: string) => {
    let hasSomeLoaded = filterBy('loaded', tabsState, tab);

    if (hasSomeLoaded.length && tab) {
      setTabsState({ [tab]: { loaded: false, pendingChanges: false } });
      handleTabChange(null, hasSomeLoaded[0]);
    } else {
      !showTabs && setTabsState({ [tab]: { loaded: false, pendingChanges: false } });

      onDismiss();
      if (refresh) {
        getHostToGuestBus().next({ type: RELOAD_REQUEST });
      }
    }
  }, [onDismiss, handleTabChange, setTabsState, tabsState, showTabs]);

  useEffect(() => {
    if (open) {
      const messagesSubscription = messages.subscribe((e: any) => {
        let tab = e.data.tab || 'form';
        switch (e.data.type) {
          case EMBEDDED_LEGACY_FORM_CLOSE: {
            closeEmbeddedLegacyForm(e.data.refresh, tab);
            break;
          }
          case EMBEDDED_LEGACY_FORM_RENDERED: {
            if (inProgress) {
              const config = { inProgress: false };
              dispatch(updateEditConfig(config));
            }
            setTabsState({
              [tab]: { loaded: true, pendingChanges: tabsState[tab].pendingChanges }
            });
            break;
          }
          case EMBEDDED_LEGACY_FORM_PENDING_CHANGES: {
            if (tabsState[tab].pendingChanges === false) {
              setTabsState({ [tab]: { loaded: true, pendingChanges: true } });
            }
            break;
          }
          case EMBEDDED_LEGACY_FORM_SAVE: {
            closeEmbeddedLegacyForm(e.data.refresh, tab);
            onSaveSuccess?.(e.data);
            break;
          }
          case EMBEDDED_LEGACY_FORM_FAILURE: {
            setError({
              message: e.data.message
            });
            break;
          }
        }
      });
      return () => {
        messagesSubscription.unsubscribe();
      };
    }
  }, [
    inProgress,
    open,
    onSaveSuccess,
    handleTabChange,
    setTabsState,
    tabsState,
    messages,
    closeEmbeddedLegacyForm,
    dispatch
  ]);

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      {showTabs && (
        <AppBar position="static" color="default">
          <Tabs
            value={type}
            onChange={handleTabChange}
            aria-label="simple tabs example"
            centered
          >
            <Tab
              value="form"
              label={
                <div>
                  {formatMessage(translations.contentForm)}
                  {tabsState.form.pendingChanges && <CreateIcon className={classes.edited} />}
                </div>
              }
              disabled={inProgress}
            />
            <Tab
              value="template"
              label={
                <div>
                  {formatMessage(translations.template)}
                  {tabsState.template.pendingChanges && <CreateIcon className={classes.edited} />}
                </div>
              }
              disabled={inProgress}
            />
            {showController && (
              <Tab
                value="controller"
                label={
                  <div>
                    {formatMessage(translations.controller)}
                    {tabsState.controller.pendingChanges && (
                      <CreateIcon className={classes.edited} />
                    )}
                  </div>
                }
                disabled={inProgress}
              />
            )}
          </Tabs>
        </AppBar>
      )}

      {inProgress && open && (
        <LoadingState
          title={formatMessage(translations.loadingForm)}
          classes={{ root: classes.loadingRoot }}
        />
      )}
      <iframe
        ref={iframeRef}
        src={src}
        title="Embedded Legacy Form"
        className={clsx(classes.iframe, !inProgress && 'complete')}
      />
      <ErrorDialog open={Boolean(error)} error={error} onDismiss={onErrorClose} />
    </Dialog>
  );
}
