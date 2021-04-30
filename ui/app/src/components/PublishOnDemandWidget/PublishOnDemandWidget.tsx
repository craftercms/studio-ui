/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { FormattedMessage } from 'react-intl';
import DialogHeader from '../Dialogs/DialogHeader';
import { createStyles, makeStyles } from '@material-ui/core';
import palette from '../../styles/palette';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import Radio from '@material-ui/core/Radio/Radio';
import RadioGroup from '@material-ui/core/RadioGroup/RadioGroup';
import Collapse from '@material-ui/core/Collapse/Collapse';
import Button from '@material-ui/core/Button';
import ListItemText from '@material-ui/core/ListItemText';
import PublishOnDemandForm from '../PublishOnDemandForm';
import { PublishFormData, PublishOnDemandMode } from '../../models/Publishing';
import { nnou } from '../../utils/object';

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      backgroundColor: palette.gray.light0,
      padding: '16px'
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '16px'
    },
    modeSelector: {
      padding: '10px 25px',
      border: `1px solid ${palette.gray.light7}`,
      marginBottom: '20px'
    },
    byPathModeSelector: {
      marginBottom: '10px'
    },
    cancelBtn: {
      marginRight: '20px'
    }
  })
);

interface PublishOnDemandWidgetProps {
  mode: PublishOnDemandMode;
  setMode(mode): void;
  formData: PublishFormData;
  setFormData(data): void;
  formValid: boolean;
  onPublish?(): void;
  onCancel?(): void;
}

export default function PublishOnDemandWidget(props: PublishOnDemandWidgetProps) {
  const { mode, setMode, formData, setFormData, formValid = false, onPublish, onCancel } = props;
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode((event.target as HTMLInputElement).value);
  };

  return (
    <Paper elevation={2}>
      <DialogHeader title={<FormattedMessage id="publishOnDemand.title" defaultMessage="Publish on Demand" />} />

      <div className={classes.content}>
        <Paper elevation={0} className={classes.modeSelector}>
          <form>
            <RadioGroup value={mode} onChange={handleChange}>
              <FormControlLabel
                value="studio"
                control={<Radio color="primary" />}
                label={
                  <ListItemText
                    primary={
                      <FormattedMessage
                        id="publishOnDemand.pathModeDescription"
                        defaultMessage="Publish changes made in Studio via the UI"
                      />
                    }
                    secondary="By path"
                  />
                }
                className={classes.byPathModeSelector}
              />
              <FormControlLabel
                value="git"
                control={<Radio color="primary" />}
                label={
                  <ListItemText
                    primary={
                      <FormattedMessage
                        id="publishOnDemand.tagsModeDescription"
                        defaultMessage="Publish changes made via direct git actions against the repository or pulled from a remote repository"
                      />
                    }
                    secondary="By tags or commit ids"
                  />
                }
              />
            </RadioGroup>
          </form>
        </Paper>

        <Collapse in={nnou(mode)} timeout={300} unmountOnExit>
          <PublishOnDemandForm formData={formData} setFormData={setFormData} mode={mode} />
        </Collapse>
      </div>

      <div className={classes.actions}>
        <Button variant="outlined" color="default" onClick={onCancel} className={classes.cancelBtn} disabled={!mode}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </Button>
        <Button variant="contained" color="primary" disabled={!formValid} onClick={onPublish}>
          <FormattedMessage id="words.publish" defaultMessage="Publish" />
        </Button>
      </div>
    </Paper>
  );
}
