/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import { combineReducers } from '@reduxjs/toolkit';
import confirm from './confirm';
import error from './error';
import newContent from './newContent';
import minimizedDialogs from './minimizedDialogs';
import history from './history';
import viewVersion from './viewVersion';
import compareVersions from './compareVersions';
import publish from './publish';
import dependencies from './dependencies';
import deleteDialog from './delete';
import edit from './edit';
import codeEditor from './codeEditor';
import workflowCancellation from './workflowCancellation';
import reject from './reject';
import createFolder from './createFolder';
import createFile from './createFile';
import copy from './copy';
import upload from './upload';
import preview from './preview';
import editSite from './editSite';
import pathSelection from './pathSelection';
import changeContentType from './changeContentType';
import itemMenu from './itemMenu';

export default combineReducers({
  confirm,
  error,
  newContent,
  minimizedDialogs,
  history,
  viewVersion,
  compareVersions,
  publish,
  dependencies,
  delete: deleteDialog,
  edit,
  codeEditor,
  workflowCancellation,
  reject,
  editSite,
  createFolder,
  createFile,
  copy,
  upload,
  preview,
  pathSelection,
  changeContentType,
  itemMenu
});
