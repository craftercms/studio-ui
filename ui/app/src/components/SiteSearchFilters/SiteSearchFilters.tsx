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
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Theme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/KeyboardArrowDown';
import Collapse from '@material-ui/core/Collapse';
import clsx from 'clsx';
import { camelize } from '../../utils/string';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { ElasticParams, Facet, Filter as FilterType } from '../../models/Search';
import CheckIcon from '@material-ui/icons/Check';
import { LookupTable } from '../../models/LookupTable';
import SiteSearchSortBy from '../SiteSearchSortBy';
import SiteSearchSortOrder from '../SiteSearchSortOrder';
import SiteSearchFilter from '../SiteSearchFilter';
import PathSelector from '../SiteSearchPathSelector';
import Button from '@material-ui/core/Button';
import palette from '../../styles/palette';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    width: '100%',
    padding: '10px 15px 10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: 'none',
    color: theme.palette.type === 'dark' ? palette.white : ''
  },
  filterLabel: {
    fontWeight: 600,
    textTransform: 'uppercase'
  },
  body: {
    padding: '10px'
  },
  filterChecked: {
    marginLeft: '10px',
    color: theme.palette.type === 'dark' ? palette.white : palette.black
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  },
  listPadding: {
    padding: '0'
  },
  clearButtonContainer: {
    padding: '10px 20px',
    '& button': {
      fontWeight: 600
    }
  }
}));

const messages: any = defineMessages({
  path: {
    id: 'words.path',
    defaultMessage: 'Path'
  },
  sortBy: {
    id: 'searchFilter.sortBy',
    defaultMessage: 'Sort By'
  },
  relevance: {
    id: 'words.relevance',
    defaultMessage: 'Relevance'
  },
  internalName: {
    id: 'searchFilter.internalName',
    defaultMessage: 'Name'
  },
  width: {
    id: 'words.width',
    defaultMessage: 'Width'
  },
  contentType: {
    id: 'searchFilter.contentType',
    defaultMessage: 'Content Type'
  },
  mimeType: {
    id: 'searchFilter.mimeType',
    defaultMessage: 'MIME Type'
  },
  size: {
    id: 'searchFilter.size',
    defaultMessage: 'Content Size'
  },
  lastEditDate: {
    id: 'searchFilter.lastEditDate',
    defaultMessage: 'Last Edit Date'
  },
  height: {
    id: 'words.height',
    defaultMessage: 'Height'
  },
  clearFilters: {
    id: 'searchFilter.clearFilters',
    defaultMessage: 'Clear Filters'
  }
});

interface SiteSearchFiltersProps {
  text: string;
  className: any;
  facets: [Facet];
  queryParams: Partial<ElasticParams>;
  mode: string;
  checkedFilters: object;
  selectedPath: string;
  setSelectedPath(path: string): void;
  clearFilters(): void;
  setCheckedFilters(checkedFilters: object): any;
  handleFilterChange(filter: FilterType, isFilter?: boolean): any;
  handleClearClick(filter: string): void;
}

