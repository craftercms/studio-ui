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
import useSpreadState from '../../hooks/useSpreadState';
import { DialogBody } from '../DialogBody';
import Box from '@mui/material/Box';
import DuplicateForm from './DuplicateForm';
import { DialogFooter } from '../DialogFooter';
import Button from '@mui/material/Button';
import { FormattedMessage } from 'react-intl';
import PrimaryButton from '../PrimaryButton';
import React, { MouseEvent, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { keyframes } from 'tss-react';
import { fadeIn } from 'react-animations';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { CreateSiteDialogLoader } from '../CreateSiteDialog';

interface DuplicateSiteDialogContainerProps {
  site: DuplicateSiteState;
  setSite: (site: Partial<DuplicateSiteState>) => void;
  handleClose(event?: React.MouseEvent, reason?: string): void;
}

export function DuplicateSiteDialogContainer(props: DuplicateSiteDialogContainerProps) {
  const { site, setSite, handleClose } = props;
  const [apiState, setApiState] = useSpreadState({
    duplicatingSite: false,
    error: null
  });

  const fieldsErrorsLookup: LookupTable<boolean> = useMemo(() => {
    return {
      originalSiteId: !site.originalSiteId,
      siteName: !site.siteName || site.siteNameExist,
      siteId: !site.siteId || site.siteIdExist || site.invalidSiteId,
      description: false,
      gitBranch: false
    };
  }, [site]);

  const validateForm = () => {
    return !(
      !site.originalSiteId ||
      !site.siteId ||
      site.siteIdExist ||
      !site.siteName ||
      site.siteNameExist ||
      site.invalidSiteId
    );
  };

  const handleBack = () => {
    let back = site.selectedView - 1;
    setSite({ selectedView: back });
  };

  const handleErrorBack = () => {
    setApiState({ error: null });
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
      // TODO: duplicateProject();
    }
  };

  return (
    <>
      <DialogBody>
        {(apiState.duplicatingSite && (
          <CreateSiteDialogLoader
            title={<FormattedMessage defaultMessage="Duplicating Project" />}
            handleClose={handleClose}
          />
        )) ||
          (apiState.error && <ApiResponseErrorState error={apiState.error} onButtonClick={handleErrorBack} />) || (
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
                  fieldsErrorsLookup={fieldsErrorsLookup}
                  onSubmit={handleFinish}
                />
              )}
              {site.selectedView === 1 && (
                <Grid container sx={{ maxWidth: '600px', margin: 'auto' }}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      <FormattedMessage defaultMessage="Project info" />
                      <IconButton onClick={() => {}} size="large">
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
      <DialogFooter>
        {site.selectedView === 1 && (
          <Button color="primary" variant="outlined" onClick={handleBack}>
            <FormattedMessage defaultMessage="Back" />
          </Button>
        )}
        <PrimaryButton /* ref={finishRef */ onClick={handleFinish}>
          {site.selectedView === 0 && <FormattedMessage defaultMessage="Review" />}
          {site.selectedView === 1 && <FormattedMessage defaultMessage="Duplicate Project" />}
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

export default DuplicateSiteDialogContainer;
