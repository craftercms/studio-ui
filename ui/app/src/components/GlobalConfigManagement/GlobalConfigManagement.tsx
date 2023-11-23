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

import GlobalAppToolbar from '../GlobalAppToolbar';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { fetchConfigurationXML, writeConfiguration } from '../../services/configuration';
import AceEditor from '../AceEditor/AceEditor';
import useStyles from './styles';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { forkJoin } from 'rxjs';
import { ConditionalLoadingState } from '../LoadingState/LoadingState';
import ConfigurationSamplePreviewDialog from '../ConfigurationSamplePreviewDialog';
import ConfirmDropdown from '../ConfirmDropdown';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import { useHistory } from 'react-router';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import { useMount } from '../../hooks/useMount';
import Paper from '@mui/material/Paper';
import { MAX_CONFIG_SIZE } from '../../utils/constants';
import { MaxLengthCircularProgress } from '../MaxLengthCircularProgress';

const translations = defineMessages({
  configSaved: {
    id: 'globalConfig.configSaved',
    defaultMessage: 'Configuration saved successfully.'
  },
  documentError: {
    id: 'globalConfig.documentError',
    defaultMessage: 'The document contains errors. Check for error markers on side of the editor.'
  }
});

export function GlobalConfigManagement() {
  const [content, setContent] = useState('');
  const [sample, setSample] = useState('');
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [enable, setEnable] = useState(true);
  const [viewSample, setViewSample] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [nextRoute, setNextRoute] = useState<string>();
  const history = useHistory();
  const { classes } = useStyles();
  const [contentSize, setContentSize] = useState(0);

  const aceEditorRef = useRef<any>();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  useEffect(() => {
    const historyBlock = history.block;
    history.block((props) => {
      if (hasChanges) {
        history.goBack();
        setNextRoute(props.pathname);
        setShowConfirmDialog(true);
        return false;
      }
    });
    return () => {
      history.block = historyBlock;
    };
  }, [hasChanges, history]);

  useMount(() => {
    const requests = [
      fetchConfigurationXML('studio_root', '/configuration/samples/sample-studio-config-override.yaml', 'studio'),
      fetchConfigurationXML('studio_root', '/configuration/studio-config-override.yaml', 'studio')
    ];

    forkJoin(requests).subscribe(([sample, content]) => {
      setLastSavedContent(content);
      setContent(content);
      setContentSize(content.length);
      setSample(sample);
      setEnable(false);
    });
  });

  const onUseSampleClick = (type: 'replace' | 'append') => {
    if (type === 'replace') {
      setContent(sample);
    } else {
      const currentContent = aceEditorRef.current.getValue();
      setContent(currentContent + sample);
    }
    setViewSample(false);
  };

  const onResetClick = () => {
    aceEditorRef.current.setValue(lastSavedContent, -1); // sets cursor in position 0, avoiding all editor content selection
    aceEditorRef.current.focus();
  };

  const onSaveClick = () => {
    const value = aceEditorRef.current.getValue();
    const errors = aceEditorRef.current
      .getSession()
      .getAnnotations()
      .filter((annotation) => {
        return annotation.type === 'error';
      });

    if (errors.length) {
      dispatch(
        showSystemNotification({
          message: formatMessage(translations.documentError),
          options: {
            variant: 'error'
          }
        })
      );
    } else {
      writeConfiguration('studio_root', '/configuration/studio-config-override.yaml', 'studio', value).subscribe(
        () => {
          setLastSavedContent(value);
          setHasChanges(false);
          dispatch(
            showSystemNotification({
              message: formatMessage(translations.configSaved)
            })
          );
        },
        ({ response: { response } }) => {
          dispatch(
            showSystemNotification({
              message: response.message,
              options: {
                variant: 'error'
              }
            })
          );
        }
      );
      setHasChanges(false);
    }
  };

  const onChange = () => {
    const currentEditorValue = aceEditorRef.current.getValue();
    const hasChanges = lastSavedContent !== currentEditorValue;
    setContentSize(currentEditorValue.length);
    setHasChanges(hasChanges);
  };

  const onConfirmOk = () => {
    setHasChanges(false);
    setShowConfirmDialog(false);
    // timeout needed to avoid running the useEffect on line:64 with hasChanges on true
    setTimeout(() => {
      history.push(nextRoute);
    });
  };

  const onAceInit = (editor: AceAjax.Editor) => {
    editor.commands.addCommand({
      name: 'saveToCrafter',
      bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
      exec: () => onSaveClick(),
      readOnly: false
    });
  };

  return (
    <Paper elevation={0}>
      <GlobalAppToolbar
        title={<FormattedMessage id="globalMenu.globalConfigEntryLabel" defaultMessage="Global Config" />}
      />
      <ConditionalLoadingState isLoading={enable}>
        <section className={classes.paper}>
          <AceEditor
            ref={aceEditorRef}
            onChange={onChange}
            classes={{ editorRoot: classes.root }}
            value={content}
            mode="ace/mode/yaml"
            theme="ace/theme/textmate"
            autoFocus={true}
            readOnly={enable}
            onInit={onAceInit}
          />
          <Box p="10px" display="flex" justifyContent="space-between">
            <SecondaryButton onClick={() => setViewSample(true)}>
              <FormattedMessage id="globalConfig.viewSample" defaultMessage="View Sample" />
            </SecondaryButton>
            <ConfirmDropdown
              disabled={!hasChanges}
              classes={{ button: classes.marginLeftAuto }}
              text={<FormattedMessage id="words.reset" defaultMessage="Reset" />}
              cancelText={<FormattedMessage id="words.cancel" defaultMessage="Cancel" />}
              confirmText={<FormattedMessage id="words.ok" defaultMessage="Ok" />}
              confirmHelperText={
                <FormattedMessage id="globalConfig.confirmHelper" defaultMessage="Discard unsaved changes?" />
              }
              onConfirm={onResetClick}
            />
            <PrimaryButton disabled={!hasChanges || contentSize > MAX_CONFIG_SIZE} onClick={onSaveClick}>
              <FormattedMessage id="words.save" defaultMessage="Save" />
            </PrimaryButton>
            <MaxLengthCircularProgress
              sxs={{ root: { ml: 1 }, circularProgress: { width: '35px !important', height: '35px !important' } }}
              max={MAX_CONFIG_SIZE}
              current={contentSize}
              renderThresholdPercentage={90}
            />
          </Box>
        </section>
      </ConditionalLoadingState>
      <ConfigurationSamplePreviewDialog
        onUseSampleClick={onUseSampleClick}
        open={viewSample}
        onClose={() => setViewSample(false)}
        onClosed={() => aceEditorRef.current.focus()}
        content={sample}
      />
      <ConfirmDialog
        open={showConfirmDialog}
        title={
          <FormattedMessage
            id="globalConfigManagement.pendingChanges"
            defaultMessage="You have unsaved changes. Discard changes?"
          />
        }
        onOk={onConfirmOk}
        onCancel={() => {
          setShowConfirmDialog(false);
        }}
      />
    </Paper>
  );
}

export default GlobalConfigManagement;
