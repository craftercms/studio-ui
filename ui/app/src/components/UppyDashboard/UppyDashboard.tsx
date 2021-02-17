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

import Dashboard, { DashboardOptions } from '@craftercms/uppy-dashboard';
import { useEffect, useRef } from 'react';
import { Uppy } from '@uppy/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import palette from '../../styles/palette';
import { validateActionPolicy } from '../../services/sites';

interface UppyDashboardProps {
  uppy: Uppy;
  site: string;
  path: string;
  options?: DashboardOptions;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    dashboard: {
      paddingBottom: 0,
      '& .uppy-Dashboard-inner': {
        border: 0
      },
      '& .uppy-Dashboard-files': {
        padding: '15px'
      },
      '& .uppy-Dashboard-browse': {
        color: theme.palette.primary.main,
        textDecoration: 'underline'
      },
      '& .uppy-Dashboard-dropFilesHereHint': {
        border: `1px dashed ${theme.palette.primary.main}`
      },
      '& [data-uppy-drag-drop-supported=true] .uppy-Dashboard-AddFiles': {
        border: 0
      },
      // region item card
      '& .uppy-dashboard-item-card': {
        display: 'flex',
        position: 'relative'
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
      '& .uppy-Dashboard-Item-action:focus': {
        boxShadow: 'none'
      },
      '& .uppy-dashboard-item-action--validating': {
        color: palette.gray.medium4,
        width: '20px',
        height: '20px',
        display: 'block'
      },
      '& .uppy-dashboard-item-action--remove': {
        color: palette.gray.medium4,
        width: '20px',
        height: '20px'
      },
      '& .uppy-dashboard-item-action--retry': {
        color: palette.gray.medium4,
        width: '20px',
        height: '20px',
        marginRight: '10px'
      },
      '& .uppy-dashboard-item-action--validateAndRetry': {
        color: palette.gray.medium4,
        width: '20px',
        height: '20px',
        marginLeft: '10px'
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
      '& .uppy-dashboard-files-list-row': {
        marginBottom: '20px'
      },
      // endregion
      // region Footer
      '& .uppy-DashboardContent-bar': {
        position: 'relative',
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
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

export default function UppyDashboard(props: UppyDashboardProps) {
  const { uppy, options, site, path } = props;
  const classes = useStyles();
  const ref = useRef();

  useEffect(() => {
    if (uppy.getPlugin(options.id ?? 'craftercms:Dashboard')) {
      uppy.removePlugin(uppy.getPlugin(options.id ?? 'craftercms:Dashboard'));
    }
    uppy.use(Dashboard, {
      ...options,
      inline: true,
      target: ref.current,
      validateActionPolicy,
      id: 'craftercms:Dashboard',
      site,
      path
    });
    return () => {
      uppy.removePlugin(uppy.getPlugin(options.id ?? 'craftercms:Dashboard'));
    };
    // options is removed from dependencies to avoid re-render a new dashboard
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [uppy]);

  return <section ref={ref} className={classes.dashboard} />;
}
