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
	customControlMap?: Record<string, ElementType>;
}

export const ControlWrapper = memo(function (props: ControlWrapperProps) {
	const siteId = useActiveSiteId();
	const { field, autoFocus, readonly, contentType, atom, customControlMap } = props;
	const [value, setValue] = useAtom(atom);
	const fieldId = field.id;
	let Control: ElementType<ControlProps>;
	if (field.properties?.plugin) {
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
		Control = controlMap[field.type] ?? customControlMap?.[field.type] ?? UnknownControl;
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
	contentType: ContentType,
	customControlsMap?: ControlWrapperProps['customControlMap']
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
			customControlMap={customControlsMap}
		/>
	);
}

/**
 * Checks if the populate time expression is valid.
 *
 * @param expr {string} The populate time expression to validate.
 * @returns true if the expression is valid, false otherwise.
 */
export function validateTimePopulateExpression(expr: string): boolean {
	const trimmed = (expr ?? '').replace(/ /g, '').toLowerCase();
	if (trimmed === 'now') return true;
	return /^(now)?[+-]\d+(hours|minutes)$/i.test(trimmed);
}

/**
 * Checks if the populate date expression is valid.
 *
 * @param expr {string} The populate date expression to validate.
 * @returns true if the expression is valid, false otherwise.
 */
export function validateDatePopulateExpression(expr: string): boolean {
	const normalized = expr.replace(/ /g, '');
	return /^(now|((now)?[+-]\d+(days|weeks|years|hours|minutes)))$/i.test(normalized);
}

/**
 * Takes an expression like "now", "now+5days", "now-3weeks", "now+2years", "now-4hours", "now+30minutes"
 * and returns a Date object representing the calculated date. If the expression is invalid, it returns the
 * current date.
 *
 * @param params {Object} - The parameters for processing the date expression.
 * @param params.expression {string}  - The date expression to process ('now[+ or -][number][days or weeks or years or hours or minutes]'
 * 																			e.g. 'now', 'now+5hours', 'now-30minutes', 'now+10days', 'now-2weeks', 'now+1years').
 * @param params.validatePopulateExpression {Function} - A function to validate the expression. If the expression is invalid, the current date is returned.
 * @param [params.allowPastDate=false] {boolean} - If `false`, ensures the resulting date is not in the past.
 *
 * @returns {Date} The calculated date based on the expression.
 */

export function processPopulateExpression({
	expression,
	validatePopulateExpression,
	allowPastDate = false
}: {
	expression: string;
	validatePopulateExpression(expr: string): boolean;
	allowPastDate?: boolean;
}): Date {
	const date = new Date();
	const daysInWeek = 7;
	let modifier = 1;

	const populateDateExp = expression.replace(/ /g, '');
	const normalized = populateDateExp.toLowerCase();

	if (validatePopulateExpression(expression)) {
		if (normalized === 'now') {
			if (!allowPastDate) date.setSeconds(59, 0);
		} else {
			const action = normalized.match(/[+-]/)![0];
			const expValue = parseInt(normalized.match(/\d+/)![0], 10);
			const type = normalized.match(/(days|weeks|years|hours|minutes)/)![0];
			if (action === '-') {
				modifier = modifier * -1;
			}
			if (type === 'years') {
				date.setFullYear(date.getFullYear() + modifier * expValue);
			} else if (type === 'weeks') {
				date.setDate(date.getDate() + modifier * expValue * daysInWeek);
			} else if (type === 'days') {
				date.setDate(date.getDate() + modifier * expValue);
			} else if (type === 'hours') {
				date.setTime(date.getTime() + modifier * (expValue * 3600000));
			} else if (type === 'minutes') {
				date.setTime(date.getTime() + modifier * expValue * 60000);
			}
		}
	} else {
		if (!allowPastDate) date.setSeconds(59, 0);
	}
	return date;
}
