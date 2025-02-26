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

import { toColor } from '../../../utils/string';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import Accordion from '@mui/material/Accordion';
import React, { ReactNode, useContext } from 'react';
import { ContentTypeSection } from '../../../models';
import { useTheme } from '@mui/material/styles';
import { StableFormContext } from '../lib/formsEngineContext';
import { useAtom } from 'jotai';

export interface SectionAccordionProps {
	section: ContentTypeSection;
	renderControl(fieldId: string, fieldIndex: number): ReactNode;
}

export function SectionAccordion({ section, renderControl }: SectionAccordionProps) {
	const theme = useTheme();
	const [isExpanded, setExpanded] = useAtom(
		useContext(StableFormContext).atoms.expandedStateBySectionId[section.title]
	);
	return (
		<Accordion
			expanded={isExpanded}
			onChange={(e, expanded) => setExpanded(expanded)}
			sx={{
				borderLeftColor: toColor(section.title, 0.7),
				borderLeftWidth: 5,
				borderLeftStyle: 'solid',
				borderTopLeftRadius: theme.shape.borderRadius,
				borderBottomLeftRadius: theme.shape.borderRadius,
				borderTopRightRadius: theme.shape.borderRadius,
				borderBottomRightRadius: theme.shape.borderRadius
			}}
		>
			<AccordionSummary data-section-id={section.title}>
				<Typography>{section.title}</Typography>
			</AccordionSummary>
			<AccordionDetails className="space-y-2">{section.fields.map(renderControl)}</AccordionDetails>
		</Accordion>
	);
}

export default SectionAccordion;
