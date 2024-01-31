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

import DashboardUI from '../components/Dashboard';
import StatusBar from '@uppy/status-bar/lib/StatusBar';
import Informer from '@uppy/informer/lib/Informer';
import ThumbnailGenerator from '@uppy/thumbnail-generator/lib/index';
import findAllDOMElements from '@uppy/utils/lib/findAllDOMElements';
import memoize from 'memoize-one';
import locale from '@uppy/dashboard/lib/locale';
import UppyDashboard from '@uppy/dashboard';
import { nanoid } from 'nanoid';

export class Dashboard extends UppyDashboard {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = this.opts.id || 'Dashboard';
    this.title = 'Dashboard';
    this.type = 'orchestrator';
    this.modalName = `uppy-Dashboard-${nanoid()}`;

    this.defaultLocale = {
      ...locale,
      strings: {
        ...locale.strings,
        validating: 'Validating',
        validateAndRetry: 'Accept changes',
        rejectAll: 'Reject all changes',
        acceptAll: 'Accept all changes',
        clear: 'Clear',
        cancelPending: 'Cancel pending',
        clearCompleted: 'Clear completed',
        renamingFromTo: 'Renaming from %{from} to %{to}',
        minimize: 'Minimize',
        close: 'Close'
      }
    };
    this.opts = {
      ...this.opts,
      thumbnailWidth: 120,
      proudlyDisplayPoweredByUppy: false,
      disableStatusBar: true
    };

