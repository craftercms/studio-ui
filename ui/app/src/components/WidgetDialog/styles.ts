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

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => {
  let toolPanelBody;
  const toolbarMixin: any = theme.mixins.toolbar;
  const key1 = '@media (min-width:0px) and (orientation: landscape)';
  const key2 = '@media (min-width:600px)';
  if (!toolbarMixin[key1] || !toolbarMixin[key2] || !toolbarMixin.minHeight) {
    console.error(
      '[ToolsPanelEmbeddedAppViewButton] MUI may have changed their toolbar mixin. Please adjust my styles.',
      toolbarMixin
    );
    toolPanelBody = {
      overflow: 'auto',
      height: `calc(90vh - 57px)`
    };
  } else {
    toolPanelBody = {
      [key1]: {
        height: `calc(90vh - ${toolbarMixin[key1].minHeight}px - 1px)`
      },
      [key2]: {
        height: `calc(90vh - ${toolbarMixin[key2].minHeight}px - 1px)`
      },
      overflow: 'auto',
      height: `calc(90vh - ${toolbarMixin.minHeight}px - 1px)`
    };
  }
  return {
    dialog: { minHeight: '90vh' },
    toolPanelBody
  };
});

export default useStyles;
