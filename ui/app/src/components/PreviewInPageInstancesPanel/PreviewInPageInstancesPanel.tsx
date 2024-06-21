/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import MenuItem from '@mui/material/MenuItem';
import { makeStyles } from 'tss-react/mui';
import { contentTreeFieldSelected, setContentTypeFilter, setPreviewEditMode } from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import Suspencified from '../Suspencified/Suspencified';
import ContentInstance from '../../models/ContentInstance';
import SearchBar from '../SearchBar/SearchBar';
import Select from '@mui/material/Select';
import ListItem from '@mui/material/ListItem';
import Avatar from '@mui/material/Avatar';
import { getInitials } from '../../utils/string';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import { getHostToGuestBus } from '../../utils/subjects';
import EmptyState from '../EmptyState/EmptyState';
import { useSelection } from '../../hooks/useSelection';
import { usePreviewGuest } from '../../hooks/usePreviewGuest';
import { useContentTypes } from '../../hooks/useContentTypes';
import { LoadingState } from '../LoadingState';

const translations = defineMessages({
  previewInPageInstancesPanel: {
    id: 'previewInPageInstancesPanel.title',
    defaultMessage: 'In this Page'
  },
  noResults: {
    id: 'previewInPageInstancesPanel.noResults',
    defaultMessage: 'No results found.'
  },
  selectContentType: {
    id: 'previewInPageInstancesPanel.selectContentType',
    defaultMessage: 'Select content type'
  },
  chooseContentType: {
    id: 'previewInPageInstancesPanel.chooseContentType',
    defaultMessage: 'Please choose a content type.'
  }
});

const useStyles = makeStyles()(() => ({
  search: {
    padding: '15px 15px 0 15px'
  },
  Select: {
    width: '100%',
    marginTop: '15px'
  },
  noWrapping: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'block'
  },
  selectProgress: {
    position: 'absolute',
    right: '28px'
  },
  emptyStateTitle: {
    fontSize: '1em'
  },
  item: {}
}));

export function PreviewInPageInstancesPanel() {
  const { classes } = useStyles();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const contentTypeLookup = useContentTypes();
  const contentTypeFilter = useSelection((state) => state.preview.components.contentTypeFilter);
  const guest = usePreviewGuest();
  const [keyword, setKeyword] = useState('');
  const hostToGuest$ = getHostToGuestBus();
  const editMode = useSelection((state) => state.preview.editMode);
  const models = useMemo(() => {
    return guest?.models;
  }, [guest]);
  const filteredContentTypes = Object.values(models ?? {}).filter(
    (model) => model.craftercms.contentTypeId === contentTypeFilter
  );

  const selectedModels = useMemo(() => {
    return Object.values(models ?? []).filter((model) => {
      return (
        model.craftercms.contentTypeId === contentTypeFilter &&
        (model.craftercms.label.toLowerCase().includes(keyword.toLowerCase()) ||
          model.craftercms.contentTypeId.toLowerCase().includes(keyword.toLowerCase()))
      );
    });
    // filter using .includes(keyword) on model.craftercms.label
  }, [contentTypeFilter, models, keyword]);

  const [contentTypes, setContentTypes] = useState([]);

  // setting contentTypes
  useEffect(() => {
    if (models) {
      const contentTypes = [];
      Object.values(models ?? []).forEach((model) => {
        // TODO: Groovy Controller Issue;
        if (model.craftercms.contentTypeId && contentTypes.indexOf(model.craftercms.contentTypeId) <= 0) {
          contentTypes.push(model.craftercms.contentTypeId);
        }
      });
      setContentTypes(contentTypes);
    }
    return () => {
      setContentTypes([]);
      setKeyword('');
    };
  }, [models]);

  const handleSearchKeyword = (keyword) => {
    setKeyword(keyword);
  };

  const handleSelectChange = (value: string) => {
    setKeyword('');
    dispatch(setContentTypeFilter(value));
  };

  const onItemClick = (instance: ContentInstance) => {
    if (!editMode) {
      dispatch(setPreviewEditMode({ editMode: true }));
    }
    hostToGuest$.next(
      contentTreeFieldSelected({
        name: instance.craftercms.label,
        scrollElement: null,
        iceProps: {
          modelId: instance.craftercms.id,
          fieldId: null,
          index: null
        }
      })
    );
    return;
  };

  return (
    <>
      <div className={classes.search}>
        <SearchBar
          showActionButton={Boolean(keyword)}
          onChange={handleSearchKeyword}
          keyword={keyword}
          disabled={!Boolean(contentTypeFilter)}
        />
        <Select
          value={contentTypes.length ? contentTypeFilter : ''}
          displayEmpty
          className={classes.Select}
          onChange={(event: any) => handleSelectChange(event.target.value)}
          endAdornment={
            contentTypes.length && contentTypeLookup ? null : (
              <CircularProgress size={20} className={classes.selectProgress} />
            )
          }
        >
          <MenuItem value="" disabled>
            {formatMessage(translations.selectContentType)}
          </MenuItem>
          {contentTypeLookup &&
            contentTypes.map((id: string, i: number) => (
              <MenuItem value={contentTypeLookup[id].id} key={i}>
                {contentTypeLookup[id].name}
              </MenuItem>
            ))}
        </Select>
      </div>
      <Suspencified>
        {filteredContentTypes ? (
          <InPageInstancesUI
            selectedModels={selectedModels}
            onItemClick={onItemClick}
            contentTypeFilter={contentTypeFilter}
          />
        ) : (
          <LoadingState />
        )}
      </Suspencified>
    </>
  );
}

interface InPageInstancesUIProps {
  selectedModels: ContentInstance[];
  contentTypeFilter: string;
  onItemClick(instance: ContentInstance): void;
}

function InPageInstancesUI(props: InPageInstancesUIProps) {
  const { selectedModels, onItemClick, contentTypeFilter } = props;
  const { classes } = useStyles();
  const { formatMessage } = useIntl();

  return (
    <>
      {selectedModels.length ? (
        selectedModels.map((instance: ContentInstance) => (
          <ListItem
            key={instance.craftercms.id}
            className={classes.item}
            button={true}
            onClick={() => onItemClick(instance)}
          >
            <ListItemAvatar>
              <Avatar>{getInitials(instance.craftercms.label)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={instance.craftercms.label}
              secondary={instance.craftercms.contentTypeId}
              classes={{ primary: classes.noWrapping, secondary: classes.noWrapping }}
            />
          </ListItem>
        ))
      ) : (
        <EmptyState
          title={
            contentTypeFilter ? formatMessage(translations.noResults) : formatMessage(translations.chooseContentType)
          }
          classes={{ title: classes.emptyStateTitle }}
        />
      )}
    </>
  );
}

export default PreviewInPageInstancesPanel;
