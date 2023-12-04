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

import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { FormattedMessage } from 'react-intl';
import Select, { SelectProps } from '@mui/material/Select';
import useStyles from './styles';
import { isBlank } from '../../utils/string';
import { changeSite } from '../../state/actions/sites';
import { setSiteCookie } from '../../utils/auth';
import { useDispatch } from 'react-redux';
import { useEnv } from '../../hooks/useEnv';
import { useSiteList } from '../../hooks/useSiteList';
import { getSystemLink } from '../../utils/system';
import { PREVIEW_URL_PATH } from '../../utils/constants';
import useMinimizedDialogWarning from '../../hooks/useMinimizedDialogWarning';
import SiteStatusIndicator from '../SiteStatusIndicator/SiteStatusIndicator';
import { previewSwitch } from '../../services/security';

export interface SiteSwitcherSelectProps extends SelectProps {
  site: string;
}

function SiteSwitcherSelect(props: SiteSwitcherSelectProps) {
  const { site, ...rest } = props;
  const sites = useSiteList();
  const { classes, cx: clsx } = useStyles();
  const { authoringBase, useBaseDomain } = useEnv();
  const dispatch = useDispatch();
  const checkMinimized = useMinimizedDialogWarning();

  const onSiteChange = ({ target: { value } }) => {
    if (!isBlank(value) && site !== value && !checkMinimized()) {
      if (window.location.href.includes(PREVIEW_URL_PATH)) {
        dispatch(changeSite(value));
      } else {
        setSiteCookie(value, useBaseDomain);
        previewSwitch().subscribe(() => {
          window.location.href = getSystemLink({
            site: value,
            systemLinkId: 'preview',
            authoringBase
          });
        });
      }
    }
  };

  return (
    <Select
      displayEmpty
      variant="standard"
      {...rest}
      className={clsx(classes.menuRoot, props.className)}
      classes={{
        ...props.classes,
        select: clsx(classes.input, props.classes?.select, classes.menu)
      }}
      value={site}
      onChange={onSiteChange}
    >
      {sites.length === 0 && (
        <MenuItem value="">
          <FormattedMessage id="siteSwitcherSelected.siteSelectorNoSiteSelected" defaultMessage="Choose site" />
        </MenuItem>
      )}
      {sites.map(({ id, name, state }) => (
        <MenuItem key={id} value={id} className={classes.menuItem} disabled={state !== 'READY'}>
          {name}
          {state !== 'READY' && <SiteStatusIndicator state={state} size={16} sx={{ float: 'right', ml: 1 }} />}
        </MenuItem>
      ))}
    </Select>
  );
}

export default SiteSwitcherSelect;
