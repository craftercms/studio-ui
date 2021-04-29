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

import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { useSitesBranch, useSpreadState } from '../../utils/hooks';
import User from '../../models/User';
import React, { useEffect, useMemo, useState } from 'react';
import LookupTable from '../../models/LookupTable';
import { disable, enable, fetchRolesBySite, trash, update } from '../../services/users';
import { showSystemNotification } from '../../state/actions/system';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { EditUserDialogUI } from './EditUserDialogUI';
import { defineMessages } from 'react-intl';

export interface EditUserDialogContainerProps {
  open: boolean;
  user: User;
  onClose(): void;
  onUserEdited(): void;
  passwordRequirementsRegex: string;
}

const translations = defineMessages({
  userDeleted: {
    id: 'userInfoDialog.userDeleted',
    defaultMessage: 'User deleted successfully'
  },
  userUpdated: {
    id: 'userInfoDialog.userUpdated',
    defaultMessage: 'User updated successfully'
  },
  userEnabled: {
    id: 'userInfoDialog.userEnabled',
    defaultMessage: 'User enabled successfully'
  },
  userDisabled: {
    id: 'userInfoDialog.userDisabled',
    defaultMessage: 'User disabled successfully'
  }
});

export function EditUserDialogContainer(props: EditUserDialogContainerProps) {
  const { open, onClose, onUserEdited, passwordRequirementsRegex } = props;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [user, setUser] = useSpreadState<User>({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    enabled: false,
    externallyManaged: false
  });
  const sites = useSitesBranch();
  const sitesById = sites.byId;
  const mySites = useMemo(() => Object.values(sitesById), [sitesById]);
  const [lastSavedUser, setLastSavedUser] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const [rolesBySite, setRolesBySite] = useState<LookupTable<string[]>>({});
  const [dirty, setDirty] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);

  const editMode = !props.user?.externallyManaged;

  useEffect(() => {
    if (open) {
      setUser(props.user);
    }
  }, [props.user, open, setUser]);

  useEffect(() => {
    if (mySites.length && props.user?.username) {
      fetchRolesBySite(props.user.username, mySites).subscribe((response) => {
        setRolesBySite(response);
      });
    }
  }, [mySites, props.user?.username]);

  const onInputChange = (value: object) => {
    setDirty(true);
    setUser(value);
  };

  const onCancelForm = () => {
    if (lastSavedUser) {
      setUser(lastSavedUser);
    } else {
      setUser(props.user);
    }
    setDirty(false);
  };

  const onEnableChange = (value) => {
    setUser(value);
    if (value.enabled) {
      enable(user.username).subscribe(
        () => {
          dispatch(
            showSystemNotification({
              message: formatMessage(translations.userEnabled)
            })
          );
        },
        ({ response: { response } }) => {
          dispatch(showErrorDialog({ error: response }));
        }
      );
    } else {
      disable(user.username).subscribe(
        () => {
          dispatch(
            showSystemNotification({
              message: formatMessage(translations.userDisabled)
            })
          );
        },
        ({ response: { response } }) => {
          dispatch(showErrorDialog({ error: response }));
        }
      );
    }
  };

  const onSave = () => {
    if (!editMode) {
      return;
    }
    setInProgress(true);
    update(user).subscribe(
      () => {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.userUpdated)
          })
        );
        setDirty(false);
        setInProgress(false);
        setLastSavedUser(user);
        onUserEdited();
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onDelete = (username: string) => {
    trash(username).subscribe(
      () => {
        onClose();
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.userDeleted)
          })
        );
        onUserEdited();
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onCloseResetPasswordDialog = () => {
    setOpenResetPassword(false);
  };

  const onResetPassword = (value: boolean) => {
    setOpenResetPassword(value);
  };

  return (
    <EditUserDialogUI
      user={user}
      openResetPassword={openResetPassword}
      inProgress={inProgress}
      dirty={dirty}
      sites={mySites}
      rolesBySite={rolesBySite}
      passwordRequirementsRegex={passwordRequirementsRegex}
      onSave={onSave}
      onClose={onClose}
      onDelete={onDelete}
      onCloseResetPasswordDialog={onCloseResetPasswordDialog}
      onInputChange={onInputChange}
      onEnableChange={onEnableChange}
      onCancelForm={onCancelForm}
      onResetPassword={onResetPassword}
    />
  );
}

export default EditUserDialogContainer;
