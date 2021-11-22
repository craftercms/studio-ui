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

import React from 'react';
import { useReference } from '../../hooks/useReference';
import EmptyState from '../EmptyState/EmptyState';
import { FormattedMessage } from 'react-intl';
import ToolsPanelEmbeddedAppViewButton from '../ToolsPanelEmbeddedAppViewButton';

export function SiteToolsPanel() {
  const siteTools = useReference('craftercms.siteTools');
  return (
    <>
      {siteTools?.tools?.length ? (
        siteTools.tools.map((tool, index) => (
          <ToolsPanelEmbeddedAppViewButton
            key={index}
            title={tool.title}
            icon={tool.icon}
            widget={{
              ...tool.widget,
              configuration: { ...tool.widget?.configuration, embedded: true },
              uiKey: String(index)
            }}
          />
        ))
      ) : (
        <EmptyState
          title={
            <FormattedMessage
              id="siteTools.toolListingNotConfigured"
              defaultMessage="The site tools list has not been set"
            />
          }
          subtitle={
            <FormattedMessage
              id="siteTools.toolListingNotConfiguredSubtitle"
              defaultMessage="Please set the craftercms.siteTools reference on the ui.xml"
            />
          }
        />
      )}
    </>
  );
}

export default SiteToolsPanel;
