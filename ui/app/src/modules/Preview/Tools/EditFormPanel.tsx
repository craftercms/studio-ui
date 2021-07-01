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

import React from 'react';
import ToolPanel from './ToolPanel';
import CloseRounded from '@material-ui/icons/CloseRounded';
import Typography from '@material-ui/core/Typography';
import { useDispatch } from 'react-redux';
import { defineMessages, IntlFormatters, useIntl } from 'react-intl';
import { findParentModelId, nnou } from '../../../utils/object';
import { popPiece } from '../../../utils/string';
import * as ModelHelper from '../../../utils/model';
import {
  showCodeEditorDialog,
  showConfirmDialog,
  showEditDialog,
  showSingleFileUploadDialog
} from '../../../state/actions/dialogs';
import { getField } from '../../../utils/contentType';
import { Menu, MenuItem } from '@material-ui/core';
import { GuestData } from '../../../models/GlobalState';
import { useSelection } from '../../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../../utils/hooks/useActiveSiteId';
import { usePreviewState } from '../../../utils/hooks/usePreviewState';
import ContentInstance from '../../../models/ContentInstance';
import ContentType, { ContentTypeField } from '../../../models/ContentType';
import LookupTable from '../../../models/LookupTable';
import { expandPathMacros } from '../../../utils/path';

interface EditFormPanelProps {
  open: boolean;
  onDismiss: () => void;
}

interface EditFormPanelBodyProps {
  onDismiss: () => void;
  selected: GuestData['selected'];
  models: GuestData['models'];
  childrenMap: GuestData['childrenMap'];
  modelIdByPath: GuestData['modelIdByPath'];
}

interface FieldOption {
  id: string;
  label: string;
  options?: LookupTable<any>;
}

const getEditDialogProps = (props: {
  authoringBase: string;
  childrenMap: GuestData['childrenMap'];
  model: ContentInstance;
  models: GuestData['models'];
  path: string;
  selectedId: string;
  site: string;
  selectedFields: string[];
}) => {
  const { authoringBase, childrenMap, model, models, path, selectedId, site, selectedFields } = props;
  if (path) {
    return {
      authoringBase,
      site,
      path,
      ...(selectedFields ? { selectedFields } : {})
    };
  } else {
    let parentPath;
    if (model === models[selectedId]) {
      let parentId = findParentModelId(model.craftercms.id, childrenMap, models);
      parentPath = models[parentId].craftercms.path;
    } else {
      parentPath = models[model.craftercms.id].craftercms.path;
    }

    return {
      authoringBase,
      site,
      path: parentPath,
      isHidden: true,
      modelId: selectedId,
      ...(selectedFields ? { selectedFields } : {})
    };
  }
};

const translations = defineMessages({
  openComponentForm: {
    id: 'previewEditFormTool.openComponentForm',
    defaultMessage: 'Edit'
  },
  editTemplate: {
    id: 'previewEditFormTool.editTemplate',
    defaultMessage: 'Edit Template'
  },
  editController: {
    id: 'previewEditFormTool.editController',
    defaultMessage: 'Edit Controller'
  },
  delete: {
    id: 'words.delete',
    defaultMessage: 'Delete'
  },
  assetUploaderMissingConfiguration: {
    id: 'operations.assetUploadMissingConfiguration',
    defaultMessage: 'Data source "{id}" have properties with missing or incorrect values.'
  }
});

export default function EditFormPanel(props: EditFormPanelProps) {
  const { showToolsPanel, guest } = usePreviewState();
  const { selected, models, childrenMap, modelIdByPath } = guest ?? {};
  const getAnchorPosition = () => {
    let iframe = document.getElementById('crafterCMSPreviewIframe');
    let bounding = iframe.getBoundingClientRect();
    let selection = selected[0];
    return {
      top: bounding.top + selection.coordinates.y,
      left: (showToolsPanel ? bounding.left : 0) + selection.coordinates.x
    };
  };
  return (
    <Menu
      open={props.open && Boolean(selected)}
      onClose={props.onDismiss}
      anchorReference="anchorPosition"
      anchorPosition={props.open ? getAnchorPosition() : null}
    >
      <div>
        {selected ? (
          <EditFormPanelBody
            models={models}
            selected={selected}
            childrenMap={childrenMap}
            modelIdByPath={modelIdByPath}
            onDismiss={props.onDismiss}
          />
        ) : (
          ''
        )}
      </div>
    </Menu>
  );
}

