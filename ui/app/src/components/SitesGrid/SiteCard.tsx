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
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import Tooltip from '@material-ui/core/Tooltip';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import CardActionArea from '@material-ui/core/CardActionArea';
import { Typography } from '@material-ui/core';
import ConfirmDropdown from '../Controls/ConfirmDropdown';
import clsx from 'clsx';
import { useSiteCardStyles } from './styles';
import { PublishingStatus } from '../../models/Publishing';
import { PublishingStatusButtonUI } from '../PublishingStatusButton';

interface SiteCardProps {
  site: Site;
  onSiteClick(site: Site): void;
  onDeleteSiteClick(site: Site): void;
  onEditSiteClick(site: Site): void;
  onPublishButtonClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, site: Site): void;
  fallbackImageSrc?: string;
  compact?: boolean;
  publishingStatus: PublishingStatus;
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

export default function SiteCard(props: SiteCardProps) {
  const {
    site,
    onSiteClick,
    onDeleteSiteClick,
    onEditSiteClick,
    fallbackImageSrc = '/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg',
    compact = false,
    publishingStatus,
    onPublishButtonClick
  } = props;
  const classes = useSiteCardStyles();
  const { formatMessage } = useIntl();

  return (
    <Card className={clsx(classes.card, compact && 'compact')}>
      <CardActionArea onClick={() => onSiteClick(site)} component="div">
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
        {!compact && (
          <CardMedia
            component="img"
            className={classes.media}
            image={`/.crafter/screenshots/default.png?crafterSite=${site.id}`}
            title={site.name}
            onError={(event) => (event.target.src = fallbackImageSrc)}
          />
        )}
      </CardActionArea>
      <CardActions className={classes.cardActions} disableSpacing>
        <PublishingStatusButtonUI
          isFetching={!publishingStatus}
          enabled={publishingStatus?.enabled}
          status={publishingStatus?.status}
          variant="icon"
          size={compact ? 'small' : 'medium'}
          onClick={(e) => onPublishButtonClick(e, site)}
        />
        {onEditSiteClick && (
          <Tooltip title={<FormattedMessage id="words.edit" defaultMessage="Edit" />}>
            <IconButton onClick={() => onEditSiteClick(site)} size={compact ? 'small' : 'medium'}>
              <EditRoundedIcon />
            </IconButton>
          </Tooltip>
        )}
        {onDeleteSiteClick && (
          <ConfirmDropdown
            size={compact ? 'small' : 'medium'}
            cancelText={formatMessage(translations.confirmCancel)}
            confirmText={formatMessage(translations.confirmOk)}
            confirmHelperText={formatMessage(translations.confirmHelperText, {
              site: site.name
            })}
            iconTooltip={<FormattedMessage id="words.delete" defaultMessage="Delete" />}
            icon={DeleteRoundedIcon}
            iconColor="action"
            onConfirm={() => {
              onDeleteSiteClick(site);
            }}
          />
        )}
      </CardActions>
    </Card>
  );
}
