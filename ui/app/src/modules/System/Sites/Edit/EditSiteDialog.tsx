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
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import StandardAction from '../../../../models/StandardAction';
import { useLogicResource, useUnmount } from '../../../../utils/hooks';
import TextField from '@material-ui/core/TextField';
import { Site } from '../../../../models/Site';
import Suspencified from '../../../../components/SystemStatus/Suspencified';
import { updateSite } from '../../../../services/sites';
import { Resource } from '../../../../models/Resource';
import { useDispatch, useSelector } from 'react-redux';
import GlobalState from '../../../../models/GlobalState';
import { LookupTable } from '../../../../models/LookupTable';
import { fetchSites } from '../../../../state/reducers/sites';
import Grid from '@material-ui/core/Grid';
import { SecondaryButton } from '../../../../components/SecondaryButton';
import { PrimaryButton } from '../../../../components/PrimaryButton';

type Source = { site: Site; error: Error };
type Return = Omit<Source, 'error'>;

interface EditSiteDialogUIProps {
  siteId: string;
  siteName: string;
  siteDescription: string;
  submitting: boolean;
  submitDisabled: boolean;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSiteNameChange(event: React.ChangeEvent): void;
  onSiteDescriptionChange(value: string): void;
  onSubmit(): void;
  onClose?(): void;
  onDismiss?(): void;
}

interface EditSiteDialogUIContainerProps {
  resource: Resource<Pick<Source, 'site'>>;
  submitting: boolean;
  submitDisabled: boolean;
  checkSiteName(event: React.ChangeEvent, currentSiteName: string): void;
  onSubmit(id: string, name: string, description: string): void;
  onClose?(): void;
  onDismiss?(): void;
}

interface EditSiteDialogBaseProps {
  open: boolean;
  site: Site;
}

export type EditSiteDialogProps = PropsWithChildren<EditSiteDialogBaseProps> & {
  onSaveSuccess?(response?: any): any;
  onClose?(): void;
  onClosed?(): void;
  onDismiss?(): void;
};

export interface EditSiteDialogStateProps extends EditSiteDialogBaseProps {
  onSaveSuccess?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
}

const messages = defineMessages({
  siteNameRequired: {
    id: 'editSiteDialog.siteNameRequired',
    defaultMessage: 'Site Name is required.'
  },
  siteNameExists: {
    id: 'editSiteDialog.sitenameExists',
    defaultMessage: 'The name already exist.'
  }
});

function EditSiteDialog(props: EditSiteDialogProps) {
  const { open, onClose } = props;

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="editSiteDialogTitle" fullWidth maxWidth="sm">
      <EditSiteDialogWrapper {...props} />
    </Dialog>
  );
}

function EditSiteDialogWrapper(props: EditSiteDialogProps) {
  const { site, onClosed, onClose, onDismiss, onSaveSuccess } = props;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const sites = useSelector<GlobalState, LookupTable>((state) => state.sites.byId);
  const dispatch = useDispatch();

  useUnmount(onClosed);

  const dialogResource = useMemo(
    () => ({
      site,
      error
    }),
    [site, error]
  );

  const resource = useLogicResource<Return, Source>(dialogResource, {
    shouldResolve: (source) => Boolean(source.site),
    shouldReject: (source) => Boolean(source.error),
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => source.error
  });

  function checkSiteName(event: React.ChangeEvent<HTMLInputElement>, currentSiteName: string) {
    if (
      (currentSiteName !== event.target.value &&
        sites &&
        Object.keys(sites).filter((key) => sites[key].name === event.target.value).length) ||
      event.target.value.trim() === ''
    ) {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }
  }

  const handleSubmit = (id: string, name: string, description: string) => {
    setSubmitting(true);
    updateSite({ id, name, description }).subscribe(
      (response) => {
        setSubmitting(false);
        dispatch(fetchSites());
        onSaveSuccess?.(response);
      },
      (e) => {
        setSubmitting(false);
        setError(e.response?.response ?? e);
      }
    );
  };

  const onErrorBoundaryReset = () => setError(null);

  return (
    <Suspencified errorBoundaryProps={{ onReset: onErrorBoundaryReset }}>
      <EditSiteDialogUIContainer
        resource={resource}
        submitting={submitting}
        submitDisabled={submitDisabled}
        checkSiteName={checkSiteName}
        onSubmit={handleSubmit}
        onClose={onClose}
        onDismiss={onDismiss}
      />
    </Suspencified>
  );
}

