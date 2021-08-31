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

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import React, { ChangeEvent, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { defineMessages, useIntl } from 'react-intl';
import SelectButton from '../../../../components/Controls/ConfirmDropdown';
import Typography from '@material-ui/core/Typography';
import { cancelPackage, fetchPackage } from '../../../../services/publishing';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import '../../../../styles/animations.scss';
import clsx from 'clsx';
import { READY_FOR_LIVE } from '../constants';
import { alpha } from '@material-ui/core/styles';
import palette from '../../../../styles/palette';
import PrimaryButton from '../../../../components/PrimaryButton';

const useStyles = makeStyles((theme) => ({
  package: {
    padding: '20px 8px 20px 0',
    '& .loading-header': {
      display: 'flex',
      alignItems: 'center',
      height: '42px'
    },
    '& .name': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    '& .status': {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px'
    },
    '& .comment': {
      display: 'flex',
      '& p:first-child': {
        marginRight: '20px',
        marginBottom: '10px'
      },
      '& span': {
        color: theme.palette.text.secondary
      }
    },
    '& .files': {
      marginTop: '10px'
    }
  },
  checkbox: {
    marginRight: 'auto'
  },
  thRow: {
    background: theme.palette.background.default
  },
  th: {
    fontWeight: 600
  },
  list: {
    '& li': {
      display: 'flex',
      justifyContent: 'space-between'
    }
  },
  spinner: {
    marginRight: '10px',
    color: theme.palette.text.secondary
  },
  packageLoading: {
    '-webkit-animation': 'pulse 3s infinite ease-in-out',
    animation: 'pulse 3s infinite ease-in-out',
    pointerEvents: 'none'
  },
  cancelButton: {
    paddingRight: '10px',
    color: palette.orange.main,
    border: `1px solid ${alpha(palette.orange.main, 0.5)}`,
    '&:hover': {
      backgroundColor: alpha(palette.orange.main, 0.08)
    }
  },
  username: {
    maxWidth: '390px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block',
    marginBottom: '-5px'
  }
}));

const translations = defineMessages({
  cancelText: {
    id: 'publishingDashboard.cancelItemButtonText',
    defaultMessage: 'Cancel'
  },
  cancel: {
    id: 'publishingDashboard.no',
    defaultMessage: 'No'
  },
  confirm: {
    id: 'publishingDashboard.yes',
    defaultMessage: 'Yes'
  },
  confirmHelperText: {
    id: 'publishingDashboard.confirmHelperText',
    defaultMessage: 'Set item state to "Cancelled"?'
  },
  fetchPackagesFiles: {
    id: 'publishingDashboard.fetchPackagesFiles',
    defaultMessage: 'Fetch Packages Files'
  },
  scheduled: {
    id: 'publishingDashboard.scheduled',
    defaultMessage: 'Scheduled for <b>{schedule, date, medium} {schedule, time, short}</b> by <b>{approver}</b>'
  },
  status: {
    id: 'publishingDashboard.status',
    defaultMessage: 'Status is {state} for {environment} target'
  },
  comment: {
    id: 'publishingDashboard.comment',
    defaultMessage: 'Comment'
  },
  commentNotProvided: {
    id: 'publishingDashboard.commentNotProvided',
    defaultMessage: '(submission comment not provided)'
  },
  filesList: {
    id: 'publishingDashboard.filesList',
    defaultMessage: 'files list'
  },
  path: {
    id: 'words.path',
    defaultMessage: 'Path'
  },
  type: {
    id: 'words.type',
    defaultMessage: 'Type'
  },
  item: {
    id: 'words.item',
    defaultMessage: 'Item'
  },
  asset: {
    id: 'words.asset',
    defaultMessage: 'Asset'
  },
  script: {
    id: 'words.script',
    defaultMessage: 'Script'
  },
  page: {
    id: 'words.page',
    defaultMessage: 'Page'
  },
  renderingTemplate: {
    id: 'words.template',
    defaultMessage: 'Template'
  },
  component: {
    id: 'words.component',
    defaultMessage: 'Component'
  },
  unknown: {
    id: 'words.unknown',
    defaultMessage: 'Unknown'
  }
});

interface PublishingPackageProps {
  siteId: string;
  id: string;
  schedule: string;
  approver: string;
  state: string;
  environment: string;
  comment: string;
  selected: any;
  pending: any;
  filesPerPackage: {
    [key: string]: any;
  };

  setSelected(selected: any): any;

  setApiState(state: any): any;

  setPending(pending: any): any;

  getPackages(siteId: string, filters?: string): any;

  setFilesPerPackage(filesPerPackage: any): any;
}

export default function PublishingPackage(props: PublishingPackageProps) {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const {
    id,
    approver,
    schedule,
    state,
    comment,
    environment,
    siteId,
    selected,
    setSelected,
    pending,
    setPending,
    getPackages,
    setApiState,
    filesPerPackage,
    setFilesPerPackage
  } = props;
  const [loading, setLoading] = useState(null);

  const { current: ref } = useRef<any>({});

  ref.cancelComplete = (packageId: string) => {
    setPending({ ...pending, [packageId]: false });
    getPackages(siteId);
  };

  function onSelect(event: ChangeEvent, id: string, checked: boolean) {
    if (checked) {
      setSelected({ ...selected, [id]: false });
    } else {
      setSelected({ ...selected, [id]: true });
    }
  }

  function handleCancel(packageId: string) {
    setPending({ ...pending, [packageId]: true });

    cancelPackage(siteId, [packageId]).subscribe(
      () => {
        ref.cancelComplete(packageId);
      },
      ({ response }) => {
        setApiState({ error: true, errorResponse: response });
      }
    );
  }

  function onFetchPackages(packageId: string) {
    setLoading(true);
    fetchPackage(siteId, packageId).subscribe(
      ({ response }) => {
        setLoading(false);
        setFilesPerPackage({ ...filesPerPackage, [packageId]: response.package.items });
      },
      ({ response }) => {
        setApiState({ error: true, errorResponse: response });
      }
    );
  }

  function renderFiles(files: [File]) {
    return files.map((file: any, index: number) => {
      return (
        <ListItem key={index} divider>
          <Typography variant="body2">{file.path}</Typography>
          <Typography variant="body2" color="textSecondary">
            {file.contentTypeClass in translations
              ? formatMessage(translations[file.contentTypeClass])
              : file.contentTypeClass}
          </Typography>
        </ListItem>
      );
    });
  }

  const checked = selected[id] ? selected[id] : false;
  return (
    <div className={clsx(classes.package, pending[id] && classes.packageLoading)}>
      <section className="name">
        {pending[id] ? (
          <header className={'loading-header'}>
            <CircularProgress size={15} className={classes.spinner} color={'inherit'} />
            <Typography variant="body1">
              <strong>{id}</strong>
            </Typography>
          </header>
        ) : state === READY_FOR_LIVE ? (
          <FormGroup className={classes.checkbox}>
            <FormControlLabel
              control={
                <Checkbox color="primary" checked={checked} onChange={(event) => onSelect(event, id, checked)} />
              }
              label={<strong>{id}</strong>}
            />
          </FormGroup>
        ) : (
          <Typography variant="body1">
            <strong>{id}</strong>
          </Typography>
        )}
        {state === READY_FOR_LIVE && (
          <SelectButton
            classes={{ button: classes.cancelButton }}
            text={formatMessage(translations.cancelText)}
            cancelText={formatMessage(translations.cancel)}
            confirmText={formatMessage(translations.confirm)}
            confirmHelperText={formatMessage(translations.confirmHelperText)}
            onConfirm={() => handleCancel(id)}
          />
        )}
      </section>
      <div className="status">
        <Typography variant="body2">
          {formatMessage(translations.scheduled, {
            schedule: new Date(schedule),
            approver: approver,
            b: (content) => (
              <strong key={content} className={classes.username}>
                {content}
              </strong>
            )
          })}
        </Typography>
        <Typography variant="body2">
          {formatMessage(translations.status, {
            state: <strong key={state}>{state}</strong>,
            environment: <strong key={environment}>{environment}</strong>
          })}
        </Typography>
      </div>
      <div className="comment">
        <Typography variant="body2">{formatMessage(translations.comment)}</Typography>
        <Typography variant="body2">
          {comment ? comment : <span>{formatMessage(translations.commentNotProvided)}</span>}
        </Typography>
      </div>
      <div className="files">
        {filesPerPackage && filesPerPackage[id] && (
          <List aria-label={formatMessage(translations.filesList)} className={classes.list}>
            <ListItem className={classes.thRow} divider>
              <Typography variant="caption" className={classes.th}>
                {formatMessage(translations.item)} ({formatMessage(translations.path).toLowerCase()})
              </Typography>
              <Typography variant="caption" className={classes.th}>
                {formatMessage(translations.type)}
              </Typography>
            </ListItem>
            {renderFiles(filesPerPackage[id])}
          </List>
        )}
        {(filesPerPackage === null || !filesPerPackage[id]) && (
          <PrimaryButton variant="outlined" onClick={() => onFetchPackages(id)} disabled={!!loading} loading={loading}>
            {formatMessage(translations.fetchPackagesFiles)}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
