/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React, { ReactNode } from 'react';
import clsx from 'clsx';
import Paper from '@mui/material/Paper';
import { LinearProgress } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import { RedColor } from '../../styles/theme';
import { capitalize } from '../../utils/string';

export interface MobileStepperProps {
  activeStep?: number;
  backButton?: ReactNode;
  onDotClick?: Function;
  classes?: any;
  className?: string;
  LinearProgressProps?: any;
  nextButton?: ReactNode;
  position?: 'bottom' | 'top' | 'static';
  steps: number;
  variant: 'text' | 'dots' | 'progress';
}

export const UnstyledMobileStepper = React.forwardRef<HTMLDivElement, MobileStepperProps>(
  function MobileStepper(props, ref) {
    const {
      activeStep = 0,
      backButton,
      onDotClick,
      classes = {},
      className,
      LinearProgressProps,
      nextButton,
      position = 'bottom',
      steps,
      variant = 'dots',
      ...other
    } = props;

    return (
      <Paper
        square
        elevation={0}
        className={clsx(classes.root, classes[`position${capitalize(position)}`], className)}
        onClick={(e) => e.stopPropagation()}
        ref={ref}
        {...other}
      >
        {backButton}
        {variant === 'text' && (
          <React.Fragment>
            {activeStep + 1} / {steps}
          </React.Fragment>
        )}
        {variant === 'dots' && (
          <div className={classes.dots}>
            {[...new Array(steps)].map((_, index) => (
              <div
                key={index}
                onClick={onDotClick ? (e) => onDotClick(e, index) : null}
                className={clsx(classes.dot, {
                  [classes.dotActive]: index === activeStep
                })}
              />
            ))}
          </div>
        )}
        {variant === 'progress' && (
          <LinearProgress
            className={classes.progress}
            variant="determinate"
            value={Math.ceil((activeStep / (steps - 1)) * 100)}
            {...LinearProgressProps}
          />
        )}
        {nextButton}
      </Paper>
    );
  }
);

export const MobileStepper = withStyles(
  UnstyledMobileStepper,
  (theme) => ({
    /* Styles applied to the root element. */
    root: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: theme.palette.background.default,
      padding: 8,
      width: '100%'
    },
    /* Styles applied to the root element if `position="bottom"`. */
    positionBottom: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: theme.zIndex.mobileStepper
    },
    /* Styles applied to the root element if `position="top"`. */
    positionTop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: theme.zIndex.mobileStepper
    },
    /* Styles applied to the root element if `position="static"`. */
    positionStatic: {},
    /* Styles applied to the dots container if `variant="dots"`. */
    dots: {
      display: 'flex',
      flexDirection: 'row',
      margin: 'auto'
    },
    /* Styles applied to each dot if `variant="dots"`. */
    dot: {
      backgroundColor: theme.palette.action.disabled,
      borderRadius: '50%',
      width: 8,
      height: 8,
      margin: '0 2px'
    },
    /* Styles applied to a dot if `variant="dots"` and this is the active step. */
    dotActive: {
      backgroundColor: RedColor
    },
    /* Styles applied to the Linear Progress component if `variant="progress"`. */
    progress: {
      width: '50%'
    }
  }),
  { name: 'MuiMobileStepper' }
);

export default MobileStepper;
