/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

// Since this typography runs guest-side, there may be all sorts of styles that affect Typography styles.
// The idea of this component is to be as specific as possible to avoid guest site styles to break ours.

import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

export const UltraStyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: 14
}));

export default UltraStyledTypography;
