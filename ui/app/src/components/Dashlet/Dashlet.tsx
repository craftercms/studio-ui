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
import Accordion, { AccordionProps } from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreRounded';
import useStyles from './styles';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';

export type DashletProps = PropsWithChildren<
  Omit<AccordionProps, 'title'> & {
    title: React.ReactNode;
    headerRightSection?: React.ReactNode;
    icon?: ElementType;
    onToggleExpanded(): void;
  }
>;

export default function Dashlet(props: DashletProps) {
  const { icon: Icon = ExpandMoreIcon, title, headerRightSection, onToggleExpanded, children, ...rest } = props;
  const classes = useStyles();
  return (
    <Accordion {...rest}>
      <AccordionSummary expandIcon={<Icon />} classes={{ content: classes.summary }} onClick={onToggleExpanded}>
        <Typography>{title}</Typography>
        {headerRightSection && <section className={classes.rightSection}>{headerRightSection}</section>}
      </AccordionSummary>
      <AccordionDetails className={classes.details}>{children}</AccordionDetails>
    </Accordion>
  );
}
