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
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import { fetchContentXML, writeContent } from '../../services/content';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import AceEditor from '../AceEditor';
import useStyles from './styles';
import { CodeEditorDialogProps } from './CodeEditorDialog';
import { useDispatch } from 'react-redux';
import { updateCodeEditorDialog } from '../../state/actions/dialogs';
import { Skeleton } from '@material-ui/lab';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage, useIntl } from 'react-intl';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showSystemNotification } from '../../state/actions/system';
import translations from './translations';
import SplitButton from '../Controls/SplitButton';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import { ListSubheader } from '@material-ui/core';
import LookupTable from '../../models/LookupTable';
import { hasEditAction, isItemLockedForMe } from '../../utils/content';
import { localItemLock } from '../../state/actions/content';
import { useContentTypes } from '../../utils/hooks/useContentTypes';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useDetailedItem } from '../../utils/hooks/useDetailedItem';
import { useReferences } from '../../utils/hooks/useReferences';
import { useUnmount } from '../../utils/hooks/useUnmount';

export interface CodeEditorDialogContainerProps extends CodeEditorDialogProps {
  path: string;
  title: string;
  onMinimized(): void;
}

export const contentTypePropsMap = {
  fileName: 'file-name',
  internalName: 'internal-name',
  localeCode: 'locale-code'
};

export function CodeEditorDialogContainer(props: CodeEditorDialogContainerProps) {
  const { path, onMinimized, onClose, onClosed, mode, readonly, contentType } = props;
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
      if (_contentType) {
        const fields = contentTypes[_contentType].fields;
        if (mode === 'ftl') {
          if (freemarkerCodeSnippets?.['contentVariable']) {
            let { contentVariable, ...rest } = freemarkerCodeSnippets;
            setSnippets(rest);
            const snippets = Object.keys(fields).map((key) => ({
              label: fields[key].name,
              value: contentVariable.value.replace(
                'VARIABLE_NAME',
                contentTypePropsMap[fields[key].id] ? `["${contentTypePropsMap[fields[key].id]}"]` : fields[key].id
              )
            }));
            setContentModelSnippets(snippets);
          }
        } else if (mode === 'groovy') {
          if (groovyCodeSnippets?.['accessContentModel']) {
            let { accessContentModel, ...rest } = groovyCodeSnippets;
            setSnippets(rest);
            const snippets = Object.keys(fields).map((key) => ({
              label: fields[key].name,
              value: accessContentModel.value.replace(
                'VARIABLE_NAME',
                contentTypePropsMap[fields[key].id] ? `"${contentTypePropsMap[fields[key].id]}"` : fields[key].id
              )
            }));
            setContentModelSnippets(snippets);
          }
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
  }, [site, item, setContent, content, dispatch, user.username]);

  useUnmount(onClosed);

  const onEditorChanges = () => {
    dispatch(
      updateCodeEditorDialog({
        pendingChanges: content !== editorRef.current.getValue()
      })
    );
  };

  const save = useCallback(
    (unlock: boolean = true) => {
      writeContent(site, item.path, editorRef.current.getValue(), { unlock }).subscribe(
        (response) => {
          dispatch(
            showSystemNotification({
              message: formatMessage(translations.saved)
            })
          );
        },
        ({ response }) => {
          dispatch(showErrorDialog({ error: response }));
        }
      );
    },
    [dispatch, formatMessage, item?.path, site]
  );

  const onCancel = () => {
    onClose();
  };

  const onSave = useCallback(() => {
    save();
    setContent(editorRef.current.getValue());
  }, [save]);

  const onSaveAndMinimize = () => {
    save(false);
    setContent(editorRef.current.getValue());
    onMinimized();
  };

  const saveAndClose = () => {
    save(false);
    onClose();
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

  return (
    <>
      <DialogHeader
        title={item ? item.label : <Skeleton width="120px" />}
        onDismiss={onClose}
        rightActions={[
          {
            icon: 'MinimizeIcon',
            onClick: onMinimized
          }
        ]}
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
          <SecondaryButton onClick={onCancel}>
            <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
          </SecondaryButton>
          <SplitButton
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
