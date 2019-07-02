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

import React, { useEffect, useRef } from 'react';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';

export interface GraphiQLProps {
  url?: string,
  storageKey?: string,
  method?: string
}

const _storages: any = {};

function _makeStorage(storageKey: string) {
  return {
    setItem: (key: string, val: any) => window.localStorage.setItem(`${storageKey}${key}`, val),
    getItem: (key: string) => window.localStorage.getItem(`${storageKey}${key}`),
    removeItem: (key: string) => window.localStorage.removeItem(`${storageKey}${key}`)
  };
}

function getStorage(storageKey: string) {
  if (!_storages[storageKey]) {
    _storages[storageKey] = _makeStorage(storageKey);
  }
  return _storages[storageKey];
}

function Graphi(props: GraphiQLProps) {

  function onEditQuery(newQuery:any) {
    window.localStorage.setItem(`${props.storageKey}graphiql:query`, newQuery);
  }

  function graphQLFetcher(graphQLParams: any) {       // TODO: set type
    var url:string = props.url ? props.url : window.location.origin + '/api/1/site/graphql',
        method:string = props.method;

    if('get' === method){
      if (typeof graphQLParams['variables'] === "undefined"){
        graphQLParams['variables'] = "{}";
      }

      const query = encodeURIComponent(graphQLParams['query']);
      const variables = encodeURIComponent(JSON.stringify(graphQLParams['variables']));

      url += `?query=${query}&variables=${variables}`;

      return fetch(url, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' }
      }).then(function (responseBody: any) {    //TODO: set type
        try {
          return responseBody.json();
        } catch (error) {
          return responseBody;
        }
      });

    }else{
      return fetch(url, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphQLParams),
      }).then(function (responseBody: any) {    //TODO: set type
        try {
          return responseBody.json();
        } catch (error) {
          return responseBody;
        }
      });
    }
  }

  useEffect(
    () => {
      // onmount

      return () => {
        // onunmount
      }
    },
    // eslint-disable-next-line
    []
  );

  return (
    <div className="graphiql-container">
      <GraphiQL fetcher={graphQLFetcher}
                storage={getStorage(`${props.storageKey}`)}
                onEditQuery={onEditQuery}/>
    </div>
  )
}

export default Graphi;
