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
  removeStoredBrowseDialogCompactMode,
  removeStoredClipboard,
  removeStoredEditModeChoice,
  removeStoredEditModePadding,
  removeStoredGlobalAppOpenSidebar,
  removeStoredGlobalMenuSiteViewPreference,
  removeStoredHighlightModeChoice,
  removeStoredICEToolsPanelPage,
  removeStoredICEToolsPanelWidth,
  removeStoredItems,
  removeStoredLegacyComponentPanel,
  removeStoredOutdatedXBValidationDate,
  removeStoredPreviewBackgroundMode,
  removeStoredPreviewToolsPanelPage,
  removeStoredPreviewToolsPanelWidth,
  removeStoredPullBranch,
  removeStoredPullMergeStrategy,
  removeStoredPushBranch,
  removeStoredShowToolsPanel
} from '../../utils/state';

export const preferencesGroups: Array<{
  label: string | JSX.Element;
  onClear: (props: { siteId: string; siteUuid: string; username: string }) => void;
}> = [
  {
    label: <FormattedMessage defaultMessage="Preview sidebar widths" />,
    onClear: (props) => {
      removeStoredPreviewToolsPanelWidth(props.siteId, props.username);
      removeStoredICEToolsPanelWidth(props.siteId, props.username);
    }
  },
  {
    label: <FormattedMessage defaultMessage="Preview's left sidebar navigator state" />,
    onClear: (props) => {
      const pathNavigatorKeyRegex = new RegExp(
        `^craftercms.${props.username}.pathNavigator.${props.siteUuid}.[a-zA-Z0-9]+`
      );
      removeStoredItems((key) => pathNavigatorKeyRegex.test(key));

      const pathNavigatorTreeKeyRegex = new RegExp(
        `^craftercms.${props.username}.pathNavigatorTree.${props.siteUuid}.[a-zA-Z0-9]+`
      );
      removeStoredItems((key) => pathNavigatorTreeKeyRegex.test(key));
    }
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
    label: <FormattedMessage defaultMessage="Dashboard preferences" />,
    onClear: (props) => {
      // new dashlets
      const newDashletsKeyRegex = new RegExp(`^craftercms.${props.siteUuid}.[a-zA-Z0-9]+.dashletFilterTypeGroups`);
      removeStoredItems((key) => newDashletsKeyRegex.test(key));

      // Legacy dashlets
      const legacyDashletsKeyRegex = new RegExp(
        `^craftercms.dashboard.[a-zA-Z0-9]+.${props.siteUuid}.${props.username}`
      );
      removeStoredItems((key) => legacyDashletsKeyRegex.test(key));
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
      removeStoredItems((key) => key.includes(`craftercms.${props.username}.saveButtonSubAction.`));
    }
  },
  {
    label: <FormattedMessage defaultMessage="Miscellaneous" />,
    onClear: (props) => {
      removeStoredGlobalAppOpenSidebar(props.username);
      removeStoredGlobalMenuSiteViewPreference(props.username);
      removeStoredOutdatedXBValidationDate(props.siteId, props.username);
      removeStoredClipboard(props.siteUuid, props.username);
      removeStoredPreviewBackgroundMode(props.username);
      removeStoredBrowseDialogCompactMode(props.username);
    }
  }
];
