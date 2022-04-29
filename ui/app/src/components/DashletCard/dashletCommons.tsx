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
import { CheckRounded } from '@mui/icons-material';
import Box, { BoxProps } from '@mui/material/Box';
import { UNDEFINED } from '../../utils/constants';
import { getInitials } from '../../utils/string';
import Person from '../../models/Person';
import Avatar from '@mui/material/Avatar';
import { getPersonFullName } from '../SiteDashboard/utils';

export const List = styled(MuiList)({ paddingTop: 0 });

export const ListSubheader = styled(MuiListSubheader)({ paddingLeft: 0, paddingRight: 0, lineHeight: 2 });

export const ListItem = styled(MuiListItem)({ padding: 0 });

export const ListItemIcon = styled(MuiListItemIcon)({ marginRight: 0 });

export const ListItemAvatar = styled(MuiListItemAvatar)({ minWidth: 50 });

export const DenseCheckbox = styled(MuiCheckbox)({ padding: '5px' });

export const DashletAvatar = styled(Avatar)({ width: 40, height: 40 });

export interface PersonAvatarProps {
  person: Person;
}

export function PersonAvatar(props: PersonAvatarProps) {
  const { person } = props;
  return <DashletAvatar src={person.avatar ?? UNDEFINED} children={person.avatar ? UNDEFINED : getInitials(person)} />;
}

export const getItemSkeleton = ({
  numOfItems = 1,
  showCheckbox = false,
  showAvatar = false
}: Partial<{ numOfItems: number; showCheckbox: boolean; showAvatar: boolean }>) => (
  <List>
    {new Array(numOfItems).fill(null).map((nothing, index) => (
      <ListItem key={index}>
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
