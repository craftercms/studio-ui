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

import InputBase from '@mui/material/InputBase';
import React, { useEffect, useState } from 'react';
import { catchError, debounceTime, switchMap, tap } from 'rxjs/operators';
import { search } from '../../services/search';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import useAutocomplete from '@mui/material/useAutocomplete';
import { SearchItem } from '../../models/Search';
import { CircularProgress, IconButton, List, ListItemIcon, ListItemText, Paper } from '@mui/material';
import LoadingState from '../LoadingState/LoadingState';
import EmptyState from '../EmptyState/EmptyState';
import Page from '../../icons/Page';
import CloseIcon from '@mui/icons-material/Close';
import { getPreviewURLFromPath } from '../../utils/path';
import { FormattedMessage } from 'react-intl';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import palette from '../../styles/palette';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useContentTypeList } from '../../hooks/useContentTypeList';
import { useSubject } from '../../hooks/useSubject';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { of } from 'rxjs';
import ListItemButton from '@mui/material/ListItemButton';

export interface PagesSearchAheadProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onEnter(url: string): void;
  onFocus?(): void;
  onBlur?(): void;
  classes: Partial<Record<'input', string>>;
  autoFocus?: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    width: '100%',
    position: 'relative'
  },
  closeIcon: {
    padding: '3px'
  },
  progress: {
    position: 'absolute',
    right: 0
  },
  inputRoot: {
    width: '100%',
    background: 'none'
  },
  input: {},
  paper: {
    width: 400,
    position: 'absolute',
    right: '-52px',
    top: '50px'
  },
  listBox: {
    overflow: 'auto',
    maxHeight: 600,
    margin: 0,
    padding: 0,
    listStyle: 'none',
    '& li[data-focus="true"]': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    },
    '& li:active': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      color: 'white'
    }
  },
  listItemIcon: {
    minWidth: 'auto',
    paddingRight: '16px'
  },
  highlighted: {
    display: 'inline-block',
    background: 'yellow',
    color: theme.palette.mode === 'dark' ? palette.gray.medium6 : theme.palette.text.secondary
  }
}));

export function PagesSearchAhead(props: PagesSearchAheadProps) {
  const { value, placeholder = '', disabled = false, onEnter, onFocus, onBlur, autoFocus = true } = props;
  const { classes, cx } = useStyles();
  const onSearch$ = useSubject<string>();
  const site = useActiveSiteId();
  const contentTypes = useContentTypeList((contentType) => contentType.id?.startsWith('/page'));
  const [keyword, setKeyword] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [items, setItems] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, getListboxProps, getOptionProps, groupedOptions, popupOpen } = useAutocomplete({
    freeSolo: true,
    inputValue: keyword,
    disableCloseOnSelect: true,
    onInputChange: (e, value, reason) => {
      if (reason === 'reset') {
        const previewUrl = getPreviewURLFromPath(value);
        setKeyword(previewUrl);
        onEnter(previewUrl);
        setDirty(false);
      } else {
        setKeyword(value);
        if (value) {
          onSearch$.next(value);
        } else {
          setDirty(true);
        }
      }
    },
    options: keyword && items ? items : [],
    filterOptions: (options: SearchItem[], state) => options,
    getOptionLabel: (item: SearchItem | string) => {
      return typeof item === 'string' ? item : item.path;
    },
    isOptionEqualToValue: (option, value) => option.path === value.path
  });

  useEffect(() => {
    setKeyword(value);
  }, [value]);

  useEffect(() => {
    const subscription = onSearch$
      .pipe(
        tap(() => {
          setIsFetching(true);
          setError(null);
          setDirty(true);
        }),
        debounceTime(400),
        switchMap((keywords) => {
          return search(site, {
            // Cleaning of searchKeywords due to security validations for characters like '?', '#' in the back.
            keywords: keywords.replace(/(\?|#).*/, ''),
            filters: {
              'content-type': contentTypes.map((contentType) => contentType.id)
            }
          }).pipe(
            catchError(({ response }) => {
              setIsFetching(false);
              setError(response.response);
              setItems(null);
              return of({ items: null });
            })
          );
        })
      )
      .subscribe((response) => {
        setIsFetching(false);
        setItems(response.items);
      });
    return () => subscription.unsubscribe();
  }, [contentTypes, onSearch$, site]);

  const onClean = () => {
    setItems(null);
    setKeyword(value);
    setDirty(false);
  };

  const inputProps: { [key: string]: any } = getInputProps();

  return (
    <div className={classes.container}>
      <div {...getRootProps()}>
        <InputBase
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              if (keyword.startsWith('/')) {
                onEnter(keyword);
              } else if (groupedOptions.length > 0) {
                // TODO:
                //   1. Fix typing so cast is not required
                const previewUrl = getPreviewURLFromPath((groupedOptions[0] as SearchItem).path);
                onEnter(previewUrl);
                setKeyword(previewUrl);
              }
              setItems(null);
              setDirty(false);
            }
          }}
          onFocus={(e) => {
            onFocus?.();
            inputProps.onFocus(e);
            e.target.select();
          }}
          onBlur={(e) => {
            onBlur?.();
            inputProps.onFocus(e);
            onClean();
          }}
          autoFocus={autoFocus}
          placeholder={placeholder}
          disabled={disabled}
          classes={{ root: classes.inputRoot, input: cx(classes.input, props.classes?.input) }}
          endAdornment={
            isFetching ? (
              <CircularProgress className={classes.progress} size={15} />
            ) : keyword && keyword !== value ? (
              <IconButton className={classes.closeIcon} onClick={onClean} size="large">
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null
          }
          inputProps={inputProps}
        />
      </div>
      {popupOpen && dirty && (
        <Paper className={classes.paper}>
          {isFetching && <LoadingState />}
          {!isFetching && error && <ApiResponseErrorState error={error} imageUrl={null} />}
          {!isFetching && groupedOptions.length > 0 && (
            <List dense className={classes.listBox} {...getListboxProps()}>
              {(groupedOptions as SearchItem[]).map((option, index) => (
                <ListItemButton dense component="li" {...getOptionProps({ option, index })}>
                  <ListItemIcon className={classes.listItemIcon}>
                    <Page />
                  </ListItemIcon>
                  <Option
                    name={option.name}
                    path={getPreviewURLFromPath(option.path)}
                    keyword={keyword}
                    highlighted={classes.highlighted}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
          {!isFetching && !error && groupedOptions.length === 0 && (
            <EmptyState
              title={<FormattedMessage id="searchAhead.noResults" defaultMessage="No Results." />}
              styles={{
                image: {
                  width: 100
                }
              }}
            />
          )}
        </Paper>
      )}
    </div>
  );
}

function Option(props) {
  const { name, path, keyword, highlighted } = props;
  const nameMatches = match(name, keyword);
  const pathMatches = match(path, keyword);
  const nameParts = parse(name, nameMatches);
  const pathParts = parse(path, pathMatches);

  return (
    <ListItemText
      primary={
        <>
          {nameParts.map((part, i) =>
            part.highlight ? (
              <span key={i} className={highlighted}>
                {' '}
                {part.text}{' '}
              </span>
            ) : (
              part.text
            )
          )}
        </>
      }
      secondary={
        <>
          {pathParts.map((part, i) =>
            part.highlight ? (
              <span key={i} className={highlighted}>
                {' '}
                {part.text}{' '}
              </span>
            ) : (
              part.text
            )
          )}
        </>
      }
    />
  );
}

export default PagesSearchAhead;
