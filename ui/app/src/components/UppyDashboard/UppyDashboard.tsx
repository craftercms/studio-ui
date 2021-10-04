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

import { Dashboard } from '@craftercms/uppy';
import React, { useCallback, useEffect, useRef } from 'react';
import { Uppy } from '@uppy/core';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import palette from '../../styles/palette';
import { validateActionPolicy } from '../../services/sites';
import { defineMessages, useIntl } from 'react-intl';
import { emitSystemEvent, itemsUploaded, showSystemNotification } from '../../state/actions/system';
import { useDispatch } from 'react-redux';
import { useDebouncedInput } from '../../utils/hooks/useDebouncedInput';
import { DashboardOptions } from '@uppy/dashboard';

interface UppyDashboardProps {
  uppy: Uppy;
  site: string;
  path: string;
  title: string;
  maxActiveUploads: number;
  onMinimized?(): void;
  onPendingChanges?(pending: boolean): void;
  onClose?(): void;
  options?: DashboardOptions;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    dashboard: {
      paddingBottom: 0,
      '& .uppy-Dashboard-inner': {
        border: 0,
        borderRadius: 0,
        backgroundColor: theme.palette.background.default
      },
      '& .uppy-Dashboard-files, & .uppy-size--md .uppy-Dashboard-files': {
        padding: '15px'
      },
      '& .uppy-Dashboard-browse': {
        color: theme.palette.primary.main,
        textDecoration: 'underline'
      },
      '& .uppy-Dashboard-dropFilesHereHint': {
        border: `1px dashed ${theme.palette.primary.main}`,
        color: theme.palette.primary.main
      },
      '& [data-uppy-drag-drop-supported=true] .uppy-Dashboard-AddFiles': {
        border: 0
      },
      // region header
      '& .uppy-dashboard-header': {
        backgroundColor: theme.palette.background.paper,
        minHeight: '64px',
        color: theme.palette.text.primary,
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        '& .uppy-dashboard-header-actions': {
          marginLeft: 'auto'
        },
        '& .uppy-dashboard-header-title': {
          padding: '0 8px',
          margin: 0,
          fontSize: '1.25rem',
          fontFamily: ' Source Sans Pro, Open Sans, sans-serif',
          fontWeight: '600',
          lineHeight: '1.6'
        }
      },
      // endregion
      // region item card
      '& .uppy-dashboard-item-card': {
        display: 'flex',
        position: 'relative'
      },
      '& .uppy-dashboard-item-validating': {
        color: 'rgba(0, 0, 0, 0.54)'
      },
      '& .uppy-dashboard-item-preview': {
        width: '120px',
        height: '120px',
        position: 'relative'
      },
      '& .uppy-Dashboard-Item-name': {
        display: 'flex',
        alignItems: 'center',
        '& .suggested-file-name': {
          display: 'flex',
          alignItems: 'center'
        },
        '& .suggested-icon': {
          fill: palette.gray.medium6,
          width: '20px',
          height: '20px',
          marginRight: '5px',
          marginLeft: '5px'
        }
      },
      '& .uppy-dashboard-site-policy-warning': {
        color: theme.palette.error.main,
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.875rem',
        marginBottom: '5px',
        '& .warning-icon': {
          fill: theme.palette.error.main,
          width: '20px',
          height: '20px',
          marginRight: '5px'
        }
      },
      '& .uppy-Dashboard-Item-previewInnerWrap': {
        backgroundColor: `${theme.palette.divider} !important`,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0
      },
      '& .uppy-dashboard-item-statusType': {
        display: 'inline-block'
      },
      '& .uppy-dashboard-item-fileInfoAndButtons': {
        padding: '15px',
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1
      },
      '& .uppy-dashboard-item-progress': {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        '& .uppy-file-progress-bar': {
          backgroundColor: theme.palette.primary.main,
          height: '2px',
          transition: 'background-color, width 0.3s ease-out',
          borderBottomRightRadius: '5px',
          borderBottomLeftRadius: '5px',
          '&.complete': {
            backgroundColor: theme.palette.success.main
          },
          '&.error': {
            backgroundColor: theme.palette.error.main
          }
        }
      },
      '& .item-name-valid': {
        color: theme.palette.success.main
      },
      '& .item-name-invalid': {
        textDecoration: 'line-through',
        color: theme.palette.text.primary
      },
      // endregion
      // region File list
      '& .uppy-Dashboard-files': {},
      '& .uppy-Dashboard-AddFiles-title': {
        color: theme.palette.text.primary
      },
      '& .uppy-dashboard-files-list-row': {
        marginBottom: '20px',
        '&:last-child': {
          marginBottom: 0
        }
      },
      // endregion
      // region Footer
      '& .uppy-DashboardContent-bar': {
        position: 'relative',
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        borderBottom: 0
      },
      '& .uppy-dashboard-progress-indicator': {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        '& .uppy-file-progress-bar': {
          backgroundColor: theme.palette.primary.main,
          height: '2px',
          transition: 'background-color, width 0.3s ease-out',
          '&.complete': {
            backgroundColor: theme.palette.success.main
          },
          '&.error': {
            backgroundColor: theme.palette.error.main
          }
        }
      },
      '& .uppy-dashboard-validation-buttons': {
        marginLeft: 'auto',
        '& button:first-child': {
          marginRight: '10px'
        }
      },
      '& .uppy-dashboard-right-buttons': {
        marginLeft: 'auto',
        '& button:last-child': {
          marginLeft: '10px'
        }
      }
      // endregion
    }
  })
);

