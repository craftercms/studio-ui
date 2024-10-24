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

import React, { ReactElement, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { UNDEFINED } from '../../utils/constants';
import { checkPathExistence } from '../../services/content';
import { takeUntil } from 'rxjs/operators';
import useUnmount$ from '../../hooks/useUnmount$';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import CircularProgress from '@mui/material/CircularProgress';
import { CheckRounded, ErrorRounded } from '@mui/icons-material';
import { withoutFile, withoutIndex } from '../../utils/path';
import useUpdateRefs from '../../hooks/useUpdateRefs';

export interface PathSelectionInputProps {
  rootPath: string;
  currentPath?: string;
  allowFiles?: boolean;
  startAdornment?: ReactElement;
  onChange?(path: string): void;
}

export function PathSelectionInput(props: PathSelectionInputProps) {
  const { rootPath = '', currentPath = '', allowFiles = false, onChange: onChangeProp, startAdornment } = props;
  const unmount$ = useUnmount$();
  const site = useActiveSiteId();
  const [path, setPath] = useState('');
  const [pathExists, setPathExists] = useState<boolean | null>(null); // null = unchecked
  const [isChecking, setIsChecking] = useState(false);

  const getFullPath = () => `${rootPath}${path}`.trim();

  const check = () => {
    setIsChecking(true);
    let value = getFullPath();
    if (!allowFiles) {
      value = withoutFile(value);
    }
    value = value.replace(/\/$/, '');
    setPath(value.substr(rootPath.length));
    checkPathExistence(site, value)
      .pipe(takeUntil(unmount$))
      .subscribe({
        next(exists) {
          setIsChecking(false);
          setPathExists(exists);
          exists && refs.current.onChange?.(value);
        },
        error() {
          setIsChecking(false);
          setPathExists(false);
        }
      });
  };

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      check();
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPath(event.target.value);
    setPathExists(null);
  };

  const refs = useUpdateRefs({ rootPath, onChange: onChangeProp, getFullPath });

  useEffect(() => {
    const newPath = withoutIndex(currentPath.startsWith(rootPath) ? currentPath.substr(rootPath.length) : currentPath);
    if (`${rootPath}${newPath}` !== refs.current.getFullPath()) {
      setPathExists(null);
      setIsChecking(false);
      setPath(newPath);
    }
  }, [refs, rootPath, currentPath]);

  return (
    <FormControl sx={{ mb: 1 }}>
      <TextField
        fullWidth
        value={path}
        onKeyPress={onKeyPress}
        onChange={onChange}
        error={pathExists === false}
        aria-describedby="pathInputTextField"
        label={<FormattedMessage id="words.path" defaultMessage="Path" />}
        slotProps={{
          input: {
            startAdornment: rootPath ? (
              <InputAdornment position="start" sx={{ mr: 0 }}>
                {startAdornment}
                {rootPath}
              </InputAdornment>
            ) : (
              UNDEFINED
            ),
            endAdornment: isChecking ? (
              <InputAdornment position="end" sx={{ width: 20, height: 20 }}>
                <CircularProgress variant="indeterminate" size={20} />
              </InputAdornment>
            ) : pathExists === true ? (
              <InputAdornment position="end">
                <CheckRounded color="success" />
              </InputAdornment>
            ) : pathExists === false ? (
              <InputAdornment position="end">
                <ErrorRounded color="error" />
              </InputAdornment>
            ) : (
              UNDEFINED
            )
          }
        }}
      />
      <FormHelperText id="pathInputTextFieldHelper" error={pathExists === false}>
        {pathExists ? (
          <FormattedMessage id="pathSelectionInput.found" defaultMessage="Path found" />
        ) : pathExists === false ? (
          <FormattedMessage id="pathSelectionInput.invalidPath" defaultMessage="The entered path doesn't exist" />
        ) : (
          <FormattedMessage
            id="pathSelectionInput.description"
            defaultMessage="Enter a path and press `enter` to validate"
          />
        )}
      </FormHelperText>
    </FormControl>
  );
}

export default PathSelectionInput;
