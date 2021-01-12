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

import React, { PropsWithChildren, useEffect, useState } from 'react';
import StandardAction from '../../models/StandardAction';
import Dialog from '@material-ui/core/Dialog';
import { useActiveSiteId, useLogicResource, useSpreadState, useUnmount } from '../../utils/hooks';
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles';
import { SandboxItem } from '../../models/Item';
import DialogHeader from './DialogHeader';
import { FormattedMessage } from 'react-intl';
import DialogBody from './DialogBody';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { Resource } from '../../models/Resource';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import DialogFooter from './DialogFooter';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputBase from '@material-ui/core/InputBase';
import palette from '../../styles/palette';
import { reject } from '../../services/publishing';
import { ApiResponse } from '../../models/ApiResponse';
import { fetchCannedMessage } from '../../services/configuration';
import TextFieldWithMax from '../Controls/TextFieldWithMax';
import { getCurrentLocale } from '../../utils/i18n';
import { SecondaryButton } from '../SecondaryButton';
import { PrimaryButton } from '../PrimaryButton';

// region Typings

type ApiState = { error: ApiResponse; submitting: boolean };
type Source = SandboxItem[];
type Return = Source;

interface RejectDialogContentUIProps {
  resource: Resource<Return>;
  checkedItems: string[];
  onUpdateChecked?(value?: string): void;
  classes?: any;
}

interface RejectDialogUIProps {
  resource: Resource<Return>;
  checkedItems: string[];
  rejectionReason: string;
  rejectionComment: string;
  setRejectionReason?(value: string): void;
  setRejectionComment?(value: string): void;
  onUpdateChecked?(value?: string): void;
  classes?: any;
  onReject?(): void;
  onClose?(): void;
  onDismiss?(): void;
}

interface RejectDialogBaseProps {
  open: boolean;
  items?: SandboxItem[];
}

export type RejectDialogProps = PropsWithChildren<
  RejectDialogBaseProps & {
    onClose?(response?: any): any;
    onClosed?(response?: any): any;
    onDismiss?(response?: any): any;
    onRejectSuccess?(response?: any): any;
  }
>;

export interface RejectDialogStateProps extends RejectDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
  onRejectSuccess?: StandardAction;
}

// endregion

const useStyles = makeStyles(() =>
  createStyles({
    itemsList: {
      border: `1px solid ${palette.gray.light5}`,
      backgroundColor: palette.white,
      padding: 0,
      height: '100%'
    },
    submissionTextField: {
      marginTop: '10px'
    },
    textField: {
      padding: 0,
      '& textarea[aria-hidden="true"]': {
        width: '50% !important'
      }
    }
  })
);

const SelectInput = withStyles(() =>
  createStyles({
    input: {
      borderRadius: 4
    }
  })
)(InputBase);

function RejectDialogContentUI(props: RejectDialogContentUIProps) {
  const { resource, checkedItems, onUpdateChecked, classes } = props;

  const rejectItems = resource.read();

  return (
    <List className={classes.itemsList}>
      {rejectItems.map((item) => {
        const labelId = `checkbox-list-label-${item.path}`;

        return (
          <ListItem key={item.path} onClick={() => onUpdateChecked(item.path)} button>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={checkedItems.includes(item.path)}
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': labelId }}
                color="primary"
              />
            </ListItemIcon>
            <ListItemText primary={item.label} secondary={item.path} id={labelId} />
          </ListItem>
        );
      })}
    </List>
  );
}

