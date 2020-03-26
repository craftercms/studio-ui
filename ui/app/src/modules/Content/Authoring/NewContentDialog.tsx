/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { usePreviewState } from '../../../utils/hooks';
import { fetchLegacyContentTypes } from '../../../services/content';


interface NewContentDialogProps {
  open: boolean;
  path: string;
  site: string;

  onDialogClose(): void;

  onTypeOpen(srcData: any, srcPath: string): any;
}

export default function NewContentDialog(props: NewContentDialogProps) {
  const { open, onDialogClose, onTypeOpen, site, path } = props;
  const defaultPath = '/site/website';
  const [contextPath, setContextPath] = useState(`${defaultPath}/`);
  const [selectContent, setSelectContent] = useState(null);
  const [contentTypes, setContentTypes] = useState(null);
  const contentTypesUrl = `/studio/api/1/services/api/1/content/get-content-at-path.bin?site=${site}&path=/config/studio/content-types`;
  const defaultPrevImgUrl = '/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg';

  const onListItemClick = (contentData) => () => setSelectContent(contentData);

  const onPathChange = e => setContextPath(e.target.value);

  const prevImgSrc =
    (selectContent?.imageThumbnail) ?
      `${contentTypesUrl}${selectContent.form}/${selectContent.imageThumbnail}` :
      defaultPrevImgUrl;

  useEffect(() => {
    setContextPath(`${defaultPath}${!path ? '/' : path}`);
  }, [path]);

  useEffect(() => {
    open && fetchLegacyContentTypes(site, contextPath).subscribe(data => {
      setContentTypes(data);
      setSelectContent(data[0]);
    });
  }, [open, contextPath]);

  return (
    contentTypes &&
    <Dialog fullScreen open={open} onClose={onDialogClose}>
      <List>
        {
          contentTypes?.map(content => (
            <ListItem key={content.name} button={true} onClick={onListItemClick(content)}>
              {content.label}
            </ListItem>
          ))
        }
      </List>
      <img
        src={prevImgSrc}
        alt="preview"
        style={{ maxWidth: '200px' }} />

      <TextField
        id="sandboxBranch"
        name="sandboxBranch"
        label={<span>Content Path</span>}
        onChange={onPathChange}
        InputLabelProps={{ shrink: true }}
        value={contextPath}
      />

      <Button color="primary" onClick={onTypeOpen(selectContent, contextPath)}>
        Open
      </Button>

    </Dialog>
  );
}
