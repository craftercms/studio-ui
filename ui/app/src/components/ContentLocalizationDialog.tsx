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
import Dialog from '@material-ui/core/Dialog';
import { defineMessages, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { TableBody, TableCell, TableContainer, TableHead } from '@material-ui/core';
import DialogTitle from './DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { palette } from '../styles/theme';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const translations = defineMessages({
  title: {
    id: 'contentLocalization.title',
    defaultMessage: 'Content Localization'
  }
});

const useStyles = makeStyles((theme) => createStyles({
  dialogContentRoot: {
    padding: theme.spacing(2),
    backgroundColor: palette.gray.light0
  },
  contentLocalizationRoot: {
    background: palette.white,
    border: '1px solid rgba(0, 0, 0, .125)'
  },
  tableCellHeader: {
    border: 0,
    padding: '20px 10px 0 0',
    fontWeight: 600
  },
  tableCell: {
    border: 0,
    padding: '0 10px 0 0'
  },
  tableCellOption: {
    padding: 0,
    border: 0
  },
  icon: {
    padding: '9px'
  },
  checkbox: {
    color: theme.palette.primary.main
  }
}));

export default function ContentLocalizationDialog(props: any) {
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const { open, onClose } = props;
  console.log('holita');
  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableBackdropClick={true}
    >
      <DialogTitle title={formatMessage(translations.title)} subtitle={'breadcrumb'} onClose={onClose}/>
      <DialogContent dividers classes={{ root: classes.dialogContentRoot }}>
        <TableContainer component={'table'} className={classes.contentLocalizationRoot}>
          <TableHead>
            <TableRow>
              <TableCell classes={{ root: classes.tableCellHeader }}>
                <Checkbox
                  color="primary"
                  className={classes.checkbox}
                />
              </TableCell>
              <TableCell classes={{ root: classes.tableCellHeader }}>Locales</TableCell>
              <TableCell classes={{ root: classes.tableCellHeader }}>Status</TableCell>
              <TableCell classes={{ root: classes.tableCellHeader }}/>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell classes={{ root: classes.tableCellOption }}>
                <Checkbox
                  color="primary"
                  className={classes.checkbox}
                />
              </TableCell>
              <TableCell classes={{ root: classes.tableCell }}>English, US (en)</TableCell>
              <TableCell classes={{ root: classes.tableCell }}>Published</TableCell>
              <TableCell classes={{ root: classes.tableCellOption }}>
                <IconButton
                  aria-label="options"
                  className={classes.icon}
                >
                  <MoreVertIcon/>
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </TableContainer>
      </DialogContent>
    </Dialog>
  )
}
