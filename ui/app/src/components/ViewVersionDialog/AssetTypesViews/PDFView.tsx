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

import React from 'react';
import useSelection from '../../../hooks/useSelection';
import { isBlobUrl } from '../../../utils/content';
import { IFrame } from '../../IFrame';

export interface PDFViewProps {
	content: string;
}
export function PDFView(props: PDFViewProps) {
	const { content } = props;
	const guestBase = useSelection<string>((state) => state.env.guestBase);

	if (!content) {
		return <div>No content available</div>;
	}

	return <IFrame url={isBlobUrl(content) ? content : `${guestBase}${content}`} title="" width="100%" height="100%" />;
}
