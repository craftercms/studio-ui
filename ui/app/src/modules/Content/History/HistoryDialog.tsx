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

import React, { PropsWithChildren, useCallback } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from '../../../components/DialogHeader';
import {
  defineMessages,
  FormattedDateParts,
  FormattedMessage,
  FormattedTime,
  useIntl
} from 'react-intl';
import DialogBody from '../../../components/DialogBody';
import { LegacyItem } from '../../../../../guest/src/models/Item';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import makeStyles from '@material-ui/styles/makeStyles';
import createStyles from '@material-ui/styles/createStyles';
import { palette } from '../../../styles/theme';
import MoreVertIcon from '@material-ui/icons/MoreVertRounded';
import { useSpreadState, useStateResource } from '../../../utils/hooks';
import ContextMenu, { SectionItem } from '../../../components/ContextMenu';
import DialogFooter from '../../../components/DialogFooter';
import TablePagination from '@material-ui/core/TablePagination';
import { APIError, EntityState } from '../../../models/GlobalState';
import { Resource } from '../../../models/Resource';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { LookupTable } from '../../../models/LookupTable';
import clsx from 'clsx';
import StandardAction from '../../../models/StandardAction';
import { LegacyVersion } from '../../../models/version';
import { useDispatch } from 'react-redux';
import { compareHistories, historyDialogChangePage } from '../../../state/reducers/dialogs/history';

const translations = defineMessages({
  previousPage: {
    id: 'pagination.PreviousPage',
    defaultMessage: 'Previous page'
  },
  nextPage: {
    id: 'pagination.nextPage',
    defaultMessage: 'Next page'
  },
  view: {
    id: 'words.view',
    defaultMessage: 'View'
  },
  compareTo: {
    id: 'historyDialog.options.compareTo',
    defaultMessage: 'Compare to...'
  },
  compareToCurrent: {
    id: 'historyDialog.options.compareToCurrent',
    defaultMessage: 'Compare to current'
  },
  compareToPrevious: {
    id: 'historyDialog.options.compareToPrevious',
    defaultMessage: 'Compare to previous'
  },
  revertToPrevious: {
    id: 'historyDialog.options.revertToPrevious',
    defaultMessage: 'Revert to <b>previous</b>'
  },
  revertToThisVersion: {
    id: 'historyDialog.options.revertToThisVersion',
    defaultMessage: 'Revert to <b>this version</b>'
  }
});

const versionListStyles = makeStyles(() =>
  createStyles({
    list: {
      backgroundColor: palette.white,
      padding: 0,
      borderRadius: '5px 5px 0 0',
      overflowY: 'auto'
    },
    listItem: {
      padding: ' 15px 20px',
      '&.selected': {
        backgroundColor: palette.blue.highlight
      }
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
    },
    pagination: {
      marginLeft: 'auto',
      position: 'fixed',
      zIndex: 1,
      bottom: 0,
      background: 'white',
      color: 'black',
      left: 0,
      borderTop: '1px solid rgba(0, 0, 0, 0.12)',
      '& p': {
        padding: 0
      },
      '& svg': {
        top: 'inherit'
      },
      '& .hidden': {
        display: 'none'
      }
    },
    toolbar: {
      padding: 0,
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: '20px',
      '& .MuiTablePagination-spacer': {
        display: 'none'
      },
      '& .MuiTablePagination-spacer + p': {
        display: 'none'
      }
    }
  })
);

const historyStyles = makeStyles(() =>
  createStyles({
    dialogFooter: {
      padding: 0
    },
    menuList: {
      padding: 0
    },
    pagination: {
      marginLeft: 'auto',
      background: 'white',
      color: 'black',
      '& p': {
        padding: 0
      },
      '& svg': {
        top: 'inherit'
      },
      '& .hidden': {
        display: 'none'
      }
    },
    toolbar: {
      padding: 0,
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: '20px',
      '& .MuiTablePagination-spacer': {
        display: 'none'
      },
      '& .MuiTablePagination-spacer + p': {
        display: 'none'
      }
    }
  })
);

const CompareRevisionStyles = makeStyles(() =>
  createStyles({
    compareBoxHeader: {
      display: 'flex',
      justifyContent: 'space-around'
    },
    compareBoxHeaderItem: {
      flexBasis: '50%',
      '& .blackText': {
        color: palette.black
      }
    }
  })
);

interface FancyFormattedDateProps {
  date: string;
}

function FancyFormattedDate(props: FancyFormattedDateProps) {
  const ordinals = 'selectordinal, one {#st} two {#nd} few {#rd} other {#th}';
  return (
    <FormattedDateParts value={props.date} month="long" day="numeric" weekday="long" year="numeric">
      {(parts) => (
        <>
          {`${parts[0].value} ${parts[2].value} `}
          <FormattedMessage
            id="historyDialog.ordinals"
            defaultMessage={`{day, ${ordinals}}`}
            values={{ day: parts[4].value }}
          />{' '}
          {parts[6].value} @ <FormattedTime value={props.date} />
        </>
      )}
    </FormattedDateParts>
  );
}

