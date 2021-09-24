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

import createStyles from '@mui/styles/createStyles';

import makeStyles from '@mui/styles/makeStyles';
import { useIntl } from 'react-intl';
import Checkbox from '@mui/material/Checkbox';
import React from 'react';
import { getPossibleTranslation } from '../../utils/i18n';
import clsx from 'clsx';
import Button from '@mui/material/Button';
import TranslationOrText from '../../models/TranslationOrText';
import Skeleton from '@mui/material/Skeleton';
import { rand } from '../PathNavigator/utils';

const styles = makeStyles((theme) =>
  createStyles({
    root: {
      background: theme.palette.background.paper
    },
    itemHeader: {
      display: 'flex',
      background: theme.palette.action.selected
    },
    checkbox: {
      color: theme.palette.primary.main,
      width: '48px'
    }
  })
);

export interface Action {
  id: string;
  label: TranslationOrText;
}

interface ActionsBarProps {
  options: Action[];
  numOfSkeletonItems?: number;
  isLoading?: boolean;
  isIndeterminate: boolean;
  isChecked: boolean;
  classes?: Partial<Record<'root' | 'header' | 'checkbox', string>>;
  onOptionClicked(option: string): void;
  toggleSelectAll(): void;
}

export default function ActionsBar(props: ActionsBarProps) {
  const classes = styles({});
  const { formatMessage } = useIntl();
  const {
    options,
    onOptionClicked,
    isIndeterminate,
    toggleSelectAll,
    isChecked,
    isLoading = false,
    numOfSkeletonItems = 5
  } = props;

  return (
    <section className={clsx(classes.root, props.classes?.root)}>
      <header className={clsx(classes.itemHeader, props.classes?.header)}>
        <Checkbox
          color="primary"
          indeterminate={isIndeterminate}
          checked={isChecked}
          className={clsx(classes.checkbox, props.classes?.checkbox)}
          onChange={toggleSelectAll}
        />
        {isLoading
          ? new Array(numOfSkeletonItems).fill(null).map((_, index) => (
              <Button color="primary" key={index}>
                <Skeleton animation="pulse" height="12px" width={`${rand(40, 60)}px`} />
              </Button>
            ))
          : options.map((option: Action) => (
              <Button color="primary" variant="text" key={option.id} onClick={() => onOptionClicked(option.id)}>
                {getPossibleTranslation(option.label, formatMessage)}
              </Button>
            ))}
      </header>
    </section>
  );
}
