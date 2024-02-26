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

import React, { useEffect, useState, useMemo } from 'react';
import Card from '@mui/material/Card';
import CardHeader, { cardHeaderClasses } from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded';
import { Site } from '../../models/Site';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import CardActionArea from '@mui/material/CardActionArea';
import { alpha, Typography } from '@mui/material';
import { useSiteCardStyles } from '../SitesGrid/styles';
import { PublishingStatus } from '../../models/Publishing';
import { PublishingStatusButtonUI } from '../PublishingStatusButton';
import SiteStatusIndicator from '../SiteStatusIndicator/SiteStatusIndicator';
import { toColor } from '../../utils/string';
import useProjectPreviewImage from '../../hooks/useProjectPreviewImage';
import { PROJECT_PREVIEW_IMAGE_UPDATED } from '../../utils/constants';
import { Subscription } from 'rxjs';
import { fetchStatus } from '../../services/publishing';
import { catchError, delay, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

interface SiteCardProps {
  site: Site;
  onSiteClick(site: Site): void;
  onDeleteSiteClick(site: Site): void;
  onEditSiteClick(site: Site): void;
  onDuplicateSiteClick(siteId: string): void;
  onPublishButtonClick(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    site: Site,
    status: PublishingStatus
  ): void;
  fallbackImageSrc?: string;
  compact?: boolean;
  disabled?: boolean;
}

export function SiteCard(props: SiteCardProps) {
  const {
    site,
    onSiteClick,
    onDeleteSiteClick,
    onEditSiteClick,
    onDuplicateSiteClick,
    fallbackImageSrc,
    compact = false,
    disabled,
    onPublishButtonClick
  } = props;
  const { classes, cx: clsx } = useSiteCardStyles();
  const [publishingStatus, setPublishingStatus] = useState<PublishingStatus>();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const isSiteReady = site.state === 'READY';
  const [dataUrl, fetch] = useProjectPreviewImage(site.id, fallbackImageSrc);
  const color = useMemo(() => toColor(site.name), [site.name]);

  useEffect(() => {
    if (isSiteReady) {
      setIsFetching(true);
      const subscription = fetchStatus(site.id)
        .pipe(
          // The back seems to 400 to checking publishing status right after creating a very large site.
          // This attempts to retry the request once after a delay.
          catchError((e, c) =>
            of(null).pipe(
              delay(1000),
              switchMap(() => fetchStatus(site.id))
            )
          )
        )
        .subscribe({
          next: (status) => {
            setPublishingStatus(status);
            setIsFetching(false);
          },
          error: (error) => {
            console.log(error);
            setIsFetching(false);
          }
        });
      return () => {
        subscription?.unsubscribe();
        setIsFetching(false);
      };
    }
  }, [site.id, isSiteReady]);

  useEffect(() => {
    let subscription: Subscription | undefined;
    const callback = () => {
      subscription = fetch();
    };
    document.addEventListener(PROJECT_PREVIEW_IMAGE_UPDATED, callback);
    return () => {
      subscription?.unsubscribe();
      document.removeEventListener(PROJECT_PREVIEW_IMAGE_UPDATED, callback);
    };
  }, [fetch]);

  return (
    <Card className={clsx(classes.card, compact && 'compact')} sx={{ position: 'relative' }}>
      <CardActionArea onClick={() => onSiteClick(site)} component="div" disabled={disabled || !isSiteReady}>
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
          onClick={(e) => {
            e.stopPropagation();
            onSiteClick(site);
          }}
          titleTypographyProps={{
            variant: 'subtitle2',
            component: 'h2',
            className: 'cardTitle'
          }}
          sx={{
            [`.${cardHeaderClasses.action}`]: {
              alignSelf: 'center'
            },
            ...(!isSiteReady && {
              paddingRight: '55px'
            })
          }}
        />
        {!compact && (
          <CardMedia
            component={dataUrl ? 'img' : 'div'}
            className={classes.media}
            image={dataUrl}
            title={site.name}
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              placeContent: 'center',
              backgroundColor: theme.palette.mode === 'light' ? color : alpha(color, 0.6)
            })}
            children={
              dataUrl ? undefined : (
                <Typography
                  variant="h6"
                  component="span"
                  sx={(theme) => ({ color: theme.palette.getContrastText(color) })}
                >
                  {site.name}
                </Typography>
              )
            }
          />
        )}
      </CardActionArea>
      <CardActions className={classes.cardActions} sx={compact ? undefined : { minHeight: '64px' }} disableSpacing>
        {isSiteReady && (
          <PublishingStatusButtonUI
            isFetching={isFetching}
            enabled={publishingStatus?.enabled}
            status={publishingStatus?.status}
            totalItems={publishingStatus?.totalItems}
            numberOfItems={publishingStatus?.numberOfItems}
            variant="icon"
            size={compact ? 'small' : 'medium'}
            onClick={(e) => onPublishButtonClick(e, site, publishingStatus)}
            disabled={disabled}
          />
        )}
        {isSiteReady && onEditSiteClick && (
          <Tooltip title={<FormattedMessage id="words.edit" defaultMessage="Edit" />}>
            <IconButton onClick={() => onEditSiteClick(site)} size={compact ? 'small' : 'medium'} disabled={disabled}>
              <EditRoundedIcon />
            </IconButton>
          </Tooltip>
        )}
        {isSiteReady && onDuplicateSiteClick && (
          <Tooltip title={<FormattedMessage defaultMessage="Duplicate" />}>
            <IconButton
              onClick={() => onDuplicateSiteClick(site.id)}
              size={compact ? 'small' : 'medium'}
              disabled={disabled}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        )}
        {isSiteReady && onDeleteSiteClick && (
          <Tooltip title={<FormattedMessage defaultMessage="Delete" />}>
            <IconButton onClick={() => onDeleteSiteClick(site)} size={compact ? 'small' : 'medium'} disabled={disabled}>
              <DeleteRoundedIcon />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
      {!isSiteReady && (
        <SiteStatusIndicator state={site.state} sx={{ position: 'absolute', top: '22px', right: '20px' }} />
      )}
    </Card>
  );
}

export default SiteCard;
