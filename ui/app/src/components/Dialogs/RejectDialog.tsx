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
import { createStyles, makeStyles } from '@material-ui/core/styles';
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
import { reject } from '../../services/publishing';
import { ApiResponse } from '../../models/ApiResponse';
import { fetchCannedMessage } from '../../services/configuration';
import TextFieldWithMax from '../Controls/TextFieldWithMax';
import { getCurrentLocale } from '../../utils/i18n';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import Typography from '@material-ui/core/Typography';
import ListSubheader from '@material-ui/core/ListSubheader';
import { emitSystemEvent, itemsRejected } from '../../state/actions/system';
import { useDispatch } from 'react-redux';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { useSpreadState } from '../../utils/hooks/useSpreadState';

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

const useStyles = makeStyles((theme) =>
  createStyles({
    itemsList: {
      border: `1px solid ${theme.palette.divider}`,
      background: theme.palette.background.paper,
      padding: 0,
      height: '100%'
    },
    submissionTextField: {
      marginTop: '10px'
    },
    ellipsis: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    submittedBy: {
      flexGrow: 0,
      width: '100px',
      textAlign: 'right',
      alignSelf: 'flex-start'
    },
    listSubHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${theme.palette.divider}`,
      lineHeight: '30px'
    },
    subHeaderItem: {
      marginLeft: '40px'
    }
  })
);

function RejectDialogContentUI(props: RejectDialogContentUIProps) {
  const { resource, checkedItems, onUpdateChecked, classes } = props;

  const rejectItems = resource.read();

  return (
    <List
      subheader={
        <ListSubheader component="div" className={classes.listSubHeader}>
          <label className={classes.subHeaderItem}>
            <FormattedMessage id="words.item" defaultMessage="Item" />
          </label>
          <label>
            <FormattedMessage id="rejectDialog.submittedBy" defaultMessage="Submitted By" />
          </label>
        </ListSubheader>
      }
      className={classes.itemsList}
    >
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
            <ListItemText
              primary={item.label}
              secondary={item.path}
              id={labelId}
              primaryTypographyProps={{
                classes: { root: classes.ellipsis }
              }}
              secondaryTypographyProps={{
                classes: { root: classes.ellipsis }
              }}
            />
            <ListItemText disableTypography={true} className={classes.submittedBy}>
              <Typography>{item.modifier}</Typography>
            </ListItemText>
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
        onCloseButtonClick={onDismiss}
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
              <FormControl fullWidth variant="outlined">
                <InputLabel>
                  <FormattedMessage id="rejectDialog.rejectionReason" defaultMessage="Rejection Reason" />
                </InputLabel>
                <Select
                  fullWidth
                  label={<FormattedMessage id="rejectDialog.rejectionReason" defaultMessage="Rejection Reason" />}
                  autoFocus
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
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value as string)}
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
  const [rejectionCommentDirty, setRejectionCommentDirty] = useState(false);
  const siteId = useActiveSiteId();
  const currentLocale = getCurrentLocale();
  const dispatch = useDispatch();
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
        dispatch(emitSystemEvent(itemsRejected({ targets: checkedItems })));
        onRejectSuccess?.();
        onDismiss?.();
      },
      (error) => {
        setApiState({ error, submitting: false });
      }
    );
  };

  const onRejectionCommentChanges = (value: string) => {
    setRejectionCommentDirty(value !== '');
    setRejectionComment(value);
  };

  const onRejectionReasonChanges = (value: string) => {
    if (value && rejectionCommentDirty === false) {
      fetchCannedMessage(siteId, currentLocale, value).subscribe(setRejectionComment);
    }
    setRejectionReason(value);
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
      setRejectionReason={onRejectionReasonChanges}
      rejectionComment={rejectionComment}
      setRejectionComment={onRejectionCommentChanges}
      onUpdateChecked={updateChecked}
      onClose={onClose}
      onDismiss={onDismiss}
      onReject={onReject}
      classes={useStyles()}
    />
  );
}
