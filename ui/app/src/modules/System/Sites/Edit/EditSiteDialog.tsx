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

import React, { PropsWithChildren, useMemo, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from '../../../../components/Dialogs/DialogHeader';
import DialogBody from '../../../../components/Dialogs/DialogBody';
import DialogFooter from '../../../../components/Dialogs/DialogFooter';
import { FormattedMessage } from 'react-intl';
import StandardAction from '../../../../models/StandardAction';
import { useLogicResource, useUnmount } from '../../../../utils/hooks';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { Site } from '../../../../models/Site';
import Suspencified from '../../../../components/SystemStatus/Suspencified';
import { updateSite } from '../../../../services/sites';
import { Resource } from '../../../../models/Resource';

type Source = { site: Site; error: Error };
type Return = Omit<Source, 'error'>;

interface EditSiteDialogUIProps {
  siteName: string;
  siteDescription: string;
  onSiteNameChange: Function;
  onSiteDescriptionChange: Function;
  submitting: boolean;
  onSubmit: Function;
  onClose?(response?: any): any;
}

interface EditSiteDialogUIContainerProps {
  resource: Resource<Pick<Source, "site">>;
  submitting: boolean;
  onSubmit: Function;
  onClose?(response?: any): any;
}

interface EditSiteDialogBaseProps {
  open: boolean;
  site: Site;
}

export type EditSiteDialogProps = PropsWithChildren<EditSiteDialogBaseProps> & {
  onSaveSuccess?(response?: any): any;
  onClose?(response?: any): any;
  onClosed?(response?: any): any;
  onDismiss?(response?: any): any;
}

export interface EditSiteDialogStateProps extends EditSiteDialogBaseProps {
  onSaveSuccess?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
}

function EditSiteDialog(props: EditSiteDialogProps) {
  const {
    site,
    open,
    onClosed,
    onClose,
    onSaveSuccess
  } = props;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useUnmount(onClosed);

  const dialogResource = useMemo(() => ({
    site,
    error
  }), [site, error]);

  const resource = useLogicResource<Return, Source>(dialogResource, {
    shouldResolve: (source) => Boolean(source.site),
    shouldReject: (source) => Boolean(source.error),
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => source.error
  });

  const handleSubmit = (id: string, name: string, description: string) => {
    setSubmitting( true );

    updateSite({id, name, description}).subscribe(
      (response) => {
        setSubmitting( false );
        onSaveSuccess?.(response);
      },
      (e) => {
        setSubmitting( false );
        setError(e);
      }
    )
  };

  return (
    <Dialog
      open={open}
      onClose={onClosed}
      aria-labelledby="editSiteDialogTitle"
      fullWidth
      maxWidth="sm"
    >
      <Suspencified>
        <EditSiteDialogUIContainer
          resource={resource}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={onClose}
        />
      </Suspencified>
    </Dialog>
  );
}

function EditSiteDialogUIContainer(props: EditSiteDialogUIContainerProps) {
  const {
    resource,
    submitting,
    onSubmit,
    onClose
  } = props;
  const site = resource.read().site;
  const [name, setName] = useState(site.name);
  const [description, setDescription] = useState(site.description);

  return (
    <EditSiteDialogUI
      siteName={name}
      siteDescription={description}
      onSiteNameChange={setName}
      onSiteDescriptionChange={setDescription}
      submitting={submitting}
      onSubmit={ () => onSubmit(site.id, name, description) }
      onClose={onClose}
    />
  )
}

function EditSiteDialogUI(props: EditSiteDialogUIProps) {
  const {
    siteName,
    siteDescription,
    onSiteNameChange,
    onSiteDescriptionChange,
    submitting,
    onSubmit,
    onClose
  } = props;

  return (
    <>
      <DialogHeader
        id="editSiteDialogTitle"
        title={
          <FormattedMessage
            id="editSiteDialog.title" defaultMessage="Edit Site"
          />
        }
      />
      <DialogBody>
        <form>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                id="name"
                name="name"
                label={
                  <FormattedMessage
                    id="editSiteDialog.siteName" defaultMessage="Site Name"
                  />
                }
                fullWidth
                onChange={(event) => onSiteNameChange(event.target.value)}
                value={siteName}
                inputProps={{ maxLength: 50 }}
                autoFocus
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="description"
                name="description"
                label={
                  <FormattedMessage
                    id="editSiteDialog.siteDescription" defaultMessage="Site Description"
                  />
                }
                fullWidth
                onChange={(event) => onSiteDescriptionChange(event.target.value)}
                value={siteDescription??''}
                inputProps={{ maxLength: 4000 }}
              />
            </Grid>
          </Grid>
        </form>
      </DialogBody>
      <DialogFooter>
        {
          onClose && (
          <Button onClick={onClose} variant="contained">
            <FormattedMessage id="editSiteDialog.cancel" defaultMessage="Cancel" />
          </Button>
        )}
        {
          onSubmit && (
          <Button onClick={() => onSubmit()} variant="contained" color="primary" autoFocus disabled={submitting}>
            <FormattedMessage id="editSiteDialog.continue" defaultMessage="Continue" />
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

export default EditSiteDialog;
