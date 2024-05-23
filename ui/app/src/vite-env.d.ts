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

/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_SHOW_TOOLS_PANEL: string;
  VITE_PREVIEW_LANDING: string;
  VITE_AUTHORING_BASE: string;
  VITE_GUEST_BASE: string;
  /**
   * Can be used to specify a different entry file other than `main.prod.tsx`
   * to use for the dev server's `index.html`.
   */
  VITE_MAIN: string;
}
