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
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import SelectButton from '../ConfirmDropdown';
import Typography from '@mui/material/Typography';
import { cancelPackage, fetchPackage } from '../../services/publishing';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import CircularProgress from '@mui/material/CircularProgress';
import '../../styles/animations.scss';
import { READY_FOR_LIVE } from './constants';
import PrimaryButton from '../PrimaryButton';
import Box from '@mui/material/Box';
import { typographyClasses } from '@mui/material';

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
    <Box
      sx={[
        {
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
              color: (theme) => theme.palette.text.secondary
            }
          },
          '& .files': {
            marginTop: '10px'
          }
        },
        pending[id] && {
          WebkitAnimation: 'pulse 3s infinite ease-in-out',
          animation: 'pulse 3s infinite ease-in-out',
          pointerEvents: 'none'
        }
      ]}
    >
      <section className="name">
        {pending[id] ? (
          <header className={'loading-header'}>
            <CircularProgress
              size={15}
              sx={{
                marginRight: '10px',
                color: (theme) => theme.palette.text.secondary
              }}
              color={'inherit'}
            />
            <Typography variant="body1">
              <strong>{id}</strong>
            </Typography>
          </header>
        ) : state === READY_FOR_LIVE ? (
          <FormGroup sx={{ marginRight: 'auto' }}>
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
            sx={{
              button: {
                paddingRight: '10px'
              }
            }}
            text={formatMessage(translations.cancelText)}
            cancelText={formatMessage(translations.cancel)}
            confirmText={formatMessage(translations.confirm)}
            confirmHelperText={formatMessage(translations.confirmHelperText)}
            onConfirm={() => handleCancel(id)}
            disabled={readOnly}
            buttonProps={{
              color: 'warning'
            }}
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
                <Box
                  component="strong"
                  key={content[0] as string}
                  sx={{
                    maxWidth: '390px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'inline-block',
                    marginBottom: '-5px'
                  }}
                >
                  {content[0]}
                </Box>
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
          <List
            aria-label={formatMessage(translations.filesList)}
            sx={{
              '& li': {
                display: 'flex',
                justifyContent: 'space-between'
              }
            }}
          >
            <ListItem
              sx={{
                background: (theme) => theme.palette.background.default,
                [`& .${typographyClasses.root}`]: {
                  fontWeight: 600
                }
              }}
              divider
            >
              <Typography variant="caption">
                {formatMessage(translations.item)} ({formatMessage(translations.path).toLowerCase()})
              </Typography>
              <Typography variant="caption">{formatMessage(translations.type)}</Typography>
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
    </Box>
  );
}

export default PublishingPackage;
