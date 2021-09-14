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

import React, { useEffect, useState, useRef } from 'react';
//@ts-ignore
import GraphiQL from 'graphiql';
//@ts-ignore
import GraphiQLExplorer from 'graphiql-explorer';
import { buildClientSchema, getIntrospectionQuery, GraphQLSchema } from 'graphql';

export interface GraphiQLProps {
  url?: string;
  storageKey?: string;
  method?: string;
}

const storages: any = {};

// Custom storage to store graphiQL info by key
function makeStorage(storageKey: string) {
  return {
    setItem: (key: string, val: any) => window.localStorage.setItem(`${storageKey}${key}`, val),
    getItem: (key: string) => window.localStorage.getItem(`${storageKey}${key}`),
    removeItem: (key: string) => window.localStorage.removeItem(`${storageKey}${key}`)
  };
}

// Returns custom storage by key
function getStorage(storageKey: string) {
  if (!storages[storageKey]) {
    storages[storageKey] = makeStorage(storageKey);
  }
  return storages[storageKey];
}

function Graphi(props: GraphiQLProps) {
  const [query, setQuery] = useState(window.localStorage.getItem(`${props.storageKey}graphiql:query`));
  const [schema, setSchema] = useState<GraphQLSchema>(null);
  const [explorerIsOpen, setExplorerIsOpen] = useState<boolean>(false);
  const graphiql: GraphiQL = useRef();

  // Updates localStorage and query variable used by graphiQL and graphiQL explorer
  function onEditQuery(newQuery: string) {
    setQuery(newQuery);
    window.localStorage.setItem(`${props.storageKey}graphiql:query`, newQuery);
  }

  function graphQLFetcher(graphQLParams: any) {
    var url: string = props.url ? props.url : window.location.origin + '/api/1/site/graphql',
      method: string = (props.method || 'post').toLowerCase();

    if ('get' === method) {
      if (typeof graphQLParams['variables'] === 'undefined') {
        graphQLParams['variables'] = '{}';
      }

      const query = encodeURIComponent(graphQLParams['query']);
      const variables = encodeURIComponent(JSON.stringify(graphQLParams['variables']));

      url += `?query=${query}&variables=${variables}`;
    }

    return fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(method === 'post' ? { body: JSON.stringify(graphQLParams) } : {})
    }).then(function (responseBody: any) {
      try {
        return responseBody.json();
      } catch (error) {
        return responseBody;
      }
    });
  }

  function handleToggleExplorer() {
    setExplorerIsOpen(!explorerIsOpen);
  }

  useEffect(
    () => {
      graphQLFetcher({
        query: getIntrospectionQuery()
      }).then((result) => {
        setSchema(buildClientSchema(result.data));
      });
    },
    // eslint-disable-next-line
    []
  );

  return (
    <div className="graphiql-container">
      {/* Explorer plugin for GraphiQL  */}
      <GraphiQLExplorer
        schema={schema}
        query={query}
        onEdit={onEditQuery}
        onRunOperation={(operationName: any) => graphiql.current.handleRunQuery(operationName)}
        explorerIsOpen={explorerIsOpen}
        onToggleExplorer={handleToggleExplorer}
      />
      <GraphiQL
        ref={graphiql}
        fetcher={graphQLFetcher}
        schema={schema}
        query={query}
        storage={getStorage(`${props.storageKey}`)}
        onEditQuery={onEditQuery}
      >
        <GraphiQL.Toolbar>
          <GraphiQL.Button
            onClick={() => graphiql.current.handlePrettifyQuery()}
            label="Prettify"
            title="Prettify Query (Shift-Ctrl-P)"
          />
          <GraphiQL.Button
            onClick={() => graphiql.current.handleToggleHistory()}
            label="History"
            title="Show History"
          />
          <GraphiQL.Button onClick={handleToggleExplorer} label="Explorer" title="Toggle Explorer" />
        </GraphiQL.Toolbar>
      </GraphiQL>
    </div>
  );
}

export default Graphi;
