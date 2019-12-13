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

import React, { ElementType } from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import makeStyles from "@material-ui/core/styles/makeStyles";
import cardTitleStyles from "../styles/card";
import { palette } from "../styles/theme";
import clsx from "clsx";

const useStyles = makeStyles(() => ({
  card: {
    '& .cardTitle': {
      ...cardTitleStyles
    },
  },
  avatar: {
    color: palette.red.main
  },
  action: {
    marginTop: 0,
    alignSelf: 'inherit'
  },
  root: {
    padding: '0 16px',
    height: '70px'
  }
}));

interface TitleCardProps {
  title: string;
  icon?: ElementType<any>;
  options?: boolean;
  classes?: any;
}

export default function TitleCard(props: TitleCardProps) {
  const {title, options, icon: Icon} = props;
  const classes = useStyles({});
  return (
    <Card className={clsx(classes.card, props.classes?.root && props.classes.root )}>
      <CardHeader
        classes={{root: classes.root, avatar: classes.avatar, action: classes.action}}
        avatar={Icon && <Icon/>}
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
