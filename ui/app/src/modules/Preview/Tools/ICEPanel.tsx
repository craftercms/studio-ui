/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import ToolPanel from './ToolPanel';
import { defineMessages } from 'react-intl';
import Typography from '@material-ui/core/Typography';

const translations = defineMessages({
  inContextEditing: {
    id: 'craftercms.ice.ice.title',
    defaultMessage: 'In Context Editing'
  }
});

export default function ICEPanel() {
  return (
    <ToolPanel title={translations.inContextEditing}>
      <Typography component="h2" variant="subtitle1" style={{ padding: '10px' }}>
        ICE Panel
      </Typography>
    </ToolPanel>
  );
}
