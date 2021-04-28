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

import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import FilterListRoundedIcon from '@material-ui/icons/FilterListRounded';
import Tooltip from '@material-ui/core/Tooltip';

export default function AuditManagement() {
  const onFiltersClick = () => {};

  return (
    <section>
      <GlobalAppToolbar
        title={<FormattedMessage id="GlobalMenu.Audit" defaultMessage="Audit" />}
        rightContent={
          <Tooltip title={<FormattedMessage id="auditManagement.openFilters" defaultMessage="Open filters" />}>
            <IconButton onClick={onFiltersClick}>
              <FilterListRoundedIcon />
            </IconButton>
          </Tooltip>
        }
      />
    </section>
  );
}
