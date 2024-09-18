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

import { DialogHeaderStateAction } from '../DialogHeader';
import StandardAction from '../../models/StandardAction';
import ApiResponse from '../../models/ApiResponse';
import { ItemHistoryEntry, VersionsStateProps } from '../../models/Version';
import { EntityState } from '../../models/EntityState';
import ContentType, { ContentTypeField } from '../../models/ContentType';
import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import { DialogHeaderActionProps } from '../DialogHeaderAction';
import { areObjectsEqual } from '../../utils/object';
import ContentInstance from '../../models/ContentInstance';
import { ReactNode } from 'react';
import { LookupTable } from '../../models';
import { ViewVersionDialogProps } from '../ViewVersionDialog/utils';

export interface CompareVersionsDialogBaseProps {
  error: ApiResponse;
  isFetching: boolean;
  disableItemSwitching?: boolean;
}

export interface CompareVersionsDialogProps extends CompareVersionsDialogBaseProps, EnhancedDialogProps {
  subtitle?: ReactNode;
  versionsBranch?: VersionsStateProps;
  selectedA?: ItemHistoryEntry;
  selectedB?: ItemHistoryEntry;
  selectionContent?: {
    a: {
      xml: string;
      content: ContentInstance;
    };
    b: {
      xml: string;
      content: ContentInstance;
    };
  };
  fields?: LookupTable<ContentTypeField>;
  contentTypesBranch?: EntityState<ContentType>;
  leftActions?: DialogHeaderActionProps[];
  rightActions?: DialogHeaderActionProps[];
}

export interface CompareVersionsDialogStateProps extends CompareVersionsDialogBaseProps, EnhancedDialogState {
  leftActions?: DialogHeaderStateAction[];
  rightActions?: DialogHeaderStateAction[];
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export interface CompareVersionsDialogContainerProps
  extends CompareVersionsDialogBaseProps,
    Pick<
      CompareVersionsDialogProps,
      | 'contentTypesBranch'
      | 'versionsBranch'
      | 'selectedA'
      | 'selectedB'
      | 'disableItemSwitching'
      | 'selectionContent'
      | 'fields'
    > {
  compareXml: boolean;
  setCompareSubDialogState?(props: CompareVersionsDialogProps): void;
  setViewSubDialogState?(props: ViewVersionDialogProps): void;
}

// region diffArrays
function _clonePath(path) {
  return {
    newPos: path.newPos,
    components: path.components.slice(0)
  };
}

function _extractCommon(basePath, newString, oldString, diagonalPath) {
  let newLen = newString.length,
    oldLen = oldString.length,
    newPos = basePath.newPos,
    oldPos = newPos - diagonalPath,
    commonCount = 0;

  while (newPos + 1 < newLen && oldPos + 1 < oldLen && newString[newPos + 1] === oldString[oldPos + 1]) {
    newPos++;
    oldPos++;
    commonCount++;
  }

  if (commonCount) {
    basePath.components.push({
      count: commonCount
    });
  }

  basePath.newPos = newPos;
  return oldPos;
}

function _pushComponent(components, added, removed) {
  const last = components[components.length - 1];

  if (last && last.added === added && last.removed === removed) {
    // We need to clone here as the component clone operation is just
    // as shallow array clone
    components[components.length - 1] = {
      count: last.count + 1,
      added: added,
      removed: removed
    };
  } else {
    components.push({
      count: 1,
      added: added,
      removed: removed
    });
  }
}

function _buildValues(components, newString, oldString, useLongestToken) {
  let componentPos = 0,
    componentLen = components.length,
    newPos = 0,
    oldPos = 0;

  for (; componentPos < componentLen; componentPos++) {
    const component = components[componentPos];

    if (!component.removed) {
      if (!component.added && useLongestToken) {
        let value = newString.slice(newPos, newPos + component.count);
        const pos = oldPos;
        value = value.map(function (value, i) {
          const oldValue = oldString[pos + i];
          return oldValue.length > value.length ? oldValue : value;
        });
        component.value = value;
      } else {
        component.value = newString.slice(newPos, newPos + component.count);
      }

      newPos += component.count; // Common case

      if (!component.added) {
        oldPos += component.count;
      }
    } else {
      component.value = oldString.slice(oldPos, oldPos + component.count);
      oldPos += component.count; // Reverse add and remove so removes are output first to match common convention
      // The diffing algorithm is tied to add then remove output and this is the simplest
      // route to get the desired output with minimal overhead.

      if (componentPos && components[componentPos - 1].added) {
        const tmp = components[componentPos - 1];
        components[componentPos - 1] = components[componentPos];
        components[componentPos] = tmp;
      }
    }
  } // Special case handle for when one terminal is ignored (i.e. whitespace).
  // For this case we merge the terminal into the prior string and drop the change.
  // This is only available for string mode.

  const lastComponent = components[componentLen - 1];

  if (
    componentLen > 1 &&
    typeof lastComponent.value === 'string' &&
    (lastComponent.added || lastComponent.removed) &&
    '' === lastComponent.value
  ) {
    components[componentLen - 2].value += lastComponent.value;
    components.pop();
  }

  return components;
}

/* This generates an array with information about the diff between two arrays of primitive types.
 * For example, given two arrays like this:
 * oldArray = [1, 2, 3]
 * newArray = [1, 3, 2, 4]
 * The result will be (simplifying the content of the result array items):
 * [
 *   { value: [1] }, // Meaning that the value 1 didn't change
 *   { value: [3], added: true }, // Meaning that the value 3 was removed from this position
 *   { value: [2] }, // Meaning that the value 2 didn't change
 *   { value: [3], removed: true }, // Meaning that the value 3 was added in this position
 *   { value: [4], added: true } // Meaning that the value 4 was added in this position
 * ]
 * Note that each of the items in the result array has a value property that is an array of one or more items (for
 * example, if two items are staying the same, they will both be wrapped in the same array item)
 */
export function diffArrays(oldArray, newArray) {
  oldArray = oldArray.slice();
  newArray = newArray.slice();
  const newLen = newArray.length,
    oldLen = oldArray.length;
  let editLength = 1;
  const maxEditLength = newLen + oldLen;
  const bestPath = [
    {
      newPos: -1,
      components: []
    }
  ]; // Seed editLength = 0, i.e. the content starts with the same values

  const oldPos = _extractCommon(bestPath[0], newArray, oldArray, 0);

  if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
    // Identity per the equality and tokenizer
    return [
      {
        value: newArray,
        count: newArray.length
      }
    ];
  } // Main worker method. checks all permutations of a given edit length for acceptance.

