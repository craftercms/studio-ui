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
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const deleteDialogStyles = makeStyles((theme) => createStyles({
  root: {
    textAlign: 'left'
  },
  dialogPaper: {
    minHeight: '530px'
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
    display: 'flex',
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
    flex: 1,
    maxHeight: 440,
    overflow: 'auto',
    background: `${palette.white}`,
    border: `1px solid ${palette.gray.light5}`
  },
  tableHeadCell: {
    fontWeight: 600
  },
  formControl: {
    margin: '10px 0',
    minWidth: 120,
    flexDirection: 'unset'
  },
  selectLabel: {
    position: 'relative',
    color: palette.gray.dark5,
    fontSize: '14px',
    padding: '10px 10px 10px 0'
  },
  select: {
    fontSize: '14px'
  }
}));

interface DependenciesDialogUIProps {
  item: Item;
  dependencies: Item[];
  state: any;
  setState: Function;
  open: boolean;
  apiState: any;
  handleErrorBack: any;
  handleClose: any;
  handleDependencyEdit: Function;
}

function DependenciesDialogUI(props: DependenciesDialogUIProps) {
  const {
    item,
    dependencies,
    state,
    setState,
    open,
    apiState,
    handleErrorBack,
    handleClose,
    handleDependencyEdit
  } = props;
  const classes = deleteDialogStyles({});

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      fullWidth={true}
      maxWidth={'md'}
      classes={{
        root: classes.root,
        paper: classes.dialogPaper
      }}
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
                  <IconButton aria-label="close" onClick={handleClose}>
                    <CloseIcon/>
                  </IconButton>
                </div>
                <Typography variant="subtitle1" className={classes.subtitle}>
                  <FormattedMessage
                    id="deleteDialog.headerSubTitle"
                    defaultMessage={`Dependencies Shown for: ${item.internalName}`}
                  />
                </Typography>
                <FormControl className={classes.formControl}>
                  <InputLabel className={classes.selectLabel}>
                    <FormattedMessage
                      id="deleteDialog.selectLabel"
                      defaultMessage={'Show content that:'}
                    />
                  </InputLabel>
                  <Select
                    value={state.selectedOption}
                    onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                      setState({ selectedOption: event.target.value as string });
                    }}
                    inputProps={{
                      className: classes.select
                    }}
                    ref={(el: HTMLElement) => {   // Style overriding with important, and need to set it inline
                      if (el) {
                        el.style.setProperty('margin-top', '0', 'important');
                      }
                    }}
                  >
                    <MenuItem value='depends-on'>Refers to this item</MenuItem>
                    <MenuItem value='depends-on-me'>Is referenced by this item</MenuItem>
                  </Select>
                </FormControl>
              </MuiDialogTitle>
              <div className={classes.dialogContent}>
                <div className={classes.tableWrapper}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          key={'item'}
                          align={'left'}
                          className={classes.tableHeadCell}
                        >
                          <FormattedMessage
                            id="dependenciesDialog.item"
                            defaultMessage="Item"
                          />
                        </TableCell>
                        <TableCell
                          key={'uri'}
                          align={'left'}
                          className={classes.tableHeadCell}
                        >
                          <FormattedMessage
                            id="dependenciesDialog.path"
                            defaultMessage="Path"
                          />
                        </TableCell>
                        <TableCell key={'edit'} align={'left'}/>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dependencies.map(dependency => (
                        <TableRow key={dependency.name}>
                          <TableCell component="th" scope="row">
                            {dependency.internalName}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {dependency.uri}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            <a href="" onClick={(e) => {
                              e.preventDefault();
                              handleDependencyEdit(dependency);
                            }}>
                              <FormattedMessage
                                id="dependenciesDialog.edit"
                                defaultMessage="Edit"
                              />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className={classes.dialogActions}>
                <Button variant="contained" onClick={handleClose} disabled={apiState.submitting}>
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
