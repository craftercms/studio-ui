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
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import { Item } from '../../../models/Item';
import makeStyles from '@material-ui/core/styles/makeStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { palette } from '../../../styles/theme';
import { FormattedMessage } from 'react-intl';
import ErrorState from '../../../components/SystemStatus/ErrorState';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const deleteDialogStyles = makeStyles((theme) => createStyles({
  root: {
    textAlign: 'left'
  },
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
  },
  dialogContent: {
    padding: theme.spacing(2),
    backgroundColor: palette.gray.light0,
    flex: '1 1 auto',
    overflowY: 'auto',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
  },
  dialogActions: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    margin: 0,
    padding: theme.spacing(2),
    '& > :not(:first-child)': {
      marginLeft: '8px'
    }
  },
  errorPaperRoot: {
    maxHeight: '586px',
    height: '100vh',
    padding: 0
  },
  tableWrapper: {
    maxHeight: 440,
    overflow: 'auto'
  }
}));

interface DependenciesDialogUIProps {
  item: Item;
  apiState: any;
  handleErrorBack: any;
}

function DependenciesDialogUI(props: DependenciesDialogUIProps) {
  const { item, apiState, handleErrorBack } = props;
  const classes = deleteDialogStyles({});

  return (
    <Dialog
      // onClose={onClose}
      aria-labelledby="simple-dialog-title"
      // open={open}
      open={true}
      fullWidth={true}
      maxWidth={'md'}
      className={classes.root}
    >
      {
        (!apiState.error) ?
          (
            <>
              <MuiDialogTitle disableTypography className={classes.titleRoot}>
                <div className={classes.title}>
                  <Typography variant="h6">
                    <FormattedMessage
                      id="dependenciesDialog.headerTitle"
                      defaultMessage="Dependencies"
                    />
                  </Typography>
                  {/*{onClose ? (*/}
                  <IconButton aria-label="close" /*onClick={onClose}*/>
                    <CloseIcon/>
                  </IconButton>
                  {/*) : null}*/}
                </div>
                <Typography variant="subtitle1" className={classes.subtitle}>
                  <FormattedMessage
                    id="deleteDialog.headerSubTitle"
                    defaultMessage={`Dependencies Shown for: ${item.internalName}`}
                  />
                </Typography>
              </MuiDialogTitle>
              <div className={classes.dialogContent}>
                <div className={classes.tableWrapper}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          key={'item'}
                          align={'left'}
                        >
                          <FormattedMessage
                            id="dependenciesDialog.item"
                            defaultMessage="Item"
                          />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>

                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className={classes.dialogActions}>
                <Button variant="contained" /*onClick={handleClose}*/ disabled={apiState.submitting}>
                  <FormattedMessage
                    id="dependenciesDialog.close"
                    defaultMessage={`Close`}
                  />
                </Button>
              </div>
            </>
          ) : (
            <ErrorState
              classes={{ root: classes.errorPaperRoot }}
              error={apiState.errorResponse}
              onBack={handleErrorBack}
            />
          )
      }
    </Dialog>
  )
}

export default DependenciesDialogUI;
