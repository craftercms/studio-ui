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

import React, { useState } from 'react';
import ToolsPanelListItemButton from '../ToolsPanelListItemButton';
import { Dialog } from '@material-ui/core';
import ToolPanel from '../../modules/Preview/Tools/ToolPanel';
import { Widget } from '../Widget';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
  createStyles({
    dialog: {
      minHeight: '90vh'
    }
  })
);

export default function ToolsPanelEmbeddedAppViewButton(props) {
  const [open, setOpen] = useState(false);
  const openEmbeddedApp = () => setOpen(true);
  const classes = useStyles();
  return (
    <>
      <ToolsPanelListItemButton {...props} onClick={openEmbeddedApp} />
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xl" classes={{ paper: classes.dialog }}>
        <ToolPanel title={props.title} onBack={() => setOpen(false)}>
          <Widget {...props.widget} />
        </ToolPanel>
      </Dialog>
    </>
  );
}
