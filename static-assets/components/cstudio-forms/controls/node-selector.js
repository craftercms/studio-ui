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

CStudioForms.Controls.NodeSelector = function (id, form, owner, properties, constraints, readonly) {
  this.owner = owner;
  this.owner.registerField(this);
  this.errors = [];
  this.nodes = [];
  this.properties = properties;
  this.constraints = constraints;
  this.inputEl = null;
  this.countEl = null;
  this.required = false;
  this.value = '_not-set';
  this.form = form;
  this.id = id;
  this.allowEdit = false;
  this.items = [];
  this.readonly = readonly;
  this.allowDuplicates = false;
  this.minSize = 0;
  this.maxSize = 0;
  this.readonly = readonly;
  this.defaultValue = '';
  this.disableFlattening = false;
  this.useSingleValueFilename = false;
  this.useMVS = false;
  this.supportedPostFixes = ['_o'];
  amplify.subscribe('/datasource/loaded', this, this.onDatasourceLoaded);
  amplify.subscribe('UPDATE_NODE_SELECTOR', this, this.onIceUpdate);
  amplify.subscribe('UPDATE_NODE_SELECTOR_NEW', this, this.insertEmbeddedItem);
  this.formatMessage = CrafterCMSNext.i18n.intl.formatMessage;
  this.words = CrafterCMSNext.i18n.messages.words;
  this.formEngineMessages = CrafterCMSNext.i18n.messages.formEngineMessages;

  return this;
};

CStudioForms.Controls.NodeSelector.prototype = {
  Node: {
    label: '',
    value: ''
  }
};

