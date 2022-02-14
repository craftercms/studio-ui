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

import React, { forwardRef } from 'react';
import Field, { FieldProps } from './Field';

export type ModelProps<P = {}> = Omit<FieldProps<P>, 'fieldId'>;

export const Model = forwardRef<any, ModelProps>((props, ref) => {
  return <Field {...(props as FieldProps)} ref={ref} fieldId="__CRAFTERCMS_FAKE_FIELD__" />;
});

Model.propTypes = (({ fieldId, ...propTypes }) => propTypes)(Field.propTypes);

export default Model;
