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

import Person from './Person';

export interface SocketEventBase {
  siteId: string;
  timestamp: number;
  eventType: string;
  targetPath?: string;
  user: Person | null;
}

export type ContentEventPayload = SocketEventBase & { targetPath: string };

export type DeleteContentEventPayload = SocketEventBase & { targetPath: string };

export type DeleteContentEventsPayload = Omit<SocketEventBase, 'targetPath'> & { targetPaths: string[] };

export type MoveContentEventPayload = SocketEventBase & { targetPath: string; sourcePath: string };

export type LockContentEventPayload = SocketEventBase & { targetPath: string; locked: boolean };

export type PublishEventPayload = Omit<SocketEventBase, 'targetPath'>;

export type RepositoryEventPayload = Omit<SocketEventBase, 'targetPath' | 'user'> & { user: null };

export type WorkflowEventPayload = Omit<SocketEventBase, 'targetPath'>;

export default SocketEventBase;
