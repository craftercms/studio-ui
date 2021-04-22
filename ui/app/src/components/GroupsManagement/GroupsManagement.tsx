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
import AddIcon from '@material-ui/icons/Add';
import React from 'react';
import GlobalAppToolbar from '../GlobalAppToolbar';
import Button from '@material-ui/core/Button';

export default function GroupsManagement() {
  return (
    <section>
      <GlobalAppToolbar
        title={<FormattedMessage id="GlobalMenu.Groups" defaultMessage="Groups" />}
        leftContent={
          <Button startIcon={<AddIcon />} variant="outlined" color="primary">
            <FormattedMessage id="sites.createGroup" defaultMessage="Create Group" />
          </Button>
        }
      />
    </section>
  );
}
