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

import React, { useState } from 'react';
import AsyncVideoPlayer from '../AsyncVideoPlayer';
import LoadingState, { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import IFrame from '../IFrame';
import { nou } from '../../utils/object';
import AceEditor from '../AceEditor';
import { useStyles } from './PreviewDialog';
import { PreviewDialogContainerProps } from './utils';

export function PreviewDialogContainer(props: PreviewDialogContainerProps) {
  const classes = useStyles();

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
            <AceEditor
              value={props.content}
              classes={{ editorRoot: classes.editor }}
              mode={`ace/mode/${props.mode}`}
              readOnly
            />
          </ConditionalLoadingState>
        );
      }
      default:
        break;
    }
  };
  return (
    <>
      <section className={classes.container}>{renderPreview()}</section>
    </>
  );
}
