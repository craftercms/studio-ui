/*
 * Copyright (C) 2007-2025 Crafter Software Corporation. All Rights Reserved.
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

import { h } from 'preact';
import { Dashboard as UppyDashboard } from 'uppy';
import { defaultPickerIcon } from '@uppy/provider-views';
import locale from './locale';
import DashboardUI from '../components/Dashboard';

const defaultOptions = {
	target: 'body',
	metaFields: [],
	thumbnailWidth: 280,
	thumbnailType: 'image/jpeg',
	waitForThumbnailsBeforeUpload: false,
	defaultPickerIcon,
	showLinkToFileUploadResult: false,
	hideProgressDetails: false,
	hideUploadButton: false,
	hideCancelButton: false,
	hideRetryButton: false,
	hidePauseResumeButton: false,
	hideProgressAfterFinish: false,
	note: null,
	singleFileFullScreen: true,
	disableStatusBar: false,
	disableInformer: false,
	disableThumbnailGenerator: false,
	fileManagerSelectionType: 'files',
	proudlyDisplayPoweredByUppy: true,
	showSelectedFiles: true,
	showRemoveButtonAfterComplete: false,
	showNativePhotoCameraButton: false,
	showNativeVideoCameraButton: false,
	theme: 'light',
	autoOpen: null,
	disabled: false,
	disableLocalFiles: false,
	nativeCameraFacingMode: '',
	onDragLeave: () => {},
	onDragOver: () => {},
	onDrop: () => {},
	plugins: [],

	// Dynamic default options, they have to be defined in the constructor (because
	// they require access to the `this` keyword), but we still want them to
	// appear in the default options so TS knows they'll be defined.
	doneButtonHandler: undefined,
	onRequestCloseModal: null,

	// defaultModalOptions
	inline: false,
	animateOpenClose: true,
	browserBackButtonClose: false,
	closeAfterFinish: false,
	closeModalOnClickOutside: false,
	disablePageScrollWhenModalOpen: true,
	trigger: null,

	// defaultInlineOptions
	width: 750,
	height: 550
};

export class Dashboard extends UppyDashboard {
	constructor(uppy, opts) {
		const autoOpen = opts?.autoOpen ?? null;
		super(uppy, { ...defaultOptions, ...opts, autoOpen });
		this.id = this.opts.id || 'Dashboard';
		this.title = 'Dashboard';
		this.type = 'orchestrator';

		this.defaultLocale = locale;

		// Dynamic default options:
		if (this.opts.doneButtonHandler === undefined) {
			// `null` means "do not display a Done button", while `undefined` means
			// "I want the default behavior". For this reason, we need to differentiate `null` and `undefined`.
			this.opts.doneButtonHandler = () => {
				this.uppy.clear();
				this.requestCloseModal();
			};
		}
		this.opts.onRequestCloseModal ??= () => this.closeModal();

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
					relativePath: file.relativePath || file.webkitRelativePath || null,
					// craftercms/uppy - sitePolicy custom value
					validating: true,
					path: relativePath
						? this.opts.path + relativePath.substring(0, relativePath.lastIndexOf('/'))
						: this.opts.path
				}
			};
		});

		const maxActiveUploads = this.opts.maxActiveUploads;
		const uppyFiles = this.uppy.getFiles();

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

	#getAcquirers = (targets) => {
		return targets
			.filter((target) => target.type === 'acquirer' && this.#isTargetSupported(target))
			.map(this.#attachRenderFunctionToTarget);
	};

	#getProgressIndicators = (targets) => {
		return targets.filter((target) => target.type === 'progressindicator').map(this.#attachRenderFunctionToTarget);
	};

	#getEditors = (targets) => {
		return targets.filter((target) => target.type === 'editor').map(this.#attachRenderFunctionToTarget);
	};

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
			isAllPaused
		} = this.uppy.getObjectOfFilesPerState();

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
			console.warn(
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
			isAllPaused,
			totalFileCount: Object.keys(files).length,
			totalProgress: state.totalProgress,
			allowNewUpload,
			acquirers,
			theme,
			disabled: this.opts.disabled,
			disableLocalFiles: this.opts.disableLocalFiles,
			direction: this.opts.direction,
			activePickerPanel: pluginState.activePickerPanel,
			showFileEditor: pluginState.showFileEditor,
			saveFileEditor: this.saveFileEditor,
			closeFileEditor: this.closeFileEditor,
			disableInteractiveElements: this.disableInteractiveElements,
			animateOpenClose: this.opts.animateOpenClose,
			isClosing: pluginState.isClosing,
			progressindicators,
			editors,
			autoProceed: this.uppy.opts.autoProceed,
			id: this.id,
			closeModal: this.requestCloseModal,
			handleClickOutside: this.handleClickOutside,
			handleInputChange: this.handleInputChange,
			handlePaste: this.handlePaste,
			inline: this.opts.inline,
			showPanel: this.showPanel,
			hideAllPanels: this.hideAllPanels,
			i18n: this.i18n,
			i18nArray: this.i18nArray,
			uppy: this.uppy,
			note: this.opts.note,
			recoveredState: state.recoveredState,
			metaFields: pluginState.metaFields,
			resumableUploads: capabilities.resumableUploads || false,
			individualCancellation: capabilities.individualCancellation,
			isMobileDevice: capabilities.isMobileDevice,
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
			showRemoveButtonAfterComplete: this.opts.showRemoveButtonAfterComplete,
			containerWidth: pluginState.containerWidth,
			containerHeight: pluginState.containerHeight,
			areInsidesReadyToBeVisible: pluginState.areInsidesReadyToBeVisible,
			parentElement: this.el,
			allowedFileTypes: this.uppy.opts.restrictions.allowedFileTypes,
			maxNumberOfFiles: this.uppy.opts.restrictions.maxNumberOfFiles,
			requiredMetaFields: this.uppy.opts.restrictions.requiredMetaFields,
			showSelectedFiles: this.opts.showSelectedFiles,
			showNativePhotoCameraButton: this.opts.showNativePhotoCameraButton,
			showNativeVideoCameraButton: this.opts.showNativeVideoCameraButton,
			nativeCameraFacingMode: this.opts.nativeCameraFacingMode,
			singleFileFullScreen: this.opts.singleFileFullScreen,
			handleRequestThumbnail: this.handleRequestThumbnail,
			handleCancelThumbnail: this.handleCancelThumbnail,
			// drag props
			isDraggingOver: pluginState.isDraggingOver,
			handleDragOver: this.handleDragOver,
			handleDragLeave: this.handleDragLeave,
			handleDrop: this.handleDrop,
			// informer props
			disableInformer: this.opts.disableInformer,
			// status-bar props
			disableStatusBar: this.opts.disableStatusBar,
			hideProgressDetails: this.opts.hideProgressDetails,
			hideUploadButton: this.opts.hideUploadButton,
			hideRetryButton: this.opts.hideRetryButton,
			hidePauseResumeButton: this.opts.hidePauseResumeButton,
			hideCancelButton: this.opts.hideCancelButton,
			hideProgressAfterFinish: this.opts.hideProgressAfterFinish,
			doneButtonHandler: this.opts.doneButtonHandler
		});
	};
}
