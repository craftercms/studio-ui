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

import React, { PropsWithChildren } from 'react';
import StandardAction from '../../models/StandardAction';
import { Dialog } from '@material-ui/core';
import DialogHeader from './DialogHeader';
import AsyncVideoPlayer from '../AsyncVideoPlayer';
import IFrame from '../IFrame';
import Editor from '../Editor';
import { defineMessages, useIntl } from 'react-intl';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { useUnmount } from '../../utils/hooks';

const messages = defineMessages({
  videoProcessed: {
    id: 'search.videoProcessed',
    defaultMessage: 'Video is being processed, preview will be available when processing is complete'
  }
});

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    maxWidth: '700px',
    minWidth: '400px',
    minHeight: '200px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& img': {
      maxWidth: '100%'
    }
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

export type PreviewDialogProps = PropsWithChildren<PreviewDialogBaseProps & {
  onClose(): void;
  onClosed?(): void;
}>;

export interface PreviewDialogStateProps extends PreviewDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export default function (props: PreviewDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth="md"
    >
      <PreviewDialogUI {...props} />
    </Dialog>
  );
}

function PreviewDialogUI(props: PreviewDialogProps) {
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  useUnmount(props.onClosed);

  const renderPreview = () => {
    switch (props.type) {
      case 'image':
        return <img src={props.url} alt="" />;
      case 'video':
        return (
          <AsyncVideoPlayer
            playerOptions={{ src: props.url, autoplay: true }}
            nonPlayableMessage={formatMessage(messages.videoProcessed)}
          />);
      case 'page':
        return (
          <IFrame
            url={props.url}
            title={props.title}
            width={960}
            height={600}
          />);
      case 'editor': {
        return <Editor mode={`ace/mode/${props.mode}`} data={props.content} />;
      }
      default:
        break;
    }
  };

  return (
    <>
      <DialogHeader title={props.title} onDismiss={props.onClose} />
      <section className={classes.container}>
        {renderPreview()}
      </section>
    </>
  );
}

