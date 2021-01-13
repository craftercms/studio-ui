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

/**
 * File:
 * Component ID: component-templateagent
 * @author: Roy Art
 * @date: 10.01.2011
 **/
(function() {
  var Lang = YAHOO.lang,
    Util = CStudioAuthoring.StringUtils,
    TemplateAgent;

  CStudioAuthoring.register('TemplateHolder.TemplateAgent', function() {
    this.init.apply(this, arguments);
  });

  TemplateAgent = CStudioAuthoring.TemplateHolder.TemplateAgent;

  TemplateAgent.prototype = {
    init: function(oTemplate) {
      this.oTemplate = oTemplate;
    },
    get: function(tmpl, pieces) {
      var template = this.oTemplate[tmpl];
      if (Lang.isArray(pieces)) {
        return Util.format.apply(Util, [template].concat(pieces.map((p) => CrafterCMSNext.util.string.escapeHTML(p))));
      } /* if (Lang.isObject(pieces)) */ else {
        return Util.advFormat(template, function(txt) {
          return CrafterCMSNext.util.string.escapeHTML(pieces[txt]) || '';
        });
      }
    }
  };
})();
