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
import TableContainer from '@mui/material/TableContainer';
import useStyles from '../LegacyRecentActivityDashletGrid/styles';
import TableHead from '@mui/material/TableHead';
import Table from '@mui/material/Table';
import GlobalAppGridRow from '../../GlobalAppGridRow';
import GlobalAppGridCell from '../../GlobalAppGridCell';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@mui/material/TableBody';
import ItemDisplay from '../../ItemDisplay';
import { asLocalizedDateTime } from '../../../utils/datetime';
import GlobalState from '../../../models/GlobalState';
import LookupTable from '../../../models/LookupTable';
import IconButton from '@mui/material/IconButton';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import Tooltip from '@mui/material/Tooltip';
import { getDateScheduled } from '../../../utils/content';
import { DetailedItem } from '../../../models';

export interface LegacyInReviewDashletGridUIProps {
  items: DetailedItem[];
  locale: GlobalState['uiConfig']['locale'];
  selectedLookup: LookupTable<boolean>;
  isAllChecked: boolean;
  isIndeterminate: boolean;
  onItemChecked(path: string): void;
  onOptionsButtonClick?: any;
  onClickSelectAll(): void;
}

export function LegacyInReviewDashletGridUI(props: LegacyInReviewDashletGridUIProps) {
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
            <GlobalAppGridCell className="width40 pl0">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.item" defaultMessage="Item" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width15 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="inReviewDashlet.publishingTarget" defaultMessage="Publishing Target" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width15 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage defaultMessage="Publishing Date" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width15 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="inReviewDashlet.lastEditedBy" defaultMessage="Last Edited By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width15 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="inReviewDashlet.lastEdited" defaultMessage="Last Edited" />
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
              <GlobalAppGridCell className="ellipsis width40 pl0">
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
              <GlobalAppGridCell className="width15">
                {item.stateMap.submittedToLive ? (
                  <FormattedMessage id="words.live" defaultMessage="Live" />
                ) : (
                  <FormattedMessage id="words.staging" defaultMessage="Staging" />
                )}
              </GlobalAppGridCell>
              <GlobalAppGridCell
                className="width15"
                title={
                  getDateScheduled(item) &&
                  asLocalizedDateTime(getDateScheduled(item), locale.localeCode, locale.dateTimeFormatOptions)
                }
              >
                {getDateScheduled(item) ? (
                  asLocalizedDateTime(getDateScheduled(item), locale.localeCode, locale.dateTimeFormatOptions)
                ) : (
                  <Typography variant="caption" color="textSecondary">
                    <FormattedMessage id="words.now" defaultMessage="Now" />
                  </Typography>
                )}
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width15 ellipsis" title={item.sandbox.modifier?.username ?? ''}>
                {item.sandbox.modifier?.username ?? ''}
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width15 ellipsis">
                {item.sandbox.dateModified &&
                  asLocalizedDateTime(item.sandbox.dateModified, locale.localeCode, locale.dateTimeFormatOptions)}
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

export default LegacyInReviewDashletGridUI;
