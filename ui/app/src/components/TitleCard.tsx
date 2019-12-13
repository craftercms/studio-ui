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
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import makeStyles from "@material-ui/core/styles/makeStyles";
import cardTitleStyles from "../styles/card";
import HomeIcon from '@material-ui/icons/Home';
import { palette } from "../styles/theme";

const useStyles = makeStyles(() => ({
  card: {
    '& .cardTitle': {
      ...cardTitleStyles
    },
  },
  avatar: {
    color: palette.red.main
  }
}));


interface TitleCardProps {
  title: string;
  icon?: any;
  options?: boolean;
}

export default function TitleCard(props: TitleCardProps) {
  const {title, options, icon} = props;
  const classes = useStyles({});

  return (
    <Card className={classes.card}>
      <CardHeader
        classes={{avatar: classes.avatar}}
        avatar={
          icon &&
            <HomeIcon/>
        }
        action={
          options &&
          <IconButton aria-label="settings">
            <MoreVertIcon/>
          </IconButton>
        }
        title={title}
        titleTypographyProps={{
          variant: "subtitle2",
          component: "h2",
          className: 'cardTitle'
        }}
      />
    </Card>
  )
}
