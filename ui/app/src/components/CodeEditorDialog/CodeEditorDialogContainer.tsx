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

import React, { useEffect, useRef, useState } from 'react';
import DialogHeader from '../DialogHeader/DialogHeader';
import DialogBody from '../DialogBody/DialogBody';
import { fetchContentXML, lock, writeContent } from '../../services/content';
import { ConditionalLoadingState } from '../LoadingState/LoadingState';
import AceEditor from '../AceEditor/AceEditor';
import useStyles from './styles';
import { useDispatch } from 'react-redux';
import { updateCodeEditorDialog } from '../../state/actions/dialogs';
import Skeleton from '@mui/material/Skeleton';
import ListSubheader from '@mui/material/ListSubheader';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage, useIntl } from 'react-intl';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showSystemNotification } from '../../state/actions/system';
import translations from './translations';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LookupTable from '../../models/LookupTable';
import { isItemLockedForMe, isLockedState } from '../../utils/content';
import { useContentTypes } from '../../hooks/useContentTypes';
import { useActiveUser } from '../../hooks/useActiveUser';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useDetailedItem } from '../../hooks/useDetailedItem';
import { useReferences } from '../../hooks/useReferences';
import { getHostToGuestBus } from '../../utils/subjects';
import { reloadRequest } from '../../state/actions/preview';
import { CodeEditorDialogContainerProps, getContentModelSnippets } from './utils';
import { batchActions } from '../../state/actions/misc';
import { MultiChoiceSaveButton } from '../MultiChoiceSaveButton';
import useUpToDateRefs from '../../hooks/useUpdateRefs';
import { useEnhancedDialogContext } from '../EnhancedDialog';
import { writeConfiguration } from '../../services/configuration';

