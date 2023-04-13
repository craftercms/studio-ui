/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { MultiChoiceSaveButton, MultiChoiceSaveButtonProps } from '../components/MultiChoiceSaveButton';
import { useEffect, useState } from 'react';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

const EMBEDDED_LEGACY_FORM_SAVE_START = 'EMBEDDED_LEGACY_FORM_SAVE_START';
const EMBEDDED_LEGACY_FORM_SAVE_END = 'EMBEDDED_LEGACY_FORM_SAVE_END';

export function LegacyMultiChoiceSaveButton(props: MultiChoiceSaveButtonProps) {
  const [disabled, setDisabled] = useState(props.disabled);

  useEffect(() => {
    const messagesSubscription = fromEvent(window, 'message')
      .pipe(filter((e: any) => e.data && e.data.type))
      .subscribe((e: any) => {
        switch (e.data.type) {
          case EMBEDDED_LEGACY_FORM_SAVE_START: {
            setDisabled(true);
            break;
          }
          case EMBEDDED_LEGACY_FORM_SAVE_END: {
            setDisabled(false);
            break;
          }
        }
        return () => {
          messagesSubscription.unsubscribe();
        };
      });
  }, []);

  return <MultiChoiceSaveButton {...props} disabled={disabled} />;
}

export default LegacyMultiChoiceSaveButton;
