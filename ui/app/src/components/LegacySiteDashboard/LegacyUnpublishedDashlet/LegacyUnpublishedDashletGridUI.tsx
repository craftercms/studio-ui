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

import React from 'react';
import { SandboxItem } from '../../../models';
import useStyles from '../LegacyRecentActivityDashletGrid/styles';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import GlobalAppGridRow from '../../GlobalAppGridRow';
import GlobalAppGridCell from '../../GlobalAppGridCell';
import Checkbox from '@mui/material/Checkbox';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import TableBody from '@mui/material/TableBody';
import ItemDisplay from '../../ItemDisplay';
import { asLocalizedDateTime } from '../../../utils/datetime';
import GlobalState from '../../../models/GlobalState';
import IconButton from '@mui/material/IconButton';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import Tooltip from '@mui/material/Tooltip';
import LookupTable from '../../../models/LookupTable';

export interface LegacyUnpublishedDashletGridUIProps {
  items: SandboxItem[];
  locale: GlobalState['uiConfig']['locale'];
  selectedLookup: LookupTable<boolean>;
  isAllChecked: boolean;
  isIndeterminate: boolean;
  onItemChecked(path: string): void;
  onOptionsButtonClick?: any;
  onClickSelectAll(): void;
}

export function LegacyUnpublishedDashletGridUI(props: LegacyUnpublishedDashletGridUIProps) {
  const {
    items,
    locale,
    onOptionsButtonClick,
    selectedLookup,
    onItemChecked,
    isAllChecked,
    isIndeterminate,
    onClickSelectAll
  } = props;
  const { classes, cx } = useStyles();

  return (
    <TableContainer>
      <Table size="small" className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox">
              <Checkbox
                disabled={items?.length === 1 && items[0].stateMap.deleted}
                indeterminate={isIndeterminate}
                checked={isAllChecked}
                onChange={() => onClickSelectAll()}
              />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width60 pl0">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.item" defaultMessage="Item" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.myLastEdit" defaultMessage="Last Edited By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.myLastEdit" defaultMessage="Last Edited" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="checkbox" />
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <GlobalAppGridRow
              key={item.id}
              onClick={
                item.stateMap.deleted
                  ? null
                  : () => {
                      onItemChecked(item.path);
                    }
              }
            >
              <GlobalAppGridCell className="checkbox">
                <Checkbox
                  disabled={item.stateMap.deleted}
                  checked={item.stateMap.deleted ? false : Boolean(selectedLookup[item.path])}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onChange={() => {
                    onItemChecked(item.path);
                  }}
                />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="ellipsis width60 pl0">
                <ItemDisplay item={item} showNavigableAsLinks={false} showPublishingTarget={false} />
                <Typography
                  title={item.path}
                  variant="caption"
                  component="p"
                  className={cx(classes.itemPath, classes.ellipsis)}
                >
                  {item.path}
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">{item.modifier}</GlobalAppGridCell>
              <GlobalAppGridCell className="width20">
                {item.dateModified &&
                  asLocalizedDateTime(item.dateModified, locale.localeCode, locale.dateTimeFormatOptions)}
              </GlobalAppGridCell>
              <GlobalAppGridCell className="checkbox">
                {item.stateMap.deleted ? (
                  <IconButton disabled={true} size="large">
                    <MoreVertRounded />
                  </IconButton>
                ) : (
                  <Tooltip title={<FormattedMessage id="words.options" defaultMessage="Options" />}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onOptionsButtonClick(e, item);
                      }}
                      size="large"
                    >
                      <MoreVertRounded />
                    </IconButton>
                  </Tooltip>
                )}
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default LegacyUnpublishedDashletGridUI;
