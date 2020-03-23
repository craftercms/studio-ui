import React, { useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { fetchLegacyContentTypes } from '../../../services/content';

interface ContentTypesFetchConfig {
  site: string;
  path: string;
}

interface NewContentProps {
  open: boolean;

  handleClose(): void;

  contentTypesFetchConfig: ContentTypesFetchConfig
}

function NewContentUi({ open, handleClose, contentTypes }) {
  const [selectContent, setSelectContent] = useState(null);
  const contentTypesUrl = '/studio/api/1/services/api/1/content/get-content-at-path.bin?site=editorial&path=/config/studio/content-types';
  const defaultPrevImgUrl = '/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg';

  const handleListItemClick = (contentData) => () => setSelectContent(contentData);

  const prevImgSrc =
    (selectContent?.imageThumbnail) ?
      `${contentTypesUrl}${selectContent.form}/${selectContent.imageThumbnail}` :
      defaultPrevImgUrl;

  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
      <List>
        {
          contentTypes?.map(content => (
            <ListItem key={content.name} button={true} onClick={handleListItemClick(content)}>
              {content.label}
            </ListItem>
          ))
        }
      </List>
      <img
        src={prevImgSrc}
        alt="preview" />
    </Dialog>
  );
}

export default function NewContentDialog(props: NewContentProps) {
  const { open, handleClose, contentTypesFetchConfig } = props;
  const [contentTypes, setContentTypes] = useState(null);
  const { site, path } = contentTypesFetchConfig;

  useEffect(() => {
    open && fetchLegacyContentTypes(site, path).subscribe(data => setContentTypes(data));
  }, [open]);

  return (
    <NewContentUi open={open} handleClose={handleClose} contentTypes={contentTypes} />
  );
}
