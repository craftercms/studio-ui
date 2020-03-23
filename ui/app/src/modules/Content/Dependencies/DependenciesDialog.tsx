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

import React, { useState } from 'react';
import DependenciesDialogUI from './DependenciesDialogUI';
import { Item } from '../../../models/Item';

interface DependenciesDialogProps {
  item: Item;
  dependenciesSelection: string;
}

function DependenciesDialog(props: DependenciesDialogProps) {
  const { item } = props;
  const [apiState, setApiState] = useState({
    error: false,
    global: false,
    errorResponse: null
  });

  function handleErrorBack() {
    setApiState({ ...apiState, error: false, global: false });
  }

  return (
    <DependenciesDialogUI
      item={item}
      apiState={apiState}
      handleErrorBack={handleErrorBack}
    />
  )
}

export default DependenciesDialog;
