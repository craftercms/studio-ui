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

import { useUnmount } from '../../utils/hooks';
import DialogHeader from '../Dialogs/DialogHeader';
import { FormattedMessage } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import React from 'react';
import { SetWorkflowStateDialogProps } from './SetWorkflowStateDialog';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { useStyles } from './styles';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { CSSProperties } from '@material-ui/styles';

export function SetWorkflowStateDialogContainer(props: SetWorkflowStateDialogProps) {
  const { onClose, onClosed, title } = props;
  const classes = useStyles();

  useUnmount(onClosed);

  return (
    <>
      <DialogHeader title={title} onDismiss={onClose} />
      <DialogBody>
        <FormGroup>
          <FormControlLabel
            className={classes.paddedLeft}
            control={<Switch color="primary" onChange={() => {}} name="checkedA" />}
            label={
              <FormattedMessage
                id="setWorkflowStateDialog.clearSystemProcessing"
                defaultMessage="Clear system processing"
              />
            }
          />
          <FormControlLabel
            className={classes.paddedLeft}
            control={<Switch color="primary" onChange={() => {}} name="checkedA" />}
            label={<FormattedMessage id="setWorkflowStateDialog.clearUserLock" defaultMessage="Clear user lock" />}
          />
          <Box display="flex" alignItems="center">
            <Bracket width="12px" height="42px" styles={{ bracket: { marginRight: '10px' } }} />
            <Box display="flex" flexDirection="column">
              <FormControlLabel
                control={<Switch color="primary" onChange={() => {}} name="checkedA" />}
                label={
                  <FormattedMessage
                    id="setWorkflowStateDialog.setAsPublishedLive"
                    defaultMessage="Set as published live"
                  />
                }
              />
              <FormControlLabel
                control={<Switch color="primary" onChange={() => {}} name="checkedA" />}
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
                control={<Switch color="primary" onChange={() => {}} name="checkedA" />}
                label={
                  <FormattedMessage
                    id="setWorkflowStateDialog.setAsPublishedToStaging"
                    defaultMessage="Set as published to staging"
                  />
                }
              />
              <FormControlLabel
                control={<Switch color="primary" onChange={() => {}} name="checkedA" />}
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
        <SecondaryButton>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton>
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
