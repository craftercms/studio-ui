/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

CStudioAuthoring.ContextualNav.WcmRootFolder.RegionalOverride = CStudioAuthoring.ContextualNav.WcmRootFolder
  .RegionalOverride || {
  Self: this,
  region: '',

  init: function (moduleConfig) {
    Self.region = moduleConfig.config.region;
    Self.filterFolders = this.filterFolders;
  },

  _renderContextMenu: function (tree, target, p_aArgs, component, menuItems, oCurrentTextNode, isWrite) {
    var data = {
      tree: tree,
      currentTextNode: oCurrentTextNode,
      region: Self.region
    };

    p_aArgs.addItems([menuItems.separator]);
    p_aArgs.addItems([
      {
        text: CMgs.format(siteDropdownLangBundle, 'Add Regional Content'),
        onclick: {
          fn: CStudioAuthoring.ContextualNav.WcmRootFolder.RegionalOverride.createRegionalContent,
          obj: data
        }
      }
    ]);
  },

  createRegionalContent: function (action, evt, data) {
    var createCb = {
      success: function () {
        this.callingWindow.location.reload(true);
      },
      failure: function () {},
      callingWindow: window
    };

    var path = oCurrentTextNode.data.path;
    if (path.indexOf('/' + data.region) == -1) {
      path += '/' + data.region;
    }
    CStudioAuthoring.Operations.createNewContent(CStudioAuthoringContext.site, path, false, createCb);
  },

  filterItem: function (treeItem) {
    var filterFolders = ['lac', 'usa', 'euro'];

    for (var i = 0; i < filterFolders.length; i++) {
      if (filterFolders[i] === treeItem.name) {
        if (filterFolders[i] != Self.region) {
          return true;
        } else {
          return false;
        }
      }
    }

    return false;
  },

  drawTreeItem: function (treeNodeTO, root, treeNode) {
    if (treeNodeTO.fileName == Self.region) {
      treeNode.label = Self.region.toUpperCase() + ' ' + treeNode.parent.label.replace('*', '') + 'Regional Content';
    }
    return treeNode;
  }
};

CStudioAuthoring.Module.moduleLoaded(
  'regional-override',
  CStudioAuthoring.ContextualNav.WcmRootFolder.RegionalOverride
);
