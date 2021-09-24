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

import React from 'react';
import { DeleteDependencies } from '../../modules/Content/Dependencies/DependencySelection';
import { useDeleteDialogUIStyles } from './styles';
import Grid from '@mui/material/Grid';
import TextFieldWithMax from '../Controls/TextFieldWithMax';
import { FormattedMessage } from 'react-intl';
import { SelectionList } from '../../modules/Content/Dependencies/SelectionList';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DeleteDialogContentUIProps } from './utils';

export function DeleteDialogUIBody(props: DeleteDialogContentUIProps) {
  const {
    resource,
    items,
    comment,
    selectedItems,
    isCommentRequired = false,
    isDisabled,
    isConfirmDeleteChecked,
    onCommentChange,
    onItemClicked,
    onSelectAllClicked,
    onSelectAllDependantClicked,
    onConfirmDeleteChange,
    onEditDependantClick
  } = props;
  const deleteDependencies: DeleteDependencies = resource.read();
  const classes = useDeleteDialogUIStyles();
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={7} md={7} lg={7} xl={7}>
        <div className={classes.depsContainer}>
          <SelectionList
            title={<FormattedMessage id="deleteDialog.deleteItems" defaultMessage="Delete Items" />}
            items={items}
            onItemClicked={onItemClicked}
            onSelectAllClicked={onSelectAllClicked}
            displayItemTitle
            selectedItems={selectedItems}
            disabled={isDisabled}
          />
          <SelectionList
            title={<FormattedMessage id="deleteDialog.childItemsText" defaultMessage="Child Items" />}
            subtitle={<FormattedMessage id="deleteDialog.willGetDeleted" defaultMessage="Will get deleted" />}
            emptyMessage={<FormattedMessage id="deleteDialog.emptyChildItems" defaultMessage="No child items" />}
            paths={deleteDependencies.childItems}
            displayItemTitle={false}
          />
          <SelectionList
            title={<FormattedMessage id="deleteDialog.dependentItems" defaultMessage="Dependent Items" />}
            subtitle={<FormattedMessage id="deleteDialog.brokenItems" defaultMessage="Will have broken references" />}
            emptyMessage={
              <FormattedMessage id="deleteDialog.emptyDependentItems" defaultMessage="No dependent items" />
            }
            paths={deleteDependencies.dependentItems}
            displayItemTitle={false}
            onSelectAllClicked={onSelectAllDependantClicked}
            onItemClicked={onItemClicked}
            selectedItems={selectedItems}
            disabled={isDisabled}
            onEditClick={onEditDependantClick}
          />
        </div>
      </Grid>
      <Grid item xs={12} sm={5} md={5} lg={5} xl={5}>
        <form className={classes.submissionCommentField} noValidate autoComplete="off">
          <TextFieldWithMax
            label={<FormattedMessage id="deleteDialog.submissionCommentLabel" defaultMessage="Submission Comment" />}
            multiline
            value={comment}
            onChange={onCommentChange}
            required={isCommentRequired}
            disabled={isDisabled}
          />
          <FormControlLabel
            className={classes.confirmCheck}
            control={
              <Checkbox
                color="primary"
                checked={isConfirmDeleteChecked}
                onChange={onConfirmDeleteChange}
                disabled={isDisabled}
              />
            }
            label={
              <FormattedMessage
                id="deleteDialog.confirmDeletion"
                defaultMessage="By submitting, deleted items will be published immediately."
              />
            }
          />
        </form>
      </Grid>
    </Grid>
  );
}

export default DeleteDialogUIBody;
