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
import GraphiQLComponent, { FetcherOpts, FetcherParams, ToolbarButton } from 'graphiql';
import 'graphiql/graphiql.min.css';
import GraphiQLExplorer from 'graphiql-explorer';
import { buildClientSchema, getIntrospectionQuery, GraphQLSchema } from 'graphql';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import { toQueryString } from '../../utils/object';
import { onSubmittingAndOrPendingChangeProps } from '../../hooks/useEnhancedDialogState';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import { isBlank } from '../../utils/string';
import { defaultQuery } from './utils';
import useEnv from '../../hooks/useEnv';
import useActiveSiteId from '../../hooks/useActiveSiteId';

export interface GraphiQLProps {
  url?: string;
  storageKey?: string;
  method?: string;
  embedded?: boolean;
  showAppsButton?: boolean;
  onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
}

function GraphiQL(props: GraphiQLProps) {
  const { guestBase } = useEnv();
  const site = useActiveSiteId();
  const {
    storageKey = site,
    showAppsButton,
    embedded = false,
    method = 'post',
    url = `${guestBase}/api/1/site/graphql${site ? `?crafterSite=${site}` : ''}`,
    onSubmittingAndOrPendingChange
  } = props;
  // We don't want to update the initialQuery.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialQuery = useMemo(() => window.localStorage.getItem(`${storageKey}graphiql:query`) ?? defaultQuery, []);
  const [query, setQuery] = useState(initialQuery);
  const [schema, setSchema] = useState<GraphQLSchema>(null);
  const [explorerIsOpen, setExplorerIsOpen] = useState<boolean>(false);
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
  const handleToggleExplorer = () => setExplorerIsOpen(!explorerIsOpen);
  const refs = useUpdateRefs({ onSubmittingAndOrPendingChange, graphiql: null });
  const hasChanges = isBlank(query) ? false : initialQuery !== query;
  const onEditQuery = (newQuery: string) => {
    setQuery(newQuery);
    window.localStorage.setItem(`${storageKey}graphiql:query`, newQuery);
  };

  useEffect(() => {
    refs.current.onSubmittingAndOrPendingChange?.({ hasPendingChanges: hasChanges });
  }, [hasChanges, refs]);

  useEffect(() => {
    graphQLFetcher({
      query: getIntrospectionQuery()
    }).then((result) => {
      setSchema(buildClientSchema(result.data));
    });
  }, [graphQLFetcher]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {!embedded && (
        <GlobalAppToolbar
          title={<FormattedMessage id="words.graphQL" defaultMessage="GraphQL" />}
          showAppsButton={showAppsButton}
        />
      )}
      <Box
        className="graphiql-container"
        sx={{
          height: 'calc(100% - 65px)',
          position: 'relative',
          '.title': {
            display: 'none'
          },
          '.doc-explorer-title-bar, .history-title-bar': {
            height: 'auto!important'
          }
        }}
      >
        <GraphiQLExplorer
          schema={schema}
          query={query}
          onEdit={onEditQuery}
          onRunOperation={(operationName: any) => refs.current.graphiql.handleRunQuery(operationName)}
          explorerIsOpen={explorerIsOpen}
          onToggleExplorer={handleToggleExplorer}
        />
        <GraphiQLComponent
          ref={(ref) => (refs.current.graphiql = ref)}
          fetcher={graphQLFetcher}
          schema={schema}
          query={query}
          storage={storage}
          onEditQuery={onEditQuery}
          toolbar={{
            additionalContent: <ToolbarButton onClick={handleToggleExplorer} label="Explorer" title="Toggle Explorer" />
          }}
        />
      </Box>
    </Box>
  );
}

export default GraphiQL;
