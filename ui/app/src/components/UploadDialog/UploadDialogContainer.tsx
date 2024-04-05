/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import { UploadDialogContainerProps } from './util';
import { useIntl } from 'react-intl';
import { useSelection } from '../../hooks/useSelection';
import React, { useEffect } from 'react';
import { Uppy } from '@uppy/core';
import { translations } from './translations';
import { XHRUpload } from '@craftercms/uppy';
import { getBulkUploadUrl } from '../../services/content';
import { getGlobalHeaders } from '../../utils/ajax';
import { useUnmount } from '../../hooks/useUnmount';
import { Button, IconButton } from '@mui/material';
import CloseIconRounded from '@mui/icons-material/CloseRounded';
import DialogBody from '../DialogBody/DialogBody';
import UppyDashboard from '../UppyDashboard';
import { makeStyles } from 'tss-react/mui';
import useSiteUIConfig from '../../hooks/useSiteUIConfig';
import { XHRUploadOptions } from '@uppy/xhr-upload';
import ApiResponse from '../../models/ApiResponse';
import useUpdateRefs from '../../hooks/useUpdateRefs';

const useStyles = makeStyles()(() => ({
  rootTitle: {
    paddingBottom: 0,
    display: 'none'
  },
  subtitleWrapper: {
    paddingBottom: 0,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between'
  },
  dialogBody: {
    minHeight: '60vh',
    padding: 0
  }
}));

const mixHeaders = (headers: Record<string, any>) => Object.assign({}, getGlobalHeaders(), headers);

export function UploadDialogContainer(props: UploadDialogContainerProps) {
  const { formatMessage } = useIntl();
  const expiresAt = useSelection((state) => state.auth.expiresAt);
  const { upload } = useSiteUIConfig();
  const { classes } = useStyles();
  // region const { ... } = props
  const {
    site,
    path,
    onClose,
    onClosed,
    maxSimultaneousUploads,
    onMinimized,
    hasPendingChanges,
    setPendingChanges,
    headers,
    method = 'post',
    meta,
    allowedMetaFields,
    endpoint,
    useFormData = true,
    fieldName = 'file',
    onFileAdded,
    onUploadSuccess,
    validateStatus,
    getResponseData,
    getResponseError
  } = props;
  // endregion
  const propRefs = useUpdateRefs({
    headers,
    meta,
    allowedMetaFields,
    onFileAdded,
    onUploadSuccess,
    validateStatus,
    getResponseData,
    getResponseError
  });

  // TODO: Currently unknown if recreating the Uppy instance works properly down the component tree.
  const uppy = React.useMemo(() => {
    // Want to avoid memo renewal on every render due to these various props not being memoized up in the tree.
    const {
      headers,
      allowedMetaFields,
      validateStatus,
      getResponseData,
      getResponseError,
      onFileAdded,
      onUploadSuccess,
      meta
    } = propRefs.current;
    const xhrOptions: XHRUploadOptions = {
      endpoint: endpoint ?? getBulkUploadUrl(site, path),
      formData: useFormData,
      fieldName,
      limit: maxSimultaneousUploads ? maxSimultaneousUploads : upload.maxSimultaneousUploads,
      timeout: upload.timeout,
      headers: mixHeaders(headers),
      method,
      getResponseError(responseText) {
        try {
          const parsed = JSON.parse(responseText);
          const error: ApiResponse = parsed.response;
          // TODO: Test this with Studio error responses.
          return new Error(
            `[${error.code}] ${error.message}. ${error.remedialAction}. ${error.documentationUrl}.`
              .replace('. .', '.')
              .replace('. .', '.')
          );
        } catch {
          return new Error(formatMessage({ defaultMessage: 'An error occurred uploading the file.' }));
        }
      }
    };
    allowedMetaFields && (xhrOptions.allowedMetaFields = allowedMetaFields);
    // These (validateStatus, getResponseData, getResponseError) are unlikely to have closures inside them that would go stale.
    validateStatus && (xhrOptions.validateStatus = validateStatus);
    getResponseData && (xhrOptions.getResponseData = getResponseData);
    getResponseError && (xhrOptions.getResponseError = getResponseError);
    const instance = new Uppy({
      meta: Object.assign({ site }, meta),
      locale: { strings: { noDuplicates: formatMessage(translations.noDuplicates) } }
    }).use(XHRUpload, xhrOptions);
    onFileAdded &&
      instance.on('file-added', (file) => {
        propRefs.current.onFileAdded({ file, uppy: instance });
      });
    onUploadSuccess &&
      instance.on('upload-success', (file, response) => {
        propRefs.current.onUploadSuccess({ file, response });
      });
    return instance;
  }, [
    propRefs,
    endpoint,
    site,
    path,
    useFormData,
    fieldName,
    maxSimultaneousUploads,
    upload.maxSimultaneousUploads,
    upload.timeout,
    method,
    formatMessage
  ]);

  useUnmount(() => {
    uppy.close();
    onClosed?.();
  });

  useEffect(() => {
    const handleBeforeUpload = () => {
      return formatMessage(translations.uploadInProgress);
    };

    if (hasPendingChanges) {
      window.onbeforeunload = handleBeforeUpload;
    } else {
      window.onbeforeunload = null;
    }

    return () => {
      window.onbeforeunload = null;
    };
  }, [hasPendingChanges, formatMessage]);

  useEffect(() => {
    const plugin = uppy.getPlugin('XHRUpload');
    plugin.setOptions({ headers: mixHeaders(headers) });
  }, [expiresAt, uppy, headers]);

  return (
    <>
      <Button style={{ display: 'none' }}>test</Button>
      <IconButton style={{ display: 'none' }} size="large">
        <CloseIconRounded />
      </IconButton>
      <DialogBody className={classes.dialogBody}>
        <UppyDashboard
          uppy={uppy}
          site={site}
          path={path}
          onMinimized={onMinimized}
          onPendingChanges={setPendingChanges}
          onClose={onClose}
          title={formatMessage(translations.title)}
          maxActiveUploads={upload.maxActiveUploads}
        />
      </DialogBody>
    </>
  );
}
