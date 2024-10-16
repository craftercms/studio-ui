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

import React from 'react';
import { useDeleteDialogUIStyles } from './styles';
import Grid from '@mui/material/Grid2';
import TextFieldWithMax from '../TextFieldWithMax/TextFieldWithMax';
import { FormattedMessage } from 'react-intl';
import { SelectionList } from '../DependencySelection/SelectionList';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DeleteDialogContentUIProps } from './utils';
import Alert from '@mui/material/Alert';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/InfoOutlined';

export function DeleteDialogUIBody(props: DeleteDialogContentUIProps) {
  const {
    items,
    childItems,
    dependentItems,
    comment,
    selectedItems,
    isCommentRequired = false,
    isDisabled,
    isConfirmDeleteChecked,
    onCommentChange,
    onItemClicked,
    onSelectAllClicked,
    onConfirmDeleteChange,
    onEditDependantClick
  } = props;
  const { classes } = useDeleteDialogUIStyles();
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 7 }}>
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
          <ListItem divider dense disableGutters={!Boolean(dependentItems)}>
            <ListItemText
              primary={
                <Typography variant="subtitle1" component="span">
                  <FormattedMessage id="deleteDialog.dependentItems" defaultMessage="Dependent Items" />
                  {` • `}
                  <FormattedMessage id="deleteDialog.brokenItems" defaultMessage="Will have broken references" />
                </Typography>
              }
            />
          </ListItem>
          {dependentItems.length ? (
            <List>
              {dependentItems.map((path) => {
                return (
                  <ListItem dense key={path}>
                    <ListItemText
                      primary={path}
                      primaryTypographyProps={{
                        title: path,
                        sx: {
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis'
                        }
                      }}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        color="primary"
                        onClick={(e) => onEditDependantClick(e, path)}
                        size="small"
                        sx={{
                          marginLeft: 'auto',
                          fontWeight: 'bold',
                          verticalAlign: 'baseline'
                        }}
                      >
                        <FormattedMessage id="words.edit" defaultMessage="Edit" />
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                '& svg': {
                  marginRight: '8px'
                }
              }}
            >
              <InfoIcon color="action" fontSize="small" />
              <Typography variant="caption">
                <FormattedMessage id="deleteDialog.emptyDependentItems" defaultMessage="No dependent items" />
              </Typography>
            </Box>
          )}
          <SelectionList
            title={<FormattedMessage id="deleteDialog.childItemsText" defaultMessage="Child Items" />}
            subtitle={<FormattedMessage id="deleteDialog.willGetDeleted" defaultMessage="Will get deleted" />}
            emptyMessage={<FormattedMessage id="deleteDialog.emptyChildItems" defaultMessage="No child items" />}
            paths={childItems}
            displayItemTitle={false}
          />
        </div>
      </Grid>
      <Grid size={{ xs: 12, sm: 5 }}>
        <form className={classes.submissionCommentField} noValidate autoComplete="off">
          <TextFieldWithMax
            label={<FormattedMessage id="deleteDialog.submissionCommentLabel" defaultMessage="Submission Comment" />}
            multiline
            value={comment}
            onChange={onCommentChange}
            required={isCommentRequired}
            disabled={isDisabled}
          />
          <Alert severity="warning" icon={false}>
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
                  defaultMessage="I understand that deleted items will be published immediately."
                />
              }
            />
          </Alert>
        </form>
      </Grid>
    </Grid>
  );
}

export default DeleteDialogUIBody;