interface CompareRevisionProps {
  compareA: LegacyVersion;
  compareB: LegacyVersion;
}

function CompareRevision(props: CompareRevisionProps) {
  const classes = CompareRevisionStyles({});
  const { compareA, compareB } = props;
  return (
    <section className={classes.compareBoxHeader}>
      <div className={classes.compareBoxHeaderItem}>
        <ListItemText
          primary={<FancyFormattedDate date={compareA.lastModifiedDate} />}
          secondary={
            <FormattedMessage
              id="historyDialog.versionNumber"
              defaultMessage="Version: <span>{versionNumber}</span>"
              values={{
                versionNumber: compareA.versionNumber,
                span: (msg) => <span className="blackText">{msg}</span>
              }}
            />
          }
        />
      </div>
      <div className={classes.compareBoxHeaderItem}>
        <ListItemText
          primary={<FancyFormattedDate date={compareB.lastModifiedDate} />}
          secondary={
            <FormattedMessage
              id="historyDialog.versionNumber"
              defaultMessage="Version: <span>{versionNumber}</span>"
              values={{
                versionNumber: compareB.versionNumber,
                span: (msg) => <span className="blackText">{msg}</span>
              }}
            />
          }
        />
      </div>
    </section>
  );
}

interface HistoryListProps {
  resource: Resource<LegacyVersion[]>;
  rowsPerPage: number;
  page: number;
  compareAB: {
    a?: string;
    b?: string;
  };
  current: LegacyVersion;
  handleHistoryItemClick(version: LegacyVersion): void;
  handleViewItem(version: LegacyVersion): void;
  handleOpenMenu(anchorEl: Element, version: LegacyVersion, isCurrent: boolean): void;
}

function HistoryList(props: HistoryListProps) {
  const classes = versionListStyles({});
  const { resource, handleOpenMenu, rowsPerPage, page, compareAB, handleHistoryItemClick, handleViewItem, current } = props;
  const versions = resource.read().slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <List component="div" className={classes.list} disablePadding>
      {versions.map((version: LegacyVersion, i: number) => {
        let isSelected = version.versionNumber === compareAB.a;
        let compareMode = compareAB.a;
        return (
          <ListItem
            key={version.versionNumber}
            divider={versions.length - 1 !== i}
            button
            onClick={compareMode ? () => handleHistoryItemClick(version) : () => handleViewItem(version)}
            className={clsx(classes.listItem, isSelected && 'selected')}
          >
            <ListItemText
              classes={{
                multiline: classes.listItemTextMultiline,
                primary: classes.listItemTextPrimary
              }}
              primary={
                <>
                  <FancyFormattedDate date={version.lastModifiedDate} />
                  {current.versionNumber === version.versionNumber && (
                    <Chip
                      label={
                        <FormattedMessage id="historyDialog.current" defaultMessage="current" />
                      }
                      className={classes.chip}
                    />
                  )}
                </>
              }
              secondary={version.comment}
            />
            {
              !compareMode &&
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => handleOpenMenu(e.currentTarget, version, current.versionNumber === version.versionNumber)}
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            }
          </ListItem>
        );
      })}
    </List>
  );
}

const menuOptions: LookupTable<SectionItem> = {
  view: {
    id: 'view',
    label: translations.view
  },
  compareTo: {
    id: 'compareTo',
    label: translations.compareTo
  },
  compareToCurrent: {
    id: 'compareToCurrent',
    label: translations.compareToCurrent
  },
  compareToPrevious: {
    id: 'compareToPrevious',
    label: translations.compareToPrevious
  },
  revertToPrevious: {
    id: 'revertToPrevious',
    label: translations.revertToPrevious,
    values: { b: (msg) => <b key={'bold'}>&nbsp;{msg}</b> }
  },
  revertToThisVersion: {
    id: 'revertToThisVersion',
    label: translations.revertToThisVersion,
    values: { b: (msg) => <b key={'bold'}>&nbsp;{msg}</b> }
  }
};

const menuInitialState = {
  sections: [],
  anchorEl: null,
  activeItem: null
};

export interface CompareAB {
  a?: string;
  b?: string;
}

interface Menu {
  sections: SectionItem[][];
  anchorEl: Element;
  activeItem: LegacyVersion;
}

interface HistoryDialogBaseProps {
  open: boolean;
  item: LegacyItem;
  current: string;
  byId: LookupTable<LegacyVersion>;
  error: APIError;
  isFetching: boolean;
  compareAB: CompareAB;
  rowsPerPage: number;
  page: number;
}

export type HistoryDialogProps = PropsWithChildren<HistoryDialogBaseProps & {
  onClose?(): any;
  onDismiss?(): any;
}>;

export interface HistoryDialogStateProps extends EntityState<LegacyVersion>, HistoryDialogBaseProps {
  onClose?: StandardAction;
  onDismiss?: StandardAction;
}

