/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import * as React from 'react';
import { Dispatch, useEffect, useMemo, useState } from 'react';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UltraStyledIconButton from './UltraStyledIconButton';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import { Tooltip } from '@mui/material';
import * as contentController from '../classes/ContentController';
import { getCachedModel } from '../classes/ContentController';
import { clearAndListen$ } from '../store/subjects';
import { startListening } from '../store/actions';
import { ElementRecord } from '../models/InContextEditing';
import { extractCollection } from '@craftercms/studio-ui/utils/model';
import { popPiece } from '@craftercms/studio-ui/utils/string';
import { AnyAction } from '@reduxjs/toolkit';
import useRef from '@craftercms/studio-ui/utils/hooks/useUpdateRefs';
import { findContainerRecord, runValidation } from '../classes/ICERegistry';
import { post } from '../utils/communicator';
import { validationMessage } from '@craftercms/studio-ui/state/actions/preview';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

export interface MoveModeZoneMenuProps {
  record: ElementRecord;
  dispatch: Dispatch<AnyAction>;
}

export function MoveModeZoneMenu(props: MoveModeZoneMenuProps) {
  const { record, dispatch } = props;
  const {
    modelId,
    fieldId: [fieldId],
    index
  } = record;

  const elementIndex = useMemo(() => (typeof index === 'string' ? parseInt(popPiece(index), 10) : index), [index]);
  const trashButtonRef = React.useRef();
  const [showTrashConfirmation, setShowTrashConfirmation] = useState<boolean>(false);

  const numOfItemsInContainerCollection = useMemo(
    () => extractCollection(getCachedModel(modelId), fieldId, index).length,
    [modelId, fieldId, index]
  );

  const isEmbedded = useMemo(() => {
    return !Boolean(
      getCachedModel(extractCollection(getCachedModel(modelId), fieldId, index)[elementIndex])?.craftercms.path
    );
  }, [elementIndex, fieldId, index, modelId]);

  const isFirstItem = elementIndex === 0;
  const isLastItem = elementIndex === numOfItemsInContainerCollection - 1;
  const isOnlyItem = isFirstItem && isLastItem;

  // region callbacks

  const onCancel = () => {
    clearAndListen$.next();
    dispatch(startListening());
  };

  const onMoveUp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    contentController.sortUpItem(modelId, fieldId, index);
    onCancel();
  };

  const onMoveDown = (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    contentController.sortDownItem(modelId, fieldId, index);
    onCancel();
  };

  const onTrash = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.MouseEvent<HTMLLIElement, MouseEvent> | KeyboardEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const minCount = runValidation(findContainerRecord(modelId, fieldId, index).id, 'minCount', [
      numOfItemsInContainerCollection - 1
    ]);
    if (minCount) {
      post(validationMessage(minCount));
    } else {
      contentController.deleteItem(modelId, fieldId, index);
      onCancel();
    }
  };

  const onDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', `${record.id}`);
    e.dataTransfer.setDragImage(document.querySelector('.craftercms-dragged-element'), 20, 20);
    setTimeout(() => {
      dispatch({ type: 'dragstart', payload: { event: null, record } });
    });
  };

  // endregion

  const refs = useRef({ onMoveUp, onMoveDown, onTrash, onCancel, isFirstItem, isLastItem });

  // Listen for key input to sort/delete and for clicking outside the zone to dismiss selection.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp': {
          if (!refs.current.isFirstItem) {
            refs.current.onMoveUp(e);
          }
          break;
        }
        case 'ArrowRight':
        case 'ArrowDown': {
          if (!refs.current.isLastItem) {
            refs.current.onMoveDown(e);
          }
          break;
        }
        case 'Backspace': {
          e.preventDefault();
          setShowTrashConfirmation(true);
          break;
        }
      }
    };
    const onClickOut = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      refs.current.onCancel();
    };
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('click', onClickOut, false);
    return () => {
      document.removeEventListener('keydown', onKeyDown, false);
      document.removeEventListener('click', onClickOut, false);
    };
  }, []);

  return (
    <>
      <Tooltip title="Cancel (Esc)">
        <UltraStyledIconButton size="small" onClick={onCancel}>
          <HighlightOffRoundedIcon />
        </UltraStyledIconButton>
      </Tooltip>
      {!isFirstItem && !isOnlyItem && (
        <Tooltip title="Move up/left (← or ↑)">
          <UltraStyledIconButton size="small" onClick={onMoveUp}>
            <ArrowUpwardRoundedIcon />
          </UltraStyledIconButton>
        </Tooltip>
      )}
      {!isLastItem && !isOnlyItem && (
        <Tooltip title="Move down/right (→ or ↓)">
          <UltraStyledIconButton size="small" onClick={onMoveDown}>
            <ArrowDownwardRoundedIcon />
          </UltraStyledIconButton>
        </Tooltip>
      )}
      <Tooltip title="Trash (⌫)">
        <UltraStyledIconButton size="small" onClick={onTrash} ref={trashButtonRef}>
          <DeleteOutlineRoundedIcon />
        </UltraStyledIconButton>
      </Tooltip>
      <Tooltip title="Move">
        <UltraStyledIconButton size="small" draggable sx={{ cursor: 'grab' }} onDragStart={onDragStart}>
          <DragIndicatorRounded />
        </UltraStyledIconButton>
      </Tooltip>
      <Menu
        anchorEl={trashButtonRef.current}
        open={showTrashConfirmation}
        onClose={() => setShowTrashConfirmation(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{ zIndex: 1501 }}
      >
        <Typography variant="body1" sx={{ padding: '10px 16px 10px 16px' }}>
          {isEmbedded ? 'Disassociate' : 'Delete'} this component?
        </Typography>
        <MenuItem
          onClick={(e) => {
            e.preventDefault();
            setShowTrashConfirmation(false);
          }}
        >
          No
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            setShowTrashConfirmation(false);
            refs.current.onTrash(e);
          }}
        >
          Yes
        </MenuItem>
      </Menu>
    </>
  );
}

// Could use a more generic version...
// function IconButtonCollection({ actions }) {
//   return actions.map((action) => (
//     <Tooltip title={`${action.label} ${action.shortcut ?? ''}`.trim()}>
//       <UltraStyledIconButton size="small" {...action.props}>
//         <DragIndicatorRounded />
//       </UltraStyledIconButton>
//     </Tooltip>
//   ));
// }

export default MoveModeZoneMenu;
