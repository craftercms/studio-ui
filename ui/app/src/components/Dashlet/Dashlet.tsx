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
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreRounded';
import useStyles from './styles';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { AccordionProps } from '@material-ui/core/Accordion/Accordion';

export type DashletProps = PropsWithChildren<{
  title: React.ReactNode;
  rightSection?: React.ReactNode;
  expanded: boolean;
  icon?: ElementType;
  onExpanded(value: boolean): void;
  accordionProps?: AccordionProps;
}>;

export default function Dashlet(props: DashletProps) {
  const { expanded, icon: Icon = ExpandMoreIcon, title, rightSection, onExpanded, children, accordionProps } = props;
  const classes = useStyles();
  return (
    <Accordion expanded={expanded} {...accordionProps}>
      <AccordionSummary
        expandIcon={<Icon />}
        classes={{ content: classes.summary }}
        onClick={() => onExpanded(!expanded)}
      >
        {title}
        {rightSection && <section className={classes.rightSection}>{rightSection}</section>}
      </AccordionSummary>
      <AccordionDetails className={classes.details}>{children}</AccordionDetails>
    </Accordion>
  );
}
