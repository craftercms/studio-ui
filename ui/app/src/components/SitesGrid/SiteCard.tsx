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
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import { Site } from '../../models/Site';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import Tooltip from '@material-ui/core/Tooltip';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import CardActionArea from '@material-ui/core/CardActionArea';
import cardTitleStyles from '../../styles/card';
import { Typography } from '@material-ui/core';
import ConfirmDropdown from '../Controls/ConfirmDropdown';
import Skeleton from '@material-ui/lab/Skeleton';

interface SiteCardProps {
  site: Site;
  onSiteClick(site: Site): void;
  onDeleteSiteClick(site: Site): void;
  onEditSiteClick(site: Site): void;
  fallbackImageSrc?: string;
}

const translations = defineMessages({
  confirmHelperText: {
    id: 'siteCard.helperText',
    defaultMessage: 'Delete "{site}" site?'
  },
  confirmOk: {
    id: 'words.yes',
    defaultMessage: 'Yes'
  },
  confirmCancel: {
    id: 'words.no',
    defaultMessage: 'No'
  }
});

const styles = makeStyles((theme) =>
  createStyles({
    media: {
      height: '226px'
    },
    card: {
      width: '402px'
    },
    cardHeader: {
      height: '77px',
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
  const {
    site,
    onSiteClick,
    onDeleteSiteClick,
    onEditSiteClick,
    fallbackImageSrc = '/studio/static-assets/images/no_image_available.jpg'
  } = props;
  const classes = styles();
  const { formatMessage } = useIntl();

  return (
    <Card className={classes.card}>
      <CardActionArea onClick={() => onSiteClick(site)}>
        <CardHeader
          title={site.name}
          className={classes.cardHeader}
          subheader={
            site.description && (
              <Tooltip title={site.description}>
                <Typography color="textSecondary" component="h2" variant="subtitle2" className="cardSubtitle">
                  {site.description}
                </Typography>
              </Tooltip>
            )
          }
          onClick={() => onSiteClick(site)}
          titleTypographyProps={{
            variant: 'subtitle2',
            component: 'h2',
            className: 'cardTitle'
          }}
        />
        <CardMedia
          component={'img'}
          className={classes.media}
          image={`/static-assets/images/screenshots/site.png?crafterSite=${site.id}`}
          title={site.name}
          onError={(event) => (event.target.src = fallbackImageSrc)}
        />
      </CardActionArea>
      <CardActions disableSpacing>
        <Tooltip title={<FormattedMessage id="words.edit" defaultMessage="Edit" />}>
          <IconButton onClick={() => onEditSiteClick(site)}>
            <EditRoundedIcon />
          </IconButton>
        </Tooltip>
        <ConfirmDropdown
          cancelText={formatMessage(translations.confirmCancel)}
          confirmText={formatMessage(translations.confirmOk)}
          confirmHelperText={formatMessage(translations.confirmHelperText, {
            site: site.name
          })}
          iconTooltip={<FormattedMessage id="siteCard.delete" defaultMessage="Delete site" />}
          icon={DeleteRoundedIcon}
          iconColor="action"
          onConfirm={() => {
            onDeleteSiteClick(site);
          }}
        />
      </CardActions>
    </Card>
  );
}

export function SiteCardSkeleton() {
  const classes = styles();
  return (
    <Card className={classes.card}>
      <CardHeader
        title={<Skeleton animation="wave" height={20} width="40%" />}
        className={classes.cardHeader}
        subheader={<Skeleton animation="wave" height={20} width="80%" />}
      />
      <Skeleton animation="wave" variant="rect" className={classes.media} />
      <CardActions disableSpacing>
        <Skeleton variant="circle" width={40} height={40} style={{ marginRight: '10px' }} />
        <Skeleton variant="circle" width={40} height={40} />
      </CardActions>
    </Card>
  );
}
