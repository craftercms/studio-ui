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

const useStyles = makeStyles((theme) =>
  createStyles({
    dialog: {
      minHeight: '90vh'
    },
    toolPanelBody: () => {
      const toolbarMixin: any = theme.mixins.toolbar;
      const key1 = '@media (min-width:0px) and (orientation: landscape)';
      const key2 = '@media (min-width:600px)';
      if (!toolbarMixin[key1] || !toolbarMixin[key2] || !toolbarMixin.minHeight) {
        console.error(
          '[ToolsPanelEmbeddedAppViewButton] MUI may have changed their toolbar mixin. Please adjust my styles.',
          toolbarMixin
        );
      }
      return {
        [key1]: {
          height: `calc(90vh - ${toolbarMixin[key1].minHeight}px - 1px)`
        },
        [key2]: {
          height: `calc(90vh - ${toolbarMixin[key2].minHeight}px - 1px)`
        },
        height: `calc(90vh - ${toolbarMixin.minHeight}px - 1px)`
      };
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
        <ToolPanel title={props.title} onBack={() => setOpen(false)} classes={{ body: classes.toolPanelBody }}>
          <Widget {...props.widget} />
        </ToolPanel>
      </Dialog>
    </>
  );
}
