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
import {defineMessages, useIntl} from "react-intl";
import {fetchPublishingChannels} from "../../../services/content";
import {goLive} from "../../../services/publishing";
import {get} from "../../../utils/ajax";
import {
  checkState,
  onClickSetChecked,
  paths,
  selectAllDeps,
  updateCheckedList,
  DependenciesResultObject
} from "../Submit/RequestPublishDialog";
import PublishDialogUI from "../Submit/PublishDialogUI";
import {Item} from "../../../models/Item";
import moment from "moment";

const messages = defineMessages({
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

const dialogInitialState: any = {
  emailOnApprove: false,
  environment: '',
  submissionComment: '',
  scheduling: 'now',
  scheduledDateTime: moment().format(),
  scheduledTimeZone: 'America/Costa_Rica',
  publishingChannel: null,
  selectedItems: null
};

interface ApproveDialogProps {
  onClose(): any;
  items: Item[];
  siteId: string;
}

function ApproveDialog(props: ApproveDialogProps) {
  const { items, siteId, onClose } = props;

  const [open, setOpen] = React.useState(true);
  const [dialog, setDialog] = useReducer((a, b) => ({ ...a, ...b }), dialogInitialState);
  const [publishingChannels, setPublishingChannels] = useState(null);
  const [checkedItems, setCheckedItems] = useState<any>(checkState(items));   // selected deps
  const [checkedSoftDep, _setCheckedSoftDep] = useState<any>({}); // selected soft deps
  const [deps, setDeps] = useState<DependenciesResultObject>();
  const [showDepsButton, setShowDepsButton] = useState(true);

  const { formatMessage } = useIntl();

  useEffect(getPublishingChannels, []);
  useEffect(setRef, [checkedItems, checkedSoftDep]);

  function getPublishingChannels() {
    fetchPublishingChannels(siteId)
      .subscribe(
        ({ response }) => {
          setPublishingChannels(response.availablePublishChannels);
        },
        ({ response }) => {

        }
      );
  }

  const setSelectedItems = (items) => {
    setDialog({ ...dialog, 'selectedItems': items });
  };

  const handleClose = () => {
    setOpen(false);

    //call externalClose fn
    onClose();
  };

  const handleSubmit = () => {
    const data = {
      environment: dialog.environment,
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

    goLive(siteId, 'author', data).subscribe(
      ({ response }) => {
        console.log("SUBMIT RESPONSE", response);
        setOpen(false);
      },
      ({ response }) => {

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

  return (
    <>
      {
        publishingChannels &&
        <PublishDialogUI
          items={items}
          publishingChannels={publishingChannels}
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          dialog={dialog}
          setDialog={setDialog}
          open={open}
          title={formatMessage(messages.title)}
          subtitle={formatMessage(messages.subtitle)}
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
        />
      }
    </>
  );
}

export default ApproveDialog;
