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
import { fetchActiveEnvironment } from '../../services/environment';
import { fetchConfigurationXML, fetchSiteConfigurationFiles, writeConfiguration } from '../../services/configuration';
import { SiteConfigurationFileWithId } from '../../models/SiteConfigurationFile';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import useStyles from './styles';
import ListSubheader from '@mui/material/ListSubheader';
import { FormattedMessage, useIntl } from 'react-intl';
import Skeleton from '@mui/material/Skeleton';
import EmptyState from '../EmptyState/EmptyState';
import { translations } from './translations';
import { getTranslation } from '../../utils/i18n';
import { LoadingState } from '../LoadingState/LoadingState';
import AceEditor from '../AceEditor/AceEditor';
import GlobalAppToolbar from '../GlobalAppToolbar';
import ResizeableDrawer from '../ResizeableDrawer/ResizeableDrawer';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PrimaryButton from '../PrimaryButton';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import informationGraphicUrl from '../../assets/information.svg';
import Typography from '@mui/material/Typography';
import { useDispatch } from 'react-redux';
import { fetchItemVersions } from '../../state/actions/versions';
import { fetchItemByPath } from '../../services/content';
import SearchBar from '../SearchBar/SearchBar';
import Alert from '@mui/material/Alert';
import { showHistoryDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import { capitalize, stripCData } from '../../utils/string';
import { itemReverted, showSystemNotification } from '../../state/actions/system';
import { getHostToHostBus } from '../../utils/subjects';
import { filter, map } from 'rxjs/operators';
import { parseValidateDocument, serialize } from '../../utils/xml';
import { forkJoin } from 'rxjs';
import { encrypt } from '../../services/security';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import ResizeBar from '../ResizeBar';
import { useSelection } from '../../hooks/useSelection';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useMount } from '../../hooks/useMount';
import { ConfirmDialogProps } from '../ConfirmDialog';
import { onSubmittingAndOrPendingChangeProps } from '../../hooks/useEnhancedDialogState';
import { findPendingEncryption } from './utils';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import { UNDEFINED } from '../../utils/constants';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { nnou } from '../../utils/object';
import { useLocation, useNavigate } from 'react-router-dom';

interface SiteConfigurationManagementProps {
  embedded?: boolean;
  showAppsButton?: boolean;
  isSubmitting?: boolean;
  onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
}

