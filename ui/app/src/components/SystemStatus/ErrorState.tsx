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

import React from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Fab from '@material-ui/core/Fab';
import crack from '../../assets/full-crack.svg';
import { defineMessages, useIntl } from 'react-intl';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { createStyles } from '@material-ui/core';
import clsx from 'clsx';
import { nnou } from '../../utils/object';
import { APIError } from '../../models/GlobalState';

const useStyles = makeStyles((theme: Theme) => createStyles({
  errorView: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  graphic: {
    maxWidth: '100%'
  },
  title: {
    marginTop: '20px',
    marginBottom: '10px'
  },
  paragraph: {
    textAlign: 'center',
    marginTop: '10px'
  },
  link: {
    color: theme.palette.text.secondary,
    '& svg': {
      verticalAlign: 'sub',
      fontSize: '1.3rem'
    }
  },
  circleBtn: {
    color: theme.palette.primary.main,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: '40px',
    top: '35px',
    '&:hover': {
      backgroundColor: '#FFFFFF'
    }
  }
}));

interface ErrorStateProps {
  graphicUrl?: string;
  classes?: {
    root?: string;
    graphic?: string;
  };
  error: APIError;

  onBack?(event: any): any;
}

const messages = defineMessages({
  moreInfo: {
    id: 'common.moreInfo',
    defaultMessage: 'More info'
  },
  error: {
    id: 'words.error',
    defaultMessage: 'Error'
  }
});

export default function ErrorState(props: ErrorStateProps) {
  const classes = useStyles({});
  const propClasses = Object.assign({
    root: '',
    graphic: ''
  }, props.classes || {});
  const { error, onBack, graphicUrl = crack } = props;
  const { formatMessage } = useIntl();
  const { title, code, documentationUrl, message, remedialAction } = error;

  return (
    <div className={clsx(classes.errorView, propClasses.root)}>
      <img className={clsx(classes.graphic, propClasses?.graphic)} src={graphicUrl} alt=""/>
      {
        (nnou(code) || nnou(title)) &&
        <Typography variant="h5" component="h2" className={classes.title} color={'textSecondary'}>
          {nnou(code) ? `${formatMessage(messages.error)}${code ? ` ${code}` : ''}` : ''}
          {nnou(code) && nnou(title) && ': '}
          {title}
        </Typography>
      }
      <Typography variant="subtitle1" component="p" color="textSecondary" className={classes.paragraph}>
        {
          (message) +
          (message.endsWith('.') ? '' : '.') +
          (remedialAction ? ` ${remedialAction}` : '') +
          (remedialAction ? (remedialAction.endsWith('.') ? '' : '.') : '')
        }
      </Typography>
      {
        documentationUrl &&
        <Typography variant="subtitle1" component="p" className={classes.paragraph}>
          <a
            className={classes.link}
            href={documentationUrl}
            target={'blank'}>
            {formatMessage(messages.moreInfo)}
            <OpenInNewIcon/>
          </a>
        </Typography>
      }
      {
        onBack &&
        <Fab aria-label="back" className={classes.circleBtn} onClick={onBack}>
          <ArrowBackIcon/>
        </Fab>
      }
    </div>
  );
}
