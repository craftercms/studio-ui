/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import React, { useEffect, useReducer, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import moment from 'moment';

import { Item } from '../../../models/Item';
import PublishDialogUI from "./PublishDialogUI";
import { fetchPublishingChannels } from "../../../services/content";
import { submitToGoLive } from '../../../services/publishing';
import {get} from "../../../utils/ajax";

const messages = defineMessages({
  title: {
    id: 'requestPublishDialog.title',
    defaultMessage: 'Request Publish'
  }
});

const dialogInitialState: any = {
  emailOnApprove: false,
  environment: '',
  submissionComment: '',
  scheduling: 'now',
  scheduledDateTime: moment().format(),
  publishingChannel: null,
  selectedItems: null
};

export interface DependenciesResultObject {
  items1: [],
  items2: []
}

// dependency selection common methods
export const checkState = (items: Item[]) => {
  return (items || []).reduce(
    (table: any, item) => {
      table[item.uri] = true;
      return table;
    },
    {}
  )
};

export const onClickSetChecked = (e: any, item: any, setChecked: Function, checked: any) => {
  e.stopPropagation();
  e.preventDefault();
  setChecked([item.uri], !checked[item.uri])
};

export const updateCheckedList = (uri: string[], isChecked: boolean, checked: any) => {
  const nextChecked = { ...checked };
  (Array.isArray(uri) ? uri : [uri]).forEach((u) => {
    nextChecked[u] = isChecked;
  });
  return nextChecked;
};

export const selectAllDeps = (setChecked: Function, items: Item[]) => {
  setChecked(items.map(i => i.uri), true);
};

export const paths = (checked: any) => (
  Object.entries({ ...checked })
    .filter(([key, value]) => value === true)
    .map(([key]) => key)
);
// end of dependency selection common methods

interface RequestPublishDialogProps {
  onClose(response?: any): any;
  items: Item[];
  siteId: string;
  user: string;
}

function RequestPublishDialog(props: RequestPublishDialogProps) {
  const { items, siteId, user, onClose } = props;

  const [open, setOpen] = React.useState(true);
  const [dialog, setDialog] = useReducer((a, b) => ({ ...a, ...b }), dialogInitialState);
  const [publishingChannels, setPublishingChannels] = useState(null);
  const [publishingChannelsStatus, setPublishingChannelsStatus] = useState('Loading');
  const [checkedItems, setCheckedItems] = useState<any>(checkState(items));   // selected deps
  const [checkedSoftDep, _setCheckedSoftDep] = useState<any>({}); // selected soft deps
  const [deps, setDeps] = useState<DependenciesResultObject>();
  const [showDepsButton, setShowDepsButton] = useState(true);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [apiState, setApiState] = useState({
    publishing: false,
    error: false,
    global: false,
    errorResponse: null
  });

  const { formatMessage } = useIntl();

  useEffect(getPublishingChannels, []);
  useEffect(setRef, [checkedItems, checkedSoftDep]);

  function getPublishingChannels() {
    setPublishingChannelsStatus('Loading');
    setSubmitDisabled(true);
    fetchPublishingChannels(siteId)
      .subscribe(
        ({ response }) => {
          setPublishingChannels(response.availablePublishChannels);
          setPublishingChannelsStatus('Success');
          setSubmitDisabled(false);
        },
        ({ response }) => {
          setPublishingChannelsStatus('Error');
          setSubmitDisabled(true);
        }
      );
  }

  const setSelectedItems = (items) => {
    if (!items || items.length === 0) {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }

    setDialog({ ...dialog, 'selectedItems': items });
  };

  const handleClose = () => {
    setOpen(false);

    //call externalClose fn
    onClose();
  };

  const handleSubmit = () => {
    const data = {
      publishChannel: dialog.environment,
      items: dialog.selectedItems,
      schedule: dialog.scheduling,
      sendEmail: dialog.emailOnApprove,
      submissionComment: dialog.submissionComment,
      ...(
        (dialog.scheduling === 'custom')
          ? { scheduledDate: dialog.scheduledDateTime }
          : {}
      )
    };

    submitToGoLive(siteId, user, data).subscribe(
      ({ response }) => {
        // Need to handle error from here due to api response
        if ( response.status === 200 ) {
          setOpen(false);
          onClose(response);
        } else {
          setApiState({ ...apiState, error: true, errorResponse: response });
        }
      },
      ({ response }) => {
        setApiState({ ...apiState, error: true, errorResponse: (response.response) ? response.response : response });
      }
    );

  }

  // dependency selection internal
  const setChecked = (uri: string[], isChecked: boolean) => {
    setCheckedItems(updateCheckedList(uri, isChecked, checkedItems));
    setShowDepsButton(true);
    setDeps(null);
    cleanCheckedSoftDep();
  };

  const cleanCheckedSoftDep = () => {
    const nextCheckedSoftDep = {};
    _setCheckedSoftDep(nextCheckedSoftDep);
  };

  const setCheckedSoftDep = (uri: string[], isChecked: boolean) => {
    const nextCheckedSoftDep = { ...checkedSoftDep };
    (Array.isArray(uri) ? uri : [uri]).forEach((u) => {
      nextCheckedSoftDep[u] = isChecked;
    });
    _setCheckedSoftDep(nextCheckedSoftDep);
  };

  function setRef() {
    const result = (
      Object.entries({ ...checkedItems, ...checkedSoftDep })
        .filter(([key, value]) => value === true)
        .map(([key]) => key)
    );
    setSelectedItems(result);
  }

  function selectAllSoft() {
    setCheckedSoftDep(deps.items2, true);
  }

  function showAllDependencies() {
    setShowDepsButton(false);
    get(`/studio/api/2/dependency/dependencies?siteId=${siteId}&paths=${paths(checkedItems)}`)
      .subscribe(
        (response: any) => {
          setDeps({
            items1: response.response.items.hardDependencies,
            items2: response.response.items.softDependencies
          });
        },
        () => {
          setDeps({
            items1: [],
            items2: []
          });
        }
      );
  }
  ///////////////////////

  function handleErrorBack() {
    setApiState({ ...apiState, error: false, global: false });
  }

  return (
    <PublishDialogUI
      items={items}
      publishingChannels={publishingChannels}
      publishingChannelsStatus={publishingChannelsStatus}
      getPublishingChannels={getPublishingChannels}
      handleClose={handleClose}
      handleSubmit={handleSubmit}
      submitDisabled={submitDisabled}
      dialog={dialog}
      setDialog={setDialog}
      open={open}
      title={formatMessage(messages.title)}
      checkedItems={checkedItems}
      setCheckedItems={setChecked}
      checkedSoftDep={checkedSoftDep}
      setCheckedSoftDep={setCheckedSoftDep}
      onClickSetChecked={onClickSetChecked}
      deps={deps}
      showDepsButton={showDepsButton}
      selectAllDeps={selectAllDeps}
      selectAllSoft={selectAllSoft}
      onClickShowAllDeps={showAllDependencies}
      showEmailCheckbox={true}
      apiState={apiState}
      handleErrorBack={handleErrorBack}
    />
  );
}

export default RequestPublishDialog;
