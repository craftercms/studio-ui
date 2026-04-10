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

import {
	type RichTextEditorProps,
	RichTextEditor as BaseRichTextEditor
} from '../../FormsEngine/controls/RichTextEditor';
import { Editor } from '@tinymce/tinymce-react';

export function RichTextEditor(props: RichTextEditorProps) {
	// Minimal default options for Content Type Builder's RichTextEditor
	const defaultOpts: Editor['props']['init'] = {
		menubar: false,
		theme: 'silver',
		plugins:
			'preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help acecode',
		extended_valid_elements: '',
		valid_children: '',
		toolbar1:
			'bold italic strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent',
		code_editor_wrap: false,
		image_advtab: true,
		encoding: 'xml',
		relative_urls: false,
		remove_script_host: false,
		convert_urls: false,
		remove_trailing_brs: false,
		media_live_embeds: true,
		autoresize_on_init: false,
		autoresize_bottom_margin: 0,
		paste_data_images: true,
		templates: [],
		content_css: [],
		content_style: 'body {}',
		contextmenu: false
	};

	return <BaseRichTextEditor {...props} defaultInitOptions={defaultOpts} />;
}

export default RichTextEditor;
