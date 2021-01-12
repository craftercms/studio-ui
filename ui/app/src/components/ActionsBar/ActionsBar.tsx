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

import { createStyles, makeStyles } from '@material-ui/core/styles';
import palette from '../../styles/palette';
import { MessageDescriptor, useIntl } from 'react-intl';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import React from 'react';
import { getPossibleTranslation } from '../../utils/i18n';
import clsx from 'clsx';

const styles = makeStyles((theme) =>
  createStyles({
    itemHeader: {
      display: 'flex',
      alignItems: 'center',
      background: '#e8f1ff'
    },
    optionTypography: {
      color: palette.blue.main,
      marginRight: '25px'
    },
    checkbox: {
      color: theme.palette.primary.main,
      width: '48px'
    }
  })
);

export interface Action {
  id: string;
  label: MessageDescriptor | string;
}

interface ActionsBarProps {
  options: Action[];
  isIndeterminate: boolean;
  isChecked: boolean;
  classes?: Partial<Record<'root', string>>;
  onOptionClicked(option: Action): void;
  toggleSelectAll(): void;
}

export default function ActionsBar(props: ActionsBarProps) {
  const classes = styles({});
  const { formatMessage } = useIntl();
  const { options, onOptionClicked, isIndeterminate, toggleSelectAll, isChecked } = props;

  return (
    <header className={clsx(classes.itemHeader, props.classes?.root)}>
      <Checkbox
        color="primary"
        indeterminate={isIndeterminate}
        checked={isChecked}
        className={classes.checkbox}
        onChange={toggleSelectAll}
      />
      {options.map((option: Action) => (
        <Link
          key={option.id}
          color="inherit"
          component="button"
          variant="subtitle2"
          TypographyClasses={{ root: classes.optionTypography }}
          onClick={() => onOptionClicked(option)}
        >
          {getPossibleTranslation(option.label, formatMessage)}
        </Link>
      ))}
    </header>
  );
}
