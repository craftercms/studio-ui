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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import DialogHeader from '../DialogHeader/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import { fetchContentXML, writeContent } from '../../services/content';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import AceEditor from '../AceEditor';
import useStyles from './styles';
import { useDispatch } from 'react-redux';
import { updateCodeEditorDialog } from '../../state/actions/dialogs';
import { Skeleton } from '@mui/material';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage, useIntl } from 'react-intl';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showSystemNotification } from '../../state/actions/system';
import translations from './translations';
import SplitButton from '../Controls/SplitButton';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { ListSubheader } from '@mui/material';
import LookupTable from '../../models/LookupTable';
import { hasEditAction, isItemLockedForMe } from '../../utils/content';
import { localItemLock } from '../../state/actions/content';
import { useContentTypes } from '../../utils/hooks/useContentTypes';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useDetailedItem } from '../../utils/hooks/useDetailedItem';
import { useReferences } from '../../utils/hooks/useReferences';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import { RELOAD_REQUEST } from '../../state/actions/preview';
import { CodeEditorDialogContainerProps, getContentModelSnippets } from './utils';
import { batchActions } from '../../state/actions/misc';

export function CodeEditorDialogContainer(props: CodeEditorDialogContainerProps) {
  const { path, onMinimize, onClose, onSaveClose, mode, isSubmitting, readonly, contentType } = props;
  const item = useDetailedItem(path);
  const site = useActiveSiteId();
  const user = useActiveUser();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const classes = useStyles();
  const editorRef = useRef<any>();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const contentTypes = useContentTypes();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [snippets, setSnippets] = useState<LookupTable<{ label: string; value: string }>>({});
  const [contentModelSnippets, setContentModelSnippets] = useState<{ label: string; value: string }[]>(null);
  const {
    'craftercms.freemarkerCodeSnippets': freemarkerCodeSnippets,
    'craftercms.groovyCodeSnippets': groovyCodeSnippets
  } = useReferences();

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

  const disableEdit = isItemLockedForMe(item, user.username) || !hasEditAction(item.availableActions);

  useEffect(() => {
    if (item && content === null) {
      setLoading(true);
      fetchContentXML(site, item.path, { ...(!item.lockOwner && { lock: !readonly }) }).subscribe((xml) => {
        setContent(xml);
        setLoading(false);
        if (!readonly) {
          dispatch(localItemLock({ path: item.path, username: user.username }));
        }
      });
    }
  }, [site, item, setContent, content, dispatch, user.username, readonly]);

  const onEditorChanges = () => {
    dispatch(
      updateCodeEditorDialog({
        hasPendingChanges: content !== editorRef.current.getValue()
      })
    );
  };

  const save = useCallback(
    (callback?: Function) => {
      dispatch(
        updateCodeEditorDialog({
          isSubmitting: true
        })
      );
      writeContent(site, path, editorRef.current.getValue(), { unlock: false }).subscribe(
        () => {
          setTimeout(callback);
          dispatch(
            batchActions([
              showSystemNotification({
                message: formatMessage(translations.saved)
              }),
              updateCodeEditorDialog({
                isSubmitting: false
              })
            ])
          );
          getHostToGuestBus().next({ type: RELOAD_REQUEST });
        },
        ({ response }) => {
          dispatch(showErrorDialog({ error: response }));
        }
      );
    },
    [dispatch, formatMessage, path, site]
  );

  const onSave = useCallback(() => {
    save(() => {
      setContent(editorRef.current.getValue());
    });
  }, [save]);

  const onSaveAndMinimize = () => {
    save(() => {
      setContent(editorRef.current.getValue());
      onMinimize?.();
    });
  };

  const saveAndClose = () => {
    save(onSaveClose);
  };

  const onAddSnippet = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeSnippets = () => {
    setAnchorEl(null);
  };

  const onSnippetSelected = (snippet: { label: string; value: string }) => {
    const cursorPosition = editorRef.current.getCursorPosition();
    editorRef.current.session.insert(cursorPosition, snippet.value);
    closeSnippets();
  };

  useEffect(() => {
    if (!readonly && !disableEdit && content !== null) {
      editorRef.current?.commands.addCommand({
        name: 'myCommand',
        bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
        exec: onSave,
        readOnly: false
      });
    }
  }, [readonly, content, disableEdit, onSave]);

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  return (
    <>
      <DialogHeader
        title={item ? item.label : <Skeleton width="120px" />}
        onCloseButtonClick={onCloseButtonClick}
        {...(onMinimize && { rightActions: [] })}
      />
      <DialogBody className={classes.dialogBody}>
        <ConditionalLoadingState isLoading={loading} classes={{ root: classes.loadingState }}>
          <AceEditor
            ref={editorRef}
            mode={`ace/mode/${mode}`}
            value={content ?? ''}
            onChange={onEditorChanges}
            readOnly={disableEdit || readonly}
            enableBasicAutocompletion
            enableSnippets
            enableLiveAutocompletion
          />
        </ConditionalLoadingState>
      </DialogBody>
      {!readonly && (
        <DialogFooter>
          <Button onClick={onAddSnippet} endIcon={<ExpandMoreRoundedIcon />} className={classes.addSnippet}>
            <FormattedMessage id="codeEditor.insertCode" defaultMessage="Insert Code" />
          </Button>
          <SecondaryButton onClick={onCloseButtonClick}>
            <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
          </SecondaryButton>
          <SplitButton
            loading={isSubmitting}
            disabled={disableEdit}
            options={[
              { label: formatMessage(translations.save), callback: onSave },
              { label: formatMessage(translations.saveAndClose), callback: saveAndClose },
              { label: formatMessage(translations.saveAndMinimize), callback: onSaveAndMinimize }
            ]}
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
