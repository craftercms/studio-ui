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

import { Settings } from 'tinymce/index';
import LookupTable from '@craftercms/studio-ui/models/LookupTable';

export interface TinymceOptions extends Settings {
  paste_postprocess?(plugin: string, args?: {}): void;
  code_editor_inline?: boolean;
  code_editor_wrap?: boolean;
  craftercms_paste_cleanup?: boolean;
}

export interface RteSetup {
  id?: string;
  tinymceOptions?: TinymceOptions;
}

export type RteConfig = LookupTable<RteSetup>;
