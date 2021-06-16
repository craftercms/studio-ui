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

import * as React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { FormattedMessage } from 'react-intl';
import Select, { SelectProps } from '@material-ui/core/Select';
import useStyles from './styles';
import { useEnv, usePreviewState, useSiteList } from '../../utils/hooks';
import { isBlank } from '../../utils/string';
import { changeSite } from '../../state/reducers/sites';
import { setSiteCookie } from '../../utils/auth';
import { getSystemLink } from '../LauncherSection';
import { useDispatch } from 'react-redux';

export interface SiteSwitcherSelectProps extends SelectProps {
  site: string;
}

function SiteSwitcherSelect(props: SiteSwitcherSelectProps) {
  const { site, ...rest } = props;
  const sites = useSiteList();
  const classes = useStyles();
  const { previewChoice } = usePreviewState();
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();

  const onSiteChange = ({ target: { value } }) => {
    if (!isBlank(value) && site !== value) {
      if (previewChoice[value] === '2') {
        dispatch(changeSite(value));
      } else {
        setSiteCookie(value);
        setTimeout(
          () =>
            (window.location.href = getSystemLink({
              site: value,
              systemLinkId: 'preview',
              previewChoice,
              authoringBase
            }))
        );
      }
    }
  };

  return (
    <Select
      value={site}
      displayEmpty
      variant="standard"
      className={classes.menuRoot}
      style={{ marginRight: 5 }}
      classes={{
        select: classes.input,
        selectMenu: classes.menu
      }}
      onChange={onSiteChange}
      {...rest}
    >
      {sites.length === 0 && (
        <MenuItem value="">
          <FormattedMessage id="siteSwitcherSelected.siteSelectorNoSiteSelected" defaultMessage="Choose site" />
        </MenuItem>
      )}
      {sites.map(({ id, name }) => (
        <MenuItem key={id} value={id} className={classes.menuItem}>
          {name}
        </MenuItem>
      ))}
    </Select>
  );
}

export default SiteSwitcherSelect;
