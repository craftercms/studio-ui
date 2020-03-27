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
import { Item } from '../../../models/Item';
import makeStyles from '@material-ui/core/styles/makeStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { palette } from '../../../styles/theme';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import ErrorState from '../../../components/SystemStatus/ErrorState';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import CreateIcon from '@material-ui/icons/Create';
import DialogHeader from '../../../components/DialogHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';

const translations = defineMessages({
  headerTitle: {
    id: 'dependenciesDialog.headerTitle',
    defaultMessage: 'Content Item Dependencies'
  }
});

const dependenciesDialogStyles = makeStyles((theme) => createStyles({
  root: {
    textAlign: 'left'
  },
  dialogPaper: {
    height: '540px'
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
    flexDirection: 'column',
    flex: '1 1 auto',
    // overflowY: 'auto',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
  },
  selectionContent: {
    marginBottom: '15px',
    display: 'flex'
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
  formControl: {
    minWidth: 120,
    marginLeft: 'auto'
  },
  selectLabel: {
    position: 'relative',
    color: palette.gray.dark5,
    fontSize: '14px'
  },
  select: {
    fontSize: '16px',
    border: 'none'
  },
  selectedItem: {
    backgroundColor: palette.white,
    borderRadius: '5px',
    padding: '10px',
    height: '40px',
    fontSize: '16px',
    borderColor: palette.gray.light1
  },
  selectedItemLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 10px 0 0',
    '& .label': {
      fontWeight: '600',
      marginRight: '10px'
    },
    '& .item-icon': {
      color: palette.teal.main,
      marginRight: '10px',
      width: '20px',
      height: '20px'
    },
    '& .item-title': {
      marginRight: '25px'
    }
  },
  selectedItemEditIcon: {
    fontSize: '14px',
    color: palette.gray.medium5,
    width: '16px',
    height: '16px'
  },
  dependenciesList: {
    backgroundColor: palette.white,
    padding: 0,
    borderRadius: '5px 5px 0 0',
    overflowY: 'auto',
    height: '305px'
  },
  dependenciesListItem: {
    boxShadow: '0 1px 1px #EBEBF0',
    padding: 0,
    height: '70px'
  },
  dependenciesCompactListItem: {
    height: '43px'
  },
  listItemPreview: {
    width: '100px',
    height: '70px',
    borderRadius: 0
  },
  listItemContent: {
    paddingLeft: '15px'
  },
  compactViewAction: {
    marginRight: 'auto'
  },
  showTypesSelect: {
    '& > .MuiRadio-root': {
      display: 'none'
    }
  },
  showTypesMenu: {
    '& .MuiListItem-root': {
      padding: '0 10px',
      fontSize: '14px',
      '& > .MuiRadio-root': {
        padding: '6px',
        '& .MuiSvgIcon-root': {
          width: '16px',
          height: '16px'
        }
      }
    }
  }
}));

const assetsTypes = {
  'all-deps': {
    label: <FormattedMessage id="dependenciesDialog.allDeps" defaultMessage="Show all dependencies"/>,
    filter: () => true
  },
  'content-items': {
    label: <FormattedMessage id="dependenciesDialog.contentItems" defaultMessage="Content items only"/>,
    filter: (dependency: Item) => {
      return (dependency.isComponent || dependency.isPage)      //TODO: returning isComponent=true on assets, verify with backend
    }
  },
  'assets': {
    label: <FormattedMessage id="dependenciesDialog.assets" defaultMessage="Assets only"/>,
    filter: (dependency: Item) => dependency.isAsset
  },
  'code': {
    label: <FormattedMessage id="dependenciesDialog.code" defaultMessage="Code only"/>,
    filter: (dependency: Item) => false                         //TODO: pending filter
  }
};

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
  isEditableItem: Function;
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
    handleDependencyEdit,
    isEditableItem
  } = props;
  const classes = dependenciesDialogStyles({});
  const { formatMessage } = useIntl();

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
              <DialogHeader
                title={formatMessage(translations.headerTitle)}
                onClose={handleClose}
              />
              <div className={classes.dialogContent}>
                <div className={classes.selectionContent}>
                  <Chip
                    variant="outlined"
                    deleteIcon={<CreateIcon/>}
                    onDelete={() => {             //TODO: edit item functionality

                    }}
                    classes={{
                      root: classes.selectedItem,
                      label: classes.selectedItemLabel,
                      deleteIcon: classes.selectedItemEditIcon
                    }}
                    label={
                      <>
                        <span className='label'>Selected</span>
                        <InsertDriveFileOutlinedIcon className='item-icon'/>
                        <span className='item-title'>{item.internalName}</span>
                      </>
                    }
                  />

                  <FormControl className={classes.formControl}>
                    <Select
                      value={state.selectedOption}
                      onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                        setState({ selectedOption: event.target.value as string });
                      }}
                      inputProps={{
                        className: classes.select
                      }}
                    >
                      <MenuItem value='depends-on'>Refers to this item</MenuItem>
                      <MenuItem value='depends-on-me'>Is referenced by this item</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                {/* isEditableItem(dependency) &&*/}
                {/* <a href="" onClick={(e) => {*/}
                {/*   e.preventDefault();*/}
                {/*   handleDependencyEdit(dependency);*/}
                {/* }}>*/}
                <List className={classes.dependenciesList}>
                  {
                    dependencies
                      .filter(dependency => assetsTypes[state.showTypes].filter(dependency))
                      .map(dependency => {

                        return (
                          <ListItem
                            className={`${classes.dependenciesListItem} ${(state.compactView) ? classes.dependenciesCompactListItem : ''}`}
                          >
                            {
                              dependency.isPreviewable && !state.compactView &&
                              <ListItemAvatar>
                                <Avatar className={classes.listItemPreview} src={dependency.uri}/>
                              </ListItemAvatar>
                            }
                            <ListItemText
                              className={classes.listItemContent}
                              primary={dependency.internalName}
                              secondary={(!state.compactView) ? dependency.uri : null}/>
                          </ListItem>
                        )
                      })
                  }
                </List>
              </div>
              <div className={classes.dialogActions}>
                <FormControlLabel
                  className={classes.compactViewAction}
                  control={
                    <Checkbox
                      checked={state.compactView}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setState({ compactView: event.target.checked });
                      }}
                      color="primary"
                    />
                  }
                  label="Compact"
                />
                <FormControl className={classes.formControl}>
                  <Select
                    value={state.showTypes}
                    onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                      setState({ showTypes: event.target.value as string });
                    }}
                    inputProps={{
                      className: `${classes.select} ${classes.showTypesSelect}`
                    }}
                    MenuProps={{
                      className: classes.showTypesMenu,
                      transformOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left'
                      },
                      getContentAnchorEl: null
                    }}
                  >
                    {
                      Object.keys(assetsTypes).map(typeId =>
                        (
                          <MenuItem value={typeId}>
                            <Radio
                              checked={state.showTypes === typeId}
                              color="primary"
                            />
                            {assetsTypes[typeId].label}
                          </MenuItem>
                        )
                      )
                    }
                  </Select>
                </FormControl>
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