function EditSiteDialogUIContainer(props: EditSiteDialogUIContainerProps) {
  const { resource, submitting, submitDisabled, checkSiteName, onSubmit, onClose, onDismiss } = props;
  const site = resource.read().site;
  const [name, setName] = useState(site.name);
  const [description, setDescription] = useState(site.description);

  const onSiteNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    checkSiteName(event, site.name);
    setName(event.target.value);
  };

  const onKeyPress = (event: React.KeyboardEvent) => {
    if (event.charCode === 13) {
      onSubmit(site.id, name, description);
    }
  };

  return (
    <EditSiteDialogUI
      siteId={site.id}
      siteName={name}
      siteDescription={description}
      onSiteNameChange={onSiteNameChange}
      onSiteDescriptionChange={setDescription}
      submitting={submitting}
      submitDisabled={submitDisabled}
      onKeyPress={onKeyPress}
      onSubmit={() => onSubmit(site.id, name, description)}
      onClose={onClose}
      onDismiss={onDismiss}
    />
  );
}

function EditSiteDialogUI(props: EditSiteDialogUIProps) {
  const {
    siteId,
    siteName,
    siteDescription,
    onSiteNameChange,
    onSiteDescriptionChange,
    submitting,
    submitDisabled,
    onKeyPress,
    onSubmit,
    onClose,
    onDismiss
  } = props;
  const { formatMessage } = useIntl();
  return (
    <>
      <DialogHeader
        id="editSiteDialogTitle"
        title={<FormattedMessage id="editSiteDialog.title" defaultMessage="Edit Site" />}
        onDismiss={onDismiss}
      />
      <DialogBody>
        <Grid container spacing={1} component="form">
          <Grid item xs={12}>
            <TextField
              autoFocus
              fullWidth
              id="name"
              name="name"
              label={<FormattedMessage id="editSiteDialog.siteName" defaultMessage="Site Name" />}
              onChange={(event) => onSiteNameChange(event)}
              onKeyPress={onKeyPress}
              value={siteName}
              inputProps={{ maxLength: 255 }}
              error={submitDisabled}
              helperText={
                // prettier-ignore
                !siteName.trim()
                  ? formatMessage(messages.siteNameRequired)
                  : submitDisabled
                  ? formatMessage(messages.siteNameExists)
                  : ''
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="siteId"
              name="id"
              label={<FormattedMessage id="editSiteDialog.siteId" defaultMessage="Site ID" />}
              fullWidth
              value={siteId}
              disabled
              helperText={
                <FormattedMessage id="editSiteDialog.notEditable" defaultMessage="The site id is not editable" />
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="description"
              name="description"
              label={<FormattedMessage id="editSiteDialog.siteDescription" defaultMessage="Site Description" />}
              fullWidth
              onChange={(event) => onSiteDescriptionChange(event.target.value)}
              onKeyPress={onKeyPress}
              value={siteDescription ?? ''}
              inputProps={{ maxLength: 4000 }}
            />
          </Grid>
        </Grid>
      </DialogBody>
      <DialogFooter>
        {onClose && (
          <SecondaryButton onClick={onClose} variant="contained">
            <FormattedMessage id="editSiteDialog.cancel" defaultMessage="Cancel" />
          </SecondaryButton>
        )}
        {onSubmit && (
          <PrimaryButton
            onClick={() => onSubmit()}
            variant="contained"
            color="primary"
            disabled={submitting || submitDisabled}
          >
            <FormattedMessage id="words.submit" defaultMessage="Submit" />
          </PrimaryButton>
        )}
      </DialogFooter>
    </>
  );
}

export default EditSiteDialog;
