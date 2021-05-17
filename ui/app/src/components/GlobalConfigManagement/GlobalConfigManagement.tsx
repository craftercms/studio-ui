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

import GlobalAppToolbar from '../GlobalAppToolbar';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import React, { useRef, useState } from 'react';
import { Box } from '@material-ui/core';
import { useMount } from '../../utils/hooks';
import { fetchConfigurationXML, writeConfiguration } from '../../services/configuration';
import AceEditor from '../AceEditor';
import useStyles from './styles';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import Paper from '@material-ui/core/Paper';
import { forkJoin } from 'rxjs';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import ConfigurationSamplePreviewDialog from '../ConfigurationSamplePreviewDialog';
import ConfirmDropdown from '../Controls/ConfirmDropdown';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';

export const translations = defineMessages({
  configSaved: {
    id: 'globalConfig.configSaved',
    defaultMessage: 'Configuration saved successfully.'
  },
  documentError: {
    id: 'globalConfig.documentError',
    defaultMessage: 'The document contains errors. Check for error markers on side of the editor.'
  }
});

interface GlobalConfigManagementProps {
  onEditorChanges(hasChanges: boolean): void;
}

export default function GlobalConfigManagement(props: GlobalConfigManagementProps) {
  const [content, setContent] = useState('');
  const [sample, setSample] = useState('');
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [enable, setEnable] = useState(true);
  const [viewSample, setViewSample] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const classes = useStyles();

  const aceEditorRef = useRef<any>();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  useMount(() => {
    const requests = [
      fetchConfigurationXML('studio_root', '/configuration/samples/sample-studio-config-override.yaml', 'studio'),
      fetchConfigurationXML('studio_root', '/configuration/studio-config-override.yaml', 'studio')
    ];

    forkJoin(requests).subscribe(([sample, content]) => {
      setLastSavedContent(content);
      setContent(content);
      setSample(sample);
      setEnable(false);
    });
  });

  const onUseSampleClick = (type: 'replace' | 'append') => {
    if (type === 'replace') {
      setContent(sample);
    } else {
      setContent(content + sample);
    }
    setViewSample(false);
    aceEditorRef.current.focus();
  };

  const onResetClick = () => {
    aceEditorRef.current.setValue(lastSavedContent, -1); // sets cursor in position 0, avoiding all editor content selection
    aceEditorRef.current.focus();
  };

  const onSaveClick = () => {
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
      const value = aceEditorRef.current.getValue();
      writeConfiguration('studio_root', '/configuration/studio-config-override.yaml', 'studio', value).subscribe(() => {
        setLastSavedContent(value);
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.configSaved)
          })
        );
      });
      setHasChanges(false);
    }
  };

  const onChange = (e) => {
    const hasChanges = lastSavedContent !== aceEditorRef.current.getValue();
    props.onEditorChanges(hasChanges);
    setHasChanges(hasChanges);
  };

  return (
    <section>
      <GlobalAppToolbar
        title={<FormattedMessage id="globalMenu.globalConfigEntryLabel" defaultMessage="Global Config" />}
      />
      <ConditionalLoadingState isLoading={enable}>
        <Paper variant="outlined" className={classes.paper}>
          <AceEditor
            ref={aceEditorRef}
            onChange={onChange}
            className={classes.root}
            value={content}
            mode="ace/mode/yaml"
            theme="ace/theme/textmate"
            autoFocus={true}
            readOnly={enable}
          />
          <Box p="20px 0" display="flex" justifyContent="space-between">
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
            <PrimaryButton disabled={!hasChanges} onClick={onSaveClick}>
              <FormattedMessage id="words" defaultMessage="Save" />
            </PrimaryButton>
          </Box>
        </Paper>
      </ConditionalLoadingState>
      <ConfigurationSamplePreviewDialog
        onUseSampleClick={onUseSampleClick}
        open={viewSample}
        onClose={() => setViewSample(false)}
        content={sample}
      />
    </section>
  );
}
