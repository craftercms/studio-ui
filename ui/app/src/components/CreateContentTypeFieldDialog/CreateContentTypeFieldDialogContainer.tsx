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

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { SearchBar } from '../SearchBar';
import List from '@mui/material/List';
import Grid from '@mui/material/Grid';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import StarIcon from '@mui/icons-material/Star';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useState } from 'react';
import { DialogBody } from '../DialogBody';
import { DialogFooter } from '../DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import * as React from 'react';
import { EmptyState } from '../EmptyState';

export interface CreateContentTypeFieldDialogContainerProps {}

const translations = defineMessages({
  search: {
    id: 'words.search',
    defaultMessage: 'Search'
  },
  noTypesFound: {
    id: 'contentTypeFieldDialog.noTypesFound',
    defaultMessage: 'No types found'
  }
});

const types = [
  {
    id: 'text',
    label: 'Text',
    description: 'Short, long or rich text'
  },
  {
    id: 'components',
    label: 'Components',
    description: 'Reference to component(s)'
  },
  {
    id: 'number',
    label: 'Number',
    description: 'Integer, floating point, etc.'
  },
  {
    id: 'pages',
    label: 'Pages',
    description: 'Reference to page(s)'
  }
];

export function CreateContentTypeFieldDialogContainer(props) {
  const [keyword, setKeyword] = useState('');
  const { formatMessage } = useIntl();
  const filteredTypes = types.filter((type) => type.id.includes(keyword.toLowerCase()));

  return (
    <>
      <DialogBody>
        <Box flexGrow={1}>
          <SearchBar
            keyword={keyword}
            onChange={setKeyword}
            showDecoratorIcon
            showActionButton={Boolean(keyword)}
            placeholder={formatMessage(translations.search)}
          />
          <List component={Grid} container spacing={2} sx={{ width: '100%' }}>
            {filteredTypes.length ? (
              filteredTypes.map((type) => (
                <ListItemButton component={Grid} item xs={6}>
                  <ListItemAvatar>
                    <StarIcon />
                  </ListItemAvatar>
                  <ListItemText primary={type.label} secondary={type.description} />
                </ListItemButton>
              ))
            ) : (
              <Grid item xs={12}>
                <EmptyState title={formatMessage(translations.noTypesFound)} />
              </Grid>
            )}
          </List>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            <FormattedMessage
              id="createContentTypeDialog.helper"
              defaultMessage="Created fields will be available to all content types."
            />
          </Typography>
        </Box>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton autoFocus>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton>
          <FormattedMessage id="words.create" defaultMessage="Create" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

export default CreateContentTypeFieldDialogContainer;
