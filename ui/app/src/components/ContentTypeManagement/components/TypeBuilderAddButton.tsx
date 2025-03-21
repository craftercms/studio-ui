/*
 * Copyright (C) 2007-2025 Crafter Software Corporation. All Rights Reserved.
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

import Button from '@mui/material/Button';

// TODO: Still unsure design-wise if we need a custom button for this. If not, replace this with the plain button and remove this file.
// const TypeBuilderAddButton = styled(Button)(({ theme }) => ({
// 	borderStyle: 'dashed',
// 	borderWidth: 1,
// 	borderColor: theme.palette.primary.main
// 	// minWidth: 200,
// 	// margin: 'auto',
// 	// display: 'block'
// 	// width: '100%'
// }));

export const TypeBuilderAddButton = Button;

export default TypeBuilderAddButton;
