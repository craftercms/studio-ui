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
import makeStyles from '@mui/styles/makeStyles';
import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup } from '@mui/material';
import { setHighlightMode } from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import EditModeSwitch from '../EditModeSwitch';
import { usePreviewState } from '../../utils/hooks/usePreviewState';
import { useCurrentPreviewItem } from '../../utils/hooks/useCurrentPreviewItem';
import { HighlightMode } from '../../models/GlobalState';

const translations = defineMessages({
  editMode: {
    id: 'settingsPanel.editMode',
    defaultMessage: 'Edit Mode'
  },
  editModeHelperText: {
    id: 'settingsPanel.editModeHelperText',
    defaultMessage: 'Enable In-context editing, highlighting editable targets as you hover on them.'
  },
  highlightMode: {
    id: 'settingsPanel.highlightMode',
    defaultMessage: 'Highlight Mode'
  },
  highlightModeHelperText: {
    id: 'settingsPanel.highlightModeHelperText',
    defaultMessage:
      'When "highlight movable" is selected, only content items you can be moved or sorted highlight. Text inputs and other non-movable won\'t highlight.'
  },
  highlightAllZones: {
    id: 'settingsPanel.highlightAllTargets',
    defaultMessage: 'Highlight All Targets'
  },
  highlightMovable: {
    id: 'settingsPanel.highlightMovable',
    defaultMessage: 'Highlight Movable'
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
  const classes = useStyles();
  const { formatMessage } = useIntl();
  const { highlightMode } = usePreviewState();
  const item = useCurrentPreviewItem();
  const dispatch = useDispatch();

  return (
    <section className={classes.root}>
      <FormControl>
        <FormControlLabel
          classes={{ root: classes.labelRoot }}
          control={<EditModeSwitch item={item} />}
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
                highlightMode: e.target.value as HighlightMode
              })
            );
          }}
        >
          <FormControlLabel
            value="all"
            classes={{ root: classes.labelRoot }}
            control={<Radio color="primary" edge="end" />}
            label={formatMessage(translations.highlightAllZones)}
            labelPlacement="start"
          />
          <FormControlLabel
            value="move"
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
