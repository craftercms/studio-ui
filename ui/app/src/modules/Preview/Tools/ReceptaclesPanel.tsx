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
import Typography from '@material-ui/core/Typography';
import ToolPanel from './ToolPanel';
import { defineMessages } from 'react-intl';

const translations = defineMessages({
  receptaclesPanel: {
    id: 'craftercms.ice.receptacles.title',
    defaultMessage: 'Receptacles'
  }
});

export default function ReceptaclesPanel() {
  return (
    <ToolPanel title={translations.receptaclesPanel}>
      <Typography component="h2" variant="subtitle1" style={{ padding: '10px' }}>
        Receptacles Panel
      </Typography>
    </ToolPanel>
  );
}