    this.i18nInit();
  }

  addFiles = (files) => {
    let descriptors = files.map((file) => {
      // When uploading via drag and drop, uppy uses `relativePath` as the prop for the actual relative path, for
      // browse uploads, it uses `webkitRelativePath`.
      const relativePath = file.relativePath ?? file.webkitRelativePath ?? null;
      return {
        source: this.id,
        name: file.name,
        type: file.type,
        data: file,
        meta: {
          // path of the file relative to the ancestor directory the user selected.
          // e.g. 'docs/Old Prague/airbnb.pdf'
          relativePath,
          // sitePolicy custom value
          validating: true,
          path: relativePath
            ? this.opts.path + relativePath.substring(0, relativePath.lastIndexOf('/'))
            : this.opts.path
        }
      };
    });
    const maxActiveUploads = this.opts.maxActiveUploads;
    const uppyFiles = this.uppy.getFiles();
    // TODO: There's a TODO in uppy code to move the code to Core so it can be used as an util,
    // check when updating to v.2 if this can be replaced with the util.
    const inProgressFiles = Object.keys(uppyFiles).filter((file) => {
      return !uppyFiles[file].progress.uploadComplete && uppyFiles[file].progress.uploadStarted;
    });

    if (inProgressFiles.length + descriptors.length > maxActiveUploads) {
      const availableUploads = maxActiveUploads - inProgressFiles.length;
      descriptors = descriptors.slice(0, availableUploads);
      this.opts.onMaxActiveUploadsReached?.();
    }

    try {
      this.uppy.addFiles(descriptors);
    } catch (err) {
      this.uppy.log(err);
    }
  };

  handleComplete = () => {
    const files = this.uppy.getFiles();
    let completeFiles = 0;
    let invalidFiles = 0;
    files.forEach((file) => {
      if (file.progress.uploadComplete) {
        completeFiles++;
      }
      if (file.meta.allowed === false || file.meta.suggestedName) {
        invalidFiles++;
      }
    });

    const allFilesCompleted = files.length === completeFiles + invalidFiles;

    if (allFilesCompleted) {
      this.opts.onPendingChanges(false);
    }
  };

  validateFilesPolicy = (files) => {
    if (files.length === 0) return;
    const fileIdLookup = {};
    const invalidFiles = this.getPluginState().invalidFiles;

    this.opts
      .validateActionPolicy(
        this.opts.site,
        files.map((file) => {
          let target = `${file.meta.path}/${file.name}`;
          fileIdLookup[target] = file.id;
          return {
            type: 'CREATE',
            target,
            contentMetadata: {
              fileSize: file.size
            }
          };
        })
      )
      .subscribe((response) => {
        let uploading = false;
        response.forEach(({ allowed, modifiedValue, target }) => {
          let fileId = fileIdLookup[target];
          this.uppy.setFileMeta(fileId, {
            validating: false,
            allowed,
            ...(modifiedValue && { suggestedName: modifiedValue.replace(/^.*[\\\/]/, '') })
          });
          if (allowed && modifiedValue === null) {
            this.uppy.retryUpload(fileId);
            uploading = true;
          } else {
            invalidFiles[fileId] = true;
          }
        });
        this.opts.onPendingChanges(uploading);
        this.setPluginState({
          invalidFiles: invalidFiles
        });
      });
  };

  validateAndRetry = (fileID) => {
    const invalidFiles = { ...this.getPluginState().invalidFiles };
    const suggestedName = this.uppy.getFile(fileID).meta.suggestedName;
    invalidFiles[fileID] = false;
    this.setPluginState({ invalidFiles });
    this.uppy.setFileMeta(fileID, {
      allowed: true,
      suggestedName: null,
      name: suggestedName
    });
    this.uppy.retryUpload(fileID);
  };

  validateAndRemove = (fileID) => {
    const invalidFiles = { ...this.getPluginState().invalidFiles };
    if (invalidFiles[fileID]) {
      invalidFiles[fileID] = false;
    }
    this.setPluginState({ invalidFiles });
    this.uppy.removeFile(fileID);
  };

  cancelPending = () => {
    const invalidFiles = { ...this.getPluginState().invalidFiles };
    this.uppy.getFiles().forEach((file) => {
      if (!file.progress.uploadComplete) {
        if (invalidFiles[file.id]) {
          invalidFiles[file.id] = false;
        }
        this.uppy.removeFile(file.id);
      }
    });
    this.setPluginState({ invalidFiles });
    this.opts.onPendingChanges(false);
  };

  clearCompleted = () => {
    this.uppy.getFiles().forEach((file) => {
      if (file.progress.uploadComplete) {
        this.uppy.removeFile(file.id);
      }
    });
  };

  rejectAll = () => {
    const invalidFiles = { ...this.getPluginState().invalidFiles };
    Object.keys(invalidFiles).forEach((fileID) => {
      if (invalidFiles[fileID]) {
        invalidFiles[fileID] = false;
        this.uppy.removeFile(fileID);
      }
    });
    this.setPluginState({ invalidFiles });
  };

  confirmAll = () => {
    const invalidFiles = { ...this.getPluginState().invalidFiles };
    Object.keys(invalidFiles).forEach((fileID) => {
      if (invalidFiles[fileID]) {
        invalidFiles[fileID] = false;
        const file = this.uppy.getFile(fileID);
        const suggestedName = this.uppy.getFile(fileID).meta.suggestedName;
        if (file.meta.allowed) {
          this.uppy.setFileMeta(fileID, {
            allowed: true,
            suggestedName: null,
            name: suggestedName
          });
          this.uppy.retryUpload(fileID);
        } else {
          this.uppy.removeFile(fileID);
        }
      }
    });
    this.setPluginState({ invalidFiles });
  };

  #openFileEditorWhenFilesAdded = (files) => {
    const firstFile = files[0];
    if (this.canEditFile(firstFile)) {
      this.openFileEditor(firstFile);
    }
  };

  initEvents = () => {
    // Modal open button
    if (this.opts.trigger && !this.opts.inline) {
      const showModalTrigger = findAllDOMElements(this.opts.trigger);
      if (showModalTrigger) {
        showModalTrigger.forEach((trigger) => trigger.addEventListener('click', this.openModal));
      } else {
        this.uppy.log(
          'Dashboard modal trigger not found. Make sure `trigger` is set in Dashboard options, unless you are planning to call `dashboard.openModal()` method yourself',
          'warning'
        );
      }
    }

    this.startListeningToResize();
    document.addEventListener('paste', this.handlePasteOnBody);

    this.uppy.on('plugin-remove', this.removeTarget);
    this.uppy.on('file-added', this.hideAllPanels);
    this.uppy.on('dashboard:modal-closed', this.hideAllPanels);
    this.uppy.on('file-editor:complete', this.hideAllPanels);
    this.uppy.on('complete', this.handleComplete);

    // ___Why fire on capture?
    //    Because this.ifFocusedOnUppyRecently needs to change before onUpdate() fires.
    document.addEventListener('focus', this.recordIfFocusedOnUppyRecently, true);
    document.addEventListener('click', this.recordIfFocusedOnUppyRecently, true);

    if (this.opts.inline) {
      this.el.addEventListener('keydown', this.handleKeyDownInInline);
    }

    if (this.opts.autoOpenFileEditor) {
      this.uppy.on('files-added', this.#openFileEditorWhenFilesAdded);
    } else {
      this.uppy.on('files-added', this.validateFilesPolicy);
    }
  };

  removeEvents = () => {
    const showModalTrigger = findAllDOMElements(this.opts.trigger);
    if (!this.opts.inline && showModalTrigger) {
      showModalTrigger.forEach((trigger) => trigger.removeEventListener('click', this.openModal));
    }

    this.stopListeningToResize();
    document.removeEventListener('paste', this.handlePasteOnBody);

    window.removeEventListener('popstate', this.handlePopState, false);
    this.uppy.off('plugin-remove', this.removeTarget);
    this.uppy.off('file-added', this.hideAllPanels);
    this.uppy.off('dashboard:modal-closed', this.hideAllPanels);
    this.uppy.off('complete', this.handleComplete);

    document.removeEventListener('focus', this.recordIfFocusedOnUppyRecently);
    document.removeEventListener('click', this.recordIfFocusedOnUppyRecently);

    if (this.opts.inline) {
      this.el.removeEventListener('keydown', this.handleKeyDownInInline);
    }

    if (this.opts.autoOpenFileEditor) {
      this.uppy.off('files-added', this.#openFileEditorWhenFilesAdded);
    } else {
      this.uppy.off('files-added', this.validateFilesPolicy);
    }
  };

  #attachRenderFunctionToTarget = (target) => {
    const plugin = this.uppy.getPlugin(target.id);
    return {
      ...target,
      icon: plugin.icon || this.opts.defaultPickerIcon,
      render: plugin.render
    };
  };

  #isTargetSupported = (target) => {
    const plugin = this.uppy.getPlugin(target.id);
    // If the plugin does not provide a `supported` check, assume the plugin works everywhere.
    if (typeof plugin.isSupported !== 'function') {
      return true;
    }
    return plugin.isSupported();
  };

  #getAcquirers = memoize((targets) => {
    return targets
      .filter((target) => target.type === 'acquirer' && this.#isTargetSupported(target))
      .map(this.#attachRenderFunctionToTarget);
  });

  #getProgressIndicators = memoize((targets) => {
    return targets.filter((target) => target.type === 'progressindicator').map(this.#attachRenderFunctionToTarget);
  });

  #getEditors = memoize((targets) => {
    return targets.filter((target) => target.type === 'editor').map(this.#attachRenderFunctionToTarget);
  });

  render = (state) => {
    const pluginState = this.getPluginState();
    const { files, capabilities, allowNewUpload } = state;
    const {
      newFiles,
      uploadStartedFiles,
      completeFiles,
      erroredFiles,
      inProgressFiles,
      inProgressNotPausedFiles,
      processingFiles,
      isUploadStarted,
      isAllComplete,
      isAllErrored,
      isAllPaused
    } = this.uppy.getObjectOfFilesPerState();

    const hasInvalidFiles = Object.values(pluginState.invalidFiles).some((value) => value);

    const acquirers = this.#getAcquirers(pluginState.targets);
    const progressindicators = this.#getProgressIndicators(pluginState.targets);
    const editors = this.#getEditors(pluginState.targets);

    let theme;
    if (this.opts.theme === 'auto') {
      theme = capabilities.darkMode ? 'dark' : 'light';
    } else {
      theme = this.opts.theme;
    }

    if (['files', 'folders', 'both'].indexOf(this.opts.fileManagerSelectionType) < 0) {
      this.opts.fileManagerSelectionType = 'files';
      console.error(
        `Unsupported option for "fileManagerSelectionType". Using default of "${this.opts.fileManagerSelectionType}".`
      );
    }

    return DashboardUI({
      state,
      isHidden: pluginState.isHidden,
      files,
      newFiles,
      uploadStartedFiles,
      completeFiles,
      erroredFiles,
      inProgressFiles,
      inProgressNotPausedFiles,
      processingFiles,
      isUploadStarted,
      isAllComplete,
      isAllErrored,
      isAllPaused,
      hasInvalidFiles,
      totalFileCount: Object.keys(files).length,
      totalProgress: state.totalProgress,
      allowNewUpload,
      acquirers,
      theme,
      direction: this.opts.direction,
      activePickerPanel: pluginState.activePickerPanel,
      showFileEditor: pluginState.showFileEditor,
      saveFileEditor: this.saveFileEditor,
      disableAllFocusableElements: this.disableAllFocusableElements,
      animateOpenClose: this.opts.animateOpenClose,
      isClosing: pluginState.isClosing,
      // getPlugin: this.uppy.getPlugin,
      progressindicators: progressindicators,
      editors: editors,
      autoProceed: this.uppy.opts.autoProceed,
      id: this.id,
      closeModal: this.requestCloseModal,
      handleClickOutside: this.handleClickOutside,
      handleInputChange: this.handleInputChange,
      handlePaste: this.handlePaste,
      inline: this.opts.inline,
      showPanel: this.showPanel,
      hideAllPanels: this.hideAllPanels,
      // log: this.uppy.log,
      i18n: this.i18n,
      i18nArray: this.i18nArray,
      removeFile: this.validateAndRemove,
      uppy: this.uppy,
      info: this.uppy.info,
      note: this.opts.note,
      recoveredState: state.recoveredState,
      metaFields: pluginState.metaFields,
      resumableUploads: capabilities.resumableUploads || false,
      individualCancellation: capabilities.individualCancellation,
      isMobileDevice: capabilities.isMobileDevice,
      // pauseUpload: this.uppy.pauseResume,
      // retryUpload: this.uppy.retryUpload,
      // region header
      onMinimized: this.opts.onMinimized,
      onClose: this.opts.onClose,
      title: this.opts.title,
      // endregion
      // region Site policy functions
      cancelPending: this.cancelPending,
      clearCompleted: this.clearCompleted,
      validateAndRetry: this.validateAndRetry,
      rejectAll: this.rejectAll,
      confirmAll: this.confirmAll,
      // endregion
      // cancelUpload: this.cancelUpload,
      // cancelAll: this.uppy.cancelAll,
      fileCardFor: pluginState.fileCardFor,
      toggleFileCard: this.toggleFileCard,
      toggleAddFilesPanel: this.toggleAddFilesPanel,
      showAddFilesPanel: pluginState.showAddFilesPanel,
      saveFileCard: this.saveFileCard,
      openFileEditor: this.openFileEditor,
      canEditFile: this.canEditFile,
      width: this.opts.width,
      height: this.opts.height,
      showLinkToFileUploadResult: this.opts.showLinkToFileUploadResult,
      fileManagerSelectionType: this.opts.fileManagerSelectionType,
      proudlyDisplayPoweredByUppy: this.opts.proudlyDisplayPoweredByUppy,
      hideCancelButton: this.opts.hideCancelButton,
      hideRetryButton: this.opts.hideRetryButton,
      hidePauseResumeButton: this.opts.hidePauseResumeButton,
      showRemoveButtonAfterComplete: this.opts.showRemoveButtonAfterComplete,
      containerWidth: pluginState.containerWidth,
      containerHeight: pluginState.containerHeight,
      areInsidesReadyToBeVisible: pluginState.areInsidesReadyToBeVisible,
      isTargetDOMEl: this.isTargetDOMEl,
      parentElement: this.el,
      allowedFileTypes: this.uppy.opts.restrictions.allowedFileTypes,
      maxNumberOfFiles: this.uppy.opts.restrictions.maxNumberOfFiles,
      requiredMetaFields: this.uppy.opts.restrictions.requiredMetaFields,
      showSelectedFiles: this.opts.showSelectedFiles,
      handleRequestThumbnail: this.handleRequestThumbnail,
      handleCancelThumbnail: this.handleCancelThumbnail,
      // doneButtonHandler: this.opts.doneButtonHandler,
      // site policy props
      invalidFiles: pluginState.invalidFiles ?? {},
      // drag props
      isDraggingOver: pluginState.isDraggingOver,
      handleDragOver: this.handleDragOver,
      handleDragLeave: this.handleDragLeave,
      handleDrop: this.handleDrop,
      externalMessages: this.opts.externalMessages
    });
  };

  install = () => {
    // Set default state for Dashboard
    this.setPluginState({
      isHidden: true,
      fileCardFor: null,
      activeOverlayType: null,
      showAddFilesPanel: false,
      activePickerPanel: false,
      showFileEditor: false,
      metaFields: this.opts.metaFields,
      targets: [],
      // We'll make them visible once .containerWidth is determined
      areInsidesReadyToBeVisible: false,
      isDraggingOver: false,
      // Site Policy Props
      invalidFiles: {}
    });

    const { inline, closeAfterFinish } = this.opts;
    if (inline && closeAfterFinish) {
      throw new Error(
        '[Dashboard] `closeAfterFinish: true` cannot be used on an inline Dashboard, because an inline Dashboard cannot be closed at all. Either set `inline: false`, or disable the `closeAfterFinish` option.'
      );
    }

    const { allowMultipleUploads, allowMultipleUploadBatches } = this.uppy.opts;
    if ((allowMultipleUploads || allowMultipleUploadBatches) && closeAfterFinish) {
      this.uppy.log(
        '[Dashboard] When using `closeAfterFinish`, we recommended setting the `allowMultipleUploadBatches` option to `false` in the Uppy constructor. See https://uppy.io/docs/uppy/#allowMultipleUploads-true',
        'warning'
      );
    }

    const { target } = this.opts;
    if (target) {
      this.mount(target, this);
    }

    const plugins = this.opts.plugins || [];
    plugins.forEach((pluginID) => {
      const plugin = this.uppy.getPlugin(pluginID);
      if (plugin) {
        plugin.mount(this, plugin);
      }
    });

    if (!this.opts.disableStatusBar) {
      this.uppy.use(StatusBar, {
        id: `${this.id}:StatusBar`,
        target: this,
        hideUploadButton: this.opts.hideUploadButton,
        hideRetryButton: this.opts.hideRetryButton,
        hidePauseResumeButton: this.opts.hidePauseResumeButton,
        hideCancelButton: this.opts.hideCancelButton,
        showProgressDetails: this.opts.showProgressDetails,
        hideAfterFinish: this.opts.hideProgressAfterFinish,
        locale: this.opts.locale,
        doneButtonHandler: this.opts.doneButtonHandler
      });
    }

    if (!this.opts.disableInformer) {
      this.uppy.use(Informer, {
        id: `${this.id}:Informer`,
        target: this
      });
    }

    if (!this.opts.disableThumbnailGenerator) {
      this.uppy.use(ThumbnailGenerator, {
        id: `${this.id}:ThumbnailGenerator`,
        thumbnailWidth: this.opts.thumbnailWidth,
        thumbnailType: this.opts.thumbnailType,
        waitForThumbnailsBeforeUpload: this.opts.waitForThumbnailsBeforeUpload,
        // If we don't block on thumbnails, we can lazily generate them
        lazy: !this.opts.waitForThumbnailsBeforeUpload
      });
    }

    // Dark Mode / theme
    this.darkModeMediaQuery =
      typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    const isDarkModeOnFromTheStart = this.darkModeMediaQuery ? this.darkModeMediaQuery.matches : false;
    this.uppy.log(`[Dashboard] Dark mode is ${isDarkModeOnFromTheStart ? 'on' : 'off'}`);
    this.setDarkModeCapability(isDarkModeOnFromTheStart);

    if (this.opts.theme === 'auto') {
      this.darkModeMediaQuery.addListener(this.handleSystemDarkModeChange);
    }

    this.discoverProviderPlugins();
    this.initEvents();
  };
}

export default Dashboard;
