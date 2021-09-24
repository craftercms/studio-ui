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

import { UploadDialogContainerProps } from './util';
import { useIntl } from 'react-intl';
import { useSelection } from '../../utils/hooks/useSelection';
import React, { useEffect } from 'react';
import { Uppy } from '@uppy/core';
import { translations } from './translations';
import { XHRUpload } from '@craftercms/uppy';
import { getBulkUploadUrl } from '../../services/content';
import { getGlobalHeaders } from '../../utils/ajax';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { Button, IconButton } from '@mui/material';
import CloseIconRounded from '@mui/icons-material/CloseRounded';
import DialogBody from '../Dialogs/DialogBody';
import UppyDashboard from '../UppyDashboard';
import { useStyles } from './UploadDialog';

export function UploadDialogContainer(props: UploadDialogContainerProps) {
  const { formatMessage } = useIntl();
  const expiresAt = useSelection((state) => state.auth.expiresAt);
  const classes = useStyles({});
  const maxActiveUploads = 1000;
  const {
    site,
    path,
    onClose,
    onClosed,
    maxSimultaneousUploads = 1,
    onMinimized,
    hasPendingChanges,
    setPendingChanges
  } = props;

  const uppy = React.useMemo(() => {
    return new Uppy({
      meta: { site },
      locale: {
        strings: {
          noDuplicates: formatMessage(translations.noDuplicates)
        }
      }
    }).use(XHRUpload, {
      endpoint: getBulkUploadUrl(site, path),
      formData: true,
      fieldName: 'file',
      limit: maxSimultaneousUploads,
      headers: getGlobalHeaders()
    });
  }, [formatMessage, maxSimultaneousUploads, path, site]);

  useUnmount(() => {
    uppy.close();
    onClosed();
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
    plugin.setOptions({ headers: getGlobalHeaders() });
  }, [expiresAt, uppy]);

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
          maxActiveUploads={maxActiveUploads}
        />
      </DialogBody>
    </>
  );
}