  function execEditLength() {
    for (let diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
      let basePath = void 0;

      const addPath = bestPath[diagonalPath - 1];
      const removePath = bestPath[diagonalPath + 1];
      let _oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;

      if (addPath) {
        // No one else is going to attempt to use this value, clear it
        bestPath[diagonalPath - 1] = undefined;
      }

      const canAdd = addPath && addPath.newPos + 1 < newLen,
        canRemove = removePath && 0 <= _oldPos && _oldPos < oldLen;

      if (!canAdd && !canRemove) {
        // If this path is a terminal then prune
        bestPath[diagonalPath] = undefined;
        continue;
      } // Select the diagonal that we want to branch from. We select the prior
      // path whose position in the new string is the farthest from the origin
      // and does not pass the bounds of the diff graph

      if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {
        basePath = _clonePath(removePath);
        _pushComponent(basePath.components, undefined, true);
      } else {
        basePath = addPath; // No need to clone, we've pulled it from the list

        basePath.newPos++;
        _pushComponent(basePath.components, true, undefined);
      }

      _oldPos = _extractCommon(basePath, newArray, oldArray, diagonalPath); // If we have hit the end of both strings, then we are done

      if (basePath.newPos + 1 >= newLen && _oldPos + 1 >= oldLen) {
        return _buildValues(basePath.components, newArray, oldArray, true);
      } else {
        // Otherwise track this path as a potential candidate and continue.
        bestPath[diagonalPath] = basePath;
      }
    }

    editLength++;
  } // Performs the length of edit iteration. Is a bit fugly as this has to support the
  // sync and async mode which is never fun. Loops over execEditLength until a value
  // is produced.

  while (editLength <= maxEditLength) {
    const ret = execEditLength();

    if (ret) {
      return ret;
    }
  }
}
// endregion

export const getItemDiffStatus = (diff): string => {
  if (diff.added) {
    return 'new';
  }
  if (diff.removed) {
    return 'deleted';
  }
  return 'unchanged';
};

export function removeTags(content: string) {
  return content.replace(/<[^>]*>?/gm, '');
}

export const hasFieldChanged = (field: ContentTypeField, contentA, contentB) => {
  const fieldType = field.type;
  switch (fieldType) {
    case 'text':
    case 'html':
    case 'image':
    case 'textarea':
      return contentA !== contentB;
    case 'node-selector':
    case 'checkbox-group':
    case 'repeat':
      return !areObjectsEqual(contentA ?? {}, contentB ?? {});
    default:
      return contentA !== contentB;
  }
};
