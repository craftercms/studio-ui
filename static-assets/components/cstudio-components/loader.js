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

(function() {
  CStudioAuthoring.register('Env.ModuleMap', {
    moduleInfo: {},
    map: function(moduleId, classRef) {
      this.moduleInfo[moduleId] = classRef;
    },
    get: function(moduleId) {
      return this.moduleInfo[moduleId];
    }
  });
})();

/**
 * File: loader.js
 * Component ID: component-loader
 * @author: Roy Art
 * @date: 03.01.2011
 **/
(function() {
  var CStudioLoader,
    CustomEvent = YAHOO.util.CustomEvent;

  CStudioAuthoring.register('Component.Loader', function(usrCfg) {
    CStudioAuthoring.Component.Loader.superclass.constructor.apply(this, arguments);

    this.loadStartEvt = new CustomEvent('loader.event.loadstart', this);
    this.loadCompleteEvt = new CustomEvent('loader.event.loadcomplete', this);

    var onSuccess = this.onSuccess;
    var _this = this;
    this.onSuccess = function() {
      onSuccess && onSuccess.apply(this, arguments);
      _this.onEnd && _this.onEnd();
      _this.onEnd = null;
      _this.fire('loadComplete');
    };
  });

  CStudioLoader = CStudioAuthoring.Component.Loader;
  YAHOO.extend(CStudioLoader, YAHOO.util.YUILoader, {
    use: function() {
      var last = arguments[arguments.length - 1],
        callback = YAHOO.lang.isFunction(last) ? last : null,
        modules;

      if (callback) {
        modules = Array.prototype.splice.call(arguments, 0, arguments.length - 1);
        this.onEnd = callback;
      } else {
        modules = Array.prototype.splice.call(arguments, 0);
      }

      this.require.apply(this, modules);
      this.insert();
    },
    insert: function(o, type) {
      this.fire('loadStart');
      CStudioLoader.superclass.insert.apply(this, arguments);
    },
    on: function(evt, handler, context) {
      var e = this[evt + 'Evt'];
      e && e.subscribe(handler, context);
      return !!e;
    },
    fire: function(evt) {
      var e = this[evt + 'Evt'];
      e && e.fire();
    }
  });

  CStudioAuthoring.Env.ModuleMap.map('component-loader', CStudioLoader);
})();

(function() {
  CStudioAuthoring.namespace('Env.Loader');

  CStudioAuthoring.Env.Loader = new CStudioAuthoring.Component.Loader({
    loadOptional: true,
    base: CStudioAuthoringContext.baseUri + '/static-assets/'
  });

  var Env = CStudioAuthoring.Env,
    Loader = Env.Loader,
    emptyArray = [];

  Loader.addModule({
    type: 'js',
    name: 'component-dialogue',
    path: 'components/cstudio-components/dialogue.js?version=' + CStudioAuthoring.UIBuildId,
    requires: emptyArray
  });

  Loader.addModule({
    type: 'js',
    name: 'component-templateagent',
    path: 'components/cstudio-components/template-agent.js?version=' + CStudioAuthoring.UIBuildId,
    requires: emptyArray
  });

  Loader.addModule({
    type: 'js',
    name: 'component-dropbox',
    path: 'components/cstudio-components/dropbox.js?version=' + CStudioAuthoring.UIBuildId,
    requires: emptyArray
  });

  Loader.addModule({
    type: 'js',
    name: 'template-submitfordelete',
    path: 'components/cstudio-templates/submit-for-delete.js?version=' + CStudioAuthoring.UIBuildId,
    requires: emptyArray
  });

  Loader.addModule({
    type: 'js',
    name: 'template-incontextedit',
    path: 'components/cstudio-templates/in-context-edit.js?version=' + CStudioAuthoring.UIBuildId,
    requires: emptyArray
  });

  Loader.addModule({
    type: 'js',
    name: 'viewcontroller-base',
    path: 'components/cstudio-view-controllers/base.js?version=' + CStudioAuthoring.UIBuildId,
    requires: emptyArray
  });

  Loader.addModule({
    type: 'js',
    name: 'viewcontroller-basedelete',
    path: 'components/cstudio-view-controllers/base-delete.js?version=' + CStudioAuthoring.UIBuildId,
    requires: ['viewcontroller-base']
  });

  Loader.addModule({
    type: 'js',
    name: 'viewcontroller-submitfordelete',
    path: 'components/cstudio-view-controllers/submit-for-delete.js?version=' + CStudioAuthoring.UIBuildId,
    requires: ['viewcontroller-basedelete', 'component-templateagent', 'template-submitfordelete']
  });

  Loader.addModule({
    type: 'js',
    name: 'viewcontroller-in-context-edit',
    path: 'components/cstudio-view-controllers/in-context-edit.js?version=' + CStudioAuthoring.UIBuildId,
    requires: ['viewcontroller-base', 'component-templateagent', 'template-incontextedit']
  });

  Loader.addModule({
    type: 'js',
    name: 'publish-util',
    path: 'components/cstudio-view-controllers/publish-util.js?version=' + CStudioAuthoring.UIBuildId
  });

  Loader.addModule({
    type: 'js',
    name: 'dialog-bulkupload',
    path: 'components/cstudio-dialogs/bulk-upload.js?version=' + CStudioAuthoring.UIBuildId,
    requires: ['component-dropbox']
  });

  Loader.addModule({
    type: 'js',
    name: 'template-cancel-workflow',
    path: 'components/cstudio-templates/cancel-workflow.js?version=' + CStudioAuthoring.UIBuildId,
    requires: ['component-templateagent']
  });

  Loader.addModule({
    type: 'js',
    name: 'viewcontroller-cancel-workflow',
    path: 'components/cstudio-view-controllers/cancel-workflow.js?version=' + CStudioAuthoring.UIBuildId,
    requires: ['viewcontroller-base', 'template-cancel-workflow']
  });

  Loader.addModule({
    type: 'js',
    name: 'viewcontroller-requestdelete',
    path: 'components/cstudio-view-controllers/request-delete.js?version=' + CStudioAuthoring.UIBuildId,
    requires: ['viewcontroller-base']
  });

  Loader.addModule({
    type: 'js',
    name: 'jquery-datetimepicker',
    path: 'libs/datetimepicker/jquery.datetimepicker.js?version=' + CStudioAuthoring.UIBuildId,
    requires: ['jquery-datetimepicker-css']
  });

  Loader.addModule({
    type: 'js',
    name: 'jquery',
    path: 'libs/jquery/dist/jquery.js?version=' + CStudioAuthoring.UIBuildId
  });

  Loader.addModule({
    type: 'css',
    name: 'jquery-datetimepicker-css',
    path: 'libs/datetimepicker/jquery.datetimepicker.css?version=' + CStudioAuthoring.UIBuildId,
    requires: emptyArray
  });

  Loader.addModule({
    type: 'js',
    name: 'jquery-momentjs',
    path: 'jquery/timezones/timezones.full.js?version=' + CStudioAuthoring.UIBuildId
  });
})();
