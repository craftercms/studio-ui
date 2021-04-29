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

import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import DialogHeader from '../Dialogs/DialogHeader';
import { Alert } from '@material-ui/lab';
import { createStyles, makeStyles } from '@material-ui/core';
import palette from '../../styles/palette';
import { ReactNode } from 'react';
import BulkPublishForm from '../BulkPublishForm';
import PublishByForm from '../PublishByForm';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { BulkPublishFormData, PublishByFormData } from '../../models/Publishing';

type PublishWidgetProps = {
  title: ReactNode;
  note: ReactNode;
  type: 'bulkPublish' | 'publishBy';
  bulkPublishFormData?: BulkPublishFormData;
  setBulkPublishFormData?(data): void;
  publishByFormData?: PublishByFormData;
  setPublishByFormData?(data): void;
  formValid: boolean;
  onPublish?(): void;
};

const useStyles = makeStyles(() =>
  createStyles({
    paperContent: {
      backgroundColor: palette.gray.light0,
      padding: '16px'
    },
    paperActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '16px'
    },
    alertIcon: {
      alignItems: 'center'
    }
  })
);

export default function PublishWidget(props: PublishWidgetProps) {
  const {
    title,
    note,
    type,
    bulkPublishFormData,
    setBulkPublishFormData,
    publishByFormData,
    setPublishByFormData,
    formValid,
    onPublish
  } = props;
  const classes = useStyles();

  return (
    <Paper>
      <DialogHeader title={title} />

      <div className={classes.paperContent}>
        {type === 'bulkPublish' ? (
          <BulkPublishForm formData={bulkPublishFormData} setFormData={setBulkPublishFormData} />
        ) : (
          <PublishByForm formData={publishByFormData} setFormData={setPublishByFormData} />
        )}
        <Alert severity="warning" classes={{ icon: classes.alertIcon }}>
          {note}
        </Alert>
      </div>

      <div className={classes.paperActions}>
        <Button variant="contained" color="primary" onClick={onPublish} disabled={!formValid}>
          <FormattedMessage id="words.publish" defaultMessage="Publish" />
        </Button>
      </div>
    </Paper>
  );
}
