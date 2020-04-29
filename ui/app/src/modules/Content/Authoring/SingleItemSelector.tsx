/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import React, { useRef } from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { palette } from '../../../styles/theme';
import { Variant } from '@material-ui/core/styles/createTypography';
import { Consumer, SandboxItem } from '../../../models/Item';
import InsertDriveFileRoundedIcon from '@material-ui/icons/InsertDriveFileRounded';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Popover from '@material-ui/core/Popover';
import PathNavigatorList from '../../../components/Navigation/PathNavigator/PathNavigatorList';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { useStateResource } from '../../../utils/hooks';
import Paper from '@material-ui/core/Paper';
import Breadcrumbs from '../../../components/Navigation/PathNavigator/PathNavigatorBreadcrumbs';

const useStyles = makeStyles((theme) => ({
  popoverRoot: {
    minWidth: '245px',
    marginTop: '5px',
    padding: '0px 5px 5px 5px'
  },
  root: {
    'backgroundColor': palette.white,
    'display': 'flex',
    'padding-left': '15px',
    'align-items': 'center',
    'justify-content': 'space-between',
    'align-self': 'flex-start',
    'min-width': '245px',
    '& p': {
      padding: 0
    }
  },
  textWrapper: {
    'display': 'flex',
    '& > *': {
      marginRight: 15
    },
    '& > p': {
      color: palette.black
    }
  },
  title: {
    fontWeight: 600
  },
  changeBtn: {},
  itemIcon: {
    fill: palette.teal.main,
    marginRight: 10
  },
  selectIcon: {}
}));

interface SingleItemSelectorProps {
  itemIcon?: React.ElementType;
  selectIcon?: React.ElementType;
  classes?: {
    root?: string;
    title?: string;
    selectIcon?: string;
    itemIcon?: string;
  };
  selectedItem?: SandboxItem;
  label: string;
  titleVariant?: Variant;
  labelVariant?: Variant;
  open: boolean;
  rootPath: string;
  consumer: Consumer;
  onSelectClick(): void;
  onClose(): void;
  onItemClicked(item: SandboxItem): void;
}

export default function SingleItemSelector(props: SingleItemSelectorProps) {
  const {
    itemIcon: ItemIcon = InsertDriveFileRoundedIcon,
    selectIcon: SelectIcon = ExpandMoreRoundedIcon,
    classes: propClasses,
    titleVariant,
    labelVariant,
    onSelectClick,
    onItemClicked,
    onClose,
    selectedItem,
    label,
    open,
    rootPath,
    consumer
  } = props;
  const classes = useStyles();

  const anchorEl = useRef();

  const itemsResource = useStateResource<SandboxItem[], Consumer>(consumer, {
    shouldResolve: (consumer) => Boolean(consumer.byId) && !consumer.isFetching,
    shouldReject: (consumer) => Boolean(consumer.error),
    shouldRenew: (consumer, resource) => (
      consumer.isFetching && resource.complete
    ),
    resultSelector: (consumer) => {
      return consumer.items.map(id => consumer.byId[id]);
    },
    errorSelector: (consumer) => consumer.error
  });

  return (
    <Paper className={clsx(classes.root, propClasses?.root)} elevation={0}>
      <div className={classes.textWrapper}>
        <Typography
          variant={titleVariant || 'body1'}
          className={clsx(classes.title, propClasses?.title)}
        >
          {label}
        </Typography>
        {
          selectedItem &&
          <>
            <ItemIcon className={clsx(classes.itemIcon, propClasses?.itemIcon)} />
            <Typography variant={labelVariant || 'body1'}>{selectedItem.label}</Typography>
          </>
        }
      </div>
      <IconButton
        className={classes.changeBtn}
        ref={anchorEl}
        onClick={onSelectClick}
      >
        <SelectIcon className={clsx(classes.selectIcon, propClasses?.selectIcon)} />
      </IconButton>
      <Popover
        anchorEl={anchorEl.current}
        open={open}
        classes={{paper: classes.popoverRoot}}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <SuspenseWithEmptyState resource={itemsResource}>
          <Breadcrumbs
            keyword={consumer?.keywords}
            breadcrumb={consumer ? consumer?.breadcrumb : []}
            onSearch={() => {
            }}
            onCrumbSelected={() => {
            }}
          />
          <PathNavigatorList
            leafs={[]}
            locale={'en'}
            resource={itemsResource}
            onPathSelected={() => {
              console.log('onPathSelected')
            }}
            onItemClicked={onItemClicked}
          />
        </SuspenseWithEmptyState>
      </Popover>
    </Paper>
  );
}
