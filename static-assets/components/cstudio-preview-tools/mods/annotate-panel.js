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

CStudioAuthoring.Utils.addJavascript(
  '/static-assets/components/cstudio-preview-tools/mods/annotate/dist/drawingboard.js'
);
CStudioAuthoring.Utils.addCss('/static-assets/components/cstudio-preview-tools/mods/annotate/dist/drawingboard.css');

var crafterSocial_cfg = {
  // The SUI base URL
  'url.base': '/static-assets/sui/',
  // The fixtures URL. May be relative.
  // 'url.service'                   : '/static-assets/sui/fixtures/api/2/',
  'url.service': '/crafter-social/api/2/',
  // The Templates URL. May be relative.
  'url.templates': '/static-assets/sui/templates/',
  // 'url.security'                  : '...',
  // 'url.ugc.file'                  : '{attachmentId}.json',
  // 'url.ugc.{id}.get_attachments'  : '.json?tenant={tenant}',
  // 'url.ugc.{id}.add_attachment'   : '.json'
  'url.ugc.rating': '/ugc/create.json'
};

function crafterSocial_onAppReady(director, CrafterSocial) {
  Xdirector = director;
  // Initialise the "session user".
  director.setProfile({
    displayName: 'You',
    roles: ['SOCIAL_ADVISORY', 'SOCIAL_ADMIN', 'SOCIAL_MODERATOR']
  });
}

/**
 * editor tools
 */
CStudioAuthoring.AnnotatePanel = CStudioAuthoring.AnnotatePanel || {
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
    containerEl.style.height = '300px';
  },

  expand: function (containerEl, config) {
    try {
      var boardEl = document.getElementById('default-board');

      if (boardEl) {
        document.body.removeChild(boardEl);
      }

      var boardEl = document.createElement('div');
      boardEl.id = 'default-board';

      boardEl.style.width = '100%';
      boardEl.style.height = '80%';
      boardEl.style.position = 'absolute';
      boardEl.style.top = '0';
      boardEl.style.zIndex = 10;

      boardEl.id = 'default-board';
      document.body.appendChild(boardEl);

      var defaultBoard = new DrawingBoard.Board('default-board', {
        background: 'transparent',
        color: 'blue',
        size: 5,
        fillTolerance: 150,
        controls: [
          'Color',
          { Size: { type: 'range', min: 3, max: 42 } },
          { DrawingMode: { filler: false } },
          'Navigation',
          { Comment: { type: 'range', min: 12, max: 42 } }
          //
          //	{ Navigation: { back: false, forward: false } },
          //	'DrawingMode'
          //"comment"
        ],
        webStorage: 'local'
      });

      var controlsEl = YAHOO.util.Dom.getElementsByClassName('drawing-board-controls')[0];
      containerEl.appendChild(controlsEl);
      controlsEl.style.width = '226px';
      controlsEl.style.display = 'inline-block';
      controlsEl.style.styleFloat = 'left';

      // var layersEl = document.createElement("div");
      // layersEl.style.display = "inline-block";
      // layersEl.style.height = "300px";
      // layersEl.style.width = "300px";
      // layersEl.style.styleFloat = "left";
      // layersEl.style.marginLeft = "30px";
      // layersEl.innerHTML = "<h4>Layers</h4><button>Create Layer</button><button>Delete Layer</button><ul><li><input type='checkbox'/>Layer 1</li><li><input type='checkbox'/>Layer 1</li><li><input type='checkbox'/>Layer 1</li><li><input type='checkbox'/>Layer 1</li><ul>"
      // containerEl.appendChild(layersEl);
    } catch (err) {
      var CMgs = CStudioAuthoring.Messages;
      var langBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);
      CStudioAuthoring.Operations.showSimpleDialog(
        'err-dialog',
        CStudioAuthoring.Operations.simpleDialogTypeINFO,
        CMgs.format(langBundle, 'notification'),
        err,
        null,
        YAHOO.widget.SimpleDialog.ICON_BLOCK,
        'studioDialog'
      );
    }
  },

  collapse: function (containerEl, config) {
    var boardEl = document.getElementById('default-board');

    if (boardEl) {
      document.body.removeChild(boardEl);
    }
  }
};

setTimeout(function () {
  DrawingBoard.Control.Comment = DrawingBoard.Control.extend({
    name: 'comment',

    defaults: {
      type: 'auto',
      dropdownValues: [1, 3, 6, 10, 20, 30, 40, 50],
      min: 1,
      max: 50
    },

    types: ['dropdown', 'range'],

    initialize: function () {
      var tpl = this._template();

      this.$el.append($(tpl));
      /*
		this.board.dom.$canvas.on('mousedown touchstart', $.proxy(function(e) {
			if(annotationMode == "on") {
			 var id = CStudioAuthoring.Utils.generateUUID();
			 var commentEl = document.createElement("div");
			 commentEl.id = id;
			 document.body.appendChild(commentEl);

			commentEl.style.position = "absolute";
			commentEl.style.top = ""+this.board.coords.current.y+"px";
			commentEl.style.left = ""+this.board.coords.current.x+"px";
			//commentEl.style.border = "1px solid red";
			commentEl.style.height = "30px";
			commentEl.style.width = "30px";
			commentEl.style.zIndex = "11";
			//commentEl.innerHTML = "<p>Foo</p>"


			Xdirector.socialise({
           		target: "#"+id ,
            	tenant: 'craftercms'
        	});
		}

		}, this));
*/

      setTimeout(function () {
        var annotateOnOffEl = document.getElementById('annotate');

        annotateOnOffEl.onClick = function () {
          try {
            if (annotationMode == 'on') {
              annotationMode = 'off';
            } else {
              annotationMode = 'on';
            }
          } catch (err) {
            annotationMode = 'on';
          }
        };
      }, 1000);
    },

    _template: function () {
      var tpl = '<button id="annotate" class="drawing-board-control-download-button"></button>';

      return tpl;
    },

    onBoardReset: function (opts) {
      this.updateView();
    },

    updateView: function () {}
  });
}, 1000);

CStudioAuthoring.Module.moduleLoaded('annotate-panel', CStudioAuthoring.AnnotatePanel);