YAHOO.extend(CStudioForms.Controls.NodeSelector, CStudioForms.CStudioFormField, {
  getLabel: function () {
    return CMgs.format(langBundle, 'itemSelector');
  },

  getRequirementCount: function () {
    var count = 0;

    if (this.minSize > 0) {
      count++;
    }

    return count;
  },

  _onChange: function () {
    if (this.minSize > 0) {
      // Needs validation
      if (this.items.length < this.minSize) {
        this.setError('minCount', '# items are required');
        this.renderValidation(true, false);
      } else {
        this.clearError('minCount');
        this.renderValidation(true, true);
      }
    }

    this.owner.notifyValidation();
    this.form.updateModel(this.id, this.getValue());
    this.inputEl.value = JSON.stringify(this.getValue());
    this._renderItems();
  },

  _onChangeVal: function (obj) {
    obj.edited = true;
    this._onChange();
  },

  // Node object
  node: {
    label: '',
    value: ''
  },

  addNode: function () {
    // Create element
    // Add to global node array
  },

  deleteNode: function () {
    // Drop element from global node array
  },

  editNode: function () {},

  onIceUpdate: function (data) {
    var item = this.items.find((item) => item.key === data.objId);
    if (item) {
      item.value = data.value;
      this._renderItems();
      this._onChangeVal(this);
    }
  },

  onDatasourceLoaded: function (data) {
    if (this.datasourceName === data.name && !this.datasource) {
      this._setActions();
    }
  },

  render: function (config, containerEl) {
    containerEl.id = this.id;
    this.maxSize = 0;
    this.minSize = 0;

    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);

    for (var i = 0; i < config.constraints.length; i++) {
      var constraint = config.constraints[i];

      if (constraint.name == 'allowDuplicates' && constraint.value == 'true') {
        this.allowDuplicates = true;
      }
    }

    var _self = this;
    for (var i = 0; i < config.properties.length; i++) {
      var prop = config.properties[i];

      if (prop.name == 'itemManager') {
        this.datasourceName = Array.isArray(prop.value) ? prop.value[0] : prop.value;
        this.datasourceName = this.datasourceName.replace('["', '').replace('"]', '');
      }
      if (prop.name == 'minSize' && prop.value != '') {
        this.minSize = parseInt(prop.value, 10);
      }
      if (prop.name == 'maxSize' && prop.value != '') {
        this.maxSize = parseInt(prop.value, 10);
      }
      if (prop.name == 'readonly' && prop.value == 'true') {
        this.readonly = true;
      }
      if (prop.name == 'useSingleValueFilename' && prop.value == 'true') {
        this.useSingleValueFilename = true;
      }
      if (prop.name === 'useMVS' && prop.value === 'true') {
        this.useMVS = true;
      }
      if (prop.name == 'disableFlattening' && prop.value == 'true') {
        this.disableFlattening = true;
      }
    }

    var titleEl = document.createElement('span');
    YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
    titleEl.textContent = config.title;

    var controlWidgetContainerEl = document.createElement('div');
    YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-node-selector-container');

    var validEl = document.createElement('span');
    YAHOO.util.Dom.addClass(validEl, 'validation-hint');
    YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');

    var hiddenEl = document.createElement('input');
    hiddenEl.type = 'hidden';
    YAHOO.util.Dom.addClass(hiddenEl, 'datum');
    this.inputEl = hiddenEl;
    controlWidgetContainerEl.appendChild(hiddenEl);

    var nodeControlboxEl = document.createElement('div');
    YAHOO.util.Dom.addClass(nodeControlboxEl, 'cstudio-form-control-node-selector-controlbox');
    controlWidgetContainerEl.appendChild(nodeControlboxEl);

    var nodeItemsContainerEl = document.createElement('div');
    nodeItemsContainerEl.id = this.id + '-target';
    YAHOO.util.Dom.addClass(nodeItemsContainerEl, 'cstudio-form-control-node-selector-items-container');
    nodeControlboxEl.appendChild(nodeItemsContainerEl);
    this.itemsContainerEl = nodeItemsContainerEl;

    var nodeOptionsEl = document.createElement('div');
    this.nodeOptionsEl = nodeOptionsEl;
    YAHOO.util.Dom.addClass(nodeOptionsEl, 'cstudio-form-control-node-selector-options');
    nodeControlboxEl.appendChild(nodeOptionsEl);

    var countEl = document.createElement('div');
    YAHOO.util.Dom.addClass(countEl, 'item-count');
    YAHOO.util.Dom.addClass(countEl, 'cstudio-form-control-node-selector-count');
    this.countEl = countEl;
    nodeOptionsEl.appendChild(countEl);

    // dropdownBtn and dropdownMenu
    const $addBtn = $(
      `<button id="add-item" class="cstudio-button btn btn-transparent dropdown-toggle cstudio-button-disabled" style="border: none !important" type="button" data-bs-toggle="dropdown" disabled="true">${CMgs.format(
        langBundle,
        'add'
      )}<i class="fa fa-plus add-icon" aria-hidden="true"></i></button>`
    );
    const $dropdown = $('<div class="dropdown cstudio-dropdown ml-auto"></div>');
    const $dropdownMenu = $('<ul class="dropdown-menu pull-right"></ul>');
    this.$dropdown = $dropdown;
    this.$dropdownMenu = $dropdownMenu;
    this.$addBtn = $addBtn;
    $dropdown.append($addBtn);
    $dropdown.append($dropdownMenu);

    $(nodeOptionsEl).append($dropdown);

    if (this.readonly == true) {
      $addBtn.attr('disabled', 'true');
      $addBtn.addClass('cstudio-button-disabled');
    }

    this.renderHelp(config, nodeOptionsEl);

    var descriptionEl = document.createElement('span');
    YAHOO.util.Dom.addClass(descriptionEl, 'description');
    YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
    descriptionEl.textContent = config.description;

    containerEl.appendChild(titleEl);
    containerEl.appendChild(validEl);
    containerEl.appendChild(controlWidgetContainerEl);
    containerEl.appendChild(descriptionEl);

    this.defaultValue = config.defaultValue;

    this._renderItems();
    this._setActions();

    YAHOO.util.Event.addListener(
      nodeItemsContainerEl,
      'click',
      function (evt, context) {
        context.form.setFocusedField(context);
      },
      this,
      true
    );
  },

  _setActions: function () {
    var _self = this;

    var dataSourceNames = this.datasourceName.split(','),
      datasources = [];

    for (var x = 0; x < dataSourceNames.length; x++) {
      var currentDatasource = this.form.datasourceMap[dataSourceNames[x]];
      datasources.push(currentDatasource);

      if (currentDatasource.add && !this.readonly) {
        this.$addBtn.removeClass('cstudio-button-disabled');
        this.$addBtn.removeAttr('disabled');
      }
      if (currentDatasource.edit) {
        this.allowEdit = true;
      }
    }

    this.datasources = datasources;

    var datasource = datasources[0];

    if (datasource && !this.readonly) {
      this.datasource = datasource;
      if (!this.$addBtn.attr('disabled')) {
        datasources.forEach((datasource) => {
          datasource.add(_self, true);
        });

        // adding options to $dropdownMenu;
        YAHOO.util.Event.on(
          this.$addBtn[0],
          'click',
          function (evt) {
            var selectItemsCount = _self.getItemsLeftCount();
            _self.form.setFocusedField(_self);
            if (selectItemsCount === 0) {
              evt.preventDefault();
              evt.stopPropagation();
              var CMgs = CStudioAuthoring.Messages;
              var langBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);
              CStudioAuthoring.Operations.showSimpleDialog(
                'message-dialog',
                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                CMgs.format(langBundle, 'notification'),
                CMgs.format(langBundle, 'addMoreItemsError'),
                null,
                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                'studioDialog'
              );
            } else {
              datasources.forEach((datasource) => {
                datasource.selectItemsCount = selectItemsCount;
              });
            }
          },
          this.$addBtn[0]
        );
      }
    }
  },

  _renderItems: function () {
    var itemsContainerEl = this.itemsContainerEl;
    const _self = this;

    if (typeof this.items == 'string') {
      this.items = [];
    }

    var items = this.items;

    const sharedItems = [];
    let hasLegacyPrefix = false;
    items.forEach((item) => {
      // If it is a path, it is a shared item, otherwise, it will be a guid and it is an embedded item.
      if (item.key.trim().startsWith('/')) {
        sharedItems.push(item.key);
      }
      if (!hasLegacyPrefix) {
        hasLegacyPrefix = Object.keys(item).some((key) => key.includes('_mvs'));
        // only if true -> set value - for backward compatibility
        if (hasLegacyPrefix) this.useMVS = true;
      }
    });

    // Retrieve all SandboxItems to determine if the user has the edit permissions.
    this._renderItemsSubscription?.unsubscribe();
    this._renderItemsSubscription = craftercms.services.content
      .fetchItemsByPath(CStudioAuthoringContext.site, sharedItems)
      .subscribe((sandboxItems) => {
        itemsContainerEl.innerHTML = '';
        var tar = new YAHOO.util.DDTarget(itemsContainerEl);
        const itemsByPath = craftercms.utils.object.createLookupTable(sandboxItems, 'path');

        for (var i = 0; i < items.length; i++) {
          const item = items[i];
          const itemIndex = i;
          var itemEl = document.createElement('div');
          if (this.readonly != true) {
            var dd = new NodeSelectorDragAndDropDecorator(itemEl);
          }

          YAHOO.util.Dom.addClass(itemEl, 'cstudio-form-control-node-selector-item');
          itemEl.style.backgroundColor = '#F0F0F0'; // stylesheet not working due to proxy?
          itemEl.style.overflowWrap = 'break-word';
          itemEl._index = i;
          itemEl.context = this;

          $(itemEl).append(`<span class="name">${item.value}</span>`);
          if (item.include) {
            $(itemEl).append(`<span class="path">${item.include}</span>`);
          } else if (item.inline === 'true') {
            $(itemEl).append(
              `<span class="path">(${this.formatMessage(this.formEngineMessages.embeddedComponent)})</span>`
            );
          } else {
            $(itemEl).append(`<span class="path">${item.key}</span>`);
          }

          if (this.readonly === true) {
            itemEl.classList.add('disabled');
          }

          const isComponent = item.key.startsWith('/site') || item.inline;
          const hasWritePermission = !(item.key in itemsByPath) || itemsByPath[item.key].availableActionsMap.edit;
          const editBtnLabel = (item.inline && this.readonly) || !hasWritePermission ? 'View' : 'Edit';
          const editBtnIconClass = (item.inline && this.readonly) || !hasWritePermission ? 'fa-eye' : 'fa-pencil';

          const $actionsContainer = $(`<span class="actions-container ml-auto" />`);
          const editBtn = $(
            `<button class="fa ${editBtnIconClass} node-selector-item-icon" title="${editBtnLabel}" aria-label="${editBtnLabel}" role="button" data-index="${i}"></button>`
          );
          const deleteBtn = $(
            '<button class="fa fa-trash node-selector-item-icon" title="Delete" aria-label="Delete" role="button"></button>'
          );
          const isEditable = this.allowEdit && (isComponent || craftercms.utils.content.isEditableAsset(item.key));
          if (isEditable) {
            if (isComponent || !this.readonly) {
              $actionsContainer.append(editBtn);
              editBtn.on('click', function () {
                const elIndex = $(this).data('index');
                let selectedDatasource =
                  _self.datasources.find((item) => item.id === _self.items[elIndex].datasource) || _self.datasources[0];
                selectedDatasource.edit(item.key, _self, elIndex, {
                  failure: function (error) {
                    if (error.status === 404) {
                      CStudioAuthoring.Utils.showConfirmDialog({
                        body: _self.formatMessage(_self.formEngineMessages.nodeSelectorItemNotFound, {
                          internalName: _self.items[elIndex].value
                        }),
                        onOk: () => {
                          _self.deleteItem(elIndex);
                        },
                        okButtonText: _self.formatMessage(_self.formEngineMessages.removeItemFromNodeSelector, {
                          controlLabel: _self.fieldDef.title
                        }),
                        cancelButtonText: _self.formatMessage(_self.formEngineMessages.keepItemInNodeSelector)
                      });
                    } else {
                      craftercms.getStore().dispatch({
                        type: 'SHOW_ERROR_DIALOG',
                        payload: { error: error.response.response }
                      });
                    }
                  }
                });
              });
            }
          }
          if (this.readonly != true) {
            $actionsContainer.append(deleteBtn);
            deleteBtn.on('click', function () {
              _self.deleteItem(itemIndex);
              _self._renderItems();
            });
          }

          $(itemEl).append($actionsContainer);
          itemEl._onMouseDown = function () {};

          itemsContainerEl.appendChild(itemEl);
        }
      });
  },

  getItemsLeftCount: function () {
    if (typeof this.items == 'string') {
      this.items = [];
    }

    if (this.maxSize > 0) {
      return this.maxSize - this.items.length;
    }
    return -1;
  },

  getIndex: function (key) {
    var index = -1;
    var values = this.getValue();

    for (var i = 0; i < values.length; i++) {
      if (values[i].key == key) {
        index = i;
        break;
      }
    }

    return index;
  },

  /**
   * move a item from it's current position to a new position
   */
  moveExistingItemBefore: function (onTheMoveIndex, beforeItemIndex) {
    var item = this.items[onTheMoveIndex];
    this.items.splice(onTheMoveIndex, 1);
    this.items.splice(beforeItemIndex, 0, item);
    this._onChangeVal(this);
  },

  deleteItem: function (index) {
    if (index != -1) {
      this.items.splice(index, 1);
      this.count();
      this._onChangeVal(this);
    }
  },

  insertEmbeddedItem: function (data) {
    if (this.id === data.selectorId) {
      this.insertItem(data.key, data.value, null, null, data.ds, data.order);
    }
  },

  checkValidations: function (key, value) {
    let validation = {
      successful: true,
      message: ''
    };

    if (!this.allowDuplicates) {
      var items = this.items;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.key == key) {
          validation.successful = false;
          validation.message = `The item "${CrafterCMSNext.util.string.escapeHTML(value)}" already exists.`;
          break;
        }
      }
    }

    if (this.maxSize > 0) {
      if (this.items.length >= this.maxSize) {
        validation.successful = false;
        validation.message = "You can't add more items, Remove one and try again.";
      }
    }

    return validation;
  },

  newInsertItem: function (key, value, type) {
    const validation = this.checkValidations(key, value);

    if (validation.successful) {
      let item = {};
      item = { key: key, value: value };

      if (type === 'embedded') {
        item.key = key;
        item.inline = 'true';
      } else {
        item.include = key;
        item.disableFlattening = this.disableFlattening;
      }
      this.items[this.items.length] = item;

      this.count();
      this._onChangeVal(this);
    } else {
      this.showValidationMessage(validation.message);
    }
  },

  insertItem: function (key, value, fileType, fileSize, datasource, order) {
    const validation = this.checkValidations(key, value);
    if (validation.successful) {
      var item = {};

      if (this.useSingleValueFilename == true) {
        /* the initial assumption was that a node selector would be used to pick a single file. _s tells
         * the search index that the value is a single value.  If the node selector is used to pick multiple files
         * the indexing operation will fail. Because the node selctor is inheriently multi-valued in nature the
         * default going forward is to treat these values as multi-valued.  For backward compatibility we will support
         * _s if the form definition specifies that we do so
         */
        if (fileType && fileSize) {
          item = {
            key: key,
            value: value,
            fileType_s: fileType,
            fileSize_s: fileSize
          };
        } else if (fileType && !fileSize) {
          item = { key: key, value: value, fileType_s: fileType };
        } else if (!fileType && fileSize) {
          item = { key: key, value: value, fileSize_s: fileSize };
        } else {
          item = { key: key, value: value };
        }
      } else {
        if (fileType && fileSize) {
          item = {
            key: key,
            value: value,
            ...(this.useMVS
              ? { fileType_mvs: fileType, fileSize_s: fileSize }
              : { fileType_smv: fileType, fileSize_smv: fileSize })
          };
        } else if (fileType && !fileSize) {
          item = {
            key: key,
            value: value,
            ...(this.useMVS ? { fileType_mvs: fileType } : { fileType_smv: fileType })
          };
        } else if (!fileType && fileSize) {
          item = {
            key: key,
            value: value,
            ...(this.useMVS ? { fileSize_mvs: fileSize } : { fileSize_smv: fileSize })
          };
        } else {
          item = { key: key, value: value };
        }
      }

      item.datasource = datasource;
      if (order != null) {
        // insert on specific order
        this.items.splice(order, 0, item);
      } else {
        this.items[this.items.length] = item;
      }
      if (this.form.datasourceMap[datasource].itemsAreContentReferences) {
        if (key.indexOf('.xml') != -1) {
          item.include = key;
          item.disableFlattening = this.disableFlattening;
        } else if (this.form.datasourceMap[datasource].flattened) {
          item.key = key;
          item.inline = 'true';
        } else {
          item.include = key;
        }
      }

      this.count();
      this._onChangeVal(this);
    } else {
      this.showValidationMessage(validation.message);
    }
  },

  // Insert item may be called multiple times per item inserted.
  // This function differs showing the dialog by a few ms to only show the last call to
  // displaying a dialog. Otherwise, multiple dialogs are shown and all sorts of problems
  // come with that.
  showValidationMessageTimeout: null,
  showValidationMessageMessages: [],
  showValidationMessage(message) {
    clearTimeout(this.showValidationMessageTimeout);
    this.showValidationMessageMessages.push(message);
    this.showValidationMessageTimeout = setTimeout(() => {
      const CMgs = CStudioAuthoring.Messages;
      const langBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);
      const dialog = CStudioAuthoring.Operations.showSimpleDialog(
        `message-dialog-${CStudioAuthoring.Utils.getScopedInt()}`,
        CStudioAuthoring.Operations.simpleDialogTypeINFO,
        CMgs.format(langBundle, 'notification'),
        this.showValidationMessageMessages.length > 1
          ? `• ${this.showValidationMessageMessages.join('<br/>• ')}`
          : message,
        null,
        YAHOO.widget.SimpleDialog.ICON_BLOCK,
        'studioDialog'
      );
      this.showValidationMessageMessages = [];
      $(dialog.body).css({
        maxHeight: 200,
        overflow: 'auto'
      });
    }, 50);
  },

  count: function () {
    var itemCount = this.items.length;

    if (this.maxSize && this.maxSize != 0) {
      this.countEl.innerHTML = itemCount + ' / ' + this.maxSize;
    } else {
      this.countEl.innerHTML = itemCount;
    }
  },

  getValue: function () {
    return this.items;
  },

  // updatedItem: { key: string; include: string; value: string }
  updateEditedItem: function (updatedItem, datasource, index) {
    let item = this.items[index];
    if (datasource) {
      item.datasource;
    }
    this.items[index] = {
      ...item,
      ...updatedItem
    };
    this._renderItems();
    this._onChangeVal(this);
  },

  updateItems: function () {
    if (this.datasource && this.datasource.updateItem) {
      for (var i = 0; i < this.items.length; i++) {
        this.datasource.updateItem(this.items[i], this);
        this.items[i].disableFlattening = this.disableFlattening;
      }
    }
  },

  setValue: function (value) {
    this.items = value;
    this.edited = false;

    if (typeof this.items == 'string') {
      // Check if the current value is the default value, split it by comma and load it using key/value pair
      if (this.items === this.defaultValue && this.items != '') {
        this.items = [];
        var defaultItems = this.defaultValue.split(',');
        for (var i = 0; i < defaultItems.length; i++) {
          var item = { key: defaultItems[i], value: defaultItems[i] };
          this.items[this.items.length] = item;
          if (this.datasource.itemsAreContentReferences) {
            if (defaultItems[i].indexOf('.xml') != -1) {
              item.include = defaultItems[i];
              item.disableFlattening = this.disableFlattening;
            }
          }
        }
      } else {
        this.items = [];
      }
    }

    if (this.items.length > 0) {
      if (this.items[0].value == '') {
        this.items = this.items[0].splice();
      }
    }

    this.updateItems();
    this._onChange();
    this.count();
  },

  getName: function () {
    return 'node-selector';
  },

  getSupportedProperties: function () {
    return [
      { label: CMgs.format(langBundle, 'minSize'), name: 'minSize', type: 'int' },
      { label: CMgs.format(langBundle, 'maxSize'), name: 'maxSize', type: 'int' },
      {
        label: CMgs.format(langBundle, 'itemManager'),
        name: 'itemManager',
        type: 'datasource:item'
      },
      { label: CMgs.format(langBundle, 'readonly'), name: 'readonly', type: 'boolean' },
      {
        label: CMgs.format(langBundle, 'disableFlatteningSearch'),
        name: 'disableFlattening',
        type: 'boolean'
      },
      {
        label: CMgs.format(langBundle, 'singleValueFilename'),
        name: 'useSingleValueFilename',
        type: 'boolean'
      },
      {
        label: this.formatMessage(this.formEngineMessages.useMVS),
        name: 'useMVS',
        type: 'boolean'
      }
    ];
  },

  getSupportedConstraints: function () {
    return [{ label: CMgs.format(langBundle, 'allowDuplicate'), name: 'allowDuplicates', type: 'boolean' }];
  },

  getSupportedPostFixes: function () {
    return this.supportedPostFixes;
  }
});

