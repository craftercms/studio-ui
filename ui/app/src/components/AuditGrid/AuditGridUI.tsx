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

import { Resource } from '../../models/Resource';
import { AuditLog } from '../../models/Audit';
import { PagedArray } from '../../models/PagedArray';

interface AuditGridUIProps {
  resource: Resource<PagedArray<AuditLog>>;
}

export default function AuditGridUI(props: AuditGridUIProps) {
  const { resource } = props;
  resource.read();
  return <h1>TODO: AuditGridUI</h1>;
}
