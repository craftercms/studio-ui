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
(function () {
  var EncryptTool =
  /*#__PURE__*/
  function () {
    function EncryptTool(config, el) {
      CrafterCMSNext.util.babel.classCallCheck(this, EncryptTool);
      this.containerEl = el;
      this.config = config;
      this.types = [];
    }

    CrafterCMSNext.util.babel.createClass(EncryptTool, [{
      key: "initialize",
      value: function initialize(config) {
        this.config = config;
      }
    }, {
      key: "renderWorkarea",
      value: function renderWorkarea() {
        var workarea = document.querySelector('#cstudio-admin-console-workarea');
        var el = document.createElement('div');
        $(workarea).html('');
        workarea.appendChild(el);
        CrafterCMSNext.render(el, 'EncryptTool');
      }
    }]);
    return EncryptTool;
  }();

  CStudioAuthoring.Module.moduleLoaded('cstudio-console-tools-encrypt-tool', EncryptTool);
})();
