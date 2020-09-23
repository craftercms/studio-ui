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
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import { CommentCountUI } from './CommentCount';
import { useSelector } from 'react-redux';
import GlobalState from '../models/GlobalState';
import { nullOrUndefined } from '../utils/object';

interface TextFieldWithMaxProps {
  maxLength?: number;
}

export function TextFieldWithMax(props: TextFieldProps & TextFieldWithMaxProps) {

  // This value will be used by default, if a custom value is needed,
  // maxLength property from inputProps needs to be set as a prop
  const configMaxLength = useSelector<GlobalState, number>((state) =>
    state.configuration.publishing.submission.commentMaxLength
  );
  const maxLength = props.maxLength
    ? props.maxLength
    : configMaxLength;

  const value = !nullOrUndefined(props.value) ? props.value as string : props.defaultValue as string;

  return (
    <>
      <TextField
        {...props}
        inputProps={{ ...props.inputProps, maxLength }}
      />
      <CommentCountUI
        commentLength={value.length}
        commentMaxLength={maxLength}
      />
    </>
  );
}

export default TextFieldWithMax;
