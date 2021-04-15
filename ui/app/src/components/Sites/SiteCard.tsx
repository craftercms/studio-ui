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

import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import { Site } from '../../models/Site';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import Tooltip from '@material-ui/core/Tooltip';
import { FormattedMessage } from 'react-intl';
import CardActionArea from '@material-ui/core/CardActionArea';
import cardTitleStyles from '../../styles/card';

interface SiteCardProps {
  site: Site;
  onSiteClick(site: Site): void;
}

const styles = makeStyles((theme) =>
  createStyles({
    media: {
      height: 0,
      paddingTop: '56.25%'
    },
    card: {
      width: '402px',
      height: '360px'
    },
    cardHeader: {
      cursor: 'pointer',
      '&:hover': {
        background: theme.palette.action.hover
      },
      '& .cardTitle': {
        ...cardTitleStyles
      },
      '& .cardSubtitle': {
        overflow: 'hidden',
        display: '-webkit-box',
        '-webkit-line-clamp': 1,
        '-webkit-box-orient': 'vertical'
      }
    }
  })
);

export default function SiteCard(props: SiteCardProps) {
  const { site, onSiteClick } = props;
  const classes = styles();

  const onDescriptionIconClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card className={classes.card}>
      <CardHeader
        title={site.name}
        className={classes.cardHeader}
        subheader={site.description ?? '(No description)'}
        onClick={() => onSiteClick(site)}
        action={
          <Tooltip title={<FormattedMessage id="words.description" defaultMessage="Description" />}>
            <IconButton onClick={onDescriptionIconClick}>
              <InfoRoundedIcon />
            </IconButton>
          </Tooltip>
        }
        titleTypographyProps={{
          variant: 'subtitle2',
          component: 'h2',
          className: 'cardTitle'
        }}
        subheaderTypographyProps={{
          variant: 'subtitle2',
          component: 'h2',
          className: 'cardSubtitle',
          color: 'textSecondary'
        }}
      />
      <CardActionArea onClick={() => onSiteClick(site)}>
        <CardMedia
          className={classes.media}
          image={`/static-assets/images/screenshots/site.png?crafterSite=editorial`}
          title={site.name}
        />
      </CardActionArea>
      <CardActions disableSpacing>
        <Tooltip title={<FormattedMessage id="words.edit" defaultMessage="Edit" />}>
          <IconButton>
            <EditRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={<FormattedMessage id="words.delete" defaultMessage="Delete" />}>
          <IconButton>
            <DeleteRoundedIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
