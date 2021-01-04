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
import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/KeyboardArrowDown';
import { camelize } from '../../utils/string';
import { makeStyles } from '@material-ui/core/styles';
import { ElasticParams, Facet, Filter as FilterType } from '../../models/Search';
import CheckIcon from '@material-ui/icons/Check';
import { LookupTable } from '../../models/LookupTable';
import SiteSearchSortBy from '../SiteSearchSortBy';
import SiteSearchSortOrder from '../SiteSearchSortOrder';
import SiteSearchFilter from '../SiteSearchFilter';
import PathSelector from '../SiteSearchPathSelector';
import Button from '@material-ui/core/Button';
import palette from '../../styles/palette';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { useSpreadState } from '../../utils/hooks';
import Divider from '@material-ui/core/Divider/Divider';

const useStyles = makeStyles((theme) => ({
  header: {
    width: '100%',
    padding: '10px 15px 10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: 'none',
    color: theme.palette.type === 'dark' ? palette.white : ''
  },
  accordionTitle: {
    display: 'flex',
    fontWeight: 600,
    alignItems: 'center'
  },
  clearButtonContainer: {
    padding: '10px 20px',
    '& button': {
      fontWeight: 600
    }
  },
  divider: {
    width: 'auto',
    margin: '0 10px'
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
  const classes = useStyles();
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
  const [expanded, setExpanded] = useSpreadState({
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
    setExpanded({ [item]: !expanded[item] });
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

  return (
    <div>
      <Accordion expanded={expanded.sortBy} elevation={0} onChange={() => handleExpandClick('sortBy')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.accordionTitle}>
            {formatMessage(messages.sortBy)}
            {queryParams['sortBy'] && <CheckIcon />}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <>
            <SiteSearchSortBy
              queryParams={queryParams}
              filterKeys={filterKeys}
              handleFilterChange={handleFilterChange}
            />
            <SiteSearchSortOrder queryParams={queryParams} handleFilterChange={handleFilterChange} />
          </>
        </AccordionDetails>
      </Accordion>
      <Divider className={classes.divider} />
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
      <Accordion expanded={expanded.path} elevation={0} onChange={() => handleExpandClick('path')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.accordionTitle}>
            {formatMessage(messages.path)}
            {queryParams['path'] && <CheckIcon />}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <PathSelector
            value={selectedPath?.replace('.+', '')}
            onPathSelected={onPathSelected}
            disabled={mode === 'select'}
          />
        </AccordionDetails>
      </Accordion>
      {filterKeys.map((key: string) => (
        <Accordion key={key} expanded={expanded[key] ?? false} elevation={0} onChange={() => handleExpandClick(key)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.accordionTitle}>
              {formatMessage(messages[camelize(key)])}
              {checkedFilters[key] && <CheckIcon />}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <SiteSearchFilter
              facet={key}
              handleFilterChange={handleFilterChange}
              checkedFilters={checkedFilters}
              setCheckedFilters={setCheckedFilters}
              facetsLookupTable={facetsLookupTable}
              handleClearClick={handleClearClick}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
