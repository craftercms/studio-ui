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

import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useSelector } from 'react-redux';
import GlobalState from '../../models/GlobalState';
import CharCountStatus from '../CharCountStatus/CharCountStatus';

export type TextFieldWithMaxProps = TextFieldProps & {
  maxLength?: number;
};

function TextFieldWithMax(props: TextFieldWithMaxProps) {
  // This value will be used by default, if a custom value is needed,
  // maxLength prop needs to be supplied.
  const configMaxLength = useSelector<GlobalState, number>(
    (state) => state.uiConfig.publishing.submissionCommentMaxLength
  );
  const maxLength = props.maxLength ? props.maxLength : configMaxLength;
  const value = props.value ?? props.defaultValue ?? '';
  return (
    <>
      <TextField {...props} slotProps={{ ...props.slotProps, htmlInput: { maxLength } }} />
      <CharCountStatus commentLength={(value as string).length} commentMaxLength={maxLength} />
    </>
  );
}

export default TextFieldWithMax;
