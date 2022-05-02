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

export interface PackageDetailsDialogProps extends EnhancedDialogProps {
  packageId: string;
}

export function PackageDetailsDialog(props: PackageDetailsDialogProps) {
  const { packageId, ...enhancedDialogProps } = props;
  const site = useActiveSiteId();
  const [state, setState] = useSpreadState({
    items: null,
    loading: false,
    error: null
  });
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
                  id="packageDetailsDialog.emptyPackageMessage"
                  defaultMessage="Fetch package id is {packageId}"
                  values={{ packageId }}
                />
              }
            />
          ) : (
            <List>
              {state.items.map((item) => (
                <ListItem key={item.id}>
                  <ItemDisplay item={item} showNavigableAsLinks={false} />
                </ListItem>
              ))}
            </List>
          ))}
      </DialogContent>
    </EnhancedDialog>
  );
}

export default PackageDetailsDialog;