export function SiteConfigurationManagement(props: SiteConfigurationManagementProps) {
  const { embedded, showAppsButton, onSubmittingAndOrPendingChange, isSubmitting } = props;
  const site = useActiveSiteId();
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const { classes, cx: clsx } = useStyles();
  const { formatMessage } = useIntl();
  const [environment, setEnvironment] = useState<string>();
  const [files, setFiles] = useState<SiteConfigurationFileWithId[]>();
  const [selectedConfigFile, setSelectedConfigFile] = useState<SiteConfigurationFileWithId>(null);
  const [selectedConfigFileXml, setSelectedConfigFileXml] = useState(null);
  const [configError, setConfigError] = useState(null);
  const [selectedSampleConfigFileXml, setSelectedSampleConfigFileXml] = useState(null);
  const [loadingXml, setLoadingXml] = useState(true);
  const [encrypting, setEncrypting] = useState(false);
  const [loadingSampleXml, setLoadingSampleXml] = useState(false);
  const [sampleError, setSampleError] = useState(null);
  const [showSampleEditor, setShowSampleEditor] = useState(false);
  const [width, setWidth] = useState(240);
  const [openDrawer, setOpenDrawer] = useState(true);
  const [leftEditorWidth, setLeftEditorWidth] = useState<number>(null);
  const [disabledSaveButton, setDisabledSaveButton] = useState(true);
  const [confirmDialogProps, setConfirmDialogProps] = useState<ConfirmDialogProps>(null);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const disableBlocking = useRef(false);
  const functionRefs = useUpdateRefs({
    onSubmittingAndOrPendingChange
  });
  const editorRef = useRef<any>({
    container: null
  });

  // TODO: Pending. Using useBlocker hook from react-router-dom doesn't blocks navigation.
  // useEffect(() => {
  //   history?.block((props) => {
  //     if (!disabledSaveButton && !disableBlocking.current && location.pathname !== props.pathname) {
  //       setConfirmDialogProps({
  //         open: true,
  //         title: (
  //           <FormattedMessage id="siteConfigurationManagement.unsavedChangesTitle" defaultMessage="Unsaved changes" />
  //         ),
  //         body: (
  //           <FormattedMessage
  //             id="siteConfigurationManagement.unsavedChangesSubtitle"
  //             defaultMessage="You have unsaved changes, do you want to leave?"
  //           />
  //         ),
  //         onClosed: () => setConfirmDialogProps(null),
  //         onOk: () => {
  //           disableBlocking.current = true;
  //           history.push(props.pathname, { disableBlocking: true });
  //           navigate(props.pathname);
  //         },
  //         onCancel: () => {
  //           setConfirmDialogProps({ ...confirmDialogProps, open: false });
  //         }
  //       });
  //       return false;
  //     }
  //   });
  // }, [confirmDialogProps, disabledSaveButton, navigate, location?.pathname]);

  useMount(() => {
    fetchActiveEnvironment().subscribe({
      next(env) {
        setEnvironment(env);
      },
      error({ response }) {
        dispatch(showErrorDialog({ error: response }));
      }
    });
  });

  useEffect(() => {
    if (site && environment !== UNDEFINED) {
      fetchSiteConfigurationFiles(site, environment).subscribe({
        next(files) {
          setFiles(files.map((file) => ({ ...file, id: `${file.module}/${file.path}` })));
        },
        error({ response }) {
          dispatch(showErrorDialog({ error: response.response }));
        }
      });
    }
  }, [environment, site, dispatch]);

  useEffect(() => {
    if (selectedConfigFile && environment) {
      setConfigError(null);
      fetchConfigurationXML(site, selectedConfigFile.path, selectedConfigFile.module, environment).subscribe({
        next(xml) {
          setSelectedConfigFileXml(xml ?? '');
          setLoadingXml(false);
        },
        error({ response }) {
          if (response.response.code === 7000) {
            setSelectedConfigFileXml('');
          } else {
            setConfigError(response.response);
          }
          setLoadingXml(false);
        }
      });
    }
  }, [selectedConfigFile, environment, site]);

  // Item Revert Propagation
  useEffect(() => {
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$
      .pipe(filter((e) => itemReverted.type === e.type))
      .subscribe(({ type, payload }) => {
        if (payload.target.endsWith(selectedConfigFile.path)) {
          setSelectedConfigFile({ ...selectedConfigFile });
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, selectedConfigFile]);

  const onToggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const onDrawerResize = (width) => {
    if (width > 240) {
      setWidth(width);
    }
  };

  const showXmlParseError = (error: string) => {
    dispatch(
      showSystemNotification({
        message: formatMessage(translations.xmlContainsErrors, {
          errors: error
        }),
        options: {
          variant: 'error'
        }
      })
    );
  };

  const onEncryptClick = () => {
    const content = editorRef.current.getValue();
    const doc = parseValidateDocument(content);
    if (typeof doc === 'string') {
      showXmlParseError(doc);
      return;
    }
    const tags = doc.querySelectorAll('[encrypted]');
    const items = findPendingEncryption(tags);
    if (items.length) {
      setEncrypting(true);
      forkJoin(
        items.map(({ tag, text }) => encrypt(stripCData(text), site).pipe(map((text) => ({ tag, text }))))
      ).subscribe({
        next(encrypted) {
          encrypted.forEach(({ text, tag }) => {
            tag.innerHTML = `\${enc:${text}}`;
            tag.setAttribute('encrypted', 'true');
          });
          editorRef.current.setValue(serialize(doc), -1);
          setEncrypting(false);
        },
        error({ response: { response } }) {
          dispatch(showErrorDialog({ error: response }));
        }
      });
    } else {
      setConfirmDialogProps({
        open: true,
        imageUrl: informationGraphicUrl,
        title: tags.length ? formatMessage(translations.allEncrypted) : formatMessage(translations.noEncryptItems),
        onOk: onConfirmDialogClose,
        onClose: onConfirmDialogClose,
        onClosed: onConfirmDialogClosed
      });
    }
  };

  const onEncryptHelpClick = () => {
    setConfirmDialogProps({
      open: true,
      maxWidth: 'sm',
      onOk: onConfirmDialogClose,
      onClose: onConfirmDialogClose,
      onClosed: onConfirmDialogClosed,
      imageUrl: informationGraphicUrl,
      children: (
        <section className={classes.confirmDialogBody}>
          <Typography className={classes.textMargin} variant="subtitle1">
            {formatMessage(translations.encryptMarked)}
          </Typography>
          <Typography className={classes.textMargin} variant="body2">
            {formatMessage(translations.encryptHintPt1)}
          </Typography>
          <Typography variant="body2">{formatMessage(translations.encryptHintPt2, bold)}</Typography>
          <Typography className={classes.textMargin} variant="body2">
            {formatMessage(translations.encryptHintPt3, tags)}
          </Typography>
          <Typography variant="body2">{formatMessage(translations.encryptHintPt4, bold)}</Typography>
          <Typography className={classes.textMargin} variant="body2">
            {formatMessage(translations.encryptHintPt5, tagsAndCurls)}
          </Typography>
          <Typography className={classes.textMargin} variant="body2">
            {formatMessage(translations.encryptHintPt6)}
          </Typography>
          <ul>
            <li>
              <Typography variant="body2">{formatMessage(translations.encryptHintPt7)}</Typography>
            </li>
            <li>
              <Typography variant="body2">{formatMessage(translations.encryptHintPt8)}</Typography>
            </li>
            <li>
              <Typography variant="body2">{formatMessage(translations.encryptHintPt9)}</Typography>
            </li>
          </ul>
        </section>
      )
    });
  };

  const onViewSampleClick = () => {
    if (showSampleEditor) {
      setLeftEditorWidth(null);
    }
    setLoadingSampleXml(true);
    setShowSampleEditor(!showSampleEditor);
    if (showSampleEditor === false) {
      setSampleError(null);
      fetchConfigurationXML(
        'studio_root',
        `/configuration/samples/${selectedConfigFile.samplePath}`,
        selectedConfigFile.module,
        environment
      ).subscribe({
        next(xml) {
          setSelectedSampleConfigFileXml(xml);
          setLoadingSampleXml(false);
        },
        error({ response }) {
          setSampleError(response.response);
          setLoadingSampleXml(false);
        }
      });
    }
  };

  const onClean = () => {
    if (showSampleEditor) {
      setShowSampleEditor(false);
    }
    if (leftEditorWidth !== null) {
      setLeftEditorWidth(null);
    }
    if (encrypting !== null) {
      setEncrypting(false);
    }
    if (!disabledSaveButton) {
      setDisabledSaveButton(true);
    }
    functionRefs.current.onSubmittingAndOrPendingChange?.({ hasPendingChanges: false, isSubmitting: false });
  };

  const onListItemClick = (file: SiteConfigurationFileWithId) => {
    if (file.id !== selectedConfigFile?.id) {
      setLoadingXml(true);
      setSelectedConfigFile(file);
    }
    onClean();
  };

  const onUnsavedChangesOk = (file: SiteConfigurationFileWithId) => {
    setConfirmDialogProps({ ...confirmDialogProps, open: false });
    onListItemClick(file);
  };

  const onConfirmDialogClose = () => {
    setConfirmDialogProps({ ...confirmDialogProps, open: false });
  };

  const onConfirmDialogClosed = () => {
    setConfirmDialogProps(null);
  };

  const onEditorResize = (width: number) => {
    if (width > 240) {
      setLeftEditorWidth(width);
    }
  };

  const onEditorChanges = () => {
    if (selectedConfigFileXml !== editorRef.current.getValue()) {
      setDisabledSaveButton(false);
      functionRefs.current.onSubmittingAndOrPendingChange?.({ hasPendingChanges: true });
    } else {
      setDisabledSaveButton(true);
      functionRefs.current.onSubmittingAndOrPendingChange?.({ hasPendingChanges: false });
    }
  };

  const onShowHistory = () => {
    fetchItemByPath(site, `/config/${selectedConfigFile.module}/${selectedConfigFile.path}`).subscribe((item) => {
      dispatch(
        batchActions([
          fetchItemVersions({
            isConfig: true,
            environment: environment,
            module: selectedConfigFile.module,
            item
          }),
          showHistoryDialog({})
        ])
      );
    });
  };

  const onCancel = () => {
    onClean();
    setSelectedConfigFile(null);
  };

  const showUnsavedChangesConfirm = (file: SiteConfigurationFileWithId) => {
    setConfirmDialogProps({
      open: true,
      title: <FormattedMessage id="siteConfigurationManagement.unsavedChangesTitle" defaultMessage="Unsaved changes" />,
      body: (
        <FormattedMessage
          id="siteConfigurationManagement.unsavedChangesSubtitle"
          defaultMessage="You have unsaved changes, do you want to leave?"
        />
      ),
      onClosed: onConfirmDialogClosed,
      onOk: () => onUnsavedChangesOk(file),
      onCancel: onConfirmDialogClose
    });
  };

  const onSave = () => {
    const content = editorRef.current.getValue();
    const doc = parseValidateDocument(content);
    if (typeof doc === 'string') {
      showXmlParseError(doc);
      return;
    }
    const unencryptedItems = findPendingEncryption(doc.querySelectorAll('[encrypted]'));
    const errors = editorRef.current
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
      if (unencryptedItems.length === 0) {
        functionRefs.current.onSubmittingAndOrPendingChange?.({ isSubmitting: true });
        writeConfiguration(site, selectedConfigFile.path, selectedConfigFile.module, content, environment).subscribe({
          next: () => {
            functionRefs.current.onSubmittingAndOrPendingChange?.({ isSubmitting: false, hasPendingChanges: false });
            dispatch(
              showSystemNotification({
                message: formatMessage(translations.configSaved)
              })
            );

            setDisabledSaveButton(true);
            setSelectedConfigFileXml(content);
          },
          error: ({ response: { response } }) => {
            functionRefs.current.onSubmittingAndOrPendingChange?.({ isSubmitting: false });
            dispatch(showErrorDialog({ error: response }));
          }
        });
      } else {
        let tags;
        if (unencryptedItems.length > 1) {
          tags = unencryptedItems.map((item) => {
            return formatMessage(translations.encryptionSingleDetail, {
              name: item.tag.tagName,
              value: item.text,
              br: <br key={item.text} />
            });
          });
        } else {
          tags = formatMessage(translations.encryptionSingleDetail, {
            name: unencryptedItems[0].tag.tagName,
            value: unencryptedItems[0].text,
            br: null
          });
        }

        setConfirmDialogProps({
          open: true,
          imageUrl: informationGraphicUrl,
          title: formatMessage(translations.pendingEncryption, {
            itemCount: unencryptedItems.length,
            tags,
            br: unencryptedItems.length ? <br key={unencryptedItems.length} /> : null
          }),
          onOk: onConfirmDialogClose,
          onClose: onConfirmDialogClose,
          onClosed: onConfirmDialogClosed
        });
      }
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
    <section className={classes.root}>
      {!embedded && (
        <GlobalAppToolbar
          title={<FormattedMessage id="siteConfigurationManagement.title" defaultMessage="Configuration" />}
          showAppsButton={showAppsButton}
        />
      )}
      <ResizeableDrawer
        belowToolbar
        open={openDrawer}
        width={width}
        classes={{ drawerPaper: clsx(classes.drawerPaper, embedded && 'embedded') }}
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
                  <Tooltip
                    placement="top"
                    title={
                      <FormattedMessage
                        id="siteConfigurationManagement.environment"
                        defaultMessage='The active environment is "{environment}"'
                        values={{ environment }}
                      />
                    }
                  >
                    <Alert severity="info" className={classes.alert} classes={{ message: classes.ellipsis }}>
                      <FormattedMessage
                        id="siteConfigurationManagement.activeEnvironment"
                        defaultMessage="{environment} Environment"
                        values={{ environment: capitalize(environment) }}
                      />
                    </Alert>
                  </Tooltip>
                  <SearchBar
                    classes={{ root: classes.searchBarRoot }}
                    keyword={keyword}
                    onChange={setKeyword}
                    showActionButton={Boolean(keyword)}
                    autoFocus
                  />
                </>
              ) : (
                <section className={classes.listSubheaderSkeleton}>
                  <Skeleton height={34} width="100%" />
                  <Skeleton height={34} width="100%" />
                </section>
              )}
            </ListSubheader>
          }
        >
          {files
            ? files
                .filter(
                  (file) =>
                    file.path.toLowerCase().includes(keyword) ||
                    getTranslation(file.title, translations, formatMessage).toLowerCase().includes(keyword) ||
                    getTranslation(file.description, translations, formatMessage).toLowerCase().includes(keyword)
                )
                .map((file, i) => (
                  <ListItem
                    selected={file.id === selectedConfigFile?.id}
                    onClick={() => {
                      if (!disabledSaveButton && file.id !== selectedConfigFile?.id) {
                        showUnsavedChangesConfirm(file);
                      } else {
                        onListItemClick(file);
                      }
                    }}
                    button
                    key={i}
                    dense
                    divider={i < files.length - 1}
                  >
                    <ListItemText
                      classes={{ primary: classes.ellipsis, secondary: classes.ellipsis }}
                      primaryTypographyProps={{ title: getTranslation(file.title, translations, formatMessage) }}
                      secondaryTypographyProps={{
                        title: getTranslation(file.description, translations, formatMessage)
                      }}
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
          {configError ? (
            <ApiResponseErrorState error={configError} classes={{ root: classes.errorState }} />
          ) : loadingXml ? (
            <LoadingState />
          ) : nnou(selectedConfigFileXml) ? (
            <>
              <GlobalAppToolbar
                classes={{
                  appBar: classes.appBar
                }}
                styles={{
                  toolbar: { '& > section': {} }
                }}
                showHamburgerMenuButton={false}
                showAppsButton={false}
                startContent={
                  <IconButton onClick={onToggleDrawer} size="large">
                    {openDrawer ? <MenuOpenRoundedIcon /> : <MenuRoundedIcon />}
                  </IconButton>
                }
                title={getTranslation(selectedConfigFile.title, translations, formatMessage)}
                subtitle={getTranslation(selectedConfigFile.description, translations, formatMessage)}
                rightContent={
                  <>
                    <ButtonGroup variant="outlined" className={classes.buttonGroup}>
                      <SecondaryButton disabled={encrypting} onClick={onEncryptClick} loading={encrypting}>
                        {formatMessage(translations.encryptMarked)}
                      </SecondaryButton>
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
                    root: {
                      display: 'flex',
                      width: leftEditorWidth ? `${leftEditorWidth}px` : 'auto',
                      flexGrow: leftEditorWidth ? 0 : 1
                    },
                    editorRoot: {
                      margin: 0,
                      opacity: encrypting ? 0.5 : 1,
                      border: '0',
                      borderRadius: '0'
                    }
                  }}
                  mode="ace/mode/xml"
                  theme="ace/theme/textmate"
                  readOnly={encrypting}
                  autoFocus={true}
                  onChange={onEditorChanges}
                  value={selectedConfigFileXml}
                />
                {showSampleEditor && (
                  <>
                    <ResizeBar onWidthChange={onEditorResize} element={editorRef.current.container} />
                    {sampleError ? (
                      <ApiResponseErrorState error={sampleError} classes={{ root: classes.sampleErrorState }} />
                    ) : loadingSampleXml ? (
                      <LoadingState />
                    ) : nnou(selectedSampleConfigFileXml) ? (
                      <AceEditor
                        classes={{ root: classes.rootEditor, editorRoot: classes.editorRoot }}
                        mode="ace/mode/xml"
                        theme="ace/theme/textmate"
                        autoFocus={false}
                        readOnly={true}
                        value={selectedSampleConfigFileXml}
                      />
                    ) : (
                      <></>
                    )}
                  </>
                )}
              </Box>
              <DialogFooter>
                <SecondaryButton disabled={encrypting} className={classes.historyButton} onClick={onShowHistory}>
                  <FormattedMessage id="siteConfigurationManagement.history" defaultMessage="History" />
                </SecondaryButton>
                <SecondaryButton disabled={encrypting} onClick={onCancel}>
                  <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
                </SecondaryButton>
                <PrimaryButton disabled={disabledSaveButton || encrypting || isSubmitting} onClick={onSave}>
                  <FormattedMessage id="words.save" defaultMessage="Save" />
                </PrimaryButton>
              </DialogFooter>
            </>
          ) : (
            <></>
          )}
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
      <ConfirmDialog open={false} {...confirmDialogProps} />
    </section>
  );
}

export default SiteConfigurationManagement;
