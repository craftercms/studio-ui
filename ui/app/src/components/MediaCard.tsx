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
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import IconButton from '@material-ui/core/IconButton';
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Theme } from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import clsx from 'clsx';
import { MediaItem } from '../models/Search';
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { isEditableFormAsset } from "../utils/path";
import { defineMessages, useIntl } from "react-intl";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    '& .cardTitle': {
      fontWeight: '600',
      lineHeight: '1.5rem',
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-line-clamp': 1,
      '-webkit-box-orient': 'vertical',
      marginBottom: 0,
      '&.clickable': {
        textDecoration: 'underline',
        cursor: 'pointer',
      }
    },
    '& .cardSubtitle': {
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-line-clamp': 1,
      '-webkit-box-orient': 'vertical',
    },
    '&.list': {
      display: 'flex',
    }
  },
  cardHeaderRoot: {
    padding: '9px 0'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    '&.list': {
      marginLeft: '15px'
    }
  },
  cardOptions: {
    marginLeft: 'auto'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    //backgroundSize: 'auto',
    '&.list': {
      paddingTop: 0,
      height: '80px',
      width: '80px',
      order: -1
    }
  },
  listActionArea: {
    paddingTop: 0,
    height: '80px',
    width: '80px',
    order: -1
  },
  mediaIcon: {
    paddingTop: '56.25%',
    position: 'relative',
    '& .media-icon': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'rgba(0, 0, 0, 0.54)',
      fontSize: '50px'
    },
    '&.list': {
      height: '80px',
      width: '80px',
      paddingTop: '0',
      order: -1
    }
  },
  optionIcon: {
    color: '#828282',
    marginRight: '5px'
  },
  checkbox: {
    marginLeft: '11px',
    '& label': {
      marginRight: 0
    },
    '&.list': {
      justifyContent: 'center',
      order: -2,
      marginRight: '5px',
      marginLeft: '16px'
    }
  },
}));

interface MediaCardProps {
  item: MediaItem;
  currentView: string;
  selected: Array<string>;
  mode: string;
  previewAppBaseUri: string;

  handleEdit(path: string, readonly?: boolean): any;

  handleDelete(path: string): any;

  handlePreview(url: string): any;

  handlePreviewAsset(url: string, type: string, name: string): any;

  handleSelect(path: string, selected: boolean): any;

  onGetUserPermissions(path: string): any;
}

const messages = defineMessages({
  noPermissions: {
    id: 'mediaCard.noPermissions',
    defaultMessage: 'No permissions available.'
  },
  loadingPermissions: {
    id: 'mediaCard.loadingPermissions',
    defaultMessage: 'loading...'
  },
});

function MediaCard(props: MediaCardProps) {
  const classes = useStyles({});
  const [permissions, setPermissions] = useState({
    edit: null,
    delete: null,
  });
  const {handleEdit, handleDelete, handlePreview, handlePreviewAsset, handleSelect, onGetUserPermissions, selected, item, mode, previewAppBaseUri} = props;
  const {name, path, type} = item;
  const isList = props.currentView === 'list';
  const {formatMessage} = useIntl();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, path: string) => {
    setAnchorEl(event.currentTarget);
    onGetUserPermissions(path).then(
      ({permissions}) => {
        let editable = isEditableFormAsset(path);
        let isWriteAllowed = permissions.includes('write') || false;
        let isDeleteAllowed = permissions.includes('delete') || false;
        setPermissions({edit: editable && isWriteAllowed, delete: isDeleteAllowed && mode === 'default'});
      },
      (response: string) => {
        console.log(response)
      },
    )
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderIcon = (type: string, path: string, name: string) => {
    let iconClass = 'fa media-icon';
    let iconName = `${iconClass} fa-file`;
    let previewArea = false;
    switch (type) {
      case 'Page':
        iconName = `${iconClass} fa-file`;
        previewArea = true;
        break;
      case 'Video':
        iconName = `${iconClass} fa-file-video-o`;
        previewArea = true;
        break;
      case 'Template':
        iconName = `${iconClass} fa-file-code-o`;
        previewArea = true;
        break;
      case 'Taxonomy':
        iconName = `${iconClass} fa-tag`;
        break;
      case 'Component':
        iconName = `${iconClass} fa-puzzle-piece`;
        break;
      case 'Groovy':
        iconName = `${iconClass} fa-file-code-o`;
        previewArea = true;
        break;
      default:
        break;
    }
    return (
      <CardActionArea
        onClick={
          previewArea ?
            () => handlePreviewAsset(path, type, name)
            :
            () => handleEdit(path, true)
        }
        className={clsx(isList && classes.listActionArea)}>
        <div className={clsx(classes.mediaIcon, isList && 'list')}>
          <i className={iconName}></i>
        </div>
      </CardActionArea>
    )
  };

  return (
    <Card className={clsx(classes.card, isList && 'list')}>
      {
        isList &&
        <FormGroup className={clsx(classes.checkbox, 'list')}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selected.includes(path)}
                onClick={(e: any) => handleSelect(path, e.target.checked)}
                color="primary"/>
            }
            label={''}
          />
        </FormGroup>
      }
      <header className={clsx(classes.cardHeader, isList && 'list')}>
        {
          !isList &&
          <FormGroup className={classes.checkbox}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selected.includes(path)}
                  onClick={(e: any) => handleSelect(path, e.target.checked)}
                  color="primary"/>
              }
              label={''}
            />
          </FormGroup>
        }
        <CardHeader
          title={name}
          subheader={type}
          classes={{root: classes.cardHeaderRoot}}
          onClick={(type === 'Image' || type === 'Video' || type === 'Page') ? () => handlePreview(path) : null}
          titleTypographyProps={{
            variant: "subtitle2",
            component: "h2",
            className: clsx('cardTitle', (type === 'Image' || type === 'Video' || type === 'Page') && 'clickable')
          }}
          subheaderTypographyProps={{
            variant: "subtitle2",
            component: "h2",
            className: 'cardSubtitle',
            color: "textSecondary"
          }}
        />
        <IconButton aria-label="options" className={classes.cardOptions} onClick={(e) => handleClick(e, path)}>
          <MoreVertIcon/>
        </IconButton>
        <Menu
          id="options-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {permissions.edit === true &&
          <MenuItem onClick={() => handleEdit(path)}><EditIcon className={classes.optionIcon}/>Edit</MenuItem>}
          {permissions.delete === true &&
          <MenuItem onClick={() => handleDelete(path)}><DeleteIcon className={classes.optionIcon}/>Delete</MenuItem>}
          {
            (permissions.edit === false && permissions.delete === false) &&
            <MenuItem>{formatMessage(messages.noPermissions)}</MenuItem>
          }
          {
            permissions.edit === null &&
            <MenuItem>{formatMessage(messages.loadingPermissions)}</MenuItem>
          }
        </Menu>
      </header>
      {
        (type === 'Image') ?
          <CardActionArea onClick={() => handlePreviewAsset(path, type, name)}
                          className={clsx(isList && classes.listActionArea)}>
            <CardMedia
              className={clsx(classes.media, isList && 'list')}
              image={`${previewAppBaseUri}${path}`}
              title={name}
            />
          </CardActionArea>
          :
          renderIcon(type, path, name)
      }
    </Card>
  )
}

export default MediaCard;
