import React, { useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { usePreviewState } from '../../../utils/hooks';
import { fetchLegacyContentTypes } from '../../../services/content';

interface ContentTypesFetchConfig {
  site: string;
  path: string;
}

interface NewContentProps {
  open: boolean;
  contentTypesFetchConfig: ContentTypesFetchConfig;

  handleClose(): void;

  handleOpenType(srcData: any, srcPath: string): void;
}

function NewContentUi({ open, handleClose, contentTypes, site, handleOpenType }) {
  const [selectContent, setSelectContent] = useState(contentTypes[0]);
  const { computedUrl } = usePreviewState();
  const [contextPath, setContextPath] = useState(computedUrl);
  const contentTypesUrl = `/studio/api/1/services/api/1/content/get-content-at-path.bin?site=${site}&path=/config/studio/content-types`;
  const defaultPrevImgUrl = '/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg';
  const defaultContextPath = !contextPath ? computedUrl : contextPath;

  const handleListItemClick = (contentData) => () => setSelectContent(contentData);

  const handlePathChange = e => setContextPath(e.target.value);

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
        alt="preview"
        style={{ maxWidth: '200px' }} />

      <TextField
        id="sandboxBranch"
        name="sandboxBranch"
        label={<span>Content Path</span>}
        onChange={handlePathChange}
        InputLabelProps={{ shrink: true }}
        value={contextPath}
      />

      <Button color="primary" onClick={handleOpenType(selectContent, defaultContextPath)}>
        Open
      </Button>

    </Dialog>
  );
}

export default function NewContentDialog(props: NewContentProps) {
  const { open, handleClose, contentTypesFetchConfig, handleOpenType } = props;
  const [contentTypes, setContentTypes] = useState(null);
  const { site, path } = contentTypesFetchConfig;

  useEffect(() => {
    open && fetchLegacyContentTypes(site, path).subscribe(data => setContentTypes(data));
  }, [open]);

  return (
    contentTypes &&
    <NewContentUi
      open={open}
      handleClose={handleClose}
      contentTypes={contentTypes}
      site={site}
      handleOpenType={handleOpenType} />
  );
}
