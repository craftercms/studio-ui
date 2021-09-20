/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { FormattedMessage } from 'react-intl';
import React, { useState } from 'react';
import DialogBody from '../Dialogs/DialogBody';
import SingleItemSelector from '../SingleItemSelector';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import DependenciesList from './DependenciesList';
import Menu from '@material-ui/core/Menu';
import DialogFooter from '../Dialogs/DialogFooter';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { assetsTypes, DependenciesDialogUIProps } from './utils';
import Radio from '@material-ui/core/Radio';
import { dependenciesDialogStyles } from './DependenciesDialog';

export default function DependenciesDialogUI(props: DependenciesDialogUIProps) {
  const {
    resource,
    item,
    rootPath,
    setItem,
    compactView,
    setCompactView,
    showTypes,
    setShowTypes,
    dependenciesShown,
    setDependenciesShown,
    isEditableItem,
    handleEditorDisplay,
    handleHistoryDisplay,
    contextMenu,
    handleContextMenuClick,
    handleContextMenuClose
  } = props;
  const classes = dependenciesDialogStyles({});
  const [openSelector, setOpenSelector] = useState(false);

  return (
    <>
      <DialogBody className={classes.dialogBody}>
        <div className={classes.selectionContent}>
          <SingleItemSelector
            label={<FormattedMessage id="words.item" defaultMessage="Item" />}
            open={openSelector}
            onClose={() => setOpenSelector(false)}
            onDropdownClick={() => setOpenSelector(!openSelector)}
            rootPath={rootPath}
            selectedItem={item}
            onItemClicked={(item) => {
              setOpenSelector(false);
              setItem(item);
            }}
          />
          <FormControl className={classes.formControl}>
            <Select
              value={dependenciesShown ?? 'depends-on'}
              onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                setDependenciesShown(event.target.value);
              }}
              inputProps={{
                className: classes.select
              }}
            >
              <MenuItem value="depends-on">
                <FormattedMessage
                  id="dependenciesDialog.dependsOn"
                  defaultMessage="Items that depend on selected item"
                />
              </MenuItem>
              <MenuItem value="depends-on-me">
                <FormattedMessage id="dependenciesDialog.dependsOnMe" defaultMessage="Dependencies of selected item" />
              </MenuItem>
            </Select>
          </FormControl>
        </div>
        <SuspenseWithEmptyState
          resource={resource}
          withEmptyStateProps={{
            emptyStateProps: {
              title:
                dependenciesShown === 'depends-on' ? (
                  <FormattedMessage
                    id="dependenciesDialog.emptyDependantsMessage"
                    defaultMessage={'{itemName} has no dependencies'}
                    values={{ itemName: item?.label }}
                  />
                ) : (
                  <FormattedMessage
                    id="dependenciesDialog.emptyDependenciesMessage"
                    defaultMessage={'Nothing depends on {itemName}'}
                    values={{ itemName: item?.label }}
                  />
                ),
              classes: {
                root: classes.suspense,
                title: classes.suspenseTitle
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
            compactView={compactView}
            showTypes={showTypes}
            handleContextMenuClick={handleContextMenuClick}
          />
          <Menu anchorEl={contextMenu.el} keepMounted open={Boolean(contextMenu.el)} onClose={handleContextMenuClose}>
            {contextMenu.dependency && isEditableItem(contextMenu.dependency.path) && (
              <MenuItem
                onClick={() => {
                  handleEditorDisplay(contextMenu.dependency);
                  handleContextMenuClose();
                }}
              >
                <FormattedMessage id="dependenciesDialog.edit" defaultMessage="Edit" />
              </MenuItem>
            )}
            {contextMenu.dependency && (
              <MenuItem
                onClick={() => {
                  setItem(contextMenu.dependency);
                  handleContextMenuClose();
                }}
              >
                <FormattedMessage id="dependenciesDialog.dependencies" defaultMessage="Dependencies" />
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                handleHistoryDisplay(contextMenu.dependency);
                handleContextMenuClose();
              }}
            >
              {' '}
              {/* TODO: pending, waiting for new history dialog */}
              <FormattedMessage id="dependenciesDialog.history" defaultMessage="History" />
            </MenuItem>
          </Menu>
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
              checked={compactView}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setCompactView(event.target.checked);
              }}
              color="primary"
            />
          }
          label="Compact"
        />
        <FormControl className={classes.formControl}>
          <Select
            value={showTypes}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              setShowTypes(event.target.value);
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
            {Object.keys(assetsTypes).map((typeId) => (
              <MenuItem value={typeId} key={typeId}>
                <Radio checked={showTypes === typeId} color="primary" />
                {assetsTypes[typeId].label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogFooter>
    </>
  );
}
