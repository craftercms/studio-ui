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

import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Gears from "./Gears";
import { backgroundColor } from "../styles/theme";

const useStyles = makeStyles(() => ({
  loadingView: {
    height: '100%',
    background: backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  gearContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: '100px'
  },
  title: {
    marginTop: '40px',
    marginBottom: '15px'
  },
  paragraph: {
    marginBottom: '10px'
  },
  footerText: {
    marginBottom: '60px'
  }
}));

interface LoadingState {
  title: string,
  subtitle?: string
  subtitle2?: string
}

export default function LoadingState(props: LoadingState) {
  const classes = useStyles({});
  return (
    <div className={classes.loadingView}>
      <Typography variant="h5" component="h1" className={classes.title}>
        {props.title}
      </Typography>
      {
        props.subtitle &&
        <Typography variant="subtitle1" component="p" className={classes.paragraph}>
          {props.subtitle}
        </Typography>
      }
      <div className={classes.gearContainer}>
        <Gears width={'250px'}/>
      </div>
    </div>
  )
}
