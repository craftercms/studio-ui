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

import InputBase from '@material-ui/core/InputBase';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { useActiveSiteId, useContentTypeList } from '../../utils/hooks';
import { search } from '../../services/search';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useAutocomplete } from '@material-ui/lab';
import { SearchItem } from '../../models/Search';
import clsx from 'clsx';
import { CircularProgress, Paper } from '@material-ui/core';
import LoadingState from '../SystemStatus/LoadingState';
import EmptyState from '../SystemStatus/EmptyState';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      width: '100%',
      position: 'relative'
    },
    progress: {
      position: 'absolute',
      right: 0
    },
    inputRoot: {
      width: '100%'
    },
    input: {},
    paper: {
      width: 400,
      position: 'absolute',
      right: '-52px',
      top: '50px'
    },
    listBox: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      '& li[data-focus="true"]': {
        backgroundColor: '#4a8df6',
        color: 'white',
        cursor: 'pointer'
      },
      '& li:active': {
        backgroundColor: '#2977f5',
        color: 'white'
      }
    }
  })
);

export default function(props) {
  const { value, placeholder, disabled, onKeyDown } = props;
  const classes = useStyles({});
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const site = useActiveSiteId();
  const contentTypes = useContentTypeList((contentType) => contentType.id.startsWith('/page'));
  const [keyword, setKeyword] = useState(value);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFetching, setIsFetching] = useState(null);
  const [items, setItems] = useState(null);

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    popupOpen
  } = useAutocomplete({
    options: items ?? [],
    getOptionLabel: (item: SearchItem) => item.name,
    getOptionSelected: (option, value) => option.name === value.name
  });

  useEffect(() => {
    const subscription = onSearch$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((keyword: string) => {
        setIsFetching(true);
        search(site, {
          keywords: keyword,
          filters: {
            'content-type': contentTypes.map((contentType) => contentType.id)
          }
        }).subscribe((response) => {
          setIsFetching(false);
          setItems(response.items);
        });
      });
    return () => subscription.unsubscribe();
  }, [contentTypes, onSearch$, site]);

  const onChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setKeyword(e.target.value);
    onSearch$.next(e.target.value);
    if (!anchorEl) {
      setAnchorEl(e.target);
    }
  };

  return (
    <div className={classes.container}>
      <div {...getRootProps()}>
        <InputBase
          {...getInputProps()}
          placeholder={placeholder}
          disabled={disabled}
          classes={{ root: classes.inputRoot, input: clsx(classes.input, props.classes?.input) }}
          value={keyword}
          onChange={(e) => onChange(e)}
          onKeyDown={(e) => {
            onKeyDown(e);
          }}
          endAdornment={
            isFetching ? <CircularProgress className={classes.progress} size={15} /> : null
          }
        />
      </div>
      {popupOpen && (
        <Paper className={classes.paper}>
          holita
          {isFetching && <LoadingState />}
          {isFetching === false && groupedOptions.length > 0 && (
            <ul className={classes.listBox} {...getListboxProps()}>
              {groupedOptions.map((option, index) => (
                <li {...getOptionProps({ option, index })}>{option.name}</li>
              ))}
            </ul>
          )}
          {isFetching === false && groupedOptions.length === 0 && <EmptyState title="no results" />}
        </Paper>
      )}
    </div>
  );
}
