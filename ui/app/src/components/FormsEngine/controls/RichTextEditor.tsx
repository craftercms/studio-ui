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

import React, { useEffect, useRef, useState } from 'react';
import { FormsEngineField } from '../components/FormsEngineField';
import { ControlProps } from '../types';
import useRTEConfig from '../../../hooks/useRTEConfig';
import { initRichTextEditorConfig } from '../../../state/actions/preview';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import useSiteUIConfig from '../../../hooks/useSiteUIConfig';
import { useDispatch } from 'react-redux';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import { Editor } from '@tinymce/tinymce-react';
import { TinyMCE } from 'tinymce';
import { getTinymce } from '@tinymce/tinymce-react/lib/es2015/main/ts/TinyMCE';
import { getPropertyValue, getTinyMceInitOptions, getValidationValue } from '../lib/formUtils';

export interface RichTextEditorProps extends ControlProps {
	value: string;
	defaultInitOptions?: Editor['props']['init'];
}

const tinymceScriptSrc = '/studio/static-assets/libs/tinymce/tinymce.min.js';

declare global {
	interface Window {
		tinymce: TinyMCE;
	}
}

import { SxProps, Theme } from '@mui/material';

const tinymceCustomStyles: SxProps<Theme> = {
	// --- GROUPED BACKGROUND-ONLY STYLES ---
	[`& .tox.tox-tinymce-inline .tox-editor-header,
    & .tox:not(.tox-tinymce-inline) .tox-editor-header,
    & .tox:not(.tox-tinymce-inline).tox-tinymce--toolbar-sticky-on .tox-editor-header,
    & .tox .tox-image-selector-menu .tox-image-selector__row .tox-collection__item-image-selector.tox-collection__item--active:not(.tox-collection__item--state-disabled),
    & .tox .tox-image-selector-menu .tox-image-selector__row .tox-collection__item-image-selector.tox-collection__item--enabled:not(.tox-collection__item--state-disabled),
    & .tox .tox-comment__busy-spinner,
    & .tox .tox-dialog-wrap__backdrop--opaque,
    & .tox .tox-insert-table-picker,
    & .tox .tox-menubar,
    & .tox .tox-promotion,
    & .tox .tox-mbtn[disabled],
    & .tox .tox-notification--warn,
    & .tox .tox-notification--warning,
    & .tox .tox-onboarding-dialog,
    & .tox .tox-pop__dialog,
    & .tox .tox-statusbar,
    & .tox .tox-toolbar-overlord,
    & .tox .tox-toolbar,
    & .tox .tox-toolbar__overflow,
    & .tox .tox-toolbar__primary,
    & .tox.tox-tinymce-aux .tox-toolbar__overflow,
    & .tox .tox-view-wrap,
    & .tox .tox-view-wrap__slot-container,
    & .tox .tox-view,
    & .tox .tox-revisionhistory,
    & .tox .tox-revisionhistory__sidebar .tox-revisionhistory__sidebar-title,
    & .tox .tox-revisionhistory__sidebar .tox-revisionhistory__revisions .tox-revisionhistory__card,
    & .tox .tox-suggestededits__container .tox-suggestededits,
    & .tox .tox-suggestededits__container .tox-suggestededits .tox-suggestededits__sidebar-content .tox-suggestededits__card,
    & .tox .tox-suggestededits__container .tox-suggestededits .tox-suggestededits__sidebar-content .tox-suggestededits__card.tox-suggestededits__card--resolved`]:
		{
			backgroundColor: '#1C1C1E'
		},

	// --- BACKGROUNDS USING VARIABLES ---
	[`& .tox .tox-floating-sidebar,
    & .tox-ai .tox-ai__scroll,
    & .tox-ai .tox-ai__footer,
    & .tox .tox-toggle`]: {
		backgroundColor: 'var(--tox-private-background-color, #1C1C1E)'
	},

	'& .tox .tox-toggle__slider': {
		backgroundColor: 'var(--tox-private-slider-background-color, #1C1C1E)'
	},

	// --- BACKGROUND SHORTHAND ---
	[`& .tox .tox-comment-thread,
    & .tox .tox-comment-thread__overlay::after,
    & .tox .tox-comment__overlay,
    & .tox.tox-mentions__card,
    & .tox .tox-mbtn,
    & .tox .tox-mbtn:focus:not(:disabled),
    & .tox .tox-tbtn:focus,
    & .tox .tox-tbtn--disabled,
    & .tox .tox-tbtn--disabled:hover,
    & .tox .tox-tbtn:disabled,
    & .tox .tox-tbtn:disabled:hover,
    & .tox .tox-number-input input:disabled,
    & .tox .tox-split-button__main:focus,
    & .tox .tox-split-button__chevron:focus,
    & .tox .tox-split-button__chevron.tox-tbtn--disabled,
    & .tox .tox-split-button__main.tox-tbtn--disabled,
    & .tox .tox-split-button__chevron.tox-tbtn--disabled:hover,
    & .tox .tox-split-button__main.tox-tbtn--disabled:hover,
    & .tox .tox-split-button__chevron.tox-tbtn--disabled:focus,
    & .tox .tox-split-button__main.tox-tbtn--disabled:focus`]: {
		background: '#1C1C1E'
	},

	// --- TEXT AND ICON COLORS ---
	'& .tox': {
		color: 'var(--tox-private-color-black, #1C1C1E)'
	},

	[`& .tox .tox-dialog__body-content .accessibility-issue--warn a.tox-button--naked.tox-button--icon,
    & .tox .tox-dialog__body-content .accessibility-issue--warn a.tox-button--naked.tox-button--icon:focus,
    & .tox .tox-dialog__body-content .accessibility-issue--warn a.tox-button--naked.tox-button--icon:hover,
    & .tox .tox-dialog__body-content .accessibility-issue--warn a.tox-button--naked.tox-button--icon:active,
    & .tox .tox-dialog__body-content .accessibility-issue--error a.tox-button--naked.tox-button--icon,
    & .tox .tox-dialog__body-content .accessibility-issue--error a.tox-button--naked.tox-button--icon:focus,
    & .tox .tox-dialog__body-content .accessibility-issue--error a.tox-button--naked.tox-button--icon:hover,
    & .tox .tox-dialog__body-content .accessibility-issue--error a.tox-button--naked.tox-button--icon:active`]: {
		color: '#1C1C1E'
	},

	// --- STYLES WITH MULTIPLE PROPERTIES ---
	'& .tox .tox-comment': {
		background: '#1C1C1E',
		border: '1px solid #1C1C1E'
	},

	'& .tox .tox-comment__overlaytext p': {
		backgroundColor: '#1C1C1E',
		boxShadow: '0 0 8px 8px #1C1C1E'
	},

	'& .tox .tox-sidebar-content__header': {
		background: 'var(--tox-private-background-color, #1C1C1E)',
		zIndex: 1
	},

	// --- BORDERS, GRADIENTS, AND SHADOWS ---
	'& .tox div.tox-swatch:not(.tox-swatch--remove) svg path': {
		stroke: '#1C1C1E'
	},

	'& .tox .tox-pop.tox-pop--bottom::after': { borderColor: '#1C1C1E transparent transparent transparent' },
	'& .tox .tox-pop.tox-pop--top::after': { borderColor: 'transparent transparent #1C1C1E transparent' },
	'& .tox .tox-pop.tox-pop--left::after': { borderColor: 'transparent #1C1C1E transparent transparent' },
	'& .tox .tox-pop.tox-pop--right::after': { borderColor: 'transparent transparent transparent #1C1C1E' },

	'& .tox .tox-comment__gradient::after': {
		background: 'linear-gradient(rgba(34,47,62,0), #1C1C1E)'
	},

	'& .tox-ai .tox-ai__response.tox-ai__response-streaming': {
		background: 'linear-gradient(180deg, var(--tox-private-color-black, #1C1C1E) 0, transparent 100%)'
	},

	'& .tox .tox-promotion-dialog .tox-promotion-dialog-plugin--icon': {
		boxShadow: '0 1px 1px 0 #1C1C1E12, 0 3px 6px 0 #1C1C1E06'
	},

	'& .tox .tox-suggestededits__container .tox-suggestededits .tox-suggestededits__sidebar-content .tox-suggestededits__card:hover':
		{
			boxShadow: '0 4px 8px 0 #1C1C1E'
		}
};

