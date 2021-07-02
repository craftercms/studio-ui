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

import React, { useEffect, useState } from 'react';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { FormattedMessage } from 'react-intl';
import { search } from '../../services/search';
import { ElasticParams, MediaItem, SearchItem } from '../../models/Search';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import MediaCard from '../MediaCard';
import { useEnv } from '../../utils/hooks/useEnv';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { useStyles } from './styles';
import ImageRoundedIcon from '@material-ui/icons/ImageRounded';
import SearchBar from '../Controls/SearchBar';
import Box from '@material-ui/core/Box';
import clsx from 'clsx';

interface BrowseFilesDialogUIProps {
  path: string;
  onClose(): void;
  onClosed?(): void;
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

export function BrowseFilesDialogContainer(props: BrowseFilesDialogUIProps) {
  const { path, onClose, onClosed } = props;
  const [items, setItems] = useState<SearchItem[]>();
  const site = useActiveSiteId();
  const { guestBase } = useEnv();
  const classes = useStyles();
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<MediaItem>();

  useUnmount(onClosed);

  useEffect(() => {
    search(site, { ...initialParameters, path }).subscribe((response) => {
      setItems(response.items);
    });
  }, [path, site]);

  const onSelected = (item: MediaItem) => {
    setSelected(item);
  };

  const onSearch = () => {};

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="browseFilesDialog.uploadImage" defaultMessage="Select a file" />}
        onDismiss={onClose}
      />
      <DialogBody className={classes.dialogBody}>
        <SearchBar keyword={keyword} onChange={onSearch} classes={{ root: classes.searchRoot }} />
        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-between" margin="0 -10px">
          {items?.map((item: SearchItem) => {
            return (
              <MediaCard
                classes={{ root: clsx(classes.mediaCardRoot, item.path === selected?.path && 'selected') }}
                key={item.path}
                item={item}
                previewAppBaseUri={guestBase}
                avatar={ImageRoundedIcon}
                onPreview={onSelected}
                hasSubheader={false}
              />
            );
          })}
        </Box>
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
