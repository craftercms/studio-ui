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
import ViewSampleDialog from '../ViewSampleDialog';
import ConfirmDropdown from '../Controls/ConfirmDropdown';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';

export const translations = defineMessages({
  configSaved: {
    id: 'globalConfig.configSaved',
    defaultMessage: 'Configuration saved successfully.'
  }
});

export default function GlobalConfig() {
  const [content, setContent] = useState('');
  const [sample, setSample] = useState('');
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [enable, setEnable] = useState(true);
  const [viewSample, setViewSample] = useState(false);
  const [isModified, setIsModified] = useState(true);
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
      setEnable(false);
      setContent(content);
      setLastSavedContent(content);
      setSample(sample);
    });
  });

  const onUseSampleClick = () => {
    setViewSample(false);
    setContent(sample);
  };

  const onResetClick = () => {
    aceEditorRef.current.setValue(lastSavedContent, -1); // sets cursor in position 0, avoiding all editor content selection
    aceEditorRef.current.focus();
    setIsModified(false);
  };

  const onSaveClick = () => {
    const value = aceEditorRef.current.getValue();
    writeConfiguration('studio_root', '/configuration/studio-config-override.yaml', 'studio', value).subscribe(() => {
      setLastSavedContent(value);
      dispatch(
        showSystemNotification({
          message: formatMessage(translations.configSaved)
        })
      );
    });
    setIsModified(false);
  };

  // aceEditorRef.current?.getSession().on('change', function(e) {
  //   console.log(e);
  // });

  return (
    <section>
      <GlobalAppToolbar
        title={<FormattedMessage id="globalMenu.globalConfigEntryLabel" defaultMessage="Global Config" />}
      />
      <ConditionalLoadingState isLoading={enable}>
        <Paper variant="outlined" className={classes.paper}>
          <AceEditor
            ref={aceEditorRef}
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
              disabled={!isModified}
              classes={{ button: classes.marginLeftAuto }}
              text={<FormattedMessage id="words" defaultMessage="Reset" />}
              cancelText={<FormattedMessage id="words" defaultMessage="Cancel" />}
              confirmText={<FormattedMessage id="words" defaultMessage="Ok" />}
              confirmHelperText={
                <FormattedMessage id="globalConfig.confirmHelper" defaultMessage="Discard unsaved changes?" />
              }
              onConfirm={onResetClick}
            />
            <PrimaryButton onClick={onSaveClick}>
              <FormattedMessage id="words" defaultMessage="Save" />
            </PrimaryButton>
          </Box>
        </Paper>
      </ConditionalLoadingState>
      <ViewSampleDialog
        onUseSampleClick={onUseSampleClick}
        open={viewSample}
        onClose={() => setViewSample(false)}
        content={sample}
      />
    </section>
  );
}
