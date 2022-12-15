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

import React, { useEffect } from 'react';
import { isBlank } from '../../utils/string';
import palette from '../../styles/palette';
import { makeStyles } from 'tss-react/mui';
import { CSSObject as CSSProperties } from 'tss-react';
import zxcvbn from 'zxcvbn';

type PasswordRequirementsDisplayClassKey =
  | 'listOfConditions'
  | 'conditionItem'
  | 'conditionItemIcon'
  | 'conditionItemNotMet'
  | 'conditionItemMet';

type PasswordRequirementsDisplayStyles = Partial<Record<PasswordRequirementsDisplayClassKey, CSSProperties>>;

export interface PasswordRequirementsDisplayProps {
  value: string;
  formatMessage: Function;
  onValidStateChanged: (isValid: boolean) => void;
  passwordRequirementsMinComplexity: number;
  classes?: Partial<Record<PasswordRequirementsDisplayClassKey, string>>;
  styles?: PasswordRequirementsDisplayStyles;
}

const useStyles = makeStyles<PasswordRequirementsDisplayStyles, PasswordRequirementsDisplayClassKey>()(
  (
    theme,
    {
      listOfConditions,
      conditionItem,
      conditionItemIcon,
      conditionItemNotMet,
      conditionItemMet
    } = {} as PasswordRequirementsDisplayStyles
  ) => ({
    listOfConditions: {
      listStyle: 'none',
      padding: 0,
      margin: '16px 0 16px 0',
      ...listOfConditions
    },
    conditionItem: {
      display: 'flex',
      alignItems: 'center',
      ...conditionItem
    },
    conditionItemIcon: {
      marginRight: theme.spacing(1),
      ...conditionItemIcon
    },
    conditionItemNotMet: {
      color: palette.yellow.shade,
      ...conditionItemNotMet
    },
    conditionItemMet: {
      color: palette.green.shade,
      ...conditionItemMet
    }
  })
);

export function PasswordRequirementsDisplay(props: PasswordRequirementsDisplayProps) {
  const { classes } = useStyles(props.styles);
  const { passwordRequirementsMinComplexity, value, onValidStateChanged } = props;
  // const { regEx, conditions } = useMemo(
  //   () => getPrimeMatter({ passwordRequirementsRegex, formatMessage }),
  //   [passwordRequirementsRegex, formatMessage]
  // );
  useEffect(() => {
    const pw = zxcvbn(value);
    onValidStateChanged(isBlank(value) ? null : pw.score >= passwordRequirementsMinComplexity);
  }, [onValidStateChanged, value, passwordRequirementsMinComplexity]);
  return <ul className={classes.listOfConditions}></ul>;
}

export default PasswordRequirementsDisplay;