export function RichTextEditor(props: RichTextEditorProps) {
	const { field, value, setValue, readonly, defaultInitOptions } = props;
	const rteConfig = useRTEConfig();
	const editorRef = useRef<Editor>(undefined);
	const hasReceivedFocusRef = useRef(false);
	const maxLength = getPropertyValue(field.properties, 'maxLength') as number;

	// TODO: !!
	const required = getValidationValue(field.validations, 'required', false) as boolean;

	// region Initialize RTE config FE2 TODO: Move elsewhere
	const uiConfig = useSiteUIConfig();
	const dispatch = useDispatch();
	const siteId = useActiveSiteId();
	useEffect(() => {
		if (uiConfig.xml && !rteConfig) {
			dispatch(initRichTextEditorConfig({ configXml: uiConfig.xml, siteId }));
		}
	}, [uiConfig.xml, siteId, rteConfig, dispatch]);
	const [scriptLoaded, setScriptLoaded] = useState(!!getTinymce(window));
	useEffect(() => {
		if (!getTinymce(window)) {
			const script = document.createElement('script');
			script.src = tinymceScriptSrc;
			script.onload = () => {
				setScriptLoaded(true);
			};
			script.onerror = () => {
				console.error('TinyMCE editor could not be loaded');
			};
			document.head.appendChild(script);
		}
		// TODO: create util
		if (!window.ace) {
			const script = document.createElement('script');
			script.src = '/studio/static-assets/libs/ace/ace.js';
			document.head.appendChild(script);

			const styleSheet = document.createElement('link');
			styleSheet.rel = 'stylesheet';
			styleSheet.href = '/studio/static-assets/styles/tinymce-ace.css';
			document.head.appendChild(styleSheet);
		}
	}, []);
	// endregion

	const [currentLength, setCurrentLength] = useState(0);
	const handleChange: Editor['props']['onEditorChange'] = (newValue, editor) => {
		if (!hasReceivedFocusRef.current) {
			// When the editor initializes, it may trigger a change event with virtually the
			// same content, after it does its internal HTML cleansing. This causes the form to
			// think the content was changed and warn about losing changes if trying to close
			// the form without any user input. We'll ignore this event until the editor
			// has received focus at least once.
			return;
		}
		setCurrentLength(editor.getContent({ format: 'text' }).length);
		setValue(newValue);
	};
	if (!rteConfig || !scriptLoaded) {
		return <FormsEngineField field={field} max={maxLength} length={value.length} children={<ControlSkeleton />} />;
	}
	return (
		<FormsEngineField
			field={field}
			max={maxLength}
			length={currentLength}
			sx={{
				minHeight: 400,
				// FE2 TODO: creating skin stylesheets would be beneficial to customise colours according to our
				//       theme and to include dynamic darkmode support transitioning
				'.tox-tinymce': {
					borderRadius: 1,
					borderWidth: 1,
					borderColor: 'divider'
				},
				'.tox-editor-header': {},
				'.tox .tox-edit-area::before': {
					borderRadius: 0
				},
				'.tox.tox-edit-focus .tox-edit-area::before': {
					borderWidth: 2,
					borderColor: 'primary.main'
				},
				'.tox .tox-statusbar': {
					borderTopColor: 'divider'
				},
				'.tox.tox-tinymce-inline .tox-editor-header': {
					backgroundColor: '#1C1C1E'
				},
				'.tox:not(.tox-tinymce-inline) .tox-editor-header': {
					backgroundColor: '#1C1C1E'
				},
				'.tox:not(.tox-tinymce-inline).tox-tinymce--toolbar-sticky-on .tox-editor-header': {
					backgroundColor: '#1C1C1E'
				},
				...tinymceCustomStyles
			}}
		>
			<Editor
				licenseKey="gpl"
				init={getTinyMceInitOptions(field, rteConfig, defaultInitOptions)}
				tinymceScriptSrc={tinymceScriptSrc}
				onEditorChange={handleChange}
				value={value}
				ref={editorRef}
				onInit={(event, editor) => {
					setCurrentLength(editor.getContent({ format: 'text' }).length);
					editor.once('focus', () => {
						hasReceivedFocusRef.current = true;
					});
				}}
				disabled={readonly}
			/>
		</FormsEngineField>
	);
}

function ControlSkeleton() {
	return (
		<Box
			sx={{
				borderWidth: 1,
				borderStyle: 'solid',
				borderColor: 'divider',
				borderRadius: 1
			}}
		>
			<Box display="flex" mx={2} my={1} sx={{ gap: 1 }}>
				<Skeleton width={60} />
				<Skeleton width={60} />
				<Skeleton width={60} />
				<Skeleton width={60} />
				<Skeleton width={60} />
			</Box>
			<Box display="flex" mx={2} my={1} sx={{ gap: 1 }}>
				<Skeleton width={24} height={24} variant="circular" />
				<Skeleton width={24} height={24} variant="circular" sx={{ mr: 2 }} />
				<Skeleton width={80} height={24} variant="rounded" sx={{ mr: 2 }} />
				<Skeleton width={24} height={24} variant="circular" />
				<Skeleton width={24} height={24} variant="circular" />
				<Skeleton width={24} height={24} variant="circular" />
			</Box>
			<Divider />
			<Box height={350} />
		</Box>
	);
}

export default RichTextEditor;
