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
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core/SvgIcon';
import Paper from '@material-ui/core/Paper';
import EditIcon from '@material-ui/icons/Edit';
import clsx from 'clsx';
import { palette } from '../../../styles/theme';
import { Variant } from '@material-ui/core/styles/createTypography';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: palette.white,
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 15px'
  },
  textWrapper: {
    display: 'flex',
    '& > *': {
      marginRight: 15,
    },
    '& > p': {
      color: palette.black
    }
  },
  title: {
    fontWeight: 600
  },
  changeBtn: {
    padding: 0
  },
  labelIcon: {
    fill: palette.teal.main,
    marginRight: 10
  },
  editIcon: {
    fontSize: 17
  }
}));

interface NewContentSelectProps {
  LabelIcon: OverridableComponent<SvgIconTypeMap>;
  editIconClass?: string;
  rootClass?: string;
  labelIconClass?: string;
  selectItem: any;
  label: string;
  titleVariant?: Variant;
  labelVariant?: Variant;
  onEditClick(): void;
}

export default function NewContentSelect(props: NewContentSelectProps) {
  const { LabelIcon, editIconClass, labelIconClass, rootClass, titleVariant, labelVariant, onEditClick, selectItem, label } = props;
  const classes = useStyles();

  return (
    <Paper className={clsx(classes.root, rootClass)} elevation={0}>
      <div className={classes.textWrapper}>
        <Typography variant={titleVariant || 'body1'} className={classes.title}>
          { label }
        </Typography>
        <LabelIcon className={clsx(classes.labelIcon, labelIconClass)}/>
        <Typography variant={labelVariant || 'body1'}>
          { selectItem.name }
        </Typography>
      </div>
      <IconButton className={classes.changeBtn} onClick={() => onEditClick()}>
        <EditIcon className={clsx(classes.editIcon, editIconClass)}/>
      </IconButton>
    </Paper>
  );
}
