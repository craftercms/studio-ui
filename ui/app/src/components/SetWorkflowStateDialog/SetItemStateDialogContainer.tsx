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

import DialogHeader from '../DialogHeader/DialogHeader';
import { FormattedMessage } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import React from 'react';
import { SetItemStateDialogProps } from './SetItemStateDialog';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useStyles } from './styles';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box';
import { CSSProperties } from '@mui/styles';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { useSpreadState } from '../../utils/hooks/useSpreadState';

export function SetItemStateDialogContainer(props: SetItemStateDialogProps) {
  const { onClose, onClosed, title } = props;
  const classes = useStyles();
  const [update, setUpdate] = useSpreadState({
    clearSystemProcessing: false,
    clearUserLocked: false,
    clearLive: false,
    clearStaged: false,
    live: false,
    staged: false
  });

  useUnmount(onClosed);

  const onConfirm = (update) => {
    props.onConfirm({
      ...(update.clearSystemProcessing && { clearSystemProcessing: update.clearSystemProcessing }),
      ...(update.clearUserLocked && { clearUserLocked: update.clearUserLocked }),
      ...((update.clearLive || update.live) && { live: update.live }),
      ...((update.clearStaged || update.staged) && { staged: update.staged })
    });
  };

  return (
    <>
      <DialogHeader title={title} onCloseButtonClick={onClose} />
      <DialogBody>
        <FormGroup>
          <FormControlLabel
            className={classes.paddedLeft}
            control={
              <Switch
                checked={update.clearSystemProcessing}
                color="primary"
                onChange={(e) => {
                  setUpdate({ clearSystemProcessing: e.target.checked });
                }}
              />
            }
            label={
              <FormattedMessage
                id="setWorkflowStateDialog.clearSystemProcessing"
                defaultMessage="Clear system processing"
              />
            }
          />
          <FormControlLabel
            className={classes.paddedLeft}
            control={
              <Switch
                checked={update.clearUserLocked}
                color="primary"
                onChange={(e) => {
                  setUpdate({ clearUserLocked: e.target.checked });
                }}
              />
            }
            label={<FormattedMessage id="setWorkflowStateDialog.clearUserLock" defaultMessage="Clear user lock" />}
          />
          <Box display="flex" alignItems="center">
            <Bracket width="12px" height="42px" styles={{ bracket: { marginRight: '10px' } }} />
            <Box display="flex" flexDirection="column">
              <FormControlLabel
                control={
                  <Switch
                    checked={update.live}
                    color="primary"
                    onChange={(e) => {
                      setUpdate({ live: e.target.checked, clearLive: e.target.checked ? false : update.clearLive });
                    }}
                  />
                }
                label={
                  <FormattedMessage
                    id="setWorkflowStateDialog.setAsPublishedLive"
                    defaultMessage="Set as published live"
                  />
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={update.clearLive}
                    color="primary"
                    onChange={(e) => {
                      setUpdate({ clearLive: e.target.checked, live: e.target.checked ? false : update.live });
                    }}
                  />
                }
                label={
                  <FormattedMessage
                    id="setWorkflowStateDialog.clearAsPublishedLive"
                    defaultMessage="Clear as published live"
                  />
                }
              />
            </Box>
          </Box>
          <Box display="flex" alignItems="center">
            <Bracket width="12px" height="42px" styles={{ bracket: { marginRight: '10px' } }} />
            <Box display="flex" flexDirection="column">
              <FormControlLabel
                control={
                  <Switch
                    checked={update.staged}
                    color="primary"
                    onChange={(e) => {
                      setUpdate({
                        staged: e.target.checked,
                        clearStaged: e.target.checked ? false : update.clearStaged
                      });
                    }}
                  />
                }
                label={
                  <FormattedMessage
                    id="setWorkflowStateDialog.setAsPublishedToStaging"
                    defaultMessage="Set as published to staging"
                  />
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={update.clearStaged}
                    color="primary"
                    onChange={(e) => {
                      setUpdate({ clearStaged: e.target.checked, staged: e.target.checked ? false : update.staged });
                    }}
                  />
                }
                label={
                  <FormattedMessage
                    id="setWorkflowStateDialog.clearAsPublishedToStaging"
                    defaultMessage="Clear as published from staging"
                  />
                }
              />
            </Box>
          </Box>
        </FormGroup>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={() => onClose()}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton disabled={!Object.values(update).some(Boolean)} onClick={() => onConfirm(update)}>
          <FormattedMessage id="words.confirm" defaultMessage="Confirm" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

interface BracketProps {
  width?: string;
  height?: string;
  color?: string;
  borderWidth?: string;
  styles?: Partial<Record<'bracket', CSSProperties>>;
}

const useBracketStyles = makeStyles((theme) =>
  createStyles({
    bracket: (props: BracketProps) => ({
      width: `${props.width}`,
      height: `${props.height}`,
      borderTopLeftRadius: '2px',
      borderBottomLeftRadius: '2px',
      borderLeft: `${props.borderWidth} solid ${props.color}`,
      borderTop: `${props.borderWidth} solid ${props.color}`,
      borderBottom: `${props.borderWidth} solid ${props.color}`,
      ...props.styles.bracket
    })
  })
);

function Bracket(props: BracketProps) {
  const { width = '20px', height = '40px', color = '#E0E0E0', borderWidth = '3px', styles } = props;
  const classes = useBracketStyles({ width, height, color, borderWidth, styles });
  return <div className={classes.bracket} />;
}
