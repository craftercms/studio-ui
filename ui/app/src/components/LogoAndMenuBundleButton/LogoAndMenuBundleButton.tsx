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

import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Button } from '@material-ui/core';
import CrafterIcon from '../Icons/CrafterIcon';
import MenuRounded from '@material-ui/icons/MenuRounded';
import { ButtonProps } from '@material-ui/core/Button';
import clsx from 'clsx';

const useStyles = makeStyles(() =>
  createStyles({
    button: {
      padding: '7px'
    },
    crafterIcon: {
      fontSize: '33px'
    }
  })
);

export type LogoAndMenuBundleButtonProps = ButtonProps & {
  classes?: ButtonProps['classes'] & Partial<Record<'crafterIcon' | 'menuIcon', string>>;
};

const LogoAndMenuBundleButton = React.forwardRef<HTMLButtonElement, LogoAndMenuBundleButtonProps>(function(props, ref) {
  const classes = useStyles();
  return (
    <Button ref={ref} {...props}>
      <CrafterIcon className={clsx(classes.crafterIcon, props.classes?.crafterIcon)} />{' '}
      <MenuRounded className={props.classes?.menuIcon} />
    </Button>
  );
});

export default LogoAndMenuBundleButton;
