/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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
import clsx from 'clsx';
import { FormHelperText, InputBase, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';
import { usePathSelectedStyles } from './styles';

export interface PathSelectedProps {
  rootPath: string;
  currentPath: string;
  invalidPath: boolean;
  isFetching: boolean;
  onPathChanged(path: string): void;
  onKeyPress?(event: React.KeyboardEvent): void;
}

export function PathSelected(props: PathSelectedProps) {
  const { rootPath, currentPath, onPathChanged, invalidPath, isFetching, onKeyPress: onInputChanges } = props;
  const classes = usePathSelectedStyles();
  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState(null);

  useEffect(() => {
    setValue(currentPath);
  }, [currentPath]);

  const onBlur = () => {
    setFocus(false);
    let path = rootPath + value;
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    onPathChanged(path);
  };

  const onKeyPress = (event: React.KeyboardEvent) => {
    if (event.charCode === 13) {
      let path = rootPath + value;
      if (path !== '/' && path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      onPathChanged(path);
    } else {
      onInputChanges?.(event);
    }
  };

  return (
    <>
      <section className={clsx(classes.wrapper, invalidPath && 'invalid')}>
        <Typography className={classes.selected} display="inline" color="textSecondary">
          <FormattedMessage id="words.selected" defaultMessage="Selected" />
        </Typography>
        <Typography color="textSecondary" display="inline">
          {rootPath}
        </Typography>
        <InputBase
          className={invalidPath ? classes.invalid : null}
          onFocus={() => setFocus(true)}
          onBlur={onBlur}
          onKeyPress={onKeyPress}
          onChange={(e) => setValue(e.currentTarget.value)}
          classes={{ root: classes.root, input: classes.invisibleInput }}
          value={focus ? value : currentPath}
          endAdornment={isFetching ? <CircularProgress size={16} /> : null}
        />
      </section>
      {invalidPath && (
        <FormHelperText error>
          <FormattedMessage id="folderBrowserTreeView.invalidPath" defaultMessage="The entered path doesn’t exist." />
        </FormHelperText>
      )}
    </>
  );
}
