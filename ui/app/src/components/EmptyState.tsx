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
import emptyIGM from "../assets/desert.svg";

const useStyles = makeStyles(() => ({
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    margin: 'auto',
    '& .title': {
      marginTop: '20px',
      marginBottom: '10px'
    },
    '& .paragraph': {
      marginTop: '10px',
    },
  }
}));

interface EmptyStateProps {
  image?: string,
  title: string
  subtitle: string
}

export default function EmptyState(props: EmptyStateProps) {
  const classes = useStyles({});
  const {image, title, subtitle} = props;

  return (
    <div className={classes.emptyContainer}>
      <img src={image ? image : emptyIGM} alt=""/>
      {
        title &&
        <Typography variant="h5" component="h1" className={'title'} color={'textSecondary'}>
          {title}
        </Typography>
      }
      {
        subtitle &&
        <Typography variant="subtitle1" component="p" className={'paragraph'} color={'textSecondary'}>
          {subtitle}
        </Typography>
      }
    </div>
  )
}
