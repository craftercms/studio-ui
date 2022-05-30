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

import React, { useEffect, useMemo, useState } from 'react';
import GraphiQLComponent, { FetcherOpts, FetcherParams } from 'graphiql';
import 'graphiql/graphiql.min.css';
import { buildClientSchema, getIntrospectionQuery, GraphQLSchema } from 'graphql';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import { useStyles } from './styles';
import { toQueryString } from '../../utils/object';

export interface GraphiQLProps {
  url?: string;
  storageKey?: string;
  method?: string;
  embedded?: boolean;
  showAppsButton?: boolean;
}

function GraphiQL(props: GraphiQLProps) {
  const { classes, cx: clsx } = useStyles();
  const {
    storageKey,
    showAppsButton,
    embedded = false,
    method = 'post',
    url = `${window.location.origin}/api/1/site/graphql`
  } = props;
  const [query, setQuery] = useState(() => window.localStorage.getItem(`${storageKey}graphiql:query`));
  const [schema, setSchema] = useState<GraphQLSchema>(null);
  const storage = useMemo(
    () =>
      ({
        setItem: (key: string, value: any) => window.localStorage.setItem(`${storageKey}${key}`, value),
        getItem: (key: string) => window.localStorage.getItem(`${storageKey}${key}`),
        removeItem: (key: string) => window.localStorage.removeItem(`${storageKey}${key}`)
      } as Storage),
    [storageKey]
  );
  const graphQLFetcher = useMemo(() => {
    const lowercaseMethod = method.toLowerCase();
    const then = (response: Response) => {
      try {
        return response.json();
      } catch (error) {
        return response;
      }
    };
    if (lowercaseMethod === 'get') {
      return (graphQLParams: FetcherParams, opts?: FetcherOpts) => {
        return fetch(
          `${url}${toQueryString({
            query: encodeURIComponent(graphQLParams.query),
            variables: encodeURIComponent(JSON.stringify(graphQLParams.variables ?? '{}'))
          })}`,
          {
            method: 'get',
            headers: { 'Content-Type': 'application/json' }
          }
        ).then(then);
      };
    } else {
      return (graphQLParams: FetcherParams, opts?: FetcherOpts) => {
        return fetch(url, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(graphQLParams)
        }).then(then);
      };
    }
  }, [url, method]);

  function onEditQuery(newQuery: string) {
    setQuery(newQuery);
    window.localStorage.setItem(`${storageKey}graphiql:query`, newQuery);
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
          title={<FormattedMessage id="words.graphQL" defaultMessage="GraphQL" />}
          showAppsButton={showAppsButton}
        />
      )}
      <div className={clsx(classes.container, 'graphiql-container')}>
        {/* Explorer plugin for GraphiQL  */}
        <GraphiQLComponent
          fetcher={graphQLFetcher}
          schema={schema}
          query={query}
          storage={storage}
          onEditQuery={onEditQuery}
        />
      </div>
    </Box>
  );
}

export default GraphiQL;
