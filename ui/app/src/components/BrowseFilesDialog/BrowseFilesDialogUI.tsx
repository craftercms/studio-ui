/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import React, { ReactNode, useEffect, useState } from 'react';
import { BrowseFilesDialogProps } from './BrowseFilesDialog';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { FormattedMessage } from 'react-intl';
import { search } from '../../services/search';
import { ElasticParams, SearchItem } from '../../models/Search';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import MediaCard from '../MediaCard';
import { useEnv } from '../../utils/hooks/useEnv';

interface BrowseFilesDialogUIProps extends BrowseFilesDialogProps {
  title: ReactNode;
}

const initialParameters: ElasticParams = {
  query: '',
  keywords: '',
  offset: 0,
  limit: 21,
  sortBy: '_score',
  sortOrder: 'desc',
  filters: {}
};

export function BrowseFilesDialogUI(props: BrowseFilesDialogUIProps) {
  const { title, onClose, path, onClosed } = props;
  const [items, setItems] = useState<SearchItem[]>();
  const site = useActiveSiteId();
  const { guestBase } = useEnv();

  useEffect(() => {
    search(site, { ...initialParameters, path }).subscribe((response) => {
      console.log(response.items);
      setItems(response.items);
    });
  }, [path, site]);

  return (
    <>
      <DialogHeader title={title} onDismiss={onClose} />
      <DialogBody>
        {items?.map((item: SearchItem) => {
          return <MediaCard key={item.path} item={item} previewAppBaseUri={guestBase} hasSubheader={false} />;
        })}
      </DialogBody>
      <DialogFooter>
        <SecondaryButton>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton>
          <FormattedMessage id="words.select" defaultMessage="cancel" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}
