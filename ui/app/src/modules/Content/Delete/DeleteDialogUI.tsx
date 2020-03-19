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

import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Item } from '../../../models/Item';
import makeStyles from '@material-ui/core/styles/makeStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { palette } from '../../../styles/theme';
import Grid from '@material-ui/core/Grid';
import { DependencySelectionDelete } from '../Dependencies/DependencySelection';

const deleteDialogStyles = makeStyles((theme) => createStyles({
  titleRoot: {
    margin: 0,
    padding: '13px 20px 11px',
    background: palette.white
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10
  },
  subtitle: {
    fontSize: '14px',
    lineHeight: '18px',
    paddingRight: '35px'
  }
}));

interface DeleteDialogUIProps {
  items: Item[];
  open: boolean;

  onClose?(response?: any): any;
}

function DeleteDialogUI(props: DeleteDialogUIProps) {
  const {
    items,
    open,
    onClose
  } = props;
  const classes = deleteDialogStyles({});
  const [selectedItems, setSelectedItems] = useState([]);

  return (
    <Dialog onClose={onClose} aria-labelledby="simple-dialog-title" open={open}>
      {/* TODO: this dialog title is the same as the one used in PublishDialog and can be reused, move to a global component? */}
      <MuiDialogTitle disableTypography className={classes.titleRoot}>
        <div className={classes.title}>
          {/*<Typography variant="h6">{title}</Typography>*/}
          <Typography variant="h6">Delete</Typography>
          {onClose ? (
            <IconButton aria-label="close" onClick={onClose}>
              <CloseIcon/>
            </IconButton>
          ) : null}
        </div>
        {/*<Typography variant="subtitle1" className={classes.subtitle}>{subtitle}</Typography>*/}
        <Typography variant="subtitle1" className={classes.subtitle}>
          Selected items will be deleted along with their items. Please review dependent items before deleting as these
          will end-up with broken link references.
        </Typography>
      </MuiDialogTitle>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <DependencySelectionDelete
            items={items}
            siteId={'editorial'}
            onChange={(result) => {
              setSelectedItems(result);
              console.log('result', result)
            }}
          />
        </Grid>
      </Grid>
    </Dialog>
  )
}

export default DeleteDialogUI;
