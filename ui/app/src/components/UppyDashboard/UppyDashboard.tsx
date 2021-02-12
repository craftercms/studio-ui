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

import Dashboard, { DashboardOptions } from '@craftercms/uppy-dashboard';
import { useEffect, useRef, useState } from 'react';

interface UppyDashboardProps {
  uppy: any;
  options?: DashboardOptions;
}

export default function UppyDashboard(props: UppyDashboardProps) {
  const { uppy, options } = props;
  const [plugin, setPlugin] = useState(null);
  const ref = useRef();

  useEffect(() => {
    uppy.use(Dashboard, { id: 'react:Dashboard', inline: true, ...options, target: ref.current });
    setPlugin(uppy.getPlugin(options.id ?? 'react:Dashboard'));

    return () => {
      uppy.removePlugin(plugin);
    };
  }, [options, plugin, uppy]);

  return <section ref={ref} />;
}