function EditFormPanelBody(props: EditFormPanelBodyProps) {
  const { onDismiss, selected, models, modelIdByPath, childrenMap } = props;
  const dispatch = useDispatch();
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);

  const item = selected[0];
  const fieldId = item.fieldId[0];
  let model = models[item.modelId];
  let contentType = contentTypesBranch.byId[model.craftercms.contentTypeId];
  const levelDescriptorPath = model.craftercms.sourceMap?.[fieldId];
  if (levelDescriptorPath) {
    // Is inherited field
    const modelId = modelIdByPath[levelDescriptorPath];
    model = models[modelId];
    contentType = contentTypesBranch.byId[model.craftercms.contentTypeId];
  }

  const field = fieldId ? getField(contentType, fieldId) : null;

  const options = getContentTypeOptions(field, contentType, formatMessage);

  let title;
  let selectedId;

  if (nnou(field)) {
    if (field.type === 'node-selector' && nnou(item.index)) {
      let component;
      if (nnou(fieldId) && fieldId.includes('.')) {
        const aux = ModelHelper.extractCollectionItem(model, fieldId, item.index);
        component = models[aux];
      } else {
        const id = ModelHelper.value(model, fieldId)[item.index];
        component = models[id];
      }
      if (component) {
        selectedId = component.craftercms.id;
        title = `${component.craftercms.label} (${contentType.name})`;
      } else {
        selectedId = item.modelId;
        title = `${field.name} (${contentType.name})`;
      }
    } else {
      selectedId = item.modelId;
      title = `${field.name} (${contentType.name})`;
    }
  } else {
    selectedId = item.modelId;
    title = `${model.craftercms.label} (${contentType.name})`;
  }

  const path = ModelHelper.prop(models[selectedId], 'path');
  const selectedContentTypeId = contentType.id;

  function openDialog(type: string) {
    onDismiss();
    if (type === 'form') {
      const selectedFields = field ? [field.id] : null;
      dispatch(
        showEditDialog(
          getEditDialogProps({ authoringBase, childrenMap, model, models, path, selectedFields, selectedId, site })
        )
      );
    } else {
      dispatch(
        showCodeEditorDialog({
          authoringBase,
          site,
          path:
            type === 'template'
              ? contentType.displayTemplate
              : `/scripts/pages/${popPiece(selectedContentTypeId, '/')}.groovy`,
          type: type === 'template' ? 'template' : 'controller'
        })
      );
    }
  }

  function onMenuItemClicked(option: FieldOption) {
    switch (option.id) {
      case 'form': {
        openDialog('form');
        break;
      }
      case 'template': {
        openDialog('template');
        break;
      }
      case 'controller': {
        openDialog('controller');
        break;
      }
      case 'existingImages': {
        onDismiss();
        break;
      }
      case 'img-desktop-upload': {
        const datasource = contentType.dataSources[option.options.dataSourceId];
        const path = datasource.properties.repoPath.value;
        if (!path) {
          dispatch(
            showConfirmDialog({
              body: formatMessage(translations.assetUploaderMissingConfiguration, { id: datasource.id })
            })
          );
          return;
        }
        dispatch(
          showSingleFileUploadDialog({
            path: expandPathMacros(path),
            dataSourceId: datasource.type,
            type: 'studio'
          })
        );
        onDismiss();
        break;
      }
      case 'delete': {
        onDismiss();
        break;
      }
    }
  }

  if (selected.length > 1) {
    // TODO: Implement Multi-mode...
    return (
      <>
        <ToolPanel BackIcon={CloseRounded} title="Not Implemented.">
          <Typography>This condition is not implemented yet.</Typography>
        </ToolPanel>
      </>
    );
  }

  return (
    <>
      <Typography variant="caption" style={{ padding: '0 16px 5px' }} component="p">
        {title}
      </Typography>
      {options.map((option) => (
        <MenuItem key={option.id} onClick={() => onMenuItemClicked(option)}>
          {option.label}
        </MenuItem>
      ))}
    </>
  );
}

export function getContentTypeOptions(
  field: ContentTypeField,
  contentType: ContentType,
  formatMessage: IntlFormatters['formatMessage']
): FieldOption[] {
  if (field && field.type === 'image') {
    let options = [];
    if (Array.isArray(field.validations.allowedImageDataSources.value)) {
      field.validations.allowedImageDataSources.value.forEach((id) => {
        options.push({
          id: contentType.dataSources[id].type,
          label: contentType.dataSources[id].name,
          options: { dataSourceId: id }
        });
      });
    }
    options.push({
      id: 'delete',
      label: formatMessage(translations.delete)
    });
    return options;
  } else {
    let options = [
      {
        id: 'form',
        label: formatMessage(translations.openComponentForm)
      },
      {
        id: 'template',
        label: formatMessage(translations.editTemplate)
      }
    ];
    if (contentType.type === 'page') {
      options.push({
        id: 'controller',
        label: formatMessage(translations.editController)
      });
    }
    return options;
  }
}
