/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import { registerComponents } from './env/registerComponents';
import { createCodebaseBridge } from './env/codebase-bridge';
import { publishCrafterGlobal } from './env/craftercms';
import { setRequestForgeryToken } from './utils/auth';

registerComponents();
publishCrafterGlobal();
setRequestForgeryToken();
createCodebaseBridge();

declare global {
  interface Window {
    CrafterCMSNext;
    CStudioAuthoring;
  }
}

const { formatMessage } = window.CrafterCMSNext.i18n.intl;
const { embeddedLegacyFormMessages } = window.CrafterCMSNext.i18n.messages;
const path = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'path');
const site = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'site');
const type = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'type');
const contentType = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'contentType');
const readOnly = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'readonly') === 'true';
const iceId = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'iceId');
const selectedFields = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'selectedFields');
const fieldsIndexes = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'fieldsIndexes');
const newEmbedded = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'newEmbedded');
const contentTypeId = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'contentTypeId');
const isNewContent = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'isNewContent') === 'true';
const LEGACY_FORM_DIALOG_CANCEL_REQUEST = 'LEGACY_FORM_DIALOG_CANCEL_REQUEST';

window.CStudioAuthoring.OverlayRequiredResources.loadContextNavCss();

function openDialog(path) {
  const modelId = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'modelId');
  const isHidden = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'isHidden') === 'true';
  const canEdit = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'canEdit') === 'true';
  const changeTemplate = window.CStudioAuthoring.Utils.getQueryVariable(location.search, 'changeTemplate');

  const embeddedData = newEmbedded ? JSON.parse(newEmbedded) : false;

  const aux = [];
  if (readOnly) aux.push({ name: 'readonly' });
  if (changeTemplate) aux.push({ name: 'changeTemplate', value: changeTemplate });
  if (canEdit) aux.push({ name: 'canEdit', value: canEdit });

  if (!isNewContent) {
    window.CStudioAuthoring.Service.lookupContentItem(
      site,
      path,
      {
        success: (contentTO) => {
          window.CStudioAuthoring.Operations.performSimpleIceEdit(
            contentTO.item,
            selectedFields ? JSON.parse(decodeURIComponent(selectedFields)) : iceId,
            true,
            {
              success: (response, editorId, name, value, draft, action) => {
                window.parent.postMessage(
                  {
                    ...response,
                    type: 'EMBEDDED_LEGACY_FORM_SUCCESS',
                    refresh: true,
                    tab: type,
                    action
                  },
                  '*'
                );
              },
              failure: (error) => {
                error && console.error(error);
                window.parent.postMessage(
                  {
                    type: 'EMBEDDED_LEGACY_FORM_FAILURE',
                    refresh: false,
                    tab: type,
                    action: 'failure',
                    message: formatMessage(embeddedLegacyFormMessages.contentFormFailedToLoadErrorMessage)
                  },
                  '*'
                );
              },
              cancelled: (response) => {
                let close = true;
                if (response && response.close === false) {
                  close = false;
                }
                window.parent.postMessage(
                  {
                    type: 'EMBEDDED_LEGACY_FORM_CLOSE',
                    refresh: false,
                    close: close,
                    tab: type,
                    action: 'cancelled'
                  },
                  '*'
                );
              },
              renderComplete: () => {
                if (modelId || embeddedData) {
                  window.CStudioAuthoring.InContextEdit.messageDialogs({
                    type: 'OPEN_CHILD_COMPONENT',
                    key: Boolean(modelId) ? modelId : null,
                    iceId: selectedFields ? JSON.parse(decodeURIComponent(selectedFields)) : iceId,
                    contentType: embeddedData ? embeddedData.contentType : null,
                    edit: Boolean(modelId),
                    selectorId: embeddedData ? embeddedData.fieldId : null,
                    ds: embeddedData ? embeddedData.datasource : null,
                    order: embeddedData ? embeddedData.index : null,
                    callback: {
                      renderComplete: 'EMBEDDED_LEGACY_FORM_RENDERED',
                      pendingChanges: 'EMBEDDED_LEGACY_FORM_PENDING_CHANGES'
                    }
                  });
                } else {
                  window.parent.postMessage({ type: 'EMBEDDED_LEGACY_FORM_RENDERED' }, '*');
                }
              },
              pendingChanges: () => {
                window.parent.postMessage(
                  {
                    type: 'EMBEDDED_LEGACY_FORM_PENDING_CHANGES',
                    action: 'pendingChanges'
                  },
                  '*'
                );
              },
              renderFailed(error) {
                window.parent.postMessage({ type: 'EMBEDDED_LEGACY_FORM_RENDER_FAILED', payload: { error } }, '*');
              },
              changeToEditMode() {
                window.parent.postMessage({ type: 'EMBEDDED_LEGACY_CHANGE_TO_EDIT_MODE' }, '*');
              },
              minimize: () => {
                window.parent.postMessage(
                  {
                    type: 'EMBEDDED_LEGACY_MINIMIZE_REQUEST'
                  },
                  '*'
                );
              },
              isParent: true,
              id: type
            },
            aux,
            null,
            !!isHidden,
            fieldsIndexes ? JSON.parse(decodeURIComponent(fieldsIndexes)) : null
          );
        },
        failure: (error) => {
          error && console.error(error);
          window.parent.postMessage(
            {
              type: 'EMBEDDED_LEGACY_FORM_FAILURE',
              refresh: false,
              tab: type,
              action: 'failure',
              message: formatMessage(embeddedLegacyFormMessages.contentFormFailedToLoadErrorMessage)
            },
            '*'
          );
        }
      },
      false,
      false
    );
  } else {
    window.CStudioAuthoring.Operations.openContentWebForm(
      contentTypeId,
      null,
      null,
      window.CStudioAuthoring.Operations.processPathsForMacros(path, null, true),
      false,
      false,
      {
        success: (response, editorId, name, value, draft, action) => {
          window.parent.postMessage(
            {
              ...response,
              type: 'EMBEDDED_LEGACY_FORM_SAVE',
              refresh: false,
              tab: type,
              redirectUrl: response.item?.browserUri,
              action,
              isNew: true
            },
            '*'
          );
        },
        failure: (error) => {
          error && console.error(error);
          window.parent.postMessage(
            {
              type: 'EMBEDDED_LEGACY_FORM_FAILURE',
              refresh: false,
              tab: type,
              action: 'failure',
              message: formatMessage(embeddedLegacyFormMessages.contentFormFailedToLoadErrorMessage)
            },
            '*'
          );
        },
        cancelled: () => {
          window.parent.postMessage(
            {
              close: true,
              type: 'EMBEDDED_LEGACY_FORM_CLOSE',
              refresh: false,
              tab: type,
              action: 'cancelled'
            },
            '*'
          );
        },
        renderComplete: () => {
          window.parent.postMessage({ type: 'EMBEDDED_LEGACY_FORM_RENDERED' }, '*');
        },
        pendingChanges: () => {
          window.parent.postMessage({ type: 'EMBEDDED_LEGACY_FORM_PENDING_CHANGES', action: 'pendingChanges' }, '*');
        },
        id: type
      },
      null
    );
  }
}

window.addEventListener(
  'message',
  (event) => {
    if (event.data.type === LEGACY_FORM_DIALOG_CANCEL_REQUEST) {
      window.CStudioAuthoring.InContextEdit.messageDialogs({ type: LEGACY_FORM_DIALOG_CANCEL_REQUEST });
    }
    if (event.data.type === 'LEGACY_FORM_DIALOG_RENAMED_CONTENT') {
      window.CStudioAuthoring.InContextEdit.messageDialogs(event.data, '*');
    }
  },
  false
);

window.CrafterCMSNext.system.getStore().subscribe(() => {
  openDialog(path);
});
