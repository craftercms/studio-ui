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

import React, { useEffect, useState } from 'react';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import DeleteRoundedTilted from '../../icons/OpenRubbishBinTiltedLeftFilled';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import palette from '../../styles/palette';
import clsx from 'clsx';
import { useSelection } from '../../hooks/useSelection';

const useStyles = makeStyles((theme) =>
  createStyles({
    rubbishBin: {
      height: 250,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: palette.orange.main,
      margin: theme.spacing(1),
      position: 'absolute',
      right: theme.spacing(1),
      bottom: theme.spacing(1),
      color: palette.white,
      zIndex: theme.zIndex.drawer
    },
    rubbishBinHover: {
      background: palette.red.main
    },
    rubbishIcon: {
      width: '100%',
      height: '50%',
      color: palette.white,
      pointerEvents: 'none'
    },
    rubbishLabel: {
      pointerEvents: 'none'
    }
  })
);

export default function RubbishBin(props: any) {
  const classes = useStyles({});
  const [over, setOver] = useState(false);
  const [trashed, setTrashed] = useState(false);
  const toolsPanelWidth = useSelection<number>((state) => state.preview.toolsPanelWidth);
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
        style={{ width: toolsPanelWidth - 30 }}
        className={clsx(classes.rubbishBin, over && classes.rubbishBinHover)}
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
        {/* For embedded components show a link instead of a rubbish bin
          (over)
            ? <BrokenLinkRounded className={classes.rubbishIcon} />
            : <LinkRounded className={classes.rubbishIcon} />
          */}
        {over ? (
          <DeleteRoundedTilted className={classes.rubbishIcon} />
        ) : (
          <DeleteRounded className={classes.rubbishIcon} />
        )}
        <Typography variant="caption" className={classes.rubbishLabel}>
          {trashed ? (
            <FormattedMessage id="previewRubbishBin.itemTrashed" defaultMessage="Trashed!" />
          ) : (
            <FormattedMessage id="previewRubbishBin.dropToTrash" defaultMessage="Drop Here To Trash" />
          )}
        </Typography>
      </Paper>
    </Grow>
  );
}
