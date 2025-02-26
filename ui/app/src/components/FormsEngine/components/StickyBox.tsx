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

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

export const StickyBox = styled(Box)(({ theme }) => ({
	top: theme.spacing(1),
	height: `var(--container-height)`,
	position: 'sticky',
	overflowY: 'auto'
}));

function Sticky(props: PropsWithChildren) {
	const ref = useRef<HTMLDivElement>(null);
	const [classes, setClasses] = useState('');
	useEffect(() => {
		// Create an IntersectionObserver instance
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setClasses('sticky');
					} else {
						setClasses('');
					}
				});
			},
			{
				root: null, // Use the viewport as the root
				rootMargin: '0px',
				threshold: 1.0
			}
		);
		// Target the element you want to observe
		if (ref.current) {
			observer.observe(ref.current);
		}
		return () => {
			observer.disconnect();
		};
	}, []);
	return <StickyBox ref={ref} className={classes} children={props.children} />;
}

export default Sticky;
