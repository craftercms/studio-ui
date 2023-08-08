/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import AsyncVideoPlayer from '../AsyncVideoPlayer/AsyncVideoPlayer';
import LoadingState, { ConditionalLoadingState } from '../LoadingState/LoadingState';
import IFrame from '../IFrame/IFrame';
import { nou } from '../../utils/object';
import AceEditor from '../AceEditor/AceEditor';
import { backgroundModes, PreviewDialogContainerProps } from './utils';
import { useStyles } from './styles';
import DialogFooter from '../DialogFooter';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import PrimaryButton from '../PrimaryButton';
import { DialogBody } from '../DialogBody';
import { useDispatch } from 'react-redux';
import { closePreviewDialog, showCodeEditorDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import { hasEditAction, isBlobUrl } from '../../utils/content';
import { useSelection } from '../../hooks/useSelection';
import useItemsByPath from '../../hooks/useItemsByPath';
import { fetchSandboxItem } from '../../services/content';
import { DetailedItem, SandboxItem } from '../../models';
import useActiveSiteId from '../../hooks/useActiveSiteId';

export function PreviewDialogContainer(props: PreviewDialogContainerProps) {
  const { title, content, mode, url, path, onClose, type, mimeType, backgroundModeIndex } = props;
  const { classes, cx } = useStyles();
  const siteId = useActiveSiteId();
  const items = useItemsByPath();
  const [item, setItem] = useState<DetailedItem | SandboxItem>();
  const dispatch = useDispatch();
  const guestBase = useSelection<string>((state) => state.env.guestBase);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (type === 'editor' && path) {
      if (items[path]) {
        setItem(items[path]);
      } else {
        fetchSandboxItem(siteId, path).subscribe((item) => setItem(item));
      }
    }
  }, [siteId, items, path, type]);

  const renderPreview = () => {
    switch (type) {
      case 'image':
        return <img src={url} alt="" />;
      case 'video':
        return (
          <AsyncVideoPlayer playerOptions={{ src: url, autoplay: true, ...(mimeType ? { type: mimeType } : {}) }} />
        );
      case 'page':
        return (
          <>
            {isLoading && <LoadingState />}
            <IFrame
              url={url}
              title={title}
              width={isLoading ? 0 : 960}
              height={isLoading ? 0 : 600}
              onLoadComplete={() => setIsLoading(false)}
            />
          </>
        );
      case 'editor': {
        return (
          <ConditionalLoadingState isLoading={nou(content)}>
            <AceEditor
              value={content}
              classes={{ editorRoot: classes.editor }}
              mode={`ace/mode/${mode}`}
              readOnly
              highlightActiveLine={false}
              highlightGutterLine={false}
              highlightSelectedWord={false}
            />
          </ConditionalLoadingState>
        );
      }
      case 'pdf': {
        return <IFrame url={isBlobUrl(url) ? url : `${guestBase}${url}`} title={title} width="100%" height="100vh" />;
      }
      default:
        break;
    }
  };

  const onEdit = () => {
    dispatch(
      batchActions([
        closePreviewDialog(),
        showCodeEditorDialog({
          path: url,
          mode
        })
      ])
    );
  };

  return (
    <>
      <DialogBody
        className={cx(
          classes.container,
          backgroundModes[backgroundModeIndex]?.mode !== 'default' &&
            classes[backgroundModes[backgroundModeIndex].classKey]
        )}
        sx={{
          padding: 0
        }}
      >
        {renderPreview()}
      </DialogBody>
      {type === 'editor' && (
        <DialogFooter>
          <SecondaryButton onClick={(e) => onClose(e, null)}>
            <FormattedMessage id="words.close" defaultMessage="Close" />
          </SecondaryButton>
          {item && hasEditAction(item.availableActions) && (
            <PrimaryButton sx={{ marginLeft: '15px' }} onClick={onEdit}>
              <FormattedMessage id="words.edit" defaultMessage="Edit" />
            </PrimaryButton>
          )}
        </DialogFooter>
      )}
    </>
  );
}
