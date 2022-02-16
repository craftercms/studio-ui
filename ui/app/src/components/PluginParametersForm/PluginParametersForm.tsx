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

import { FullSxRecord, MarketplacePlugin, PartialSxRecord } from '../../models';
import Fab from '@mui/material/Fab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import React from 'react';
import Box from '@mui/material/Box';
import PluginFormEngine from '../PluginFormBuilder';
import { FormattedMessage } from 'react-intl';
import LookupTable from '../../models/LookupTable';

export type PluginParametersFormClassKey = 'root' | 'header' | 'backButton';

export type PluginParametersFormFullSx = FullSxRecord<PluginParametersFormClassKey>;

export type PluginParametersFormPartialSx = PartialSxRecord<PluginParametersFormClassKey>;

function getSx(sx?: PluginParametersFormPartialSx): PluginParametersFormFullSx {
  return {
    root: {
      height: '100%',
      overflow: 'auto',
      ...sx?.root
    },
    header: {
      display: 'flex',
      padding: '20px',
      alignItems: 'center',
      ...sx?.header
    },
    backButton: {
      color: '#4F4F4F',
      backgroundColor: '#FFFFFF',
      marginRight: '30px',
      '&:hover': {
        backgroundColor: '#FFFFFF'
      },
      ...sx?.backButton
    }
  };
}

export interface PluginParametersFormProps {
  plugin: MarketplacePlugin;
  fields: LookupTable<string>;
  submitted: boolean;
  onPluginFieldChange(key: string, value: string): void;
  onCancel(): void;
}

export function PluginParametersForm(props: PluginParametersFormProps) {
  const { plugin, fields, submitted, onCancel, onPluginFieldChange } = props;
  const sx = getSx();

  const handleInputChange = (e, type) => {
    e.persist();
    onPluginFieldChange(e.target.name, e.target.value);
  };

  return (
    <Box sx={sx.root}>
      <Box sx={sx.header}>
        <Fab aria-label="back" sx={sx.backButton} onClick={onCancel}>
          <ArrowBackIcon />
        </Fab>
        <Typography variant="h5" component="h1">
          {plugin.name} <FormattedMessage id="word.configuration" defaultMessage="Configuration" />
        </Typography>
      </Box>
      <PluginFormEngine
        fields={fields}
        submitted={submitted}
        handleInputChange={handleInputChange}
        parameters={plugin.parameters}
      />
    </Box>
  );
}

export default PluginParametersForm;
