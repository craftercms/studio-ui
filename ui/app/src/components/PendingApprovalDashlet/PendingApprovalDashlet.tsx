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
import { CommonDashletProps, DashletTemplate } from '../SiteDashboard';
import { FormattedMessage } from 'react-intl';
import palette from '../../styles/palette';

interface PendingApprovalDashletProps extends CommonDashletProps {}

export function PendingApprovalDashlet(props: PendingApprovalDashletProps) {
  const { borderLeftColor = palette.purple.tint } = props;
  return (
    <DashletTemplate
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="pendingApprovalDashlet.widgetTitle" defaultMessage="Pending Approval" />}
    >
      ...
    </DashletTemplate>
  );
}

export default PendingApprovalDashlet;
