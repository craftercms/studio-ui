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

import { EnhancedDialog, EnhancedDialogProps } from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { DuplicateSiteState, Views } from '../../models';
import DuplicateSiteDialogContainer from './DuplicateSiteDialogContainer';
import useSpreadState from '../../hooks/useSpreadState';

const siteInitialState: DuplicateSiteState = {
  originalSiteId: '',
  siteId: '',
  siteName: '',
  siteIdExist: false,
  siteNameExist: false,
  invalidSiteId: false,
  description: '',
  gitBranch: '',
  submitted: false,
  selectedView: 0
};

interface DuplicateSiteDialogProps extends EnhancedDialogProps {
  siteId?: string;
}

export function DuplicateSiteDialog(props: DuplicateSiteDialogProps) {
  const { ...rest } = props;
  const [site, setSite] = useSpreadState({
    ...siteInitialState,
    ...(props.siteId && { originalSiteId: props.siteId })
  });

  const views: Views = {
    0: {
      title: <FormattedMessage defaultMessage="Duplicate Project" />,
      subtitle: <FormattedMessage defaultMessage="The new project will be an exact copy of the chosen project" />
    },
    1: {
      title: <FormattedMessage defaultMessage="Finish" />,
      subtitle: <FormattedMessage defaultMessage="Review set up summary and duplicate the project" />
    }
  };

  return (
    <EnhancedDialog
      title={views[site.selectedView].title}
      dialogHeaderProps={{ subtitle: views[site.selectedView].subtitle }}
      maxWidth="lg"
      {...rest}
    >
      <DuplicateSiteDialogContainer site={site} setSite={setSite} />
    </EnhancedDialog>
  );
}

export default DuplicateSiteDialog;