export function CodeEditorDialogContainer(props: CodeEditorDialogContainerProps) {
  const { path, onMinimize, onClose, mode, readonly, contentType, onFullScreen, onSuccess } = props;
  const { open, isSubmitting } = useEnhancedDialogContext();
  const item = useDetailedItem(path);
  const site = useActiveSiteId();
  const user = useActiveUser();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const itemLoaded = Boolean(item); // isLocked and isLockedForMe only hold accurate value if item was already loaded.
  const isLocked = isLockedState(item?.state);
  const isLockedForMe = isItemLockedForMe(item, user.username);
  const shouldPerformLock = open && itemLoaded && !readonly && !isLockedForMe && !isLocked;
  const { classes } = useStyles();
  const editorRef = useRef<any>();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const contentTypes = useContentTypes();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [snippets, setSnippets] = useState<LookupTable<{ label: string; value: string }>>({});
  const [contentModelSnippets, setContentModelSnippets] = useState<Array<{ label: string; value: string }>>(null);
  const storedId = 'codeEditor';
  const {
    'craftercms.freemarkerCodeSnippets': freemarkerCodeSnippets,
    'craftercms.groovyCodeSnippets': groovyCodeSnippets
  } = useReferences();
  const onChangeTimeoutRef = useRef<any>(null);

  const onEditorChanges = () => {
    clearTimeout(onChangeTimeoutRef.current);
    onChangeTimeoutRef.current = setTimeout(() => {
      dispatch(
        updateCodeEditorDialog({
          hasPendingChanges: content !== editorRef.current.getValue()
        })
      );
    }, 150);
  };

  const save = (callback?: Function) => {
    if (!isLockedForMe && !readonly) {
      dispatch(updateCodeEditorDialog({ isSubmitting: true }));
      const value = editorRef.current.getValue();
      const isConfig = path.startsWith('/config');
      const module = isConfig ? (path.split('/')[2] as 'studio') : null;
      const service$ = isConfig
        ? writeConfiguration(site, path, module, value)
        : writeContent(site, path, value, { unlock: false });
      service$.subscribe({
        next() {
          dispatch(
            batchActions([
              showSystemNotification({ message: formatMessage(translations.saved) }),
              updateCodeEditorDialog({ isSubmitting: false, hasPendingChanges: false })
            ])
          );
          setTimeout(callback);
          getHostToGuestBus().next(reloadRequest());
          onSuccess?.();
        },
        error({ response }) {
          dispatch(showErrorDialog({ error: response }));
        }
      });
    }
  };

  const onSave = () => save(() => setContent(editorRef.current.getValue()));

  const onAddSnippet = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeSnippets = () => {
    setAnchorEl(null);
  };

  const onSnippetSelected = (snippet: { label: string; value: string }) => {
    const cursorPosition = editorRef.current.getCursorPosition();
    editorRef.current.session.insert(cursorPosition, snippet.value);
    editorRef.current.focus();
    closeSnippets();
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    fnRefs.current.onClose(e, null);
  };

  const onMultiChoiceSaveButtonClick = (e, type) => {
    switch (type) {
      case 'save':
        onSave();
        break;
      case 'saveAndClose':
        save(() => onCloseButtonClick(null));
        break;
      case 'saveAndMinimize':
        save(() => {
          setContent(editorRef.current.getValue());
          onMinimize?.();
        });
        break;
    }
  };

  const onAceInit = (editor: AceAjax.Editor) => {
    editor.commands.addCommand({
      name: 'saveToCrafter',
      bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
      exec: () => fnRefs.current.onSave(),
      readOnly: false
    });
  };

  const fnRefs = useUpToDateRefs({ onSave, onClose });

  // add content model variables
  useEffect(() => {
    if (contentTypes && item) {
      const _contentType = contentType
        ? contentType
        : Object.values(contentTypes).find((contentType) => contentType.displayTemplate === item.path)?.id;
      if (mode === 'ftl') {
        let { contentVariable, ...rest } = freemarkerCodeSnippets;
        setSnippets(rest);
        if (contentVariable && _contentType) {
          setContentModelSnippets(getContentModelSnippets(contentVariable, contentTypes[_contentType].fields));
        }
      } else if (mode === 'groovy') {
        let { accessContentModel, ...rest } = groovyCodeSnippets;
        setSnippets(rest);
        if (accessContentModel && _contentType) {
          setContentModelSnippets(getContentModelSnippets(accessContentModel, contentTypes[_contentType].fields));
        }
      }
    }
  }, [contentTypes, contentType, mode, item, freemarkerCodeSnippets, groovyCodeSnippets]);

  useEffect(() => {
    if (content === null) {
      setLoading(true);
      dispatch(updateCodeEditorDialog({ isSubmitting: true }));
      const subscription = fetchContentXML(site, path).subscribe((xml) => {
        setContent(xml);
        setLoading(false);
        dispatch(updateCodeEditorDialog({ isSubmitting: false }));
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [content, dispatch, path, site]);

  useEffect(() => {
    if (shouldPerformLock) {
      lock(site, path).subscribe();
    }
  }, [path, shouldPerformLock, site]);

  return (
    <>
      <DialogHeader
        title={item ? item.label : <Skeleton width="120px" />}
        onCloseButtonClick={onCloseButtonClick}
        onMinimizeButtonClick={onMinimize}
        onFullScreenButtonClick={onFullScreen}
        disabled={isSubmitting}
      />
      <DialogBody
        className={classes.dialogBody}
        sx={{
          '.MuiDialogTitle-root + &': {
            pt: 0
          }
        }}
      >
        <ConditionalLoadingState isLoading={loading} classes={{ root: classes.loadingState }}>
          <AceEditor
            ref={editorRef}
            autoFocus={!readonly}
            mode={`ace/mode/${mode}`}
            value={content ?? ''}
            onChange={onEditorChanges}
            readOnly={isLockedForMe || readonly}
            classes={{ editorRoot: classes.aceRoot }}
            enableBasicAutocompletion
            enableSnippets
            enableLiveAutocompletion
            onInit={onAceInit}
          />
        </ConditionalLoadingState>
      </DialogBody>
      {!readonly && (
        <DialogFooter>
          <Button
            onClick={onAddSnippet}
            endIcon={<ExpandMoreRoundedIcon />}
            className={classes.addSnippet}
            disabled={isSubmitting || isLockedForMe}
          >
            <FormattedMessage id="codeEditor.insertCode" defaultMessage="Insert Code" />
          </Button>
          <SecondaryButton onClick={onCloseButtonClick} sx={{ mr: '8px' }} disabled={isSubmitting}>
            <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
          </SecondaryButton>
          <MultiChoiceSaveButton
            loading={isSubmitting}
            disabled={isLockedForMe}
            storageKey={storedId}
            onClick={onMultiChoiceSaveButtonClick}
          />
        </DialogFooter>
      )}
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={closeSnippets}>
        {contentModelSnippets && (
          <ListSubheader disableSticky={true}>
            <FormattedMessage id="codeEditor.contentModel" defaultMessage="Content model" />
          </ListSubheader>
        )}
        {contentModelSnippets?.map((snippet, i) => (
          <MenuItem key={i} onClick={() => onSnippetSelected(snippet)} dense>
            {snippet.label}
          </MenuItem>
        ))}
        <ListSubheader>
          <FormattedMessage id="words.snippets" defaultMessage="Snippets" />
        </ListSubheader>
        {Object.values(snippets).map((snippet, i) => (
          <MenuItem key={i} onClick={() => onSnippetSelected(snippet)} dense>
            {snippet.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default CodeEditorDialogContainer;
