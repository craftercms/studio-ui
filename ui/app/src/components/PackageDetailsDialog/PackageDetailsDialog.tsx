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

import React, { useEffect } from 'react';
import useSpreadState from '../../hooks/useSpreadState';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchPublishingHistoryPackageItems } from '../../services/dashboard';
import { FormattedMessage } from 'react-intl';
import DialogContent from '@mui/material/DialogContent';
import { LoadingState } from '../LoadingState';
import Typography from '@mui/material/Typography';
import { EmptyState } from '../EmptyState';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ItemDisplay from '../ItemDisplay';
import { EnhancedDialog, EnhancedDialogProps } from '../EnhancedDialog';
import { Pager } from '../DashletCard/dashletCommons';
import Box from '@mui/material/Box';

const dialogContentHeight = 420;

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
    total: null,
    limit: 10,
    offset: 0
  });
  const currentPage = state.offset / state.limit;
  const totalPages = state.total ? Math.ceil(state.total / state.limit) : 0;

  useEffect(() => {
    if (packageId) {
      setState({ items: null, loading: true });
      fetchPublishingHistoryPackageItems(site, packageId, { limit: state.limit, offset: 0 }).subscribe({
        next: (items) => {
          setState({ items, loading: false, offset: 0, total: items.total });
        },
        error(error) {
          setState({ error, loading: false });
        }
      });
    }
  }, [packageId, site, setState, state.limit]);

  const loadPage = (pageNumber: number) => {
    const newOffset = pageNumber * state.limit;
    setState({ items: null, loading: true });
    fetchPublishingHistoryPackageItems(site, packageId, { limit: state.limit, offset: newOffset }).subscribe({
      next: (items) => {
        setState({ items, loading: false, offset: newOffset, total: items.total });
      },
      error(error) {
        setState({ error, loading: false });
      }
    });
  };

  function onRowsPerPageChange(rowsPerPage: number) {
    setState({
      limit: rowsPerPage,
      offset: 0
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
        {state.loading && <LoadingState styles={{ root: { width: 100, height: dialogContentHeight } }} />}
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
              <List sx={{ height: dialogContentHeight, overflowY: 'auto' }}>
                {state.items.map((item) => (
                  <ListItem key={item.id}>
                    <ItemDisplay item={item} showNavigableAsLinks={false} />
                  </ListItem>
                ))}
              </List>
              <Box display="flex" justifyContent="space-between">
                <Pager
                  totalPages={totalPages}
                  totalItems={state.total}
                  currentPage={currentPage}
                  rowsPerPage={state.limit}
                  onPagePickerChange={(page) => loadPage(page)}
                  onPageChange={(page) => loadPage(page)}
                  onRowsPerPageChange={onRowsPerPageChange}
                />
              </Box>
            </>
          ))}
      </DialogContent>
    </EnhancedDialog>
  );
}

export default PackageDetailsDialog;
