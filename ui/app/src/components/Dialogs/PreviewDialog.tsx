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

import React, { PropsWithChildren, useState } from 'react';
import StandardAction from '../../models/StandardAction';
import { Dialog } from '@material-ui/core';
import DialogHeader from './DialogHeader';
import AsyncVideoPlayer from '../AsyncVideoPlayer';
import IFrame from '../IFrame';
import AceEditor from '../AceEditor';
import { makeStyles } from '@material-ui/core/styles';
import { useUnmount } from '../../utils/hooks';
import LoadingState, { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import { nou } from '../../utils/object';

const useStyles = makeStyles(() => ({
  container: {
    maxWidth: '700px',
    minWidth: '500px',
    minHeight: '400px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& img': {
      maxWidth: '100%'
    }
  },
  editor: {
    width: 900,
    height: 600,
    border: 'none'
  }
}));

interface PreviewDialogBaseProps {
  open: boolean;
  type: string;
  title: string;
  mode?: string;
  url?: string;
  content?: string;
}

export type PreviewDialogProps = PropsWithChildren<
  PreviewDialogBaseProps & {
    onClose(): void;
    onClosed?(): void;
  }
>;

export interface PreviewDialogStateProps extends PreviewDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export default function PreviewDialog(props: PreviewDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="md">
      <PreviewDialogUI {...props} />
    </Dialog>
  );
}

function PreviewDialogUI(props: PreviewDialogProps) {
  const classes = useStyles();
  useUnmount(props.onClosed);

  const [isLoading, setIsLoading] = useState(true);

  const renderPreview = () => {
    switch (props.type) {
      case 'image':
        return <img src={props.url} alt="" />;
      case 'video':
        return <AsyncVideoPlayer playerOptions={{ src: props.url, autoplay: true }} />;
      case 'page':
        return (
          <>
            {isLoading && <LoadingState />}
            <IFrame
              url={props.url}
              title={props.title}
              width={isLoading ? 0 : 960}
              height={isLoading ? 0 : 600}
              onLoadComplete={() => setIsLoading(false)}
            />
          </>
        );
      case 'editor': {
        return (
          <ConditionalLoadingState isLoading={nou(props.content)}>
            <AceEditor value={props.content} className={classes.editor} mode={`ace/mode/${props.mode}`} readOnly />
          </ConditionalLoadingState>
        );
      }
      default:
        break;
    }
  };
  return (
    <>
      <DialogHeader title={props.title} onDismiss={props.onClose} />
      <section className={classes.container}>{renderPreview()}</section>
    </>
  );
}
