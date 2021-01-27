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
import { Widget } from '../Widget';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useMinimizeDialog, usePossibleTranslation } from '../../utils/hooks';
import { maximizeDialog, minimizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { useDispatch } from 'react-redux';
import DialogHeader from '../Dialogs/DialogHeader';

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
  const classes = useStyles();
  const dispatch = useDispatch();

  const id = props.widget.uiKey;

  const minimized = useMinimizeDialog({
    id,
    title: usePossibleTranslation(props.title),
    minimized: false
  });

  const onMinimize = () => {
    dispatch(minimizeDialog({ id }));
  };

  const openEmbeddedApp = () => {
    if (minimized) {
      dispatch(maximizeDialog({ id }));
    }
    setOpen(true);
  };

  return (
    <>
      <ToolsPanelListItemButton {...props} onClick={openEmbeddedApp} />
      <Dialog
        open={open && !minimized}
        keepMounted={minimized}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xl"
        classes={{ paper: classes.dialog }}
      >
        <DialogHeader
          title={usePossibleTranslation(props.title)}
          rightActions={[
            {
              icon: 'MinimizeIcon',
              onClick: onMinimize
            },
            {
              icon: 'CloseIcon',
              onClick: () => {
                setOpen(false);
              }
            }
          ]}
        />
        <section className={classes.toolPanelBody}>
          <Widget {...props.widget} />
        </section>
      </Dialog>
    </>
  );
}
