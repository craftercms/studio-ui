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
import { ClickAwayListener, Paper, Popper } from '@material-ui/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { useActiveSiteId, useContentTypeList, useLogicResource } from '../../utils/hooks';
import { search } from '../../services/search';
import PathNavigatorList from '../Navigation/PathNavigator/PathNavigatorList';
import { parseLegacyItemToDetailedItem } from '../../utils/content';
import Suspencified from '../SystemStatus/Suspencified';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      width: '100%'
    },
    input: {
      width: '100%'
    },
    list: {
      width: '100%'
    },
    progress: {
      position: 'absolute',
      right: 0
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

  const resource = useLogicResource<any, any>(items, {
    shouldResolve: (source) => Boolean(source),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source.map((item) => parseLegacyItemToDetailedItem(item)),
    errorSelector: (source) => null
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
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
      <div className={classes.container}>
        <InputBase
          value={keyword}
          onChange={(e) => onChange(e)}
          placeholder={placeholder}
          disabled={disabled}
          className={classes.input}
          classes={{ root: props.classes?.root, input: props.classes?.input }}
          onKeyDown={onKeyDown}
          endAdornment={
            isFetching ? <CircularProgress className={classes.progress} size={15} /> : null
          }
        />
        <Popper
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          placement="bottom-end"
          disablePortal
          popperOptions={{
            modifiers: {
              offset: {
                offset: '52, 10'
              }
            }
          }}
        >
          <Paper className={props.classes?.popoverRoot}>
            <Suspencified>
              <PathNavigatorList
                resource={resource}
                onItemClicked={() => {}}
                showArrow={false}
                classes={{ root: classes.list }}
              />
            </Suspencified>
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
