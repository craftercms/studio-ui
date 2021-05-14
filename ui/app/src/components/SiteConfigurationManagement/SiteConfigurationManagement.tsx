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
import { useActiveSiteId, useMount, useSelection } from '../../utils/hooks';
import { fetchActiveEnvironment } from '../../services/environment';
import { fetchConfigurationXML, fetchSiteConfigurationFiles } from '../../services/configuration';
import { SiteConfigurationFile } from '../../models/SiteConfigurationFile';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import useStyles, { useResizeableStyles } from './styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import { FormattedMessage, useIntl } from 'react-intl';
import Skeleton from '@material-ui/lab/Skeleton';
import EmptyState from '../SystemStatus/EmptyState';
import { translations } from './translations';
import { getTranslation } from '../../utils/i18n';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import AceEditor from '../AceEditor';
import GlobalAppToolbar from '../GlobalAppToolbar';
import ResizeableDrawer from '../../modules/Preview/ResizeableDrawer';
import { IconButton } from '@material-ui/core';
import MenuOpenRoundedIcon from '@material-ui/icons/MenuOpenRounded';
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import PrimaryButton from '../PrimaryButton';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import HelpOutlineRoundedIcon from '@material-ui/icons/HelpOutlineRounded';
import { adminConfigurationMessages } from '../../utils/i18n-legacy';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ConfirmDialog from '../Dialogs/ConfirmDialog';
import informationGraphicUrl from '../../assets/information.svg';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';

