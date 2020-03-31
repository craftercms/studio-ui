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
import {
  defineMessages,
  FormattedMessage,
  FormattedDate,
  useIntl,
  FormattedTime,
  FormattedDateParts
} from 'react-intl';
import DialogBody from '../../../components/DialogBody';
import { getItemVersions } from '../../../services/content';
import { LegacyItem } from '../../../../../guest/src/models/Item';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { LegacyVersion } from '../../../../../guest/src/models/version';
import makeStyles from '@material-ui/styles/makeStyles';
import { Theme, Chip } from '@material-ui/core';
import createStyles from '@material-ui/styles/createStyles';
import { palette } from '../../../styles/theme';


const translations = defineMessages({
  headerTitle: {
    id: 'historyDialog.headerTitle',
    defaultMessage: 'Content Item History'
  },
  current: {
    id: 'historyDialog.current',
    defaultMessage: 'current'
  }
});

const useStyles = makeStyles((theme: Theme) => createStyles({
  list: {
    backgroundColor: palette.white,
    padding: 0,
    borderRadius: '5px 5px 0 0',
    overflowY: 'auto'
  },
  listItem: {
    padding: ' 15px 20px'
  },
  listItemTextMultiline: {
    margin: 0
  },
  listItemTextPrimary: {
    display: 'flex',
    alignItems: 'center'
  },
  chip: {
    padding: '1px',
    backgroundColor: palette.green.main,
    height: 'auto',
    color: palette.white,
    marginLeft: '10px'
  }
}));

function FancyFormattedDate(props) {
  const ordinals = 'selectordinal, one {#st} two {#nd} few {#rd} other {#th}';
  return (
    <FormattedDateParts
      value={props.date}
      month="long"
      day="numeric"
      weekday="long"
      year="numeric"
    >
      {
        parts =>
          <>
            {`${parts[0].value} ${parts[2].value} `}
            <FormattedMessage
              id="historyDialog.ordinals"
              defaultMessage={`{day, ${ordinals}}`}
              values={{ day: parts[4].value }}
            /> {parts[6].value} @ <FormattedTime value={props.date}/>
          </>
      }
    </FormattedDateParts>
  )
}

function VersionsList(props) {
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const { versions } = props;
  return (
    <List component="div" className={classes.list} disablePadding>
      {
        versions.map((version: LegacyVersion, i: number) =>
          <ListItem key={version.versionNumber} divider={versions.length - 1 !== i} className={classes.listItem}>
              <ListItemText
                classes={{ multiline: classes.listItemTextMultiline, primary: classes.listItemTextPrimary }}
                primary={
                  <>
                    <FancyFormattedDate date={version.lastModifiedDate}/>
                    {
                      (i === 0) &&
                      <Chip label={formatMessage(translations.current)} className={classes.chip}/>
                    }
                  </>
                }
                secondary={version.comment}
              />
          </ListItem>
        )
      }
    </List>
  )
}

export default function HistoryDialog(props) {
  const {
    open = true, handleClose = () => {
    }, site = 'editorial', path = '/site/website/index.xml'
  } = props;
  const { formatMessage } = useIntl();
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
        <DialogBody>
          <VersionsList versions={data.versions}/>
        </DialogBody>
      }
    </Dialog>
  )
}


{/*<ListItemText key={version.versionNumber} primary={version.lastModifiedDate} secondary={version.comment}/>*/
}
