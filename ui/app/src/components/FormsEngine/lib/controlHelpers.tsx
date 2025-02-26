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

import { ControlProps } from '../types';
import Alert from '@mui/material/Alert';
import { FormattedMessage } from 'react-intl';
import React, { ComponentType, ElementType, lazy, LazyExoticComponent, memo, Suspense } from 'react';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import { Atom, useAtom } from 'jotai/index';
import { buildFileUrl } from '../../../services/plugin';
import { controlMap } from './controlMap';
import { UnknownControl } from '../components/UnknownControl';
import ErrorBoundary from '../../ErrorBoundary';
import { ControlSkeleton } from '../components/ControlSkeleton';
import { ContentTypeField } from '../../../models';
import ContentType from '../../../models/ContentType';
import FormsEngineField from '../components/FormsEngineField';
import { FormsEngineAtoms } from './formsEngineContext';

// Note: These persist past the closing of the form.
const lazyControlMap = new Map<string, LazyExoticComponent<ComponentType>>();

function addLazyControl(url: string): void {
	lazyControlMap.set(
		url,
		lazy(() =>
			import(/* @vite-ignore */ url)
				.then((m) => {
					if (m.default) return m;
					else return { default: ControlPluginNoDefaultExportError };
				})
				.catch((reason) => {
					console.error(
						// TODO: Docs or internal URL
						`An error occurred loading the control. The form attempted to load the control from \`${url}\`. Forms Engine v1 controls are not compatible with this version. If you haven't migrated this control, please check the migration guide at https://docs.craftercms.org/.\n\n`,
						reason
					);
					return { default: ControlPluginError };
				})
		)
	);
}

export interface ControlWrapperProps {
	field: ContentTypeField;
	autoFocus: boolean;
	readonly: boolean;
	contentType: ContentType;
	atom: Atom<unknown>;
}

export const ControlWrapper = memo(function (props: ControlWrapperProps) {
	const siteId = useActiveSiteId();
	const { field, autoFocus, readonly, contentType, atom } = props;
	const [value, setValue] = useAtom(atom);
	const fieldId = field.id;
	let Control: ElementType<ControlProps>;
	if (field.properties.plugin) {
		const url = buildFileUrl(
			siteId,
			field.properties.plugin.type,
			field.properties.plugin.name,
			field.properties.plugin.filename,
			field.properties.plugin.pluginId
		);
		if (!lazyControlMap.has(url)) addLazyControl(url);
		Control = lazyControlMap.get(url);
	} else {
		Control = controlMap[field.type] ?? UnknownControl;
	}
	return (
		<ErrorBoundary key={fieldId}>
			<Suspense fallback={<ControlSkeleton label={field.name} />}>
				<Control
					// Only auto-focus on controls that are not readonly.
					// Focus might not work consistently on disabled controls anyway.
					autoFocus={autoFocus && !readonly}
					value={value}
					setValue={setValue}
					field={field}
					contentType={contentType}
					readonly={readonly}
				/>
			</Suspense>
		</ErrorBoundary>
	);
});

function ControlPluginError({ field }: ControlProps) {
	return (
		<FormsEngineField field={field} menu={false}>
			<Alert
				severity="error"
				variant="standard"
				sx={(theme) => ({ border: 'none', strong: { fontWeight: theme.typography.fontWeightMedium } })}
			>
				<FormattedMessage
					defaultMessage="Unable to load the {name} ({id}) control. The control may be absent or contain errors in the code. Check the browser console for error details."
					values={{
						name: field.name,
						id: field.id
					}}
				/>
			</Alert>
		</FormsEngineField>
	);
}

function ControlPluginNoDefaultExportError({ field }: ControlProps) {
	return (
		<FormsEngineField field={field} menu={false}>
			<Alert
				severity="error"
				variant="standard"
				sx={(theme) => ({ border: 'none', strong: { fontWeight: theme.typography.fontWeightMedium } })}
			>
				<FormattedMessage
					defaultMessage="Unable to render {name} ({id}) control. No default export found. A control's JavaScript file should export a React component as `default`. Please check <docs>the documentation</docs>."
					values={{
						name: field.name,
						id: field.id,
						// TODO: Docs or internal link
						docs: (str) => (
							<a href="https://docs.craftercms.org" target="_blank">
								{str}
							</a>
						)
					}}
				/>
			</Alert>
		</FormsEngineField>
	);
}

export function renderFieldControl(
	field: ContentTypeField,
	atoms: FormsEngineAtoms['valueByFieldId'],
	autoFocus: boolean,
	readonly: boolean,
	contentType: ContentType
) {
	const fieldId = field.id;
	return (
		<ControlWrapper
			key={fieldId}
			field={field}
			atom={atoms[fieldId]}
			readonly={readonly}
			autoFocus={autoFocus}
			contentType={contentType}
		/>
	);
}