export default function SiteSearchFilters(props: SiteSearchFiltersProps) {
  const classes = useStyles({});
  const {
    facets,
    handleFilterChange,
    queryParams,
    mode,
    checkedFilters,
    setCheckedFilters,
    clearFilters,
    handleClearClick,
    selectedPath,
    setSelectedPath
  } = props;
  const { formatMessage } = useIntl();
  const [expanded, setExpanded] = useState({
    sortBy: false,
    path: false
  });

  useEffect(
    function() {
      setCheckedFilters(setCheckedParameterFromURL(queryParams));
    },
    [queryParams, setCheckedFilters]
  );

  const setCheckedParameterFromURL = (queryParams: Partial<ElasticParams>) => {
    if (queryParams['filters']) {
      let checked: any = {};
      let parseQP = JSON.parse(queryParams['filters']);
      Object.keys(parseQP).forEach((facet) => {
        if (Array.isArray(parseQP[facet])) {
          checked[facet] = {};
          parseQP[facet].forEach((name: string) => {
            checked[facet][name] = true;
          });
        } else {
          checked[facet] = parseQP[facet];
        }
      });
      return checked;
    } else {
      return {};
    }
  };

  let filterKeys: string[] = [];
  let facetsLookupTable: LookupTable = {};

  facets.forEach((facet) => {
    filterKeys.push(facet.name);
    facetsLookupTable[facet.name] = facet;
  });

  const handleExpandClick = (item: string) => {
    setExpanded({ ...expanded, [item]: !expanded[item] });
  };

  const pathToFilter = (path: string) => {
    if (path) {
      if (path.endsWith('/')) {
        return `${path}.+`;
      } else {
        return `${path}/.+`;
      }
    } else {
      return undefined;
    }
  };

  const onPathSelected = (path: string) => {
    handleFilterChange({
      name: 'path',
      value: pathToFilter(path)
    });
    setSelectedPath(path);
  };

  const renderFilters = () => {
    return filterKeys.map((key: string, i: number) => {
      let name = camelize(key);
      return (
        <div key={i}>
          <ListItem button classes={{ root: classes.listPadding }} onClick={() => handleExpandClick(name)}>
            <header className={clsx(classes.header, !!(expanded && expanded[name]) && 'open')}>
              <Typography variant="body1">
                <span className={classes.filterLabel}>{formatMessage(messages[name])}</span>
              </Typography>
              {checkedFilters[key] && <CheckIcon className={classes.filterChecked} />}
              <ExpandMoreIcon className={clsx(classes.expand, !!(expanded && expanded[name]) && classes.expandOpen)} />
            </header>
          </ListItem>
          <Collapse in={!!(expanded && expanded[name])} timeout={300}>
            <div className={classes.body}>
              <SiteSearchFilter
                facet={key}
                handleFilterChange={handleFilterChange}
                checkedFilters={checkedFilters}
                setCheckedFilters={setCheckedFilters}
                facetsLookupTable={facetsLookupTable}
                handleClearClick={handleClearClick}
              />
            </div>
          </Collapse>
        </div>
      );
    });
  };

  return (
    <div>
      <div className={classes.clearButtonContainer}>
        <Button
          variant="outlined"
          fullWidth
          disabled={Object.keys(checkedFilters).length === 0 && !Boolean(selectedPath)}
          onClick={clearFilters}
        >
          {formatMessage(messages.clearFilters)}
        </Button>
      </div>
      <List classes={{ padding: classes.listPadding }}>
        <ListItem button classes={{ root: classes.listPadding }} onClick={() => handleExpandClick('path')}>
          <header className={clsx(classes.header, 'first', !!(expanded && expanded['path']) && 'open')}>
            <Typography variant="body1" color="textPrimary">
              <span className={classes.filterLabel}>{formatMessage(messages.path)}</span>
            </Typography>
            {queryParams['path'] && <CheckIcon className={classes.filterChecked} />}
            <ExpandMoreIcon className={clsx(classes.expand, expanded && expanded['path'] && classes.expandOpen)} />
          </header>
        </ListItem>
        <Collapse in={expanded && expanded['path']} timeout={300}>
          <div className={classes.body}>
            <PathSelector
              value={selectedPath?.replace('.+', '')}
              onPathSelected={onPathSelected}
              disabled={mode === 'select'}
            />
          </div>
        </Collapse>
        <ListItem button classes={{ root: classes.listPadding }} onClick={() => handleExpandClick('sortBy')}>
          <header className={clsx(classes.header, !!(expanded && expanded['sortBy']) && 'open')}>
            <Typography variant="body1">
              <span className={classes.filterLabel}>{formatMessage(messages.sortBy)}</span>
            </Typography>
            {queryParams['sortBy'] && <CheckIcon className={classes.filterChecked} />}
            <ExpandMoreIcon className={clsx(classes.expand, expanded && expanded['sortBy'] && classes.expandOpen)} />
          </header>
        </ListItem>
        <Collapse in={expanded && expanded['sortBy']} timeout={300}>
          <div className={classes.body}>
            <SiteSearchSortBy
              queryParams={queryParams}
              filterKeys={filterKeys}
              handleFilterChange={handleFilterChange}
            />
            <SiteSearchSortOrder queryParams={queryParams} handleFilterChange={handleFilterChange} />
          </div>
        </Collapse>
        {renderFilters()}
      </List>
    </div>
  );
}
