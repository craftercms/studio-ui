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

CStudioAuthoring.ExperimentsPanel = CStudioAuthoring.ExperimentsPanel || {
  initialized: false,

  /**
   * initialize module
   */
  initialize: function (config) {
    if (this.initialized == false) {
      this.initialized = true;
    }
  },

  render: function (containerEl, config) {
    var experiments = config.config.experiments.experiment.length
      ? config.config.experiments.experiment
      : [config.config.experiments.experiment];
    var treeEl = document.createElement('div');
    treeEl.id = 'acnAbtestPanel';
    containerEl.appendChild(treeEl);

    var tree = new YAHOO.widget.TreeView('acnAbtestPanel');
    var rootNode = tree.getRoot();

    tree.subscribe('labelClick', function (node) {
      if (node.variation) {
        CStudioAuthoring.Operations.setPreview(node.variation.url);
      }
    });

    var experimentLabels = [];
    var variantLabels = [];

    for (var i = 0, il = experiments.length; i < il; i++) {
      var experiment = experiments[i];
      experiment.variations = experiment.variations.variation.length
        ? experiment.variations.variation
        : [experiment.variations.variation];

      var parentNode = new YAHOO.widget.TextNode(CMgs.format(previewLangBundle, experiment.title), rootNode, false);

      for (var j = 0, jl = experiment.variations.length; j < jl; j++) {
        var variation = experiment.variations[j];
        var childNode = new YAHOO.widget.TextNode(CMgs.format(previewLangBundle, variation.title), parentNode, false);
        childNode.variation = { url: variation.url };
        tree.draw();
      }
    }

    tree.draw();
    tree.expandAll();
    tree.collapseAll();

    for (var k = 0, kl = rootNode.children.length; k < kl; k++) {
      var experimentNode = rootNode.children[k];
      var experimentLabel = experimentNode.getContentEl().children[0];
      experimentLabel.style.color = '#0176B1';
      experimentLabel.style.fontWeight = 'bold';
      experimentLabel.style.background = 'none';

      for (var l = 0, ll = experimentNode.children.length; l < ll; l++) {
        var variantLabel = experimentNode.children[l].getContentEl().children[0];
        variantLabel.style.background = 'none';
        variantLabel.style.color = 'none';
        variantLabel.style.cursor = 'pointer';
      }
    }
  }
};

CStudioAuthoring.Module.moduleLoaded('experiments-panel', CStudioAuthoring.ExperimentsPanel);
