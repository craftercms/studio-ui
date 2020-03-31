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

import React, { useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from '../../../components/DialogHeader';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DialogBody from '../../../components/DialogBody';
import { getItemVersions } from '../../../services/content';
import { LegacyItem } from '../../../../../guest/src/models/Item';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { LegacyVersion } from '../../../../../guest/src/models/version';
import makeStyles from '@material-ui/styles/makeStyles/makeStyles';
import { Theme } from '@material-ui/core';
import createStyles from '@material-ui/styles/createStyles/createStyles';

const translations = defineMessages({
  headerTitle: {
    id: 'historyDialog.headerTitle',
    defaultMessage: 'Content Item History'
  }
});

const useStyles = makeStyles((theme: Theme) => createStyles({
  dialogBody: {
    overflow: 'auto'
  }
}));

export default function HistoryDialog(props) {
  const {
    open = true, handleClose = () => {
    }, site = 'editorial', path = '/site/website/index.xml'
  } = props;
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const [data, setData] = useState<{ contentItem: LegacyItem, versions: LegacyVersion[] }>({
    contentItem: null,
    versions: null
  });

  useEffect(() => {
    getItemVersions(site, path).subscribe(
      (response) => {
        setData({ contentItem: response.item, versions: response.versions });
        console.log(response);
      },
      (response) => {
        console.log(response);
      }
    )
  }, [site, path]);

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      fullWidth
      maxWidth="md"
    >
      <DialogHeader title={formatMessage(translations.headerTitle)} onClose={handleClose}/>
      {
        data.versions &&
        <DialogBody className={classes.dialogBody}>
          <List component="div">
            {
              data.versions.map((version: LegacyVersion) =>
                <ListItemText key={version.versionNumber} primary="Photos" secondary="Jan 9, 2014"/>
              )
            }
            <ListItem>
            </ListItem>
          </List>
        </DialogBody>
      }
    </Dialog>
  )
}
