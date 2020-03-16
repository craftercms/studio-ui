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

import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { defineMessages, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import DialogTitle from './DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { palette } from '../styles/theme';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import clsx from 'clsx';
import CustomMenu, { Option, SectionItem } from './CustomMenu';
import Link from '@material-ui/core/Link';

const translations = defineMessages({
  title: {
    id: 'contentLocalization.title',
    defaultMessage: 'Content Localization'
  },
  mark: {
    id: 'contentLocalization.mark',
    defaultMessage: 'Mark for Translation'
  },
  approveTranslation: {
    id: 'contentLocalization.approve',
    label: 'Approve Translation'
  },
  deleteTranslation: {
    id: 'contentLocalization.delete',
    label: 'Delete Translation'
  },
  locales: {
    id: 'words.locales',
    defaultMessage: 'Locales'
  },
  status: {
    id: 'words.status',
    defaultMessage: 'Status'
  },
  edit: {
    id: 'words.edit',
    defaultMessage: 'Edit'
  },
  schedule: {
    id: 'words.schedule',
    defaultMessage: 'Schedule'
  },
  delete: {
    id: 'words.delete',
    defaultMessage: 'Delete'
  },
  approve: {
    id: 'words.approve',
    defaultMessage: 'Approve'
  },
  review: {
    id: 'words.review',
    defaultMessage: 'Review'
  }
});

const useStyles = makeStyles((theme) => createStyles({
  dialogContentRoot: {
    padding: theme.spacing(2),
    backgroundColor: palette.gray.light0
  },
  contentLocalizationRoot: {
    background: palette.white,
    border: '1px solid rgba(0, 0, 0, .125)',
    minHeight: '30vh',
    '& header': {
      marginBottom: '5px'
    }
  },
  icon: {
    marginLeft: 'auto',
    padding: '9px'
  },
  checkbox: {
    color: theme.palette.primary.main
  },
  flex: {
    display: 'flex',
    alignItems: 'center'
  },
  headerTitle: {
    fontWeight: 'bold',
    paddingRight: '20px'
  },
  locale: {
    paddingRight: '20px'
  },
  width30: {
    width: '30%'
  },
  menuPaper: {
    width: '182px'
  },
  menuList: {
    padding: 0
  },
  menuItemRoot: {
    whiteSpace: 'initial'
  }
}));

const localizationMap: any = {
  en: 'English, US (en)',
  en_gb: 'English, UK (en_gb)',
  es: 'Spanish, Spain (es)',
  fr: 'French (fr)',
  de: 'German (de)'
};

const menuSections = [
  {
    id: 'edit',
    label: translations.edit
  },
  {
    id: 'review',
    label: translations.review
  },
  {
    id: 'mark',
    label: translations.mark
  },
  {
    id: 'approve',
    label: translations.approve
  },
  {
    id: 'delete',
    label: translations.delete
  }
];

const menuOptions = [
  {
    id: 'edit',
    label: translations.edit
  },
  {
    id: 'schedule',
    label: translations.schedule
  },
  {
    id: 'delete',
    label: translations.delete
  },
  {
    id: 'approve',
    label: translations.approve
  }
];

const itemHeaderStyles = makeStyles((theme) => createStyles({
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(0, 122, 255, 0.1)'
  },
  linkTypo: {
    color: palette.blue.main,
    marginRight: '25px'
  },
  checkbox: {
    color: theme.palette.primary.main
  }
}));

interface ItemHeaderOptionsProps {
  options: Option[];
  isIndeterminate: boolean;
  isChecked: boolean;

  onOptionClicked(option: Option): void;

  toggleSelectAll(): void;
}

function ItemHeaderOptions(props: ItemHeaderOptionsProps) {
  const classes = itemHeaderStyles({});
  const { formatMessage } = useIntl();
  const { options, onOptionClicked, isIndeterminate, toggleSelectAll, isChecked } = props;

  return (
    <header className={classes.itemHeader}>
      <Checkbox
        color="primary"
        indeterminate={isIndeterminate}
        checked={isChecked}
        className={classes.checkbox}
        onChange={toggleSelectAll}
      />
      {
        options.map((option: Option) =>
          <Link
            key={option.id}
            color="inherit"
            component="button"
            variant="subtitle2"
            TypographyClasses={{ root: classes.linkTypo }}
            onClick={() => onOptionClicked(option)}
          >
            {formatMessage(option.label)}
          </Link>
        )
      }
    </header>
  )
}

export default function ContentLocalizationDialog(props: any) {
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const { open, onClose, locales } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState([]);

  const onCloseCustomMenu = () => {
    setAnchorEl(null)
  };

  const onMenuItemClicked = (section: SectionItem) => {
    console.log(section)
  };

  const handleSelect = (checked: boolean, id: string) => {
    const _selected = [...selected];
    if (checked) {
      if (!_selected.includes(id)) {
        _selected.push(id)
      }
    } else {
      let index = _selected.indexOf(id);
      if (index >= 0) {
        _selected.splice(index, 1);
      }
    }
    setSelected(_selected);
  };

  const toggleSelectAll = () => {
    if (locales.length === selected.length) {
      setSelected([]);
    } else {
      setSelected(locales.map((locale: any) => locale.id));
    }
  };

  const onOptionClicked = (option: Option) => {
    console.log(option);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableBackdropClick={true}
      fullWidth={true}
    >
      <DialogTitle title={formatMessage(translations.title)} subtitle={'breadcrumb'} onClose={onClose}/>
      <DialogContent dividers classes={{ root: classes.dialogContentRoot }}>
        <section className={classes.contentLocalizationRoot}>
          {
            selected.length > 0 ? (
              <ItemHeaderOptions
                isIndeterminate={(selected.length > 0 && selected.length < locales.length)}
                onOptionClicked={onOptionClicked}
                options={menuOptions}
                isChecked={selected.length === locales.length}
                toggleSelectAll={toggleSelectAll}
              />
            ) : (
              <header className={classes.flex}>
                <Checkbox
                  color="primary"
                  className={classes.checkbox}
                  onChange={toggleSelectAll}
                />
                <>
                  <Typography variant="subtitle2" className={clsx(classes.headerTitle, classes.width30)}>
                    {formatMessage(translations.locales)}
                  </Typography>
                  <Typography variant="subtitle2" className={classes.headerTitle}>
                    {formatMessage(translations.status)}
                  </Typography>
                </>
              </header>
            )
          }
          {
            locales.map((locale: any) =>
              <div className={classes.flex} key={locale.id}>
                <Checkbox
                  color="primary"
                  className={classes.checkbox}
                  checked={selected?.includes(locale.id)}
                  onChange={(event) => handleSelect(event.currentTarget.checked, locale.id)}
                />
                <Typography variant="subtitle2" className={clsx(classes.locale, classes.width30)}>
                  {localizationMap[locale.localeCode]}
                </Typography>
                <Typography variant="subtitle2" className={classes.locale}>
                  {locale.status}
                </Typography>
                <IconButton
                  aria-label="options"
                  className={classes.icon}
                  onClick={e => setAnchorEl(e.currentTarget)}
                >
                  <MoreVertIcon/>
                </IconButton>
              </div>
            )
          }
        </section>
      </DialogContent>
      <CustomMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        classes={{
          paper: classes.menuPaper
        }}
        onClose={onCloseCustomMenu}
        sections={[menuSections]}
        onMenuItemClicked={onMenuItemClicked}
      />
    </Dialog>
  )
}
