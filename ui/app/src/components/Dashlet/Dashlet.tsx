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

import React, { ElementType, PropsWithChildren } from 'react';
import Accordion, { AccordionProps } from '@mui/material/Accordion';
import AccordionSummary, { accordionSummaryClasses } from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import useStyles from './styles';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { FormattedMessage } from 'react-intl';
import Tooltip from '@mui/material/Tooltip';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import clsx from 'clsx';
import { styled } from '@mui/material/styles';

export type DashletProps = PropsWithChildren<
  Omit<AccordionProps, 'title'> & {
    title: React.ReactNode;
    headerRightSection?: React.ReactNode;
    icon?: ElementType;
    onRefresh?(): void;
    refreshDisabled?: boolean;
    onToggleExpanded(): void;
  }
>;

const Summary = styled(AccordionSummary)(() => {
  return {
    [`& .${accordionSummaryClasses['content']}`]: {
      alignItems: 'center'
    },
    [`&.${accordionSummaryClasses['focusVisible']}`]: {
      backgroundColor: 'inherit'
    }
  };
});

export default function Dashlet(props: DashletProps) {
  const {
    icon: Icon = ExpandMoreIcon,
    title,
    headerRightSection,
    onToggleExpanded,
    refreshDisabled = false,
    children,
    onRefresh,
    ...rest
  } = props;
  const classes = useStyles();
  return (
    <Accordion {...rest}>
      <Summary expandIcon={<Icon />} onClick={onToggleExpanded}>
        <Typography>{title}</Typography>
        {headerRightSection && <section className={classes.rightSection}>{headerRightSection}</section>}
        {onRefresh && (
          <IconButton
            disabled={refreshDisabled}
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            className={clsx(!headerRightSection && classes.refresh)}
            size="large"
          >
            <Tooltip title={<FormattedMessage id="words.refresh" defaultMessage="Refresh" />}>
              <RefreshRoundedIcon />
            </Tooltip>
          </IconButton>
        )}
      </Summary>
      <AccordionDetails className={classes.details}>{children}</AccordionDetails>
    </Accordion>
  );
}