function RejectDialogUI(props: RejectDialogUIProps) {
  const {
    resource,
    checkedItems,
    rejectionReason,
    rejectionComment,
    setRejectionReason,
    setRejectionComment,
    onUpdateChecked,
    onClose,
    onDismiss,
    onReject,
    classes
  } = props;
  return (
    <>
      <DialogHeader
        id="workflowCancellationDialogTitle"
        title={<FormattedMessage id="workflowCancellation.title" defaultMessage="Reject" />}
        subtitle={
          <FormattedMessage
            id="workflowCancellation.subtitle"
            defaultMessage="The following checked item(s) will be rejected."
          />
        }
        onDismiss={onDismiss}
      />
      <DialogBody id="confirmDialogBody">
        <Grid container spacing={3} className={classes.contentRoot}>
          <Grid item xs={12} sm={7} md={7} lg={7} xl={7}>
            <SuspenseWithEmptyState
              resource={resource}
              withEmptyStateProps={{
                emptyStateProps: {
                  title: (
                    <FormattedMessage id="publishDialog.noItemsSelected" defaultMessage="There are no affected files" />
                  )
                },
                isEmpty: (value) => value.length === 0
              }}
            >
              <RejectDialogContentUI
                resource={resource}
                checkedItems={checkedItems}
                onUpdateChecked={onUpdateChecked}
                classes={classes}
              />
            </SuspenseWithEmptyState>
          </Grid>

          <Grid item xs={12} sm={5} md={5} lg={5} xl={5}>
            <form>
              <FormControl fullWidth>
                <InputLabel className={classes.sectionLabel}>
                  <FormattedMessage id="rejectDialog.rejectionReason" defaultMessage="Rejection Reason" />:
                </InputLabel>
                <Select
                  fullWidth
                  input={<SelectInput />}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value as string)}
                >
                  <MenuItem value="NotApproved">
                    <FormattedMessage id="rejectDialog.notApproved" defaultMessage="Not Approved" />
                  </MenuItem>
                  <MenuItem value="IB">
                    <FormattedMessage id="rejectDialog.incorrectBranding" defaultMessage="Incorrect Branding" />
                  </MenuItem>
                  <MenuItem value="Typos">
                    <FormattedMessage id="rejectDialog.typos" defaultMessage="Typos" />
                  </MenuItem>
                  <MenuItem value="BrokenLinks">
                    <FormattedMessage id="rejectDialog.brokenLinks" defaultMessage="Broken Links" />
                  </MenuItem>
                  <MenuItem value="NSOA">
                    <FormattedMessage id="rejectDialog.nsoa" defaultMessage="Needs Section Owner's Approval" />
                  </MenuItem>
                </Select>
              </FormControl>

              <TextFieldWithMax
                className={classes.submissionTextField}
                label={<FormattedMessage id="rejectDialog.rejectCommentLabel" defaultMessage="Rejection Comment" />}
                fullWidth
                multiline
                rows={8}
                defaultValue={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value as string)}
                InputProps={{
                  className: classes.textField
                }}
              />
            </form>
          </Grid>
        </Grid>
      </DialogBody>
      <DialogFooter>
        {onClose && (
          <SecondaryButton onClick={onClose}>
            <FormattedMessage id="rejectDialog.cancel" defaultMessage="Cancel" />
          </SecondaryButton>
        )}
        {onReject && (
          <PrimaryButton
            onClick={onReject}
            autoFocus
            disabled={checkedItems.length === 0 || rejectionComment === '' || rejectionReason === ''}
          >
            <FormattedMessage id="rejectDialog.continue" defaultMessage="Reject" />
          </PrimaryButton>
        )}
      </DialogFooter>
    </>
  );
}

export default function RejectDialog(props: RejectDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} aria-labelledby="rejectDialogTitle" fullWidth maxWidth="md">
      <RejectDialogWrapper {...props} />
    </Dialog>
  );
}

function RejectDialogWrapper(props: RejectDialogProps) {
  const { items, onClose, onClosed, onDismiss, onRejectSuccess } = props;
  useUnmount(onClosed);
  const [checkedItems, setCheckedItems] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionComment, setRejectionComment] = useState('');
  const siteId = useActiveSiteId();
  const currentLocale = getCurrentLocale();
  const [apiState, setApiState] = useSpreadState<ApiState>({
    error: null,
    submitting: false
  });

  // check all items as default
  useEffect(() => {
    const newChecked = [];

    items.forEach((item) => {
      const uri = item.path;
      newChecked.push(uri);
    });

    setCheckedItems(newChecked);
  }, [items]);

  useEffect(() => {
    if (rejectionReason === '') {
      setRejectionComment('');
    } else {
      fetchCannedMessage(siteId, currentLocale, rejectionReason).subscribe((message) => {
        setRejectionComment(message);
      });
    }
  }, [rejectionReason, setRejectionComment, currentLocale, siteId]);

  const updateChecked = (value) => {
    const itemExist = checkedItems.includes(value);
    const newChecked = [...checkedItems];

    if (itemExist) {
      newChecked.splice(newChecked.indexOf(value), 1);
    } else {
      newChecked.push(value);
    }

    setCheckedItems(newChecked);
  };

  const onReject = () => {
    setApiState({ ...apiState, submitting: true });

    reject(siteId, checkedItems, rejectionReason, rejectionComment).subscribe(
      () => {
        setApiState({ error: null, submitting: false });
        onRejectSuccess?.();
        onDismiss?.();
      },
      (error) => {
        setApiState({ error, submitting: false });
      }
    );
  };

  const resource = useLogicResource<Return, Source>(items, {
    shouldResolve: (source) => Boolean(source),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => null
  });

  return (
    <RejectDialogUI
      resource={resource}
      checkedItems={checkedItems}
      rejectionReason={rejectionReason}
      setRejectionReason={setRejectionReason}
      rejectionComment={rejectionComment}
      setRejectionComment={setRejectionComment}
      onUpdateChecked={updateChecked}
      onClose={onClose}
      onDismiss={onDismiss}
      onReject={onReject}
      classes={useStyles()}
    />
  );
}
