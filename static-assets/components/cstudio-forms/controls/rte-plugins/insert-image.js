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

CStudioForms.Controls.RTE.ImageInsert = CStudioForms.Controls.RTE.ImageInsert || {
  /**
   * Initializes the plugin
   * @param {tinymce2.Editor} ed Editor instance that the plugin is initialized in.
   * @param {string} url Absolute URL to where the plugin is located.
   */
  init: function (ed, url) {
    var _self = this;
    var beforeSaveCb = {
      beforeSave: function () {
        var docBodyEl = ed.dom.doc.body;

        if (docBodyEl) {
          var imgEls = docBodyEl.getElementsByTagName('img');

          if (imgEls.length > 0) {
            for (var i = --imgEls.length; i >= 0; i--) {
              var currentEl = imgEls[i];

              var relativeUrl = _self.cleanUrl(currentEl.src);
              currentEl.setAttribute('src', relativeUrl);
              currentEl.setAttribute('data-mce-src', relativeUrl);
            }
            ed.contextControl.save();
          }
        }
      },
      editor: ed
    };

    ed.contextControl.form.registerBeforeSaveCallback(beforeSaveCb);

    // Register the command so that it can be invoked by using tinymce2.activeEditor.execCommand('mceExample');
    ed.addCommand('mceInsertManagedImage', function (param, datasource) {
      var CMgs = CStudioAuthoring.Messages;
      var langBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);

      if (datasource) {
        if (datasource.insertImageAction) {
          datasource.insertImageAction({
            success: function (imageData) {
              var cleanUrl = imageData.relativeUrl.replace(/^(.+?\.(png|jpe?g)).*$/i, '$1'); //remove timestamp
              var actualCaretPositionBookmark = { id: ed.id };

              ed.selection.moveToBookmark(actualCaretPositionBookmark);

              if (
                !(
                  cleanUrl.indexOf('?crafterCMIS=true') !== -1 ||
                  cleanUrl.indexOf('http') !== -1 ||
                  cleanUrl.indexOf('remote-assets') !== -1
                )
              ) {
                CStudioAuthoring.Service.contentExists(imageData.relativeUrl, {
                  exists: function (result) {
                    if (result) {
                      ed.execCommand('mceInsertContent', true, '<img src="' + cleanUrl + '" />');
                      ed.contextControl.save();
                    } else {
                      setTimeout(function () {
                        ed.execCommand('mceInsertContent', true, '<img src="' + cleanUrl + '" />');
                        ed.contextControl.save();
                      }, 500);
                    }
                  },
                  failure: function (message) {
                    console.log(message);
                  }
                });
              } else {
                ed.execCommand('mceInsertContent', true, '<img src="' + cleanUrl + '" />');
                ed.contextControl.save();
              }
            },
            failure: function (message) {
              CStudioAuthoring.Operations.showSimpleDialog(
                'message-dialog',
                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                CMgs.format(langBundle, 'notification'),
                message,
                null,
                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                'studioDialog'
              );
            }
          });
        } else {
          CStudioAuthoring.Operations.showSimpleDialog(
            'message-dialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            CMgs.format(langBundle, 'notification'),
            CMgs.format(langBundle, 'datasourceNotImageManager'),
            null,
            YAHOO.widget.SimpleDialog.ICON_BLOCK,
            'studioDialog'
          );
        }
      } else {
        CStudioAuthoring.Operations.showSimpleDialog(
          'message-dialog',
          CStudioAuthoring.Operations.simpleDialogTypeINFO,
          CMgs.format(langBundle, 'notification'),
          CMgs.format(langBundle, 'noDatasourceAssociated'),
          null,
          YAHOO.widget.SimpleDialog.ICON_BLOCK,
          'studioDialog'
        );
      }
    });

    // Add a node change handler, selects the button in the UI when a image is selected
    ed.onNodeChange.add(function (ed, cm, n) {
      cm.setActive('managedImage', n.nodeName == 'IMG');
    });
  },

  cleanUrl: function (url) {
    var urlVal = url.replace(CStudioAuthoringContext.previewAppBaseUri, ''); // remove domain name & junction (optional) from image URL
    return urlVal;
  },

  createControl: function (name, cm) {
    var imageManagerNames = cm.editor.contextControl.imageManagerName; // List of image datasource IDs, could be an array or a string

    imageManagerNames = !imageManagerNames
      ? ''
      : Array.isArray(imageManagerNames)
      ? imageManagerNames.join(',')
      : imageManagerNames; // Turn the list into a string

    if (name == 'managedImage' && imageManagerNames) {
      var c = cm.createMenuButton('managedImage', {
        title: 'Insert Image',
        image:
          CStudioAuthoringContext.authoringAppBaseUri + '/static-assets/themes/cstudioTheme/images/insert_image.png',
        icons: false
      });

      c.onRenderMenu.add(function (c, m) {
        var datasourceMap = this.editor.contextControl.form.datasourceMap,
          datasourceDef = this.editor.contextControl.form.definition.datasources;
        // The datasource title is only found in the definition.datasources. It'd make more sense to have all
        // the information in just one place.

        var addMenuOption = function (el) {
          // We want to avoid possible substring conflicts by using a reg exp (a simple indexOf
          // would fail if a datasource id string is a substring of another datasource id)
          var regexpr = new RegExp('(' + el.id + ')[\\s,]|(' + el.id + ')$'),
            mapDatasource;

          if (imageManagerNames.indexOf(el.id) != -1) {
            //(imageManagerNames.search(regexpr) > -1) {
            mapDatasource = datasourceMap[el.id];

            this.add({
              title: el.title,
              onclick: function () {
                tinymce2.activeEditor.execCommand('mceInsertManagedImage', false, mapDatasource);
              }
            });
          }
        };
        datasourceDef.forEach(addMenuOption, m);
      });

      // Return the new menu button instance
      return c;
    }
    return null;
  },

  /**
   * Returns information about the plugin as a name/value array.
   * The current keys are longname, author, authorurl, infourl and version.
   *
   * @return {Object} Name/value array containing information about the plugin.
   */
  getInfo: function () {
    return {
      longname: 'Crafter Studio Insert Image',
      author: 'Crafter Software',
      authorurl: 'http://www.craftercms.org',
      infourl: 'http://www.craftercms.org',
      version: '1.0'
    };
  }
};

tinymce2.create('tinymce2.plugins.CStudioManagedImagePlugin', CStudioForms.Controls.RTE.ImageInsert);

// Register plugin with a short name
tinymce2.PluginManager.add('insertimage', tinymce2.plugins.CStudioManagedImagePlugin);

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-rte-insert-image', CStudioForms.Controls.RTE.ImageInsert);
