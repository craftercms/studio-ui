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

import React, { useMemo, useState } from 'react';
import { GlobalAppContextProvider, useGlobalAppState } from '../../GlobalApp';
import useReference from '../../../hooks/useReference';
import { useActiveSiteId } from '../../../hooks/useActiveSiteId';
import SiteTools, { Tool } from '../SiteTools';
import { onSubmittingAndOrPendingChangeProps } from '../../../hooks/useEnhancedDialogState';
import { useDispatch, useSelector } from 'react-redux';
import { SiteToolsContext, SiteToolsContextProps } from '../siteToolsContext';
import GlobalState from '../../../models/GlobalState';
import type { WidgetDialogStateProps } from '../../WidgetDialog/utils';
import { updateDialogState } from '../../../state/actions/dialogStack';

interface EmbeddedSiteToolsProps {
	onMinimize?: () => void;
	onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
}

export const EmbeddedSiteToolsContainer = (props: EmbeddedSiteToolsProps) => {
	const [width, setWidth] = useState(240);
	const [activeToolId, setActiveToolId] = useState<string>();
	const [{ openSidebar }] = useGlobalAppState();
	const siteTools = useReference('craftercms.siteTools');
	const tools: Tool[] = siteTools?.tools;
	const site = useActiveSiteId();
	const dispatch = useDispatch();
	const contextValue = useMemo<SiteToolsContextProps>(
		() => ({ setTool: (id) => setActiveToolId(id.replace(/^\//, '')), activeToolId }),
		[activeToolId]
	);
	// Embedded Site Tools may not be rendered in a dialog, if so, we need to get it for the updates to the dialog state.
	const dialogStackState = useSelector<GlobalState, GlobalState['dialogStack']>((state) => state.dialogStack);
	const dialogId = useMemo(() => {
		return Object.values(dialogStackState?.byId).find(
			(dialog) => (dialog.props as WidgetDialogStateProps).widget?.id === 'craftercms.components.EmbeddedSiteTools'
		)?.id;
	}, [dialogStackState]);

	const onNavItemClick = (id: string) => {
		setActiveToolId(id);
	};

	const onSubmittingAndOrPendingChange =
		props.onSubmittingAndOrPendingChange ??
		((value: onSubmittingAndOrPendingChangeProps) => {
			dialogId && dispatch(updateDialogState({ id: dialogId, props: value }));
		});

	return (
		<SiteToolsContext.Provider value={contextValue}>
			<SiteTools
				site={site}
				sidebarWidth={width}
				onWidthChange={setWidth}
				onNavItemClick={onNavItemClick}
				sidebarBelowToolbar
				hideSidebarLogo
				showAppsButton={false}
				hideSidebarSiteSwitcher
				activeToolId={activeToolId}
				openSidebar={openSidebar || !activeToolId}
				tools={tools}
				sx={{ height: '100%' }}
				onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange}
				onMinimize={() => {
					if (props.onMinimize) {
						props.onMinimize();
					} else {
						dialogId && dispatch(updateDialogState({ id: dialogId, props: { isMinimized: true } }));
					}
				}}
				mountMode="dialog"
			/>
		</SiteToolsContext.Provider>
	);
};

export function EmbeddedSiteTools(props: EmbeddedSiteToolsProps) {
	return (
		<GlobalAppContextProvider>
			<EmbeddedSiteToolsContainer {...props} />
		</GlobalAppContextProvider>
	);
}

export default EmbeddedSiteTools;
