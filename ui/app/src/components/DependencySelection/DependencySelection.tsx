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

import React from 'react';
import { DetailedItem } from '../../models/Item';
import { makeStyles } from 'tss-react/mui';
import { FormattedMessage } from 'react-intl';
import LookupTable from '../../models/LookupTable';
import { SelectionList, SelectionListProps } from './SelectionList';
import { nnou } from '../../utils/object';
import { FetchDependenciesResponse } from '../../services/dependencies';

export interface DependencySelectionProps extends Pick<SelectionListProps, 'onItemClicked' | 'onSelectAllClicked'> {
  items?: DetailedItem[];
  selectedItems: LookupTable<boolean>;
  dependencies: FetchDependenciesResponse;
  disabled?: boolean;
  onSelectAllSoftClicked: SelectionListProps['onSelectAllClicked'];
}

export interface DeleteDependencies {
  childItems: string[];
  dependentItems: string[];
}

// region useStyles
const useStyles = makeStyles()((theme) => ({
  dependencySelection: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    minHeight: '374px'
  },
  dependencySelectionDisabled: {
    opacity: 0.7
  },
  showAllBtn: {
    marginLeft: 0,
    verticalAlign: 'baseline'
  },
  listItemTitle: {
    '& h4': {
      fontSize: '1rem',
      margin: 0,
      padding: 0,
      fontWeight: 400
    }
  },
  listItemPath: {
    padding: 0
  }
}));
// endregion

export function DependencySelection(props: DependencySelectionProps) {
  const {
    items,
    selectedItems,
    dependencies,
    onItemClicked,
    onSelectAllClicked,
    onSelectAllSoftClicked,
    disabled = false
  } = props;
  const { classes, cx } = useStyles();
  return (
    <>
      <div className={cx(classes.dependencySelection, disabled && classes.dependencySelectionDisabled)}>
        <SelectionList
          title={<FormattedMessage id="publishDialog.itemsToPublish" defaultMessage="Items To Publish" />}
          items={items}
          onItemClicked={onItemClicked}
          onSelectAllClicked={onSelectAllClicked}
          displayItemTitle={true}
          selectedItems={selectedItems}
          disabled={disabled}
        />
        {nnou(dependencies) && (
          <>
            <SelectionList
              title={<FormattedMessage id="publishDialog.hardDependencies" defaultMessage="Hard Dependencies" />}
              subtitle={
                <FormattedMessage id="publishDialog.submissionMandatory" defaultMessage="Submission Mandatory" />
              }
              emptyMessage={
                <FormattedMessage id="publishDialog.emptyHardDependencies" defaultMessage="No hard dependencies" />
              }
              paths={dependencies.hardDependencies ?? []}
              displayItemTitle={false}
              disabled={disabled}
            />
            <SelectionList
              title={<FormattedMessage id="publishDialog.softDependencies" defaultMessage="Soft Dependencies" />}
              subtitle={<FormattedMessage id="publishDialog.submissionOptional" defaultMessage="Submission Optional" />}
              emptyMessage={
                <FormattedMessage id="publishDialog.emptySoftDependencies" defaultMessage="No soft dependencies" />
              }
              paths={dependencies.softDependencies ?? []}
              onItemClicked={onItemClicked}
              onSelectAllClicked={onSelectAllSoftClicked}
              displayItemTitle={false}
              selectedItems={selectedItems}
              disabled={disabled}
            />
          </>
        )}
      </div>
    </>
  );
}

export default DependencySelection;
