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

import React from 'react';
import { SplitButton } from '../SplitButton';
import { SplitButtonOption } from '../SplitButton/utils';
import { defineMessages, useIntl } from 'react-intl';

type CommonSaveOptions = 'save' | 'saveAndClose' | 'saveAndMinimize';

export interface MultiChoiceSaveButtonProps {
  options?: Array<CommonSaveOptions | SplitButtonOption>;
  storageKey?: string;
  disabled?: boolean;
  disablePortal?: boolean;
  loading?: boolean;
  defaultSelected?: string;
  onClick(e: Event, type: CommonSaveOptions): void;
}

const translations = defineMessages({
  save: {
    id: 'words.save',
    defaultMessage: 'Save'
  },
  saveAndClose: {
    id: 'multiChoiceSaveButton.saveAndClose',
    defaultMessage: 'Save & Close'
  },
  saveAndMinimize: {
    id: 'multiChoiceSaveButton.saveAndMinimize',
    defaultMessage: 'Save & Minimize'
  }
});

export function MultiChoiceSaveButton(props: MultiChoiceSaveButtonProps) {
  const {
    options = ['save', 'saveAndClose', 'saveAndMinimize'],
    storageKey,
    disabled,
    disablePortal,
    loading,
    defaultSelected,
    onClick
  } = props;
  const { formatMessage } = useIntl();

  return (
    <SplitButton
      options={options.map((option) => {
        if (typeof option === 'string') {
          return {
            id: option as string,
            label: formatMessage(translations[option]),
            callback: (e) => onClick(e, option)
          };
        } else {
          return option;
        }
      })}
      disablePortal={disablePortal}
      disabled={disabled}
      loading={loading}
      defaultSelected={defaultSelected}
      storageKey={storageKey}
    />
  );
}

export default MultiChoiceSaveButton;
