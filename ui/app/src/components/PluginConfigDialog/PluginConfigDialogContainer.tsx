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

import DialogBody from '../DialogBody';
import DialogFooter from '../DialogFooter';
import { PluginConfigDialogContainerProps } from './utils';
import React, { useEffect, useRef, useState } from 'react';
import { ConditionalLoadingState } from '../LoadingState';
import AceEditor from '../AceEditor/AceEditor';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage, useIntl } from 'react-intl';
import PrimaryButton from '../PrimaryButton';
import { getPluginConfiguration, setPluginConfiguration } from '../../services/marketplace';
import { useActiveSiteId } from '../../hooks';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showSystemNotification } from '../../state/actions/system';
import { translations } from '../SiteConfigurationManagement/translations';

export function PluginConfigDialogContainer(props: PluginConfigDialogContainerProps) {
  const siteId = useActiveSiteId();
  const { pluginId, onSaved, isSubmitting, onClose, onSubmittingAndOrPendingChange } = props;
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const editorRef = useRef<any>();
  const dispatch = useDispatch();
  const [disabledSaveButton, setDisabledSaveButton] = useState(true);
  const { formatMessage } = useIntl();

  useEffect(() => {
    setLoading(true);
    getPluginConfiguration(siteId, pluginId).subscribe({
      next: (content) => {
        setContent(content);
        setLoading(false);
      },
      error: ({ response }) => {
        dispatch(
          showErrorDialog({
            error: response
          })
        );
      }
    });
  }, [dispatch, pluginId, siteId]);

  const onEditorChanges = () => {
    if (content !== editorRef.current.getValue()) {
      setDisabledSaveButton(false);
      onSubmittingAndOrPendingChange?.({ hasPendingChanges: true });
    } else {
      setDisabledSaveButton(true);
      onSubmittingAndOrPendingChange?.({ hasPendingChanges: false });
    }
  };

  const onSave = () => {
    const content = editorRef.current.getValue();
    const errors = editorRef.current
      .getSession()
      .getAnnotations()
      .filter((annotation) => {
        return annotation.type === 'error';
      });

    if (errors.length) {
      dispatch(
        showSystemNotification({
          message: formatMessage(translations.documentError),
          options: {
            variant: 'error'
          }
        })
      );
    } else {
      onSubmittingAndOrPendingChange({ isSubmitting: true });
      setPluginConfiguration(siteId, pluginId, content).subscribe({
        next: () => {
          onSubmittingAndOrPendingChange({ isSubmitting: false, hasPendingChanges: false });
          onSaved();
        },
        error: ({ response }) => {
          onSubmittingAndOrPendingChange({ isSubmitting: false });
          dispatch(
            showErrorDialog({
              error: response.response
            })
          );
        }
      });
    }
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  return (
    <>
      <DialogBody sx={{ height: '60vh', padding: 0 }}>
        <ConditionalLoadingState isLoading={loading} styles={{ root: { flexGrow: 1 } }}>
          <AceEditor
            ref={editorRef}
            mode="ace/mode/xml"
            theme="ace/theme/textmate"
            autoFocus={true}
            onChange={onEditorChanges}
            value={content}
          />
        </ConditionalLoadingState>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton
          onClick={onCloseButtonClick}
          sx={{
            mr: '8px'
          }}
        >
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton disabled={disabledSaveButton || isSubmitting} onClick={onSave} loading={isSubmitting}>
          <FormattedMessage id="words.save" defaultMessage="Save" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}
