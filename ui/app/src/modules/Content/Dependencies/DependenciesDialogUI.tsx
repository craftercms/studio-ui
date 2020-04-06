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
import EmbeddedLegacyEditors from '../../Preview/EmbeddedLegacyEditors';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Menu from '@material-ui/core/Menu';
import { isImage } from '../../../utils/content';
import DialogBody from '../../../components/DialogBody';
import DialogFooter from '../../../components/DialogFooter';
import { Resource } from '../../../models/Resource';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import clsx from 'clsx';

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
    height: '540px',
    maxWidth: '725px'
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
  selectionContent: {
    marginBottom: '15px',
    display: 'flex'
  },
  dialogFooter: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
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
      marginRight: '10px',
      color: palette.black,
      fontSize: '16px'
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
    overflowY: 'auto'
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
  },
  suspense: {
    height: '100%',
    flexDirection: 'unset'
  }
}));

interface DependenciesListProps {
  resource: Resource<Item[]>;
  state: any;
  setState: Function;
  assetsTypes: any;
  isEditableItem: Function;
  handleEditorDisplay: Function;
}

function DependenciesList(props: DependenciesListProps) {
  const {
    resource,
    state,
    setState,
    assetsTypes,
    isEditableItem,
    handleEditorDisplay
  } = props;
  const classes = dependenciesDialogStyles({});
  const dependencies: Item[] = resource.read();

  return (
    <List className={classes.dependenciesList}>
      {
        dependencies
          .filter(dependency => assetsTypes[state.showTypes].filter(dependency))
          .map(dependency =>
            <ListItem
              key={dependency.uri}
              className={clsx(classes.dependenciesListItem, { [classes.dependenciesCompactListItem]: state.compactView })}
            >
              {
                isImage(dependency.uri) && !state.compactView &&
                <ListItemAvatar>
                  <Avatar className={classes.listItemPreview} src={dependency.uri}/>
                </ListItemAvatar>
              }
              <ListItemText
                className={classes.listItemContent}
                primary={dependency.internalName}
                secondary={(!state.compactView) ? dependency.uri : null}
              />

              <ListItemSecondaryAction>
                <PopupState variant="popover">
                  {popupState => (
                    <React.Fragment>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        {...bindTrigger(popupState)}
                      >
                        <MoreVertIcon/>
                      </IconButton>
                      <Menu {...bindMenu(popupState)}>
                        {
                          isEditableItem(dependency.uri) &&
                          <MenuItem onClick={() => {
                            handleEditorDisplay(dependency);
                            popupState.close();
                          }}>
                            <FormattedMessage
                              id="dependenciesDialog.edit"
                              defaultMessage="Edit"
                            />
                          </MenuItem>
                        }
                        <MenuItem onClick={() => {
                          setState({ item: dependency });
                          popupState.close();
                        }}>
                          <FormattedMessage
                            id="dependenciesDialog.dependencies"
                            defaultMessage="Dependencies"
                          />
                        </MenuItem>
                        <MenuItem
                          onClick={popupState.close}>   {/* TODO: pending, waiting for new history dialog */}
                          <FormattedMessage
                            id="dependenciesDialog.history"
                            defaultMessage="History"
                          />
                        </MenuItem>
                      </Menu>
                    </React.Fragment>
                  )}
                </PopupState>
              </ListItemSecondaryAction>
            </ListItem>
          )
      }
    </List>
  )
}

interface DependenciesDialogUIProps {
  resource: Resource<Item[]>
  state: any;
  setState: Function;
  open: boolean;
  handleClose: any;
  isEditableItem: Function;
  assetsTypes: any;
  editDialogConfig: any;
  setEditDialogConfig: Function;
  handleEditorDisplay: Function;
}

function DependenciesDialogUI(props: DependenciesDialogUIProps) {
  const {
    resource,
    state,
    setState,
    open,
    handleClose,
    isEditableItem,
    assetsTypes,
    editDialogConfig,
    setEditDialogConfig,
    handleEditorDisplay
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
      <DialogHeader
        title={formatMessage(translations.headerTitle)}
        onClose={handleClose}
      />
      <DialogBody>
        <div className={classes.selectionContent}>
          {
            state.item &&
            <Chip
              variant="outlined"
              deleteIcon={isEditableItem(state.item.uri) ? <CreateIcon/> : null}
              onDelete={isEditableItem(state.item.uri) ?
                () => {
                  handleEditorDisplay(state.item);
                } :
                null
              }
              classes={{
                root: classes.selectedItem,
                label: classes.selectedItemLabel,
                deleteIcon: classes.selectedItemEditIcon
              }}
              label={
                <>
                  <span className='label'>Selected</span>
                  <InsertDriveFileOutlinedIcon className='item-icon'/>
                  <span className='item-title'>{state.item.internalName}</span>
                </>
              }
            />
          }

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
              <MenuItem value='depends-on'>
                <FormattedMessage
                  id="dependenciesDialog.dependsOn"
                  defaultMessage="Items that depend on selected item"
                />
              </MenuItem>
              <MenuItem value='depends-on-me'>
                <FormattedMessage
                  id="dependenciesDialog.dependsOnMe"
                  defaultMessage="Dependencies of selected item"
                />
              </MenuItem>
            </Select>
          </FormControl>
        </div>
        <SuspenseWithEmptyState
          resource={resource}
          withEmptyStateProps={{
            emptyStateProps: {
              title: (
                state.dependenciesSelection === 'depends-on' ?
                  <FormattedMessage
                    id="dependenciesDialog.emptyDependantsMessage"
                    defaultMessage={'"{itemName}" has no dependencies'}
                    values={{ itemName: state.item?.['internalName'] }}
                  />
                  :
                  <FormattedMessage
                    id="dependenciesDialog.emptyDependenciesMessage"
                    defaultMessage={'Nothing depends on "{itemName}"'}
                    values={{ itemName: state.item?.['internalName'] }}
                  />
              ),
              classes: {
                root: classes.suspense
              }
            }
          }}
          loadingStateProps={{
            classes: {
              root: classes.suspense
            }
          }}
        >
          <DependenciesList
            resource={resource}
            state={state}
            setState={setState}
            assetsTypes={assetsTypes}
            isEditableItem={isEditableItem}
            handleEditorDisplay={handleEditorDisplay}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter
        classes={{
          root: classes.dialogFooter
        }}
      >
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
                  <MenuItem value={typeId} key={typeId}>
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
      </DialogFooter>
      <EmbeddedLegacyEditors
        showTabs={false}
        dialogConfig={editDialogConfig}
        setDialogConfig={setEditDialogConfig}
      />
    </Dialog>
  )
}

export default DependenciesDialogUI;
