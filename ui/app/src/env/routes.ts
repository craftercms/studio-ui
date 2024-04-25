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

export enum GlobalRoutes {
  Projects = '/projects',
  Users = '/users',
  Groups = '/groups',
  Audit = '/audit',
  LogLevel = '/logging',
  LogConsole = '/log',
  GlobalConfig = '/global-config',
  EncryptTool = '/encryption-tool',
  TokenManagement = '/token-management',
  About = '/about-us',
  Settings = '/settings'
}

export enum ProjectToolsRoutes {
  ContentTypes = '/content-types',
  EncryptTool = '/encrypt-tool',
  Configuration = '/configuration',
  Audit = '/audit',
  WorkflowStates = '/item-states',
  LogConsole = '/log',
  Publishing = '/publishing',
  Git = '/git',
  GraphQL = '/graphiql',
  PluginManagement = '/plugins'
}
