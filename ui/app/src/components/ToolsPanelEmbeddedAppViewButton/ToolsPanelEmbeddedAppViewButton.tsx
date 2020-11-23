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
import { useMinimizeDialog } from '../../utils/hooks';
import { useIntl } from 'react-intl';
import { minimizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { useDispatch } from 'react-redux';

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
        return {
          height: `calc(90vh - 57px)`
        };
      } else {
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
    }
  })
);

export default function ToolsPanelEmbeddedAppViewButton(props) {
  const [open, setOpen] = useState(false);
  const openEmbeddedApp = () => setOpen(true);
  const { formatMessage } = useIntl();
  const classes = useStyles();
  const dispatch = useDispatch();

  const minimized = useMinimizeDialog({
    id: props.widget.id,
    title: typeof props.title === 'object' ? formatMessage(props.title) : props.title,
    minimized: false
  });

  const onMinimize = () => {
    dispatch(minimizeDialog({ id: props.widget.id }));
  };

  return (
    <>
      <ToolsPanelListItemButton {...props} onClick={openEmbeddedApp} />
      <Dialog
        open={open && !minimized}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xl"
        classes={{ paper: classes.dialog }}
      >
        <ToolPanel
          title={props.title}
          onBack={() => setOpen(false)}
          onMinimize={onMinimize}
          onClose={() => setOpen(false)}
          classes={{ body: classes.toolPanelBody }}
        >
          <Widget {...props.widget} />
        </ToolPanel>
      </Dialog>
    </>
  );
}
