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

(function(window, $, Handlebars) {
  'use strict';

  var storage = CStudioAuthoring.Storage,
    repoPath;

  var CStudioBrowseS3 = $.extend({}, window.CStudioBrowse);

  CStudioBrowseS3.init = function() {
    var me = this;

    this.repoBaseUrl = CStudioAuthoring.Utils.getQueryParameterByName('baseUrl');

    CStudioBrowseS3.bindEvents();

    var searchContext = this.determineSearchContextFromUrl();
    this.searchContext = searchContext;

    CStudioBrowseS3.getContent('browse', {
      success: function(response) {
        me.rootItems = response;
        me.renderSiteFolders(me.rootItems);
      },
      failure: function() {}
    });

    var CMgs = CStudioAuthoring.Messages,
      browseLangBundle = CMgs.getBundle('browse', CStudioAuthoringContext.lang);

    var cb = function(repositories) {
      var repo = null,
        repoId = CStudioAuthoring.Utils.getQueryParameterByName('repoId');
      if (!repositories.length) {
        repo = repositories;
      } else {
        for (var i = 0; i < repositories.length; i++) {
          if (repoId === repositories[i].id) {
            repo = repositories[i];
          }
        }
      }

      repoPath = repo['download-url-regex'];
    };
  };

  CStudioBrowseS3.bindEvents = function() {
    var me = this,
      $tree = $('#data');

    //tree related events

    $tree.on('ready.jstree', function(event, data) {
      var tree = data.instance;
      var obj = tree.get_selected(true)[0];
      me.currentSelection = '';

      var openNodes = function(nodes, index) {
        if (0 == index) {
          var $tree = $('#data');

          var selectedId = $tree.jstree('get_selected')[0];
          $('#' + selectedId + '_anchor').removeClass('jstree-clicked jstree-hovered');

          $tree.jstree('select_node', '#' + nodes[index]);
        } else {
          $('#' + nodes[index] + ' > .jstree-ocl').click();
          $('#data').one('open_node.jstree', function(event, node) {
            openNodes(nodes, index - 1);
          });
        }
      };

      //get cookie - last browsed item
      if (storage.read('S3-browse-path')) {
        var nodes = storage.read('S3-browse-path');
        nodes = nodes.split(',');

        if (nodes.length > 0) {
          openNodes(nodes, nodes.length - 1);
        }
      } else if (obj) {
        tree.trigger('select_node', {
          node: obj,
          selected: tree._data.core.selected,
          event: event
        });
      }

      me.renderContextMenu('.jstree-anchor');
    });

    $tree.on('select_node.jstree', function(event, data) {
      var path = data.node.a_attr['data-path'];

      if (me.currentSelection != data.node.id) {
        me.renderSiteContent(path);
        me.currentSelection = data.node.id;

        //create cookie with current selected node
        var nodes = [data.node.id],
          currentNode = data.node,
          finished = false,
          parentNode,
          parent;

        if ('S3-root' !== currentNode.id) {
          while (!finished) {
            (parent = currentNode.parent),
              (parentNode = $('#data')
                .jstree(true)
                .get_node(parent));

            if ('S3-root' === parent) {
              finished = true;
            } else {
              currentNode = parentNode;
              nodes.push(parent);
            }
          }
        }

        storage.write('S3-browse-path', nodes.join(), 360);
      }
    });

    $('.cstudio-browse-container').on('click', '.path span', function() {
      var path = $(this).attr('data-path');

      me.renderSiteContent(path);
    });

    // When expanding a node -> show its content
    $tree.on('open_node.jstree', function(event, node) {
      $('#' + node.node.id + '_anchor').click();
    });

    // Click on expand/collapse icon
    $tree.on('click', '.jstree-ocl', function(event, node) {
      if (
        !$(this)
          .parent()
          .attr('aria-expanded')
      ) {
        var $node = $('#data')
            .jstree(true)
            .get_node(this.parentElement.id),
          rootPath = CStudioAuthoring.Utils.getQueryParameterByName('path'),
          path = 'S3-root' === $node.a_attr['data-path'] ? rootPath : $node.a_attr['data-path'],
          $resultsContainer = $('#cstudio-wcm-browse-result .results'),
          $resultsActions = $('#cstudio-wcm-browse-result .cstudio-results-actions');

        if (me.currentSelection != $node.id) {
          $resultsContainer.empty();
          $resultsActions.empty();
        }

        CStudioBrowseS3.getContent(
          'browse',
          {
            success: function(response) {
              var subFolders = false;

              if (response.length > 0) {
                $.each(response, function(index, value) {
                  if (value.folder && encodeURI(path) !== CStudioBrowseS3.cleanUrl(value.url)) {
                    $tree.jstree(
                      'create_node',
                      $node,
                      {
                        id: value.item_id,
                        text: value.name,
                        a_attr: {
                          'data-path': CStudioBrowseS3.cleanUrl(value.url)
                        }
                      },
                      'last',
                      false,
                      false
                    );

                    subFolders = true;
                  }
                });

                if (subFolders) {
                  $('#' + $node.id + ' > i').click();
                }
              } else {
                $resultsContainer.empty();
                $resultsActions.empty();
                me.renderNoItems();
              }

              $('#' + $node.id + '_anchor').click();
            },
            failure: function() {}
          },
          path
        );
      }
    });

    $('#cstudio-command-controls').on('click', '#formCancelButton', function() {
      window.close();
      $(window.frameElement.parentElement)
        .closest('.studio-ice-dialog')
        .parent()
        .remove();
    });

    $('.cstudio-wcm-result .results').delegate('.add-link-btn', 'click', function() {
      var contentTO = $(this.parentElement)
        .closest('.cstudio-search-result')
        .data('item');
      CStudioAuthoring.SelectedContent.selectContent(contentTO);
      me.saveContent();
    });

    $('.cstudio-wcm-result .results').delegate('.magnify-icon', 'click', function() {
      var path = $(this).attr('data-source');
      var type = $(this).attr('data-type');
      CStudioAuthoring.Utils.previewAssetDialog(path, type);
    });

    var pathURL = CStudioAuthoring.Utils.getQueryParameterByName('path');
    pathURL = pathURL.slice(-1) == '/' ? pathURL.substring(0, pathURL.length - 1) : pathURL;
    var pathLabel = pathURL.replace(/\//g, ' / ');
    $('.current-folder .path').html(pathLabel);
  };

  CStudioBrowseS3.renderSiteFolders = function(items) {
    var me = this;

    //Removes jstree cached state from localStorage
    localStorage.removeItem('jstree');
    //Tree - default closed
    $.jstree.defaults.core.expand_selected_onload = false;
    $('#data').jstree({
      core: {
        check_callback: true,
        data: function(node, cb) {
          var data = me.parseObjToFolders(items);
          cb(data);
        }
      },
      types: {
        default: {
          icon: 'status-icon folder'
        }
      },
      plugins: ['state', 'types']
    });
  };

  CStudioBrowseS3.parseObjToFolders = function(items) {
    var path = CStudioAuthoring.Utils.getQueryParameterByName('path');
    path = path.slice(-1) == '/' ? path.substring(0, path.length - 1) : path;
    var parsed = {
        id: 'S3-root',
        text: path.includes('/') ? path.split('/')[path.split('/').length - 1] : path,
        state: {
          opened: true,
          selected: storage.read('S3-browse-path') ? false : true
        },
        a_attr: {
          'data-path': 'S3-root'
        },
        children: []
      },
      object;

    $.each(items, function(index, value) {
      // Do not show root folder (coming from service).
      var valueUrl = CStudioBrowseS3.cleanUrl(value.url);
      if (value.folder && path !== valueUrl) {
        object = {
          id: value.item_id,
          text: value.name,
          a_attr: {
            'data-path': CStudioBrowseS3.cleanUrl(value.url)
          }
        };

        parsed.children.push(object);
      }
    });

    return parsed;
  };

  CStudioBrowseS3.parseItemObj = function(item) {
    var filter = CStudioAuthoring.Utils.getQueryParameterByName('filter'),
      parsed = {
        itemId: item.item_id,
        selectMode: '',
        status: '',
        internalName: item.name,
        type: filter ? filter : 'asset',
        browserUri: item.url,
        mimeType: filter ? filter : 'asset'
      };

    return parsed;
  };

  CStudioBrowseS3.renderSiteContent = function(path, type) {
    var me = this,
      type = type ? type : 'browse',
      $resultsContainer =
        'browse' === type ? $('#cstudio-wcm-browse-result .results') : $('#cstudio-wcm-search-result .results'),
      $resultsActions =
        'browse' === type
          ? $('#cstudio-wcm-browse-result .cstudio-results-actions')
          : $('#cstudio-wcm-search-result .cstudio-results-actions');

    $resultsContainer.empty();
    $resultsActions.empty();

    $resultsContainer.html('<span class="cstudio-spinner"></span>' + CMgs.format(browseLangBundle, 'loading') + '...');

    if ('S3-root' === path && this.rootItems) {
      //root - we already have the items

      var filesPresent = false,
        items = this.rootItems;

      $resultsContainer.empty();
      $resultsActions.empty();

      if (this.rootItems.length > 0) {
        var $resultsWrapper = $('<div class="results-wrapper"/>');
        $resultsContainer.prepend($resultsWrapper);

        $.each(items, function(index, value) {
          if (!value.folder) {
            me.renderItem(me.parseItemObj(value), $resultsWrapper, repoPath);
            filesPresent = true;
          }
        });

        if (!filesPresent) {
          me.renderNoItems();
        }
      } else {
        me.renderNoItems();
      }
    } else {
      this.getContent(
        type,
        {
          success: function(response) {
            var filesPresent = false,
              items = response;

            $resultsContainer.empty();
            $resultsActions.empty();

            if (response.length > 0) {
              var $resultsWrapper = $('<div class="results-wrapper"/>');
              $resultsContainer.prepend($resultsWrapper);

              $.each(items, function(index, value) {
                if (!value.folder) {
                  me.renderItem(me.parseItemObj(value), $resultsWrapper, repoPath);
                  filesPresent = true;
                }
              });

              if (!filesPresent) {
                me.renderNoItems(type);
              }
            } else {
              me.renderNoItems(type);
            }
          },
          failure: function() {}
        },
        path
      );
    }
  };

  CStudioBrowseS3.renderNoItems = function(type) {
    var $resultsContainer, msj;

    if ('search' === type) {
      $resultsContainer = $('#cstudio-wcm-search-result .results');
      msj = CMgs.format(browseLangBundle, 'noSearchResults');
    } else {
      $resultsContainer = $('#cstudio-wcm-browse-result .results');
      msj = CMgs.format(browseLangBundle, 'noBrowseResults');
    }

    $resultsContainer.append('<p style="text-align: center; font-weight: bold; display: block;">' + msj + '</p>');
  };

  CStudioBrowseS3.refreshContent = function(path) {
    this.renderSiteContent(path);
  };

  CStudioBrowseS3.renderContextMenu = function(selector) {
    var me = this;

    $.contextMenu({
      selector: selector,
      callback: function(key, options) {
        var pathToUpload = options.$trigger.attr('data-path'),
          basePath = CStudioAuthoring.Utils.getQueryParameterByName('path');
        pathToUpload = pathToUpload === 'S3-root' ? basePath : pathToUpload;

        var upload = me.uploadContent(CStudioAuthoringContext.site, pathToUpload);
        upload.then(function() {
          me.refreshContent(pathToUpload);
        });
      },
      items: {
        upload: { name: CMgs.format(browseLangBundle, 'uploadLabel') }
      }
    });
  };

  CStudioBrowseS3.getContent = function(type, cb, cPath) {
    var pathURL = CStudioAuthoring.Utils.getQueryParameterByName('path'),
      path = cPath ? cPath : pathURL.slice(-1) == '/' ? pathURL.substring(0, pathURL.length - 1) : pathURL,
      profileId = CStudioAuthoring.Utils.getQueryParameterByName('profileId'),
      site = CStudioAuthoring.Utils.getQueryParameterByName('site'),
      filter = CStudioAuthoring.Utils.getQueryParameterByName('filter');

    CrafterCMSNext.services.aws.list(site, profileId, { path, filter }).subscribe(
      function(response) {
        cb.success(response);
      },
      function(response) {
        var message = CMgs.format(browseLangBundle, '' + response.status + '');
        var error = JSON.parse(response.responseText),
          errorMessage = error.errors[0];

        message +=
          "</br></br><div id='errorCode' style='display: none; padding-left: 26px; width: calc(100% - 26px);'>" +
          errorMessage +
          '</div>';

        message +=
          "<div style='margin-left: 26px;'><a style='color: #4F81A0;' href='#' data-open='false' class='show-more-toggle'>Show More" +
          "<i class='fa fa-chevron-right' aria-hidden='true' style='font-size: 10px;margin-left: 5px;'></i></span></div>";

        CStudioAuthoring.Operations.showSimpleDialog(
          'error-dialog',
          CStudioAuthoring.Operations.simpleDialogTypeINFO,
          CMgs.format(browseLangBundle, 'notification'),
          message,
          null,
          YAHOO.widget.SimpleDialog.ICON_BLOCK,
          'studioDialog'
        );

        $('#error-dialog').on('click', '.show-more-toggle', function() {
          var code = $('#errorCode'),
            toggle = $('.show-more-toggle');

          if (!('true' === toggle.attr('data-open'))) {
            toggle.attr('data-open', true);
            toggle.html(
              "Show Less <i class='fa fa-chevron-left' aria-hidden='true' style='font-size: 10px;margin-left: 5px;'></i></span></div>"
            );

            code.show();
          } else {
            toggle.attr('data-open', false);
            toggle.html(
              "Show More <i class='fa fa-chevron-right' aria-hidden='true' style='font-size: 10px;margin-left: 5px;'></i></span></div>"
            );

            code.hide();
          }
        });
      }
    );
  };

  CStudioBrowseS3.uploadContent = function(site, path) {
    var d = new $.Deferred(),
      profileId = CStudioAuthoring.Utils.getQueryParameterByName('profileId');

    CStudioAuthoring.Operations.uploadS3Asset(site, path, profileId, {
      success: function(results) {
        d.resolve(results);
      },
      failure: function() {}
    });

    return d.promise();
  };

  //Cleans url by removing baseUrl for getContent to work (needs relative url)
  CStudioBrowseS3.cleanUrl = function(url) {
    return encodeURI(url.replace(this.repoBaseUrl, ''));
  };

  window.CStudioBrowseS3 = CStudioBrowseS3;
})(window, jQuery, Handlebars);
