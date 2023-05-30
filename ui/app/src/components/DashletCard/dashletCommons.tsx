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

import { styled } from '@mui/material/styles';
import MuiList from '@mui/material/List';
import MuiListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import MuiCheckbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import React, { PropsWithChildren } from 'react';
import MuiListItem from '@mui/material/ListItem';
import MuiListItemIcon from '@mui/material/ListItemIcon';
import MuiListSubheader from '@mui/material/ListSubheader';
import CheckRounded from '@mui/icons-material/CheckRounded';
import Box, { BoxProps } from '@mui/material/Box';
import { UNDEFINED } from '../../utils/constants';
import { getInitials, toColor } from '../../utils/string';
import Person from '../../models/Person';
import Avatar from '@mui/material/Avatar';
import { getPersonFullName } from '../SiteDashboard/utils';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FormattedMessage } from 'react-intl';
import { Pagination } from '../Pagination';
import { AllItemActions } from '../../models';
import { SxProps } from '@mui/system';

export const actionsToBeShown: AllItemActions[] = [
  'edit',
  'delete',
  'publish',
  'requestPublish',
  'rejectPublish',
  'dependencies',
  'history'
];

export const List = styled(MuiList)({ paddingTop: 0 });

export const ListSubheader = styled(MuiListSubheader)({ paddingLeft: 0, paddingRight: 0, lineHeight: 2 });

export const ListItem = styled(MuiListItem)({ padding: 0 });

export const ListItemIcon = styled(MuiListItemIcon)({ marginRight: 0 });

export const ListItemAvatar = styled(MuiListItemAvatar)({ minWidth: 50 });

export const DenseCheckbox = styled(MuiCheckbox)({ padding: '5px' });

export const DashletAvatar = styled(Avatar)({ width: 40, height: 40 });

export interface PersonAvatarProps {
  person: Person;
  sx?: SxProps;
}

export function PersonAvatar(props: PersonAvatarProps) {
  const { person, sx } = props;
  const backgroundColor = toColor(person.username);
  return (
    <DashletAvatar
      src={person.avatar ?? UNDEFINED}
      children={person.avatar ? UNDEFINED : getInitials(person)}
      sx={{ backgroundColor, color: (theme) => theme.palette.getContrastText(backgroundColor), ...sx }}
    />
  );
}

export const getItemSkeleton = ({
  numOfItems = 1,
  showCheckbox = false,
  showAvatar = false
}: Partial<{ numOfItems: number; showCheckbox: boolean; showAvatar: boolean }>) => (
  <List>
    {new Array(numOfItems).fill(null).map((nothing, index) => (
      <ListItem key={index} sx={{ pl: 2, pr: 2 }}>
        {showCheckbox && (
          <ListItemIcon>
            <Checkbox edge="start" disabled />
          </ListItemIcon>
        )}
        {showAvatar && (
          <ListItemAvatar>
            <DashletAvatar />
          </ListItemAvatar>
        )}
        <ListItemText
          primary={<Skeleton variant="text" />}
          secondary={
            <Typography color="text.secondary" variant="body2">
              <Skeleton variant="text" />
            </Typography>
          }
        />
      </ListItem>
    ))}
  </List>
);

export type DashletEmptyMessageProps = PropsWithChildren<{ sx?: BoxProps['sx'] }>;

export const DashletEmptyMessage = ({ children, sx }: DashletEmptyMessageProps) => (
  <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 2, ...sx }}>
    <CheckRounded sx={{ color: 'success.main', mb: 1 }} />
    <Typography color="text.secondary" variant="body2">
      {children}
    </Typography>
  </Box>
);

export interface PersonFullNameProps {
  person: Person;
}

export function PersonFullName({ person }: PersonFullNameProps) {
  return <Typography variant="h6">{getPersonFullName(person)}</Typography>;
}

export function Pager(props: {
  totalPages: number;
  totalItems: number;
  currentPage: number;
  rowsPerPage: number;
  onPagePickerChange(page: number): void;
  onPageChange(page: number): void;
  onRowsPerPageChange(rowsPerPage: number): void;
}) {
  const { totalPages, totalItems, currentPage, rowsPerPage, onPagePickerChange, onPageChange, onRowsPerPageChange } =
    props;

  return (
    <>
      <Select
        variant="standard"
        disableUnderline
        value={`${currentPage}`}
        onChange={(e) => onPagePickerChange(parseInt(e.target.value))}
        sx={{ fontSize: (theme) => theme.typography.fontSize }}
      >
        {new Array(totalPages).fill(null).map((nothing, index) => (
          <MenuItem value={index} sx={{ fontSize: (theme) => theme.typography.fontSize }} key={index}>
            {currentPage === index ? (
              <FormattedMessage defaultMessage="Page {pageNumber}" values={{ pageNumber: index + 1 }} />
            ) : (
              <FormattedMessage defaultMessage="Go to page {pageNumber}" values={{ pageNumber: index + 1 }} />
            )}
          </MenuItem>
        ))}
      </Select>
      <Pagination
        count={totalItems}
        onPageChange={(e, page) => onPageChange(page)}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value))}
        mode="table"
      />
    </>
  );
}
