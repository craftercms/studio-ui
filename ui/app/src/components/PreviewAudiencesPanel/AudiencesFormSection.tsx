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

import React, { PropsWithChildren } from 'react';
import { ContentTypeField } from '../../models/ContentType';
import Grid from '@mui/material/Grid2';
import FormHelperText from '@mui/material/FormHelperText';
import Divider from '@mui/material/Divider';

type AudiencesFormSectionProps = PropsWithChildren<{
  field: ContentTypeField;
  showDivider?: boolean;
}>;

export function AudiencesFormSection(props: AudiencesFormSectionProps) {
  const { field, showDivider, children } = props;
  return (
    <>
      <Grid size={12}>
        {children}
        <FormHelperText>{field.helpText}</FormHelperText>
      </Grid>
      {showDivider && <Divider style={{ margin: '15px 0' }} />}
    </>
  );
}
