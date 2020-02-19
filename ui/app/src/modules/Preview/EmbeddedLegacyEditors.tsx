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
import React, { useCallback, useEffect, useRef } from 'react';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CreateIcon from '@material-ui/icons/Create';
import LoadingState from '../../components/SystemStatus/LoadingState';
import clsx from 'clsx';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import { useSpreadState } from '../../utils/hooks';
import { defineMessages, useIntl } from 'react-intl';
import {
  EDIT_FORM_CHANGE_TAB,
  EMBEDDED_LEGACY_FORM_CLOSE,
  EMBEDDED_LEGACY_FORM_PENDING_CHANGES,
  EMBEDDED_LEGACY_FORM_RENDERED,
  RELOAD_REQUEST
} from '../../state/actions/preview';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { getHostToGuestBus } from './previewContext';

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

const styles = makeStyles(() => createStyles({
  iframe: {
    height: '0',
    border: 0,
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
}));

function filterBy(filter: string, changes: object, currentTab: string): Array<string> {
  let array = [];
  Object.keys(changes).forEach((key) => {
    if (changes[key][filter] && key !== currentTab) {
      array.push(key);
    }
  });
  return array;
}

export default function EmbeddedLegacyEditors(props) {
  const { formatMessage } = useIntl();
  const classes = styles({});
  const iframeRef = useRef(null);
  const { dialogConfig, setDialogConfig, getPath, showController = false } = props;
  const [tabsState, setTabsState] = useSpreadState({
    form: { loaded: false, pendingChanges: false },
    template: { loaded: false, pendingChanges: false },
    controller: { loaded: false, pendingChanges: false }
  });

  const messages = fromEvent(window, 'message').pipe(
    filter((e: any) => e.data && e.data.type)
  );

  const handleClose = () => {
    setDialogConfig({ open: false, src: null, type: null, inProgress: true });
  };

  const handleTabChange = useCallback(
    (event: React.ChangeEvent<{}>, type: string) => {
      let inProgress = !tabsState[type].loaded;
      setDialogConfig({ type, inProgress });
      iframeRef.current.contentWindow.postMessage({
        type: EDIT_FORM_CHANGE_TAB,
        tab: type,
        path: getPath(type)
      }, '*');
    }, [getPath, setDialogConfig, tabsState]);

  useEffect(() => {
    if (dialogConfig.open) {
      const messagesSubscription = messages.subscribe((e: any) => {
        let tab = e.data.tab || 'form';
        switch (e.data.type) {
          case EMBEDDED_LEGACY_FORM_CLOSE: {
            let hasSomeLoaded = filterBy('loaded', tabsState, tab);
            if (hasSomeLoaded.length) {
              setTabsState({ [tab]: { loaded: false, pendingChanges: false } });
              handleTabChange(null, hasSomeLoaded[0]);
            } else {
              setDialogConfig({ open: false, src: null, type: null, inProgress: true });
              if (e.data.refresh) {
                getHostToGuestBus().next({ type: RELOAD_REQUEST });
              }
            }
            break;
          }
          case EMBEDDED_LEGACY_FORM_RENDERED: {
            if (dialogConfig.inProgress) {
              setDialogConfig({ inProgress: false });
            }
            setTabsState({ [tab]: { loaded: true, pendingChanges: tabsState[tab].pendingChanges } });
            break;
          }
          case EMBEDDED_LEGACY_FORM_PENDING_CHANGES: {
            if (tabsState[tab].pendingChanges === false) {
              setTabsState({ [tab]: { loaded: true, pendingChanges: true } });
            }
          }
        }
      });
      return () => {
        messagesSubscription.unsubscribe();
      };
    }
  }, [handleTabChange, setDialogConfig, setTabsState, tabsState, dialogConfig, messages]);


  return (
    <Dialog fullScreen open={dialogConfig.open} onClose={handleClose}>
      <AppBar position="static" color='default'>
        <Tabs value={dialogConfig.type} onChange={handleTabChange} aria-label="simple tabs example" centered>
          <Tab
            value="form"
            label={
              <div>
                {formatMessage(translations.contentForm)}
                {tabsState.form.pendingChanges &&
                <CreateIcon className={classes.edited}/>}
              </div>
            }
            disabled={dialogConfig.inProgress}
          />
          <Tab
            value="template"
            label={
              <div>
                {formatMessage(translations.template)}
                {tabsState.template.pendingChanges &&
                <CreateIcon className={classes.edited}/>}
              </div>
            }
            disabled={dialogConfig.inProgress}
          />
          {
            (showController) &&
            <Tab
              value="controller"
              label={
                <div>
                  {formatMessage(translations.controller)}
                  {tabsState.controller.pendingChanges &&
                  <CreateIcon className={classes.edited}/>}
                </div>
              }
              disabled={dialogConfig.inProgress}
            />
          }
        </Tabs>
      </AppBar>
      {
        (dialogConfig.inProgress && dialogConfig.open) &&
        <LoadingState
          title={formatMessage(translations.loadingForm)}
          graphicProps={{ width: 150 }}
          classes={{ root: classes.loadingRoot }}
        />
      }
      <iframe
        ref={iframeRef}
        src={dialogConfig.src}
        title="Embedded Legacy Form"
        className={clsx(classes.iframe, !dialogConfig.inProgress && 'complete')}
      />
    </Dialog>
  )
}
