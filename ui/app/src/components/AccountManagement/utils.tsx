/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { FormattedMessage } from 'react-intl';
import {
  removeStoredEditModeChoice,
  removeStoredEditModePadding,
  removeStoredGlobalAppOpenSidebar,
  removeStoredGlobalMenuSiteViewPreference,
  removeStoredHighlightModeChoice,
  removeStoredICEToolsPanelPage,
  removeStoredICEToolsPanelWidth,
  removeStoredLegacyComponentPanel,
  removeStoredOutdatedXBValidationDate,
  removeStoredPreviewToolsPanelPage,
  removeStoredPreviewToolsPanelWidth,
  removeStoredPullBranch,
  removeStoredPullMergeStrategy,
  removeStoredPushBranch,
  removeStoredSaveButtonSubAction,
  removeStoredShowToolsPanel
} from '../../utils/state';

export const preferencesGroups = [
  {
    label: <FormattedMessage defaultMessage="Preview sidebar widths" />,
    onClear: (props) => {
      removeStoredPreviewToolsPanelWidth(props.siteId, props.username);
      removeStoredICEToolsPanelWidth(props.siteId, props.username);
    }
  },
  {
    label: <FormattedMessage defaultMessage="Preview's left sidebar navigator state" />,
    onClear: (props) => {}
  },
  {
    label: <FormattedMessage defaultMessage="Preview's left sidebar selected tool" />,
    onClear: (props) => {
      removeStoredPreviewToolsPanelPage(props.siteUuid, props.username);
    }
  },
  {
    label: <FormattedMessage defaultMessage="Preview's right sidebar selected tool" />,
    onClear: (props) => {
      removeStoredICEToolsPanelPage(props.siteUuid, props.username);
    }
  },
  {
    label: <FormattedMessage defaultMessage="Preview's left sidebar open/collapsed" />,
    onClear: (props) => {
      removeStoredShowToolsPanel(props.siteUuid, props.username);
    }
  },
  {
    label: <FormattedMessage defaultMessage="Preview's editing state" />,
    onClear: (props) => {
      removeStoredEditModeChoice(props.username); // TODO: this needs an update after https://github.com/craftercms/studio-ui/pull/3411 is merged
      removeStoredHighlightModeChoice(props.username);
      removeStoredEditModePadding(props.username);
      removeStoredLegacyComponentPanel(props.username);
    }
  },
  {
    label: <FormattedMessage defaultMessage="Git settings" />,
    onClear: (props) => {
      removeStoredPushBranch(props.siteUuid, props.username);
      removeStoredPullBranch(props.siteUuid, props.username);
      removeStoredPullMergeStrategy(props.siteUuid, props.username);
    }
  },
  {
    label: <FormattedMessage defaultMessage="Form settings" />,
    onClear: (props) => {
      // Ids of save buttons are 'codeEditor', 'contentTypeEditor' and 'formEditor'. How can we dynamically get these?
      removeStoredSaveButtonSubAction(props.username, 'codeEditor');
      removeStoredSaveButtonSubAction(props.username, 'contentTypeEditor');
      removeStoredSaveButtonSubAction(props.username, 'formEditor');
    }
  },
  {
    label: <FormattedMessage defaultMessage="Miscellaneous" />,
    onClear: (props) => {
      removeStoredGlobalAppOpenSidebar(props.username);
      removeStoredGlobalMenuSiteViewPreference(props.username);
      removeStoredOutdatedXBValidationDate(props.siteId, props.username);
    }
  }
];
