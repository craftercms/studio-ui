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

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Dialog, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import { PrimaryButton } from '../PrimaryButton';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { fetchContentTypeUsage, FetchContentTypeUsageResponse } from '../../services/contentTypes';
import { createResource, useActiveSiteId, useUnmount } from '../../utils/hooks';
import { Resource } from '../../models/Resource';
import List from '@material-ui/core/List';
import Checkbox from '@material-ui/core/Checkbox';
import ItemDisplay from '../ItemDisplay';
import ListSubheader from '@material-ui/core/ListSubheader';
import Typography from '@material-ui/core/Typography';
import { SandboxItem } from '../../models/Item';
import LookupTable from '../../models/LookupTable';
import ContentType from '../../models/ContentType';
import Button from '@material-ui/core/Button/Button';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import EmptyState from '../SystemStatus/EmptyState';
import { InfoOutlined } from '@material-ui/icons';

export interface DeleteContentTypeDialogBodyProps {
  resource: Resource<FetchContentTypeUsageResponse>;
  checkedPaths: LookupTable<boolean>;
  onClose?(): void;
  onBulkSelectButtonClick?(allPaths: string[]): void;
  onItemCheckChange(item: SandboxItem, checked: boolean, event?: React.SyntheticEvent<HTMLInputElement>): void;
}

export interface DeleteContentTypeDialogProps {
  open: boolean;
  contentType: ContentType;
  onClose?(): void;
  onClosed?(): void;
}

const messages = defineMessages({
  content: {
    id: 'words.content',
    defaultMessage: 'Content'
  },
  templates: {
    id: 'words.templates',
    defaultMessage: 'Templates'
  },
  scripts: {
    id: 'words.scripts',
    defaultMessage: 'Scripts'
  },
  checkboxLabel: {
    id: 'deleteContentTypeDialog.itemCheckboxLabel',
    defaultMessage: 'Select {name} for deletion'
  },
  checkAllCheckboxLabel: {
    id: 'deleteContentTypeDialog.checkAllCheckboxLabel',
    defaultMessage: 'Select all/none'
  }
});

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      background: '#fff'
    },
    preListMessageWrapper: {
      padding: '8px 15px',
      display: 'flex',
      placeContent: 'center space-between'
    },
    preListMessage: {
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        marginRight: 5
      }
    }
  })
);

function DeleteContentTypeDialogBody(props: DeleteContentTypeDialogBodyProps) {
  const classes = useStyles();
  const { onClose, resource, onItemCheckChange, checkedPaths, onBulkSelectButtonClick } = props;
  const data = resource.read();
  const { formatMessage } = useIntl();
  const dataEntries = Object.entries(data);
  const entriesWithItems = dataEntries.filter(([, items]) => items.length > 0);
  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="deleteContentTypeDialog.headerTitle" defaultMessage="Delete Content Type" />}
        subtitle={
          <FormattedMessage
            id="deleteContentTypeDialog.headerSubtitle"
            defaultMessage="Please confirm the deletion of 'My Content Type'"
          />
        }
        onDismiss={onClose}
      />
      <DialogBody>
        <div className={classes.content}>
          {entriesWithItems.length === 0 ? (
            <EmptyState title="No usages found" subtitle="The content type can be safely deleted." />
          ) : (
            <>
              <div className={classes.preListMessageWrapper}>
                <Typography className={classes.preListMessage}>
                  <InfoOutlined /> Select the items that you wish to delete together with the content type.
                </Typography>
                {onBulkSelectButtonClick && (
                  <Button
                    color="primary"
                    onClick={() =>
                      onBulkSelectButtonClick(
                        entriesWithItems.reduce((paths, [, items]) => paths.concat(items.map((item) => item.path)), [])
                      )
                    }
                  >
                    <FormattedMessage
                      id="deleteContentTypeDialog.selectAllNoneButtonLabel"
                      defaultMessage="Select all/none"
                    />
                  </Button>
                )}
              </div>
              {entriesWithItems.map(([type, items]) => (
                <List
                  key={type}
                  subheader={<ListSubheader>{messages[type] ? formatMessage(messages[type]) : type}</ListSubheader>}
                >
                  {items.map((item) => (
                    <ListItem
                      key={item.path}
                      divider
                      button
                      onClick={() => onItemCheckChange(item, !checkedPaths[item.path])}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          color="primary"
                          onChange={(e) => onItemCheckChange(item, e.currentTarget.checked, e)}
                          checked={Boolean(checkedPaths[item.path])}
                          inputProps={{
                            'aria-labelledby': formatMessage(messages.checkboxLabel, { name: item.label })
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={<ItemDisplay item={item} showNavigableAsLinks={false} />}
                        secondary={<Typography variant="body2" color="textSecondary" children={item.path} />}
                      />
                    </ListItem>
                  ))}
                </List>
              ))}
            </>
          )}
        </div>
      </DialogBody>
      <DialogFooter>
        <PrimaryButton disabled={Object.values(checkedPaths).length === 0}>
          <FormattedMessage id="deleteContentTypeDialog.submitButton" defaultMessage="Delete" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

function DeleteContentTypeDialogContainer(props: DeleteContentTypeDialogProps) {
  const { onClose, onClosed, contentType } = props;
  const site = useActiveSiteId();
  const [checkedPaths, setCheckedPaths] = useState<LookupTable<boolean>>({});
  const resource = useMemo(() => createResource(() => fetchContentTypeUsage(site, contentType.id).toPromise()), [
    site,
    contentType.id
  ]);
  useUnmount(onClosed);
  return (
    <DeleteContentTypeDialogBody
      onClose={onClose}
      resource={resource}
      checkedPaths={checkedPaths}
      onItemCheckChange={(item, checked) => {
        const nextChecked = { ...checkedPaths };
        if (checked) {
          nextChecked[item.path] = true;
        } else {
          delete nextChecked[item.path];
        }
        setCheckedPaths(nextChecked);
      }}
      onBulkSelectButtonClick={(paths) => {
        const checkedCount = Object.values(checkedPaths).length;
        if (checkedCount === paths.length) {
          setCheckedPaths({});
        } else {
          const checked = { ...checkedPaths };
          paths.forEach((path) => (checked[path] = true));
          setCheckedPaths(checked);
        }
      }}
    />
  );
}

function DeleteContentTypeDialog(props: DeleteContentTypeDialogProps) {
  const { open, onClose } = props;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DeleteContentTypeDialogContainer {...props} />
    </Dialog>
  );
}

export default DeleteContentTypeDialog;
