/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Blueprint } from "./Blueprint";

interface View {
  title: string;
  subtitle: string;
  btnText?: string;
}

export interface Views {
  [key: number]: View;
}

export interface SiteState {
  blueprint: Blueprint;
  siteId: string;
  siteIdExist: boolean;
  description: string;
  push_site: boolean;
  use_remote: boolean;
  repo_url: string;
  repo_authentication: string;
  repo_remote_branch: string;
  repo_remote_name: string;
  repo_password: string;
  repo_username: string;
  repo_token: string;
  repo_key: string;
  submitted: boolean;
  selectedView: number;
  details: Blueprint;
  blueprintFields?: {
    [key: string]: string;
  }
}

export interface Site {
  site_id: string;
  description: string;
  single_branch: boolean;
  authentication_type: string;
  blueprint?: string;
  use_remote?: boolean;
  repo_remote_name?: string;
  remote_url?: string;
  remote_name?: string;
  remote_branch? : string;
  sandbox_branch? : string;
  remote_username?: string;
  remote_password?: string;
  remote_token?: string;
  remote_private_key?: string;
  create_option?: string;
  site_params?: {
    [key: string]: string;
  }
}
