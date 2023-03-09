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

import React, { useEffect, useMemo } from 'react';
import useSpreadState from '../../hooks/useSpreadState';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchPublishingHistoryPackageItems } from '../../services/dashboard';
import { delay } from 'rxjs/operators';
import { FormattedMessage } from 'react-intl';
import DialogContent from '@mui/material/DialogContent';
import { LoadingState } from '../LoadingState';
import Typography from '@mui/material/Typography';
import { EmptyState } from '../EmptyState';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ItemDisplay from '../ItemDisplay';
import { EnhancedDialog, EnhancedDialogProps } from '../EnhancedDialog';
import { Pagination } from '../Pagination';

export interface PackageDetailsDialogProps extends EnhancedDialogProps {
  packageId: string;
}

export function PackageDetailsDialog(props: PackageDetailsDialogProps) {
  const { packageId, ...enhancedDialogProps } = props;
  const site = useActiveSiteId();
  const [state, setState] = useSpreadState({
    items: null,
    loading: false,
    error: null,
    itemsPerPage: 10,
    page: 0
  });
  const filteredItems = useMemo(() => {
    const offset = state.page * state.itemsPerPage;
    return state.items?.filter((item, index) => index >= offset && index < offset + state.itemsPerPage);
  }, [state]);

  useEffect(() => {
    if (packageId) {
      setState({ items: null, loading: true });
      fetchPublishingHistoryPackageItems(site, packageId)
        .pipe(delay(1000))
        .subscribe({
          next: (items) => setState({ items, loading: false }),
          error(error) {
            setState({ error, loading: false });
          }
        });
    }
  }, [packageId, site, setState]);

  // TODO: add server side pagination once API is ready
  const onPageChange = (newPage: number) => {
    setState({ page: newPage });
  };

  function onRowsPerPageChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    setState({
      itemsPerPage: parseInt(e.target.value),
      page: 0
    });
  }

  return (
    <EnhancedDialog
      fullWidth
      maxWidth="md"
      {...enhancedDialogProps}
      title={
        <FormattedMessage
          id="packageDetailsDialog.packageDetailsDialogTitle"
          defaultMessage="Publishing Package Details"
        />
      }
    >
      <DialogContent>
        {state.loading && <LoadingState styles={{ root: { width: 100 } }} />}
        {!Boolean(packageId) && (
          <Typography color="error.main">
            <FormattedMessage
              id="packageDetailsDialog.missingPackageId"
              defaultMessage="Unable to fetch package details as package id was not provided to this UI"
            />
          </Typography>
        )}
        {state.items &&
          (state.items.length === 0 ? (
            <EmptyState
              title={
                <FormattedMessage id="packageDetailsDialog.emptyPackageMessage" defaultMessage="The package is empty" />
              }
              subtitle={
                <FormattedMessage
                  id="packageDetailsDialog.emptyPackageMessageSubtitle"
                  defaultMessage="Fetched package id is {packageId}"
                  values={{ packageId }}
                />
              }
            />
          ) : (
            <>
              <List>
                {filteredItems.map((item) => (
                  <ListItem key={item.id}>
                    <ItemDisplay item={item} showNavigableAsLinks={false} />
                  </ListItem>
                ))}
              </List>
              <Pagination
                count={state.items.length}
                onPageChange={(e, page) => onPageChange(page)}
                page={state.page}
                rowsPerPage={state.itemsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
              />
            </>
          ))}
      </DialogContent>
    </EnhancedDialog>
  );
}

export default PackageDetailsDialog;
