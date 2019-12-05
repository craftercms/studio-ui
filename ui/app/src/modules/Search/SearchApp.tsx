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
import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import Search from './Search';


function SearchApp(props: any) {
  const {onEdit, onDelete, onPreview, onSelect, siteId} = props;
  return (
    <HashRouter>
      <Route path="/" render={(props) =>
        <Search {...props}
                onEdit={onEdit}
                onDelete={onDelete}
                onPreview={onPreview}
                onSelect={onSelect}
                siteId={siteId}
        />}/>
    </HashRouter>
  )
}

export default SearchApp;
