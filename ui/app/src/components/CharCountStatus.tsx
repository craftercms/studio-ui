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
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles';
import palette from '../styles/palette';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import GlobalState from '../models/GlobalState';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    countContainer: {
      padding: '5px'
    },
    submissionCommentCount: {
      fontSize: '14px',
      color: palette.gray.medium4
    }
  })
);

interface CharCountStatusContainerProps {
  commentLength: number;
}

interface CharCountStatusProps {
  commentLength: number;
  commentMaxLength: number;
}

function CharCountStatus(props: CharCountStatusProps) {
  const classes = useStyles({});
  const { commentLength, commentMaxLength } = props;

  return (
    <Grid container direction="row" justifyContent="space-between" className={classes.countContainer}>
      <Grid item>
        <Typography className={classes.submissionCommentCount}>
          <FormattedMessage
            id="deleteDialog.maxCharacters"
            defaultMessage="Max {maxLength} characters"
            values={{ maxLength: commentMaxLength }}
          />
        </Typography>
      </Grid>

      <Grid item>
        <Typography className={classes.submissionCommentCount}>
          {commentLength}/{commentMaxLength}
        </Typography>
      </Grid>
    </Grid>
  );
}

export function CharCountStatusContainer(props: CharCountStatusContainerProps) {
  const { commentLength } = props;

  const commentMaxLength = useSelector<GlobalState, number>((state) => state.publishing.submissionCommentMaxLength);

  return <CharCountStatus commentLength={commentLength} commentMaxLength={commentMaxLength}></CharCountStatus>;
}

export default CharCountStatus;