export default function SiteConfigurationManagement() {
  const site = useActiveSiteId();
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const classes = useStyles();
  const { formatMessage } = useIntl();
  const [environment, setEnvironment] = useState<string>();
  const [files, setFiles] = useState<SiteConfigurationFile[]>();
  const [selectedConfigFile, setSelectedConfigFile] = useState<SiteConfigurationFile>(null);
  const [selectedConfigFileXml, setSelectedConfigFileXml] = useState(null);
  const [selectedSampleConfigFileXml, setSelectedSampleConfigFileXml] = useState(null);
  const [loadingXml, setLoadingXml] = useState(true);
  const [loadingSampleXml, setLoadingSampleXml] = useState(false);
  const [showSampleEditor, setShowSampleEditor] = useState(false);
  const [showEncryptDialogHelper, setShowEncryptDialogHelper] = useState(false);
  const [width, setWidth] = useState(240);
  const [openDrawer, setOpenDrawer] = useState(true);
  const [leftEditorWidth, setLeftEditorWidth] = useState<number>(null);

  const editorRef = useRef({
    container: null
  });

  useMount(() => {
    fetchActiveEnvironment().subscribe((env) => {
      setEnvironment(env);
    });
  });

  useEffect(() => {
    if (site && environment) {
      fetchSiteConfigurationFiles(site, environment).subscribe((files) => {
        setFiles(files);
      });
    }
  }, [environment, site]);

  useEffect(() => {
    if (selectedConfigFile && environment) {
      setLoadingXml(true);
      fetchConfigurationXML(site, selectedConfigFile.path, selectedConfigFile.module, environment).subscribe((xml) => {
        setSelectedConfigFileXml(xml);
        setLoadingXml(false);
      });
    }
  }, [selectedConfigFile, environment, site]);

  const onToggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const onDrawerResize = (width) => {
    if (width > 240) {
      setWidth(width);
    }
  };

  const onEncryptHelpClick = () => {
    setShowEncryptDialogHelper(true);
  };

  const onEncryptHelpClose = () => {
    setShowEncryptDialogHelper(false);
  };

  const onViewSampleClick = () => {
    if (showSampleEditor) {
      setLeftEditorWidth(null);
    }
    setLoadingSampleXml(true);
    setShowSampleEditor(!showSampleEditor);
    if (showSampleEditor === false) {
      fetchConfigurationXML(
        'studio_root',
        `/configuration/samples/${selectedConfigFile.samplePath}`,
        selectedConfigFile.module,
        environment
      ).subscribe((xml) => {
        setSelectedSampleConfigFileXml(xml);
        setLoadingSampleXml(false);
      });
    }
  };

  const onListItemClick = (file: SiteConfigurationFile) => {
    setSelectedConfigFile(file);
    setShowSampleEditor(false);
    setLeftEditorWidth(null);
  };

  const onEditorResize = (width: number) => {
    if (width > 240) {
      setLeftEditorWidth(width);
    }
  };

  const bold = {
    bold: (msg) => (
      <strong key={msg} className="bold">
        {msg}
      </strong>
    )
  };

  const tags = { lt: '<', gt: '>' };

  const tagsAndCurls = Object.assign({ lc: '{', rc: '}' }, tags);

  return (
    <Box display="flex" height="100vh">
      <ResizeableDrawer
        open={openDrawer}
        width={width}
        classes={{ drawerPaper: classes.drawerPaper }}
        onWidthChange={onDrawerResize}
      >
        <List
          className={classes.list}
          component="nav"
          dense
          subheader={
            <ListSubheader className={classes.listSubheader} component="div">
              {environment ? (
                <>
                  <FormattedMessage id="siteConfigurationManagement.environment" defaultMessage="Active Environment" />:{' '}
                  {environment}
                </>
              ) : (
                <section className={classes.listSubheaderSkeleton}>
                  <Skeleton height={15} width="80%" />
                </section>
              )}
            </ListSubheader>
          }
        >
          {files
            ? files.map((file, i) => (
                <ListItem onClick={() => onListItemClick(file)} button key={i} dense divider={i < files.length - 1}>
                  <ListItemText
                    classes={{ primary: classes.ellipsis, secondary: classes.ellipsis }}
                    primaryTypographyProps={{ title: getTranslation(file.title, translations, formatMessage) }}
                    secondaryTypographyProps={{ title: getTranslation(file.description, translations, formatMessage) }}
                    primary={getTranslation(file.title, translations, formatMessage)}
                    secondary={getTranslation(file.description, translations, formatMessage)}
                  />
                </ListItem>
              ))
            : Array(15)
                .fill(null)
                .map((x, i) => (
                  <ListItem button key={i} dense divider={i < Array.length - 1}>
                    <ListItemText
                      primary={<Skeleton height={15} width="80%" />}
                      secondary={<Skeleton height={15} width="60%" />}
                      primaryTypographyProps={{
                        className: classes.itemSkeletonText
                      }}
                      secondaryTypographyProps={{
                        className: classes.itemSkeletonText
                      }}
                    />
                  </ListItem>
                ))}
        </List>
      </ResizeableDrawer>
      {selectedConfigFile ? (
        <Box
          display="flex"
          flexGrow={1}
          flexDirection={loadingXml ? 'row' : 'column'}
          paddingLeft={openDrawer ? `${width}px` : 0}
        >
          <ConditionalLoadingState isLoading={loadingXml}>
            <GlobalAppToolbar
              classes={{
                appBar: classes.appBar
              }}
              showHamburgerMenuButton={false}
              showAppsButton={false}
              startContent={
                <IconButton onClick={onToggleDrawer}>
                  {openDrawer ? <MenuOpenRoundedIcon /> : <MenuRoundedIcon />}
                </IconButton>
              }
              title={getTranslation(selectedConfigFile.title, translations, formatMessage)}
              rightContent={
                <>
                  <ButtonGroup variant="outlined" className={classes.buttonGroup}>
                    <Button>{formatMessage(adminConfigurationMessages.encryptMarked)}</Button>
                    <Button size="small" onClick={onEncryptHelpClick}>
                      <HelpOutlineRoundedIcon />
                    </Button>
                  </ButtonGroup>
                  <SecondaryButton onClick={onViewSampleClick}>
                    {showSampleEditor ? (
                      <FormattedMessage id="siteConfigurationManagement.hideSample" defaultMessage="Hide Sample" />
                    ) : (
                      <FormattedMessage id="siteConfigurationManagement.viewSample" defaultMessage="View Sample" />
                    )}
                  </SecondaryButton>
                </>
              }
            />
            <Box display="flex" flexGrow={1}>
              <AceEditor
                ref={editorRef}
                styles={{
                  base: {
                    width: leftEditorWidth ? `${leftEditorWidth}px` : 'auto',
                    flexGrow: leftEditorWidth ? 0 : 1,
                    height: '100%',
                    margin: 0
                  }
                }}
                mode="ace/mode/xml"
                theme="ace/theme/textmate"
                autoFocus={true}
                value={selectedConfigFileXml}
              />
              {showSampleEditor && (
                <>
                  <ResizeableBar onWidthChange={onEditorResize} element={editorRef.current.container} />
                  <ConditionalLoadingState isLoading={loadingSampleXml} classes={{ root: classes.loadingStateRight }}>
                    <AceEditor
                      className={classes.sampleEditor}
                      mode="ace/mode/xml"
                      theme="ace/theme/textmate"
                      autoFocus={false}
                      readOnly={true}
                      value={selectedSampleConfigFileXml}
                    />
                  </ConditionalLoadingState>
                </>
              )}
            </Box>
            <DialogFooter>
              <SecondaryButton className={classes.historyButton}>
                <FormattedMessage id="siteConfigurationManagement.history" defaultMessage="History" />
              </SecondaryButton>
              <SecondaryButton>
                <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
              </SecondaryButton>
              <PrimaryButton>
                <FormattedMessage id="words.save" defaultMessage="Save" />
              </PrimaryButton>
            </DialogFooter>
          </ConditionalLoadingState>
        </Box>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          flexGrow={1}
          justifyContent="center"
          paddingLeft={openDrawer && `${width}px`}
        >
          <EmptyState
            title={
              <FormattedMessage
                id="siteConfigurationManagement.selectConfigFile"
                defaultMessage="Please choose a config file from the left."
              />
            }
            image={`${baseUrl}/static-assets/images/choose_option.svg`}
          />
        </Box>
      )}
      <ConfirmDialog
        open={showEncryptDialogHelper}
        maxWidth="sm"
        onOk={onEncryptHelpClose}
        onClose={onEncryptHelpClose}
        imageUrl={informationGraphicUrl}
      >
        <section className={classes.confirmDialogBody}>
          <Typography className={classes.textMargin} variant="subtitle1">
            {formatMessage(adminConfigurationMessages.encryptMarked)}
          </Typography>
          <Typography className={classes.textMargin} variant="body2">
            {formatMessage(adminConfigurationMessages.encryptHintPt1)}
          </Typography>
          <Typography variant="body2">{formatMessage(adminConfigurationMessages.encryptHintPt2, bold)}</Typography>
          <Typography className={classes.textMargin} variant="body2">
            {formatMessage(adminConfigurationMessages.encryptHintPt3, tags)}
          </Typography>
          <Typography variant="body2">{formatMessage(adminConfigurationMessages.encryptHintPt4, bold)}</Typography>
          <Typography className={classes.textMargin} variant="body2">
            {formatMessage(adminConfigurationMessages.encryptHintPt5, tagsAndCurls)}
          </Typography>
          <Typography className={classes.textMargin} variant="body2">
            {formatMessage(adminConfigurationMessages.encryptHintPt6)}
          </Typography>
          <ul>
            <li>
              <Typography variant="body2">{formatMessage(adminConfigurationMessages.encryptHintPt7)}</Typography>
            </li>
            <li>
              <Typography variant="body2">{formatMessage(adminConfigurationMessages.encryptHintPt8)}</Typography>
            </li>
            <li>
              <Typography variant="body2">{formatMessage(adminConfigurationMessages.encryptHintPt9)}</Typography>
            </li>
          </ul>
        </section>
      </ConfirmDialog>
    </Box>
  );
}

interface ResizeableBarProps {
  onWidthChange(width: number): void;
  element?: any;
}

function ResizeableBar(props: ResizeableBarProps) {
  const classes = useResizeableStyles();
  const [resizeActive, setResizeActive] = useState(false);
  const { onWidthChange, element } = props;

  const handleMouseMove = useCallback(
    (e) => {
      e.preventDefault();
      if (element) {
        const containerOffsetLeft = element.offsetLeft;
        const newWidth = e.clientX - containerOffsetLeft - 5;

        onWidthChange(newWidth);
      }
    },
    [element, onWidthChange]
  );

  const handleMouseDown = () => {
    setResizeActive(true);
    const handleMouseUp = () => {
      setResizeActive(false);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('mousemove', handleMouseMove, true);
    };
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={clsx(classes.resizeHandle, resizeActive && classes.resizeHandleActive)}
    />
  );
}
