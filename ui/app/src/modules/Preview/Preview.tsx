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

import React, { useCallback, useMemo } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import ToolsPanel from './ToolsPanel';
import { PreviewProvider } from './previewContext';
import Host from './Host';
import ToolBar from './ToolBar';
import { PreviewConcierge } from './PreviewConcierge';
import { parse, stringify } from 'query-string';
import { LookupTable } from '../../models/LookupTable';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }
}));

export default function Preview(props) {
  const qs = useMemo(() => parse(props.location.search) as LookupTable<string>, [props.location.search]);
  const go = useCallback((data) => props.history.push({ search: stringify(data, { encode: false }) }), [props.history]);
  const classes = useStyles({});
  return (
    <PreviewProvider site={qs.site} url={qs.page}>
      <section className={classes.root}>
        <ToolBar/>
        <Host/>
        <ToolsPanel/>
      </section>
      <PreviewConcierge
        queryString={qs}
        onUrlChange={go}
      />
    </PreviewProvider>
  );
}

