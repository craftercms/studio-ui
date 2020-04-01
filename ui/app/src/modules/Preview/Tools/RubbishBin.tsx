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

import React, { useEffect, useState } from 'react';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import DeleteRounded from '@material-ui/icons/DeleteRounded';
import DeleteRoundedTilted from '../../../components/Icons/DeleteRoundedTiltedRight';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { palette } from '../../../styles/theme';
import { DRAWER_WIDTH } from '../previewContext';

const useStyles = makeStyles((theme) => createStyles({
  rubbishBin: {
    height: 250,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: palette.orange.main,
    margin: theme.spacing(1),
    position: 'absolute',
    left: theme.spacing(1),
    width: DRAWER_WIDTH - 30,
    // right: theme.spacing(1),
    bottom: theme.spacing(1),
    color: palette.white,
    zIndex: theme.zIndex.drawer
  },
  rubbishIcon: {
    width: '100%',
    height: '50%',
    color: palette.white
  },
  rubbishIconHover: {
    transform: ''
  }
}));

export default function RubbishBin(props: any) {
  const classes = useStyles({});
  const [over, setOver] = useState(false);
  const [trashed, setTrashed] = useState(false);
  useEffect(() => {
    if (props.open) {
      setOver(false);
      setTrashed(false);
    }
  }, [props.open]);
  return (
    <Grow in={props.open}>
      <Paper
        elevation={2}
        className={classes.rubbishBin}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setTrashed(true);
          props.onTrash?.();
        }}
      >
        {
          /* For embedded components show a link instead of a rubbish bin
          (over)
            ? <BrokenLinkRounded className={classes.rubbishIcon} />
            : <LinkRounded className={classes.rubbishIcon} />
          */
        }
        {
          (over)
            ? <DeleteRoundedTilted className={classes.rubbishIcon} />
            : <DeleteRounded className={classes.rubbishIcon} />
        }
        <Typography variant="caption">
          {
            (trashed) ? (
              <FormattedMessage
                id="rubbishBin.itemTrashed"
                defaultMessage="Trashed!"
              />
            ) : (
              <FormattedMessage
                id="rubbishBin.dropToTrash"
                defaultMessage="Drop Here To Trash"
              />
            )
          }
        </Typography>
      </Paper>
    </Grow>
  );
}
