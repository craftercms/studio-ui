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

import React, { useState } from 'react';
import Popover from '@material-ui/core/Popover';
import makeStyles from "@material-ui/core/styles/makeStyles";
import { palette } from "../styles/theme";
import Grid from "@material-ui/core/Grid";
import { defineMessages, useIntl } from "react-intl";
import Typography from '@material-ui/core/Typography';
import TitleCard from './TitleCard';
import HomeIcon from '@material-ui/icons/Home';

const useStyles = makeStyles(() => ({
  popover: {
    maxWidth: '834px',
    width: '100%',
    maxHeight: '656px',
    backgroundColor: palette.white,
    borderRadius: '20px',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.25), 0px 0px 4px rgba(0, 0, 0, 0.25)'
  },
  sitesPanel: {
    backgroundColor: palette.gray.light1,
    padding: '30px 24px 30px 30px'
  },
  sitesContent: {
    backgroundColor: palette.white,
    padding: '86px 24px 30px 30px'
  },
  title: {
    marginBottom: '24px',
    color: '#69696E',
    textTransform: 'uppercase'
  },
  sitesApps: {
    marginTop: '30px'
  }
}));

const messages = defineMessages({
  MySites: {
    id: 'globalMenu.MySites',
    defaultMessage: 'My Sites'
  },
  Apps: {
    id: 'globalMenu.Apps',
    defaultMessage: 'Apps'
  }
});

interface GlobalMenuPopUpProps {
  anchorElement: HTMLElement;
}

function GlobalMenuPopUp(props: GlobalMenuPopUpProps) {
  const {anchorElement} = props;
  const [open, setOpen] = useState(true);
  const classes = useStyles({});
  const {formatMessage} = useIntl();

  function handleClose() {
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorElement}
      onClose={handleClose}
      classes={{paper: classes.popover}}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Grid container spacing={0}>
        <Grid item xs={5} className={classes.sitesPanel}>
          <Typography variant="h6" gutterBottom className={classes.title}>
            {formatMessage(messages.MySites)}
          </Typography>
          <TitleCard title={"holitron"} options={true}/>
        </Grid>
        <Grid item xs={7} className={classes.sitesContent}>
          <TitleCard title={"dashboard"} options={true} icon={HomeIcon}/>
          <div className={classes.sitesApps}>
            <Typography variant="h6" gutterBottom className={classes.title}>
              {formatMessage(messages.Apps)}
            </Typography>
          </div>
        </Grid>
      </Grid>
    </Popover>
  )
}

export default GlobalMenuPopUp;
