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
import { Button } from '@mui/material';
import CrafterCMSIcon from '../../icons/CrafterCMSIcon';
import MenuRounded from '@mui/icons-material/MenuRounded';
import { ButtonProps } from '@mui/material/Button';
import { PartialSxRecord } from '../../models';

export type LogoAndMenuBundleButtonProps = ButtonProps & {
	classes?: ButtonProps['classes'] & Partial<Record<'crafterIcon' | 'menuIcon', string>>;
	sxs?: PartialSxRecord<'button' | 'crafterIcon' | 'menuIcon'>;
	showCrafterIcon?: boolean;
	showMenuIcon?: boolean;
};

const LogoAndMenuBundleButton = React.forwardRef<HTMLButtonElement, LogoAndMenuBundleButtonProps>(
	function (props, ref) {
		const { showCrafterIcon = true, showMenuIcon = true, sxs, ...buttonProps } = props;
		return (
			<Button ref={ref} {...buttonProps}>
				{showCrafterIcon && (
					<CrafterCMSIcon
						className={props.classes?.crafterIcon}
						sx={{ mr: 0.5, fontSize: '33px !important', ...sxs?.crafterIcon }}
					/>
				)}
				{showMenuIcon && <MenuRounded className={props.classes?.menuIcon} sx={sxs?.menuIcon} />}
			</Button>
		);
	}
);

export default LogoAndMenuBundleButton;