/**
 * drag and drop controls
 */
NodeSelectorDragAndDropDecorator = function (id, sGroup, config) {
  NodeSelectorDragAndDropDecorator.superclass.constructor.call(this, id, sGroup, config);

  this.logger = this.logger || YAHOO;
  var el = this.getDragEl();
  YAHOO.util.Dom.setStyle(el, 'opacity', 0.67); // The proxy is slightly transparent

  this.goingUp = false;
  this.lastY = 0;
  this.oldIndex = null;
};

YAHOO.extend(NodeSelectorDragAndDropDecorator, YAHOO.util.DDProxy, {
  onMouseDown: function (e) {
    var clickEl = this.getEl();
    clickEl._onMouseDown();
  },

  startDrag: function (x, y) {
    // make the proxy look like the source element
    var dragEl = this.getDragEl();
    var clickEl = this.getEl();
    this.oldIndex = clickEl._index;
    YAHOO.util.Dom.setStyle(clickEl, 'visibility', 'hidden');

    dragEl.innerHTML = clickEl.textContent;
    YAHOO.util.Dom.setStyle(dragEl, 'color', YAHOO.util.Dom.getStyle(clickEl, 'color'));
    YAHOO.util.Dom.setStyle(dragEl, 'backgroundColor', YAHOO.util.Dom.getStyle(clickEl, 'backgroundColor'));
    YAHOO.util.Dom.setStyle(dragEl, 'border', '1px solid #7EA6B2');
    YAHOO.util.Dom.setStyle(dragEl, 'padding', '7px 5px 7px 12px');
    YAHOO.util.Dom.setStyle(dragEl, 'border-radius', '4px');
  },

  endDrag: function (e) {
    var srcEl = this.getEl();
    if (this.oldIndex != srcEl._index) {
      srcEl.context.moveExistingItemBefore(this.oldIndex, srcEl._index);
    }

    var proxy = this.getDragEl();

    // Show the proxy element and animate it to the src element's location
    YAHOO.util.Dom.setStyle(proxy, 'visibility', '');
    var a = new YAHOO.util.Motion(
      proxy,
      {
        points: {
          to: YAHOO.util.Dom.getXY(srcEl)
        }
      },
      0.2,
      YAHOO.util.Easing.easeOut
    );
    var proxyid = proxy.id;
    var thisid = this.id;

    // Hide the proxy and show the source element when finished with the animation
    a.onComplete.subscribe(function () {
      YAHOO.util.Dom.setStyle(proxyid, 'visibility', 'hidden');
      YAHOO.util.Dom.setStyle(thisid, 'visibility', '');
    });
    a.animate();
  },

  onDragDrop: function (e, id) {
    if (YAHOO.util.DragDropMgr.interactionInfo.drop.length === 1) {
      var pt = YAHOO.util.DragDropMgr.interactionInfo.point;
      var region = YAHOO.util.DragDropMgr.interactionInfo.sourceRegion;

      if (region) {
        if (!region.intersect(pt)) {
          var srcEl = this.getEl();
          var destEl = YAHOO.util.Dom.get(id);
          if (!YDom.isAncestor(srcEl.context.id + '-target', destEl)) return;

          var destDD = YAHOO.util.DragDropMgr.getDDById(id);
          if (destEl.appendChild) {
            destEl.appendChild(srcEl);
            destDD.isEmpty = false;
            YAHOO.util.DragDropMgr.refreshCache();
          }
        }
      }
    }
  },

  onDrag: function (e) {
    // Keep track of the direction of the drag for use during onDragOver
    var y = YAHOO.util.Event.getPageY(e);

    if (y < this.lastY) {
      this.goingUp = true;
    } else if (y > this.lastY) {
      this.goingUp = false;
    }

    this.lastY = y;
  },

  onDragOver: function (e, id) {
    var srcEl = this.getEl();
    var destEl = YAHOO.util.Dom.get(id);

    if (!destEl) return;

    if (!YDom.isAncestor(srcEl.context.id + '-target', destEl)) return;

    if (
      destEl.nodeName.toLowerCase() == 'div' &&
      YAHOO.util.Dom.hasClass(destEl, 'cstudio-form-control-node-selector-item')
    ) {
      var orig_p = srcEl.parentNode;
      var p = destEl.parentNode;
      if (this.goingUp) {
        p.insertBefore(srcEl, destEl); // insert above
      } else {
        p.insertBefore(srcEl, destEl.nextSibling); // insert below
      }

      var srcIndex = srcEl._index;
      srcEl._index = destEl._index;
      destEl._index = srcIndex;

      YAHOO.util.DDM.refreshCache();
    }
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-node-selector', CStudioForms.Controls.NodeSelector);
