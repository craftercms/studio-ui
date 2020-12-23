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

import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup } from '@material-ui/core';
import { EditSwitch } from '../../modules/Preview/ToolBar';
import { usePreviewState } from '../../utils/hooks';
import { setHighlightMode, setPreviewEditMode } from '../../state/actions/preview';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';

const translations = defineMessages({
  editMode: {
    id: 'settingsPanel.editMode',
    defaultMessage: 'Edit Mode'
  },
  editModeHelperText: {
    id: 'settingsPanel.editModeHelperText',
    defaultMessage: 'Enable In-context editing, highlighting editable zones as you hover on them.'
  },
  highlightMode: {
    id: 'settingsPanel.highlightMode',
    defaultMessage: 'Highlight Mode'
  },
  highlightModeHelperText: {
    id: 'settingsPanel.highlightModeHelperText',
    defaultMessage: 'When "highlight movable" is active, only content items you can move around drop zones highlight.'
  },
  highlightAllZones: {
    id: 'settingsPanel.highlightAllZones',
    defaultMessage: 'Highlight All Zones'
  },
  highlightMovable: {
    id: 'settingsPanel.highlightMovable',
    defaultMessage: 'Highlight Movable'
  },
  editModeOn: {
    id: 'previewToolbar.editModeOn',
    defaultMessage: 'Edit mode switched on'
  },
  editModeOff: {
    id: 'previewToolbar.editModeOff',
    defaultMessage: 'Edit mode switched off'
  }
});

const useStyles = makeStyles(() => ({
  root: {
    padding: '15px'
  },
  highlightModeWrapper: {
    padding: '15px'
  },
  labelRoot: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: 0
  },
  margin: {
    marginTop: '15px',
    marginBottom: '10px'
  }
}));

export default function PreviewSettingsPanel() {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const { editMode, highlightMode } = usePreviewState();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  return (
    <section className={classes.root}>
      <FormControl>
        <FormControlLabel
          classes={{ root: classes.labelRoot }}
          control={
            <EditSwitch
              color="default"
              checked={editMode}
              onChange={(e) => {
                enqueueSnackbar(formatMessage(e.target.checked ? translations.editModeOn : translations.editModeOff));
                dispatch(setPreviewEditMode({ editMode: e.target.checked }));
              }}
              edge="end"
            />
          }
          label={formatMessage(translations.editMode)}
          labelPlacement="start"
        />
        <FormHelperText>{formatMessage(translations.editModeHelperText)}</FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel focused={false} className={classes.margin}>
          {formatMessage(translations.highlightMode)}
        </FormLabel>
        <RadioGroup
          value={highlightMode}
          onChange={(e) => {
            dispatch(
              setHighlightMode({
                highlightMode: e.target.value
              })
            );
          }}
        >
          <FormControlLabel
            value="ALL"
            classes={{ root: classes.labelRoot }}
            control={<Radio color="primary" edge="end" />}
            label={formatMessage(translations.highlightAllZones)}
            labelPlacement="start"
          />
          <FormControlLabel
            value="MOVABLE"
            classes={{ root: classes.labelRoot }}
            control={<Radio color="primary" edge="end" />}
            label={formatMessage(translations.highlightMovable)}
            labelPlacement="start"
          />
        </RadioGroup>
        <FormHelperText>{formatMessage(translations.highlightModeHelperText)}</FormHelperText>
      </FormControl>
    </section>
  );
}
