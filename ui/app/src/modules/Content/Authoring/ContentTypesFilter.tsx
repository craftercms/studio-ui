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
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import { palette } from '../../../styles/theme';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

const translations = defineMessages({
  contentTypeAll: {
    id: 'contentTypeAll.type',
    defaultMessage: 'all'
  },
  contentTypeAllLabel: {
    id: 'contentTypeAll.label',
    defaultMessage: 'Show all types'
  },
  contentTypePage: {
    id: 'contentTypePage.type',
    defaultMessage: 'page'
  },
  contentTypePageLabel: {
    id: 'contentTypePage.label',
    defaultMessage: 'Pages only'
  },
  contentTypeComponent: {
    id: 'contentTypeComponent.type',
    defaultMessage: 'component'
  },
  contentTypeComponentLabel: {
    id: 'contentTypeComponent.label',
    defaultMessage: 'Components only'
  },
  contentTypeQuickCreate: {
    id: 'contentTypeQuickCreate.type',
    defaultMessage: 'quickCreate'
  },
  contentTypeQuickCreateLabel: {
    id: 'contentTypeQuickCreate.label',
    defaultMessage: 'Quick create only'
  },
  contentTypeFavorite: {
    id: 'contentTypeFavorite.type',
    defaultMessage: 'favorite'
  },
  contentTypeFavoriteLabel: {
    id: 'contentTypeFavorite.label',
    defaultMessage: 'Favorites only'
  },
});

const useStyles = makeStyles(theme => ({
  menu: {
    '& ul': {
      padding: '5px 10px'
    }
  },
  openMenuBtn: {
    fontSize: '16px'
  },
  openMenuBtnIcon: {
    fontSize: '24px',
    marginLeft: '5px',
    paddingTop: '2px',
    fill: palette.gray.medium4
  },
  radioGroup: {
    '&:focus': {
      outline: 0
    }
  }
}));

interface ContentTypesFilterProps {
  onTypeChange(type: string): any;
}

export default function ContentTypesFilter(props: ContentTypesFilterProps) {
  const { onTypeChange } = props;
  const { formatMessage } = useIntl();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const CONTENT_TYPES = [
    {
      label: formatMessage(translations.contentTypeAllLabel),
      type: formatMessage(translations.contentTypeAll)
    },
    {
      label: formatMessage(translations.contentTypePageLabel),
      type: formatMessage(translations.contentTypePage)
    },
    {
      label: formatMessage(translations.contentTypeComponentLabel),
      type: formatMessage(translations.contentTypeComponent)
    },
    {
      label: formatMessage(translations.contentTypeQuickCreateLabel),
      type: formatMessage(translations.contentTypeQuickCreate)
    },
    {
      label: formatMessage(translations.contentTypeFavoriteLabel),
      type: formatMessage(translations.contentTypeFavorite)
    }
  ];
  const [type, setType] = useState(CONTENT_TYPES[0].type);

  const onMenuClose = () => setAnchorEl(null);

  const onMenuOpen = e => setAnchorEl(e.currentTarget);

  const onChange = e => {
    onTypeChange(e.target.value);
    setType(e.target.value);
  };

  return (
    <>
      <Button onClick={onMenuOpen} className={classes.openMenuBtn}>
        <FormattedMessage
          id="openMenuBtn.text"
          defaultMessage="Show all types"
        />
        <ArrowDropDownIcon className={classes.openMenuBtnIcon} />
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={onMenuClose}
        className={classes.menu}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <RadioGroup value={type} onChange={onChange} className={classes.radioGroup}>
          {
            CONTENT_TYPES.map(contentType => (
              <FormControlLabel
                key={contentType.type}
                value={contentType.type}
                control={<Radio color="primary" />}
                label={contentType.label}
              />
            ))
          }
        </RadioGroup>
      </Menu>
    </>
  );
}
