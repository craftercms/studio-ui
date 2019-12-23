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
import MoreVertIcon from '@material-ui/icons/MoreVertRounded';
import makeStyles from "@material-ui/core/styles/makeStyles";
import cardTitleStyles from "../../styles/card";
import { palette } from "../../styles/theme";
import clsx from "clsx";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

const useStyles = makeStyles(() => ({
  card: {
    cursor: 'pointer',
    '& .cardTitle': {
      ...cardTitleStyles
    },
    '&:hover': {
      backgroundColor: palette.gray.light1
    },
    '&.disabled': {
      opacity: '0.5',
      pointerEvents: 'none'
    }
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
  value?: string;
  icon?: ElementType<any>;
  options?: boolean;
  classes?: any;
  onCardClick(id: string): any;
  cardActions?: any;
  disabled?: boolean;
}

export default function SiteCard(props: TitleCardProps) {
  const {title, value, options, icon: Icon, onCardClick, cardActions = [], disabled = false} = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const classes = useStyles({});

  const handleClose = (event: any) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleOptions = (event: any) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleOptionClick = (event: any, action: any, id: string) => {
    event.stopPropagation();
    action.onClick(id);
  };

  return (
    <Card className={clsx(classes.card, props.classes?.root && props.classes.root, disabled && 'disabled')} onClick={() => !disabled? onCardClick(value): null}>
      <CardHeader
        classes={{root: classes.root, avatar: classes.avatar, action: classes.action}}
        avatar={Icon && <Icon/>}
        action={
          options &&
          <IconButton aria-label="settings" onClick={(e) => handleOptions(e)}>
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
      <Menu
        id="options-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={(e) => handleClose(e)}
      >
        {
          cardActions.map((action, i) =>
            <MenuItem key={i} onClick={(e) => handleOptionClick(e, action, value)}>{action.name}</MenuItem>
          )
        }
      </Menu>
    </Card>
  )
}
