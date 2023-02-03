/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import * as React from 'react';
import DialogContent from '@mui/material/DialogContent';
import { DialogFooter } from '../DialogFooter';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import DialogContentText from '@mui/material/DialogContentText';
import PrimaryButton from '../PrimaryButton';
import questionGraphicUrl from '../../assets/question.svg';
import SecondaryButton from '../SecondaryButton';
import { NoTemplateDialogContainerProps } from './utils';
import { closeCreateFileDialog, showCreateFileDialog } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';
import { batchActions, dispatchDOMEvent } from '../../state/actions/misc';
import { createCustomDocumentEventListener } from '../../utils/dom';
import BrowseFilesDialog from '../BrowseFilesDialog';
import { useState } from 'react';
import { MediaItem } from '../../models';

export function NoTemplateDialogContainer(props: NoTemplateDialogContainerProps) {
  const { type, classes, imageUrl = questionGraphicUrl, onTemplateCreated, onTemplateSelected, onStay, onSave } = props;
  const [browseDialogOpen, setBrowseDialogOpen] = useState(false);
  const dispatch = useDispatch();

  const onCreateTemplate = () => {
    const templateCreatedEvent = 'templateCreated';

    dispatch(
      showCreateFileDialog({
        path: '/templates/web',
        type: 'template',
        onCreated: batchActions([closeCreateFileDialog(), dispatchDOMEvent({ id: templateCreatedEvent })])
      })
    );

    createCustomDocumentEventListener(templateCreatedEvent, (response) => {
      const { fileName, path } = response;
      onTemplateCreated(`${path}/${fileName}`);
    });
  };

  return (
    <>
      <DialogContent className={classes.dialogBody}>
        <img src={imageUrl} alt="" className={classes.dialogImage} />
        <Typography variant="body1" component="h2" className={classes.dialogTitle}>
          <FormattedMessage id="noTemplateDialog.title" defaultMessage="Missing Template" />
        </Typography>
        <DialogContentText color="textPrimary" variant="body2">
          <FormattedMessage
            id="noTemplateDialog.body"
            defaultMessage="Confirm a template is not required for this content type. Failing to assign a template would cause rendering
          issues on templated apps."
          />
        </DialogContentText>
      </DialogContent>
      <DialogFooter className={classes.dialogFooter} sx={{ mt: 2 }}>
        <PrimaryButton onClick={onSave} fullWidth>
          {type === 'save' ? (
            <FormattedMessage id="noTemplateDialog.saveAndClose" defaultMessage="Template not required, save" />
          ) : (
            <FormattedMessage id="noTemplateDialog.save" defaultMessage="Template not required, save & close" />
          )}
        </PrimaryButton>
        <PrimaryButton onClick={onCreateTemplate} fullWidth>
          <FormattedMessage id="noTemplateDialog.createTemplate" defaultMessage="Create a template" />
        </PrimaryButton>
        <PrimaryButton onClick={() => setBrowseDialogOpen(true)} fullWidth>
          <FormattedMessage id="noTemplateDialog.chooseTemplate" defaultMessage="Choose existing template" />
        </PrimaryButton>
        <SecondaryButton autoFocus onClick={onStay} fullWidth>
          <FormattedMessage id="noTemplateDialog.stay" defaultMessage="Stay & continue editing" />
        </SecondaryButton>
      </DialogFooter>
      <BrowseFilesDialog
        path="/templates/web"
        open={browseDialogOpen}
        onClose={() => setBrowseDialogOpen(false)}
        onSuccess={(template: MediaItem) => {
          setBrowseDialogOpen(false);
          onTemplateSelected(template.path);
        }}
      />
    </>
  );
}

export default NoTemplateDialogContainer;
