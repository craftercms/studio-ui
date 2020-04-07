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

import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { fetchPublishingChannels } from '../../../services/content';
import { goLive, submitToGoLive } from '../../../services/publishing';
import { fetchDependencies } from '../../../services/dependencies';
import PublishDialogUI from './PublishDialogUI';
import { Item, LegacyItem } from '../../../models/Item';
import moment from 'moment';
import { useSelector } from 'react-redux';
import GlobalState from '../../../models/GlobalState';
import { useActiveSiteId, useOnMount, useSpreadState } from '../../../utils/hooks';

const goLiveMessages = defineMessages({
  title: {
    id: 'approveDialog.title',
    defaultMessage: 'Approve for Publish'
  },
  subtitle: {
    id: 'approveDialog.subtitle',
    defaultMessage: 'Selected files will go live upon submission. Hard dependencies are automatically submitted with the ' +
      'main items. You may choose whether to submit or not soft dependencies'
  }
});

const submitMessages = defineMessages({
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

export const checkState = (items: LegacyItem[]) => {
  return (items || []).reduce(
    (table: any, item) => {
      table[item.uri] = true;
      return table;
    },
    {}
  );
};

export const onClickSetChecked = (e: any, item: any, setChecked: Function, checked: any) => {
  e.stopPropagation();
  e.preventDefault();
  setChecked([item.uri], !checked[item.uri]);
};

export const updateCheckedList = (uri: string[], isChecked: boolean, checked: any) => {
  const nextChecked = { ...checked };
  (Array.isArray(uri) ? uri : [uri]).forEach((u) => {
    nextChecked[u] = isChecked;
  });
  return nextChecked;
};

export const selectAllDeps = (setChecked: Function, items: LegacyItem[]) => {
  setChecked(items.map(i => i.uri), true);
};

export const paths = (checked: any) => (
  Object.entries({ ...checked })
    .filter(([key, value]) => value === true)
    .map(([key]) => key)
);

interface PublishDialogProps {
  items: LegacyItem[];
  scheduling?: string;

  onClose?(response?: any): any;

  onSuccess?(response?: any): any;
}

const submitMap = {
  'admin': goLive,
  'author': submitToGoLive
};

function PublishDialog(props: PublishDialogProps) {
  const {
    items,
    scheduling = 'now',
    onClose,
    onSuccess
  } = props;

  const [open, setOpen] = React.useState(true);
  const [dialog, setDialog] = useSpreadState({ ...dialogInitialState, scheduling });
  const [publishingChannels, setPublishingChannels] = useState(null);
  const [publishingChannelsStatus, setPublishingChannelsStatus] = useState('Loading');
  const [checkedItems, setCheckedItems] = useState<any>(checkState(items));   // selected deps
  const [checkedSoftDep, _setCheckedSoftDep] = useState<any>({}); // selected soft deps
  const [deps, setDeps] = useState<DependenciesResultObject>();
  const [showDepsButton, setShowDepsButton] = useState(true);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [showDepsDisabled, setShowDepsDisabled] = useState(false);
  const [apiState, setApiState] = useState({
    error: false,
    submitting: false,
    global: false,
    errorResponse: null
  });

  const user = useSelector<GlobalState, GlobalState['user']>(state => state.user);
  const siteId = useActiveSiteId();
  const userSitesRoles: String[] = user.rolesBySite[siteId];
  const userRole = userSitesRoles.includes('admin') ? 'admin' : 'author';
  const submit = submitMap[userRole];

  const { formatMessage } = useIntl();

  const setSelectedItems = useCallback((items) => {
    if (!items || items.length === 0) {
      setSubmitDisabled(true);
      setShowDepsDisabled(true);
    } else {
      setSubmitDisabled(false);
      setShowDepsDisabled(false);
    }
    setDialog({ selectedItems: items });
  }, [setDialog]);

  const getPublishingChannels = useCallback(() => {
    setPublishingChannelsStatus('Loading');
    setSubmitDisabled(true);
    fetchPublishingChannels(siteId).subscribe(
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
  }, [siteId]);

  useOnMount(getPublishingChannels);

  useEffect(() => {
    const result = (
      Object.entries({ ...checkedItems, ...checkedSoftDep })
        .filter(([key, value]) => value)
        .map(([key]) => key)
    );
    setSelectedItems(result);
  }, [checkedItems, checkedSoftDep, setSelectedItems]);

  const handleClose = () => {
    setOpen(false);

    // call externalClose fn
    onClose?.();
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

    setApiState({ ...apiState, submitting: true });

    submit(siteId, user.username, data).subscribe(
      (response) => {
        setOpen(false);
        setApiState({ ...apiState, error: false, submitting: false });
        onSuccess?.(response);
        onClose?.(response);
      },
      (response) => {
        if (response) {
          setApiState({ ...apiState, error: true, errorResponse: (response.response) ? response.response : response });
        }
      }
    );

  };

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

  function selectAllSoft() {
    setCheckedSoftDep(deps.items2, true);
  }

  function showAllDependencies() {
    setShowDepsButton(false);
    fetchDependencies(siteId, paths(checkedItems)).subscribe(
      (items) => {
        setDeps({
          items1: items.hardDependencies,
          items2: items.softDependencies
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

  function handleErrorBack() {
    setApiState({ ...apiState, error: false, global: false });
  }

  return (
    <PublishDialogUI
      items={items}
      publishingChannels={publishingChannels}
      publishingChannelsStatus={publishingChannelsStatus}
      onPublishingChannelsFailRetry={getPublishingChannels}
      handleClose={handleClose}
      handleSubmit={handleSubmit}
      submitDisabled={submitDisabled}
      setSubmitDisabled={setSubmitDisabled}
      showDepsDisabled={showDepsDisabled}
      dialog={dialog}
      setDialog={setDialog}
      open={open}
      title={formatMessage(userRole === 'admin' ? goLiveMessages.title : submitMessages.title)}
      subtitle={userRole === 'admin' ? formatMessage(goLiveMessages.subtitle) : null}
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
      apiState={apiState}
      handleErrorBack={handleErrorBack}
      showEmailCheckbox={!(userRole === 'admin')}
    />
  );
}

export default PublishDialog;
