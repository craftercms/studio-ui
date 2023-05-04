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

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import React, { ChangeEvent, ReactNode, useRef, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import SelectButton from '../ConfirmDropdown';
import Typography from '@mui/material/Typography';
import { cancelPackage, fetchPackage } from '../../services/publishing';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import CircularProgress from '@mui/material/CircularProgress';
import '../../styles/animations.scss';
import { READY_FOR_LIVE } from './constants';
import { alpha } from '@mui/material/styles';
import palette from '../../styles/palette';
import PrimaryButton from '../PrimaryButton';

const useStyles = makeStyles()((theme) => ({
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
    WebkitAnimation: 'pulse 3s infinite ease-in-out',
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
  readOnly?: boolean;

  setSelected(selected: any): any;

  setApiState(state: any): any;

  setPending(pending: any): any;

  getPackages(siteId: string, filters?: string): any;

  setFilesPerPackage(filesPerPackage: any): any;
}

export function PublishingPackage(props: PublishingPackageProps) {
  const { classes, cx } = useStyles();
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
    setFilesPerPackage,
    readOnly
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
    fetchPackage(siteId, packageId).subscribe({
      next: (pkg) => {
        setLoading(false);
        setFilesPerPackage({ ...filesPerPackage, [packageId]: pkg.items });
      },
      error: ({ response }) => {
        setApiState({ error: true, errorResponse: response });
      }
    });
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
    <div className={cx(classes.package, pending[id] && classes.packageLoading)}>
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
                <Checkbox
                  color="primary"
                  checked={checked}
                  onChange={(event) => onSelect(event, id, checked)}
                  disabled={readOnly}
                />
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
            disabled={readOnly}
          />
        )}
      </section>
      <div className="status">
        <Typography variant="body2">
          <FormattedMessage
            id="publishingDashboard.scheduled"
            defaultMessage="Scheduled for <b>{schedule, date, medium} {schedule, time, short}</b> by <b>{approver}</b>"
            values={{
              schedule: new Date(schedule),
              approver: approver,
              b: (content: ReactNode[]) => (
                <strong key={content[0] as string} className={classes.username}>
                  {content[0]}
                </strong>
              )
            }}
          />
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

export default PublishingPackage;
