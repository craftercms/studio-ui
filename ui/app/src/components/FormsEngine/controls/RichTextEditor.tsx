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
import { reversePluckProps } from '../../../utils/object';
import { Editor } from '@tinymce/tinymce-react';
import { TinyMCE } from 'tinymce';
import { getTinymce } from '@tinymce/tinymce-react/lib/es2015/main/ts/TinyMCE';
import { ContentTypeField } from '../../../models';
import GlobalState from '../../../models/GlobalState';
import LookupTable from '../../../models/LookupTable';

export interface RichTextEditorProps extends ControlProps {
	value: string;
}

const tinymceScriptSrc = '/studio/static-assets/libs/tinymce/tinymce.min.js';

declare global {
	interface Window {
		tinymce: TinyMCE;
	}
}

// FE2 TODO: Reuse this on XB
function getTinyMceInitOptions(
	field: ContentTypeField,
	rteConfig: GlobalState['preview']['richTextEditor'], // GlobalState['preview']['richTextEditor']['']['']
	setup?: Editor['props']['init']['setup']
): Editor['props']['init'] {
	const setupId: string = (field.properties?.rteConfiguration?.value as string) ?? 'generic';
	const tinymceOptions: Editor['props']['init'] = (
		rteConfig[setupId] ??
		Object.values(rteConfig)[0] ?? { id: '', tinymceOptions: {} }
	)?.tinymceOptions;
	const controlProps: Partial<Editor['props']['init']> = {};
	if (field.properties?.enableSpellCheck?.value === false) {
		controlProps.browser_spellcheck = true;
	}
	const external: LookupTable<string> = {
		...tinymceOptions.external_plugins,
		acecode: '/studio/static-assets/js/tinymce-plugins/ace/plugin.min.js',
		editform: '/studio/static-assets/js/tinymce-plugins/editform/plugin.js',
		craftercms_paste_extension: '/studio/static-assets/js/tinymce-plugins/craftercms_paste_extension/plugin.js',
		template: '/studio/static-assets/js/tinymce-plugins/template/plugin.js',
		craftercms_paste: '/studio/static-assets/js/tinymce-plugins/craftercms_paste/plugin.js'
	};
	// Tiny: must remove `autoresize_on_init`, `templates` from all configs
	const init: Editor['props']['init'] = {
		// @ts-expect-error: Typings state the prop is wrong for the React integration, but the prop is correct.
		license_key: 'gpl',
		// Needs to be set to split when the editor is rendered in a scrollable container.
		// The `height` and `overflow` of the FormsEngine root breaks some of Tiny's internal rendering mechanics.
		ui_mode: 'split',
		// target: rteEl,
		promotion: false,
		branding: false,
		// Templates plugin is deprecated but still available on v6, since it may be used, we'll keep it. Please
		// note that it will become premium on version 7.
		deprecation_warnings: true,
		// For some reason this is not working.
		// body_class: 'craftercms-rich-text-editor',
		plugins: ['craftercms_paste', tinymceOptions.plugins].filter(Boolean).join(' '), // 'editform' plugin will always be loaded
		paste_as_text: true,
		paste_data_images: true,
		paste_preprocess(plugin, args) {
			window.tinymce.activeEditor.plugins.craftercms_paste_extension?.paste_preprocess(plugin, args);
		},
		paste_postprocess(plugin, args) {
			window.tinymce.activeEditor.plugins.craftercms_paste_extension?.paste_postprocess(plugin, args);
		},
		// toolbar: true,
		// forced_root_block: true,
		// menubar: false,
		// inline: true,
		base_url: '/studio/static-assets/libs/tinymce',
		suffix: '.min',
		external_plugins: external,
		code_editor_inline: false,
		skin: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oxide-dark' : 'oxide',
		// skin_url: '/studio/static-assets/libs/tinymce',
		media_live_embeds: true,
		file_picker_types: 'image media',
		craftercms_paste_cleanup: tinymceOptions.craftercms_paste_cleanup ?? true, // If doesn't exist or if true => true
		file_picker_callback: function (cb, value, meta) {
			//   // meta contains info about type (image, media, etc). Used to properly add DS to dialogs.
			//   // meta.filetype === 'file | image | media'
			//   const datasources = {};
			//   Object.values(field.validations).forEach((validation) => {
			//     if (
			//       [
			//         'allowImageUpload',
			//         'allowImagesFromRepo',
			//         'allowVideoUpload',
			//         'allowVideosFromRepo',
			//         'allowAudioUpload',
			//         'allowAudioFromRepo'
			//       ].includes(validation.id)
			//     ) {
			//       datasources[validation.id] = validation;
			//     }
			//   });
			//   const browseBtn = document.querySelector('.tox-dialog .tox-browse-url');
			//
			//   // post(
			//   //   showRtePickerActions({
			//   //     datasources,
			//   //     model,
			//   //     type: meta.filetype,
			//   //     rect: browseBtn.getBoundingClientRect()
			//   //   })
			//   // );
			//
			//   // message$
			//   //   .pipe(
			//   //     filter((e) => e.type === rtePickerActionResult.type),
			//   //     take(1)
			//   //   )
			//   //   .subscribe(({ payload }) => {
			//   //     if (payload) {
			//   //       cb(payload.path, { alt: payload.name });
			//   //     }
			//   //   });
		},
		setup(editor) {
			const pluginManager = window.tinymce.util.Tools.resolve('tinymce.PluginManager');

			function getContent() {
				return editor.getContent({ format: 'html' });
			}

			function getSelectionContent() {
				return editor.selection.getContent({ format: 'html' });
			}

			function destroyEditor() {
				editor.destroy(false);
			}

			// editor.on('init', function () {
			//   const initialTinyContent = getContent();
			//
			//   replaceLineBreaksIfApplicable(originalRawContent);
			//
			//   editor.focus(false);
			//   editor.selection.select(editor.getBody(), true);
			//   editor.selection.collapse(false);
			//
			//   // In some cases the 'blur' event is getting caught somewhere along
			//   // the way. Focusout seems to be more reliable.
			//   editor.on('focusout', (e: EditorEvent<FocusEvent & { forced?: boolean }>) => {
			//     // Only consider 'focusout' events that are trusted and not at the bubbling phase.
			//     if (e.forced || (e.isTrusted && e.eventPhase !== 3)) {
			//       let relatedTarget = e.relatedTarget as HTMLElement;
			//       let saved = false;
			//       // The 'change' event is not triggering until focusing out in v6. Reported in here https://github.com/tinymce/tinymce/issues/9132
			//       changed = changed || getContent() !== initialTinyContent;
			//       if (
			//         !relatedTarget?.closest('.tox-tinymce') &&
			//         !relatedTarget?.closest('.tox') &&
			//         !relatedTarget?.classList.contains('tox-dialog__body-nav-item')
			//       ) {
			//         if (validations?.required && !getContent().trim()) {
			//           post(
			//             snackGuestMessage({
			//               id: 'required',
			//               level: 'required',
			//               values: { field: record.label }
			//             })
			//           );
			//         } else if (changed) {
			//           saved = true;
			//           save();
			//         }
			//         e.stopImmediatePropagation();
			//         cancel({ saved });
			//       }
			//     }
			//   });
			//
			//   editor.once('change', () => {
			//     changed = true;
			//   });
			//
			//   editor.once('external_change', () => {
			//     changed = true;
			//   });
			//
			//   if (type !== 'html') {
			//     // For plain text fields, remove keyboard shortcuts for formatting text
			//     // meta is used in tinymce for Ctrl (PC) and Command (macOS)
			//     // https://www.tiny.cloud/docs/advanced/keyboard-shortcuts/#editorkeyboardshortcuts
			//     editor.addShortcut('meta+b', '', '');
			//     editor.addShortcut('meta+i', '', '');
			//     editor.addShortcut('meta+u', '', '');
			//   }
			// });

			// editor.on('paste', (e) => {
			//   const maxLength = validations?.maxLength ? parseInt(validations.maxLength.value) : null;
			//   const text = (
			//     e.clipboardData ||
			//     // @ts-ignore
			//     window.clipboardData
			//   ).getData('text');
			//   if (maxLength && text.length > maxLength) {
			//     post(
			//       snackGuestMessage({
			//         id: 'maxLength',
			//         level: 'required',
			//         values: { maxLength: text.length === maxLength ? text.length : `${text.length}/${maxLength}` }
			//       })
			//     );
			//   }
			//   if (type === 'textarea') {
			//     // Doing this immediately (without the timeout) causes the content to be duplicated.
			//     // TinyMCE seems to be doing something internally that causes this.
			//     setTimeout(() => {
			//       replaceLineBreaksIfApplicable(text);
			//       editor.selection.select(editor.getBody(), true);
			//       editor.selection.collapse(false);
			//     }, 10);
			//   }
			//   // TODO: It'd be great to be able to select the piece of the pasted content that falls out of the max-length.
			// });

			// const nonChars = [
			//   'Meta',
			//   'Alt',
			//   'Control',
			//   'Shift',
			//   'CapsLock',
			//   'Tab',
			//   'Escape',
			//   'ArrowLeft',
			//   'ArrowRight',
			//   'ArrowUp',
			//   'ArrowDown',
			//   'Dead',
			//   'Delete'
			//   // Added as needed when using this array...
			//   // 'Backspace',
			//   // 'Enter'
			// ].filter(Boolean);

			// editor.on('keyup', (e) => {
			//   let content = getContent();
			//   if (validations?.required && content.trim() === '' && !nonChars.concat('Enter').includes(e.key)) {
			//     post(
			//       snackGuestMessage({
			//         id: 'required',
			//         level: 'suggestion',
			//         values: { field: record.label }
			//       })
			//     );
			//   }
			// });

			// editor.on('keydown', (e) => {
			//   let content: string, selection: string, numMaxLength: number;
			//   if (e.key === 'Escape') {
			//     e.stopImmediatePropagation();
			//     cancel({ saved: false });
			//   } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			//     e.preventDefault();
			//     // Timeout to avoid "Uncaught TypeError: Cannot read properties of null (reading 'getStart')"
			//     // Hypothesis is the focusout destroys the editor before some internal tiny thing runs.
			//     // @ts-ignore - Add "forced" property to be able to recognise this manually-triggered focusout on our handler.
			//     setTimeout(() => editor.fire('focusout', { forced: true }));
			//   } else if (e.key === 'Enter' && type !== 'html' && type !== 'textarea') {
			//     // Avoid new line in plain text fields
			//     e.preventDefault();
			//   } else if (
			//     validations?.maxLength &&
			//     !nonChars.concat('Backspace').includes(e.key) &&
			//     (content = getContent()).length + 1 > (numMaxLength = parseInt(validations.maxLength.value)) &&
			//     // If everything is selected and a key is pressed, essentially, it will
			//     // delete everything so no max-length problem
			//     ((selection = getSelectionContent()) === '' || content.length - (selection.length + 1) > numMaxLength)
			//   ) {
			//     post(
			//       snackGuestMessage({
			//         id: 'maxLength',
			//         level: 'required',
			//         values: { maxLength: `${content.length}/${validations.maxLength.value}` }
			//       })
			//     );
			//     e.stopPropagation();
			//     return false;
			//   }
			// });

			editor.on('DblClick', (e) => {
				e.preventDefault();
				e.stopPropagation();
				if (e.target.nodeName === 'IMG') {
					window.tinymce.activeEditor.execCommand('mceImage');
				}
			});

			// editor.on('click', (e) => {
			//   e.preventDefault();
			//   e.stopPropagation();
			// });

			// Register 'templates_css' for a set of custom css styles (files) that will apply to the templates content
			editor.options.register('templates_css', { processor: 'string[]' });
			editor.options.set('templates_css', [
				window.matchMedia('(prefers-color-scheme: dark)').matches
					? '/studio/static-assets/libs/tinymce/skins/content/dark/content.min.css'
					: '/studio/static-assets/libs/tinymce/skins/content/default/content.min.css'
			]);

			// No point in waiting for `craftercms_tinymce_hooks` if the hook won't be loaded at all.
			external.craftercms_tinymce_hooks &&
				pluginManager.waitFor(
					'craftercms_tinymce_hooks',
					() => {
						const hooks = pluginManager.get('craftercms_tinymce_hooks');
						if (hooks) {
							pluginManager.get('craftercms_tinymce_hooks').setup?.(editor);
						} else {
							console.error(
								"The `craftercms_tinymce_hooks` was configured to be loaded but didn't load. Check the path is correct in the rte configuration file."
							);
						}
					},
					'loaded'
				);

			setup?.(editor);
		},
		...(tinymceOptions && {
			...reversePluckProps(
				// Tiny seems to somehow mutate the options object which would cause crashes when attempting
				// to mutate immutable object (possibly from redux). Also, we don't want the state to get mutated.
				JSON.parse(JSON.stringify(tinymceOptions)),
				'target', // Target can't be changed
				'inline', // Not using inline view doesn't behave well on XB, this setting shouldn't be changed.
				'setup',
				'base_url',
				'encoding',
				'autosave_ask_before_unload', // Auto-save options are removed since it is not supported in control.
				'autosave_interval',
				'autosave_prefix',
				'autosave_restore_when_empty',
				'autosave_retention',
				'file_picker_callback', // No file picker is set by default, and functions are not supported in config file.
				'height', // Height is set to the size of content
				'file_picker_callback', // Files/images handlers currently not supported
				'paste_postprocess',
				'images_upload_handler',
				'code_editor_inline',
				'plugins', // Considered/used above, mixed with our options
				'external_plugins' // Considered/used above, mixed with our options
			)
		}),
		...controlProps,
		toolbar_sticky: false, // TODO: remove. this should/will come from config.
		openEditForm() {
			console.log('openEditForm');
		}
	};
	return init;
}

export function RichTextEditor(props: RichTextEditorProps) {
	const { field, value, setValue, readonly } = props;
	const rteConfig = useRTEConfig();
	const editorRef = useRef<Editor>(undefined);
	const hasReceivedFocusRef = useRef(false);

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
	}, []);
	// endregion

	const [currentLength, setCurrentLength] = useState(0);
	const maxLength = field.validations.maxLength?.value;
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
				}
			}}
		>
			<Editor
				licenseKey="gpl"
				init={getTinyMceInitOptions(field, rteConfig)}
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
