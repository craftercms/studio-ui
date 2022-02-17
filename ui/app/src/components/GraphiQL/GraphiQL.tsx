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

import React, { useEffect, useMemo, useRef, useState } from 'react';
// @ts-ignore
import GraphiQL from 'graphiql';

import 'graphiql/graphiql.min.css';

// @ts-ignore
import GraphiQLExplorer from 'graphiql-explorer';
import { buildClientSchema, getIntrospectionQuery, GraphQLSchema } from 'graphql';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import { useStyles } from './styles';
import clsx from 'clsx';

export interface GraphiQLProps {
  url?: string;
  storageKey?: string;
  method?: string;
  embedded?: boolean;
  showAppsButton?: boolean;
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

function getGraphQLFetcher(url: string, method = 'post') {
  return (graphQLParams: object) => {
    url = url ?? window.location.origin + '/api/1/site/graphql';
    method = method.toLowerCase();

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
  };
}

function Graphi(props: GraphiQLProps) {
  const { url, storageKey, method, embedded = false, showAppsButton } = props;
  const [query, setQuery] = useState(() => window.localStorage.getItem(`${storageKey}graphiql:query`));
  const [schema, setSchema] = useState<GraphQLSchema>(null);
  const [explorerIsOpen, setExplorerIsOpen] = useState<boolean>(false);
  const graphiql = useRef<GraphiQL>();
  const classes = useStyles();

  // Updates localStorage and query variable used by graphiQL and graphiQL explorer
  function onEditQuery(newQuery: string) {
    setQuery(newQuery);
    window.localStorage.setItem(`${storageKey}graphiql:query`, newQuery);
  }

  const graphQLFetcher = useMemo(() => getGraphQLFetcher(url, method), [url, method]);

  function handleToggleExplorer() {
    setExplorerIsOpen(!explorerIsOpen);
  }

  useEffect(() => {
    graphQLFetcher({
      query: getIntrospectionQuery()
    }).then((result) => {
      setSchema(buildClientSchema(result.data));
    });
  }, [graphQLFetcher]);

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      {!embedded && (
        <GlobalAppToolbar
          title={<FormattedMessage id="GraphiQL.title" defaultMessage="GraphiQL" />}
          showAppsButton={showAppsButton}
        />
      )}
      <div className={clsx(classes.container, 'graphiql-container')}>
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
          storage={getStorage(`${storageKey}`)}
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
    </Box>
  );
}

export default Graphi;
