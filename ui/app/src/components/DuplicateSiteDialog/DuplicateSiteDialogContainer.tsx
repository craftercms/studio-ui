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

import { DuplicateSiteState, LookupTable } from '../../models';
import { DialogBody } from '../DialogBody';
import Box from '@mui/material/Box';
import DuplicateForm from './DuplicateForm';
import { DialogFooter } from '../DialogFooter';
import Button from '@mui/material/Button';
import { FormattedMessage } from 'react-intl';
import PrimaryButton from '../PrimaryButton';
import React, { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { keyframes } from 'tss-react';
import { fadeIn } from 'react-animations';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { CreateSiteDialogLoader } from '../CreateSiteDialog';
import { duplicate, fetchLegacySite } from '../../services/sites';
import { setSiteCookie } from '../../utils/auth';
import { getSystemLink } from '../../utils/system';
import useEnv from '../../hooks/useEnv';
import { nnou } from '../../utils/object';
import { Subscription } from 'rxjs';
import useMount from '../../hooks/useMount';
import { onSubmittingAndOrPendingChangeProps } from '../../hooks/useEnhancedDialogState';

interface DuplicateSiteDialogContainerProps {
  site: DuplicateSiteState;
  setSite: (site: Partial<DuplicateSiteState>) => void;
  handleClose(event?: React.MouseEvent, reason?: string): void;
  isSubmitting: boolean;
  onSubmittingAndOrPendingChange(value: onSubmittingAndOrPendingChangeProps): void;
}

export function DuplicateSiteDialogContainer(props: DuplicateSiteDialogContainerProps) {
  const { site, setSite, handleClose, isSubmitting, onSubmittingAndOrPendingChange } = props;
  const [error, setError] = useState(null);
  const { authoringBase, useBaseDomain } = useEnv();
  const fieldsErrorsLookup: LookupTable<boolean> = useMemo(() => {
    return {
      sourceSiteId: !site.sourceSiteId,
      siteName: !site.siteName || site.siteNameExist,
      siteId: !site.siteId || site.siteIdExist || site.invalidSiteId,
      description: false,
      gitBranch: false
    };
  }, [site]);
  const [sourceSiteHasBlobStores, setSourceSiteHasBlobStores] = useState(null);
  const primaryButtonRef = useRef(null);
  const siteDuplicateSubscription = useRef<Subscription>();

  const validateForm = () => {
    return !(
      !site.sourceSiteId ||
      !site.siteId ||
      site.siteIdExist ||
      !site.siteName ||
      site.siteNameExist ||
      site.invalidSiteId
    );
  };

  const duplicateSite = () => {
    onSubmittingAndOrPendingChange({ isSubmitting: true });
    siteDuplicateSubscription.current = duplicate({
      sourceSiteId: site.sourceSiteId,
      siteId: site.siteId,
      siteName: site.siteName,
      description: site.description,
      sandboxBranch: site.gitBranch,
      ...(sourceSiteHasBlobStores && { readOnlyBlobStores: site.readOnlyBlobStores })
    }).subscribe({
      next: () => {
        siteDuplicateSubscription.current = null;
        onSubmittingAndOrPendingChange({ isSubmitting: false });
        handleClose();
        setSiteCookie(site.siteId, useBaseDomain);
        window.location.href = getSystemLink({
          systemLinkId: 'preview',
          authoringBase,
          site: site.siteId,
          page: '/'
        });
      },
      error: ({ response }) => {
        setError(response.response);
        onSubmittingAndOrPendingChange({ isSubmitting: false });
      }
    });
  };

  const handleBack = () => {
    let back = site.selectedView - 1;
    setSite({ selectedView: back });
  };

  const handleErrorBack = () => {
    setError(null);
  };

  const handleFinish = (e: MouseEvent) => {
    e && e.preventDefault();
    if (site.selectedView === 0) {
      const isFormValid = validateForm();
      if (isFormValid && !site.siteIdExist) {
        setSite({ selectedView: 1 });
      } else {
        setSite({ submitted: true });
      }
    }
    if (site.selectedView === 1) {
      duplicateSite();
    }
  };

  useMount(() => {
    return () => {
      siteDuplicateSubscription.current?.unsubscribe();
    };
  });

  useEffect(() => {
    if (site.sourceSiteId) {
      fetchLegacySite(site.sourceSiteId).subscribe({
        next: ({ blobStores }) => {
          setSourceSiteHasBlobStores(nnou(blobStores) && blobStores.length > 0);
        },
        error: ({ response }) => {
          setError(response.response);
        }
      });
    }
  }, [site?.sourceSiteId, setError]);

  useEffect(() => {
    if (primaryButtonRef && primaryButtonRef.current && site.selectedView === 1) {
      primaryButtonRef.current.focus();
    }
  }, [site.selectedView]);

  return (
    <>
      <DialogBody>
        {(isSubmitting && (
          <CreateSiteDialogLoader
            title={<FormattedMessage defaultMessage="Duplicating Project" />}
            handleClose={handleClose}
          />
        )) ||
          (error && (
            <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
              <ApiResponseErrorState error={error} onButtonClick={handleErrorBack} />
            </Box>
          )) || (
            <Box
              sx={{
                flexWrap: 'wrap',
                height: '100%',
                overflow: 'auto',
                display: 'flex',
                padding: '25px',
                animation: `${keyframes`${fadeIn}`} 1s`
              }}
            >
              {site.selectedView === 0 && (
                <DuplicateForm
                  site={site}
                  setSite={setSite}
                  sourceSiteHasBlobStores={sourceSiteHasBlobStores}
                  fieldsErrorsLookup={fieldsErrorsLookup}
                  onSubmit={handleFinish}
                />
              )}
              {site.selectedView === 1 && (
                <Grid container sx={{ maxWidth: '600px', margin: 'auto' }}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      <FormattedMessage defaultMessage="Project info" />
                      <IconButton
                        onClick={handleBack}
                        size="large"
                        sx={{
                          color: (theme) => theme.palette.primary.main,
                          '& svg': {
                            fontSize: '1.2rem'
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Typography>
                    <Typography variant="body2" gutterBottom noWrap>
                      <span>
                        <FormattedMessage defaultMessage="Project Name" />:{' '}
                      </span>
                      {site.siteName}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <span>
                        <FormattedMessage defaultMessage="Project ID" />:{' '}
                      </span>
                      {site.siteId}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <span>
                        <FormattedMessage defaultMessage="Description" />:{' '}
                      </span>
                      {site.description ? (
                        site.description
                      ) : (
                        <span>
                          (<FormattedMessage defaultMessage="No description supplied" />)
                        </span>
                      )}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <span>
                        <FormattedMessage defaultMessage="Git Branch" />:
                      </span>
                      {` ${site.gitBranch ? site.gitBranch : 'master'}`}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
      </DialogBody>
      {!isSubmitting && !error && (
        <DialogFooter>
          {site.selectedView === 1 && (
            <Button color="primary" variant="outlined" onClick={handleBack}>
              <FormattedMessage defaultMessage="Back" />
            </Button>
          )}
          <PrimaryButton ref={primaryButtonRef} onClick={handleFinish}>
            {site.selectedView === 0 && <FormattedMessage defaultMessage="Review" />}
            {site.selectedView === 1 && <FormattedMessage defaultMessage="Duplicate Project" />}
          </PrimaryButton>
        </DialogFooter>
      )}
    </>
  );
}

export default DuplicateSiteDialogContainer;
