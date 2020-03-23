import React, { useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import {  fetchLegacyContentTypes } from '../../../services/content';

interface DialogConfig {
  open: boolean
}

interface NewContentProps {
  dialogConfig: DialogConfig;
  setDialogConfig: any;
  showController?: boolean;
  showTabs?: boolean;

  getPath?(type: string): void;
}

export default function NewContentDialog(props: NewContentProps) {
  const { dialogConfig, setDialogConfig } = props;

  useEffect(() => {
    fetchLegacyContentTypes('editorial','/site/website/').subscribe(data => {
      console.log('==getContentTypes DATA', data)
    });
  }, []);

  const handleClose = () => {
    setDialogConfig({ open: false, src: null, type: null, inProgress: true });
  };

  return (
    <Dialog open={dialogConfig.open} onClose={handleClose}>
      <div>NEW CONTENT</div>
    </Dialog>
  );
}