const translations = defineMessages({
  cancelPending: {
    id: 'uppyDashboard.cancelPending',
    defaultMessage: 'Cancel pending'
  },
  clearCompleted: {
    id: 'uppyDashboard.clearCompleted',
    defaultMessage: 'Clear completed'
  },
  clear: {
    id: 'words.clear',
    defaultMessage: 'Clear'
  },
  addMore: {
    id: 'uppyDashboard.addMore',
    defaultMessage: 'Add more'
  },
  rejectAll: {
    id: 'uppyDashboard.rejectAll',
    defaultMessage: 'Reject all changes'
  },
  acceptAll: {
    id: 'uppyDashboard.acceptAll',
    defaultMessage: 'Accept all changes'
  },
  validating: {
    id: 'words.validating',
    defaultMessage: 'Validating'
  },
  validateAndRetry: {
    id: 'uppyDashboard.validateAndRetry',
    defaultMessage: 'Accept changes and upload'
  },
  removeFile: {
    id: 'uppyDashboard.removeFile',
    defaultMessage: 'Remove file'
  },
  back: {
    id: 'words.back',
    defaultMessage: 'Back'
  },
  addingMoreFiles: {
    id: 'uppyDashboard.addingMoreFiles',
    defaultMessage: 'Adding more files'
  },
  renamingFromTo: {
    id: 'uppyDashboard.renamingFromTo',
    defaultMessage: "Renaming from %'{from}' to %'{to}'"
  },
  close: {
    id: 'words.close',
    defaultMessage: 'Close'
  },
  minimize: {
    id: 'words.minimize',
    defaultMessage: 'Minimize'
  },
  maxFiles: {
    id: 'uppyDashboard.maxFiles',
    defaultMessage: '{maxFiles} max.'
  },
  maxActiveUploadsReached: {
    id: 'uppyDashboard.maxActiveUploadsReached',
    defaultMessage: '{maxFiles} maximum active uploads reached. Excess has been discarded.'
  }
});

export default function UppyDashboard(props: UppyDashboardProps) {
  const { uppy, site, path, onClose, onMinimized, title, onPendingChanges, maxActiveUploads } = props;
  const options = {
    replaceTargetContent: true,
    width: '100%',
    height: '60vh',
    fileManagerSelectionType: 'both',
    ...props.options
  };
  const classes = useStyles();
  const ref = useRef();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const targetsRef = useRef<string[]>([]);

  const onItemsUploaded = useCallback(
    (id: string) => {
      dispatch(emitSystemEvent(itemsUploaded({ target: path, targets: targetsRef.current })));
      targetsRef.current = [];
    },
    [dispatch, path]
  );

  const onMaxActiveUploadsReached = () => {
    dispatch(
      showSystemNotification({
        message: formatMessage(translations.maxActiveUploadsReached, { maxFiles: maxActiveUploads })
      })
    );
  };

  const onItemsUploaded$ = useDebouncedInput(onItemsUploaded, 1000);

  useEffect(() => {
    if (uppy.getPlugin('craftercms:Dashboard')) {
      uppy.removePlugin(uppy.getPlugin('craftercms:Dashboard'));
    }
    uppy.use(Dashboard, {
      ...options,
      inline: true,
      target: ref.current,
      validateActionPolicy,
      onPendingChanges,
      onClose,
      onMinimized,
      title,
      id: 'craftercms:Dashboard',
      site,
      path,
      locale: {
        strings: {
          // @ts-ignore - TODO: find substitution(s)
          cancelPending: formatMessage(translations.cancelPending),
          clearCompleted: formatMessage(translations.clearCompleted),
          clear: formatMessage(translations.clear),
          addMore: formatMessage(translations.addMore),
          acceptAll: formatMessage(translations.acceptAll),
          rejectAll: formatMessage(translations.rejectAll),
          validating: formatMessage(translations.validating),
          validateAndRetry: formatMessage(translations.validateAndRetry),
          removeFile: formatMessage(translations.removeFile),
          back: formatMessage(translations.back),
          addingMoreFiles: formatMessage(translations.addingMoreFiles),
          renamingFromTo: formatMessage(translations.renamingFromTo),
          minimize: formatMessage(translations.minimize),
          close: formatMessage(translations.close)
        }
      },
      maxActiveUploads: maxActiveUploads,
      externalMessages: {
        maxFiles: formatMessage(translations.maxFiles, { maxFiles: maxActiveUploads })
      },
      onMaxActiveUploadsReached: onMaxActiveUploadsReached
    });

    uppy.on('upload-success', (file) => {
      onItemsUploaded$.next(file.id);
      targetsRef.current.push(file.id);
    });

    return () => {
      const plugin = uppy.getPlugin('craftercms:Dashboard');
      if (plugin) {
        uppy.removePlugin(plugin);
      }
    };
    // options is removed from dependencies to avoid re-render a new dashboard
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [uppy]);

  return <section ref={ref} className={classes.dashboard} />;
}