export default function HistoryDialog(props: HistoryDialogProps) {
  const { open, onClose, onDismiss, byId, item, error, current, compareAB, rowsPerPage, page } = props;
  const { formatMessage } = useIntl();
  const classes = historyStyles({});
  const dispatch = useDispatch();

  const [menu, setMenu] = useSpreadState<Menu>(menuInitialState);

  const resource = useStateResource<LegacyVersion[], LookupTable<LegacyVersion>>(byId, {
    shouldResolve: () => Boolean(byId),
    shouldReject: () => Boolean(error),
    shouldRenew: () => false,
    resultSelector: () => Object.values(byId),
    errorSelector: () => error
  });

  const handleOpenMenu = useCallback(
    (anchorEl, version, isCurrent = false) => {
      if (isCurrent) {
        setMenu({
          sections: [
            [menuOptions.view],
            [menuOptions.compareTo, menuOptions.compareToPrevious],
            [menuOptions.revertToPrevious]
          ],
          anchorEl,
          activeItem: version
        });
      } else {
        setMenu({
          sections: [
            [menuOptions.view],
            [menuOptions.compareTo, menuOptions.compareToCurrent, menuOptions.compareToPrevious],
            [menuOptions.revertToThisVersion]
          ],
          anchorEl,
          activeItem: version
        });
      }
    },
    [setMenu]
  );

  const handleHistoryItemClick = (version: LegacyVersion) => {
    dispatch(compareHistories({ b: version.versionNumber }));
  };

  const handleViewItem = (version: LegacyVersion) => {

  };

  const handleContextMenuClose = () => {
    setMenu({
      anchorEl: null,
      activeItem: null
    });
  };

  const handleContextMenuItemClicked = (section: SectionItem) => {
    switch (section.id) {
      case 'view': {
        break;
      }
      case 'compareTo': {
        dispatch(compareHistories({ a: menu.activeItem.versionNumber }));
        setMenu(menuInitialState);
        break;
      }
      case 'compareToCurrent': {
        dispatch(compareHistories({ a: menu.activeItem.versionNumber, b: current }));
        setMenu(menuInitialState);
        break;
      }
      case 'compareToPrevious': {
        break;
      }
      default:
        break;
    }
  };

  const onPageChanged = (nextPage: number) => {
    dispatch(historyDialogChangePage(nextPage));
  };

  const handleDialogHeaderBack = () => {
    if (compareAB.b) {
      dispatch(compareHistories({ b: null }));
    } else {
      dispatch(compareHistories({ a: null, b: null }));
    }
  };

  return (
    <Dialog onClose={onClose} open={open} fullWidth maxWidth="md">
      <DialogHeader
        title={
          compareAB.a ? (
            compareAB.b ? (
              <FormattedMessage
                id="historyDialog.comparingRevisions"
                defaultMessage={`Comparing Revisions -- {fileName}`}
                values={{ fileName: item.internalName }}
              />
            ) : (
              <FormattedMessage
                id="historyDialog.selectedRevisionToCompare"
                defaultMessage={`Select a revision to compare to "{version}"`}
                values={{
                  version: <FancyFormattedDate date={byId[compareAB.a].lastModifiedDate} />
                }}
              />
            )
          ) : (
            <FormattedMessage
              id="historyDialog.headerTitle"
              defaultMessage="Content Item History"
            />
          )
        }
        onDismiss={onDismiss}
        onBack={compareAB.a ? handleDialogHeaderBack : null}
      />
      <DialogBody>
        {compareAB.a && compareAB.b ? (
          <CompareRevision compareA={byId[compareAB.a]} compareB={byId[compareAB.b]} />
        ) : (
          <SuspenseWithEmptyState resource={resource}>
            <HistoryList
              resource={resource}
              handleOpenMenu={handleOpenMenu}
              handleHistoryItemClick={handleHistoryItemClick}
              handleViewItem={handleViewItem}
              rowsPerPage={rowsPerPage}
              page={page}
              compareAB={compareAB}
              current={byId[current]}
            />
          </SuspenseWithEmptyState>
        )}
      </DialogBody>
      {byId && (
        <DialogFooter className={classes.dialogFooter}>
          <TablePagination
            className={classes.pagination}
            classes={{ root: classes.pagination, selectRoot: 'hidden', toolbar: classes.toolbar }}
            component="div"
            labelRowsPerPage=""
            rowsPerPageOptions={[10, 20, 30]}
            count={Object.keys(byId).length}
            rowsPerPage={rowsPerPage}
            page={page}
            backIconButtonProps={{
              'aria-label': formatMessage(translations.previousPage)
            }}
            nextIconButtonProps={{
              'aria-label': formatMessage(translations.nextPage)
            }}
            onChangePage={(e: React.MouseEvent<HTMLButtonElement>, nextPage: number) =>
              onPageChanged(nextPage)
            }
          />
        </DialogFooter>
      )}
      <ContextMenu
        open={!!menu.anchorEl}
        anchorEl={menu.anchorEl}
        onClose={handleContextMenuClose}
        sections={menu.sections}
        onMenuItemClicked={handleContextMenuItemClicked}
        classes={{ menuList: classes.menuList }}
      />
    </Dialog>
  );
}
