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

import { defineMessages, MessageDescriptor } from 'react-intl';
import { getCurrentIntl } from '../utils/i18n';

export function translateElements(
  elements: Element[],
  messages: { [key: string]: MessageDescriptor },
  formats: any = {}
) {
  messages = Object.entries(messages).reduce((table: any, [key, descriptor]) => {
    table[descriptor.id] = descriptor;
    return table;
  }, {});
  elements.forEach((elem) => {
    const key = elem.getAttribute('data-i18n');
    if (key) {
      const message = getCurrentIntl().formatMessage(messages[key], formats);
      elem.innerHTML = Array.isArray(message) ? message.join('') : message;
    }
  });
}

export const approveDialogMessages = defineMessages({
  approveForPublish: {
    id: 'publishDialog.approveForPublish',
    defaultMessage: 'Approve for Publish'
  },
  differentPublishDateWarning: {
    id: 'publishDialog.differentPublishDateWarning',
    defaultMessage:
      '<strong>Warning</strong> The items you have selected for approval were submitted with different requested publish dates/times.'
  },
  publishingScheduleTitle: {
    id: 'publishDialog.publishingScheduleTitle',
    defaultMessage: 'Selected Item Scheduling'
  },
  introductoryText: {
    id: 'publishDialog.introductoryText',
    defaultMessage:
      'Selected files will be published. Hard dependencies are automatically included. Soft dependencies are optional and you may choose which to include.'
  },
  submissionCommentFieldError: {
    id: 'publishDialog.submissionCommentFieldError',
    defaultMessage: 'Please write submission comment.'
  }
});

export const deleteDialogMessages = defineMessages({
  submissionCommentFieldError: {
    id: 'deleteDialog.submissionCommentFieldError',
    defaultMessage: 'Please write submission comment.'
  }
});

export const usersAdminMessages = defineMessages({
  maxLengthError: {
    id: 'usersAdmin.maxLengthError',
    defaultMessage: "{field} can't be longer than {size} characters"
  },
  userName: {
    id: 'usersAdmin.userName',
    defaultMessage: 'User Name'
  },
  firstName: {
    id: 'usersAdmin.firstName',
    defaultMessage: 'First Name'
  },
  lastName: {
    id: 'usersAdmin.lastName',
    defaultMessage: 'Last Name'
  },
  userCreated: {
    id: 'usersAdmin.userCreated',
    defaultMessage: '{username} created.'
  },
  userEdited: {
    id: 'usersAdmin.userEdited',
    defaultMessage: '{username} edited.'
  },
  userDeleted: {
    id: 'usersAdmin.userDeleted',
    defaultMessage: '{username} deleted.'
  },
  passwordChangeSuccess: {
    id: 'usersAdmin.passwordChangeSuccessMessage',
    defaultMessage: 'Password changed successfully'
  }
});

export const passwordRequirementMessages = defineMessages({
  hasNumbers: {
    id: 'passwordRequirement.hasNumbers',
    defaultMessage: 'Must contain at least one number'
  },
  hasLowercase: {
    id: 'passwordRequirement.hasLowercase',
    defaultMessage: 'Must contain at least one lowercase letter'
  },
  hasUppercase: {
    id: 'passwordRequirement.hasUppercase',
    defaultMessage: 'Must contain at least one uppercase letter'
  },
  hasSpecialChars: {
    id: 'passwordRequirement.hasSpecialChars',
    defaultMessage: 'Must contain at least one special character {chars}'
  },
  noSpaces: {
    id: 'passwordRequirement.noSpaces',
    defaultMessage: 'Must not contain whitespaces'
  },
  minLength: {
    id: 'passwordRequirement.minLength',
    defaultMessage: 'Length must be at least {min} characters'
  },
  maxLength: {
    id: 'passwordRequirement.maxLength',
    defaultMessage: 'Length must not exceed {max} characters'
  },
  minMaxLength: {
    id: 'passwordRequirement.minMaxLength',
    defaultMessage: 'Length must be between {minLength} and {maxLength} characters'
  },
  passwordValidation: {
    id: 'passwordRequirement.passwordValidation',
    defaultMessage: 'Password Validation'
  },
  validPassword: {
    id: 'passwordRequirement.validPassword',
    defaultMessage: 'Requirements met'
  },
  invalidPassword: {
    id: 'passwordRequirement.invalidPassword',
    defaultMessage: 'Requirements are not met'
  },
  notBlank: {
    id: 'passwordRequirement.noBlank',
    defaultMessage: 'Must not be blank'
  },
  validationPassing: {
    id: 'passwordRequirement.validationPassing',
    defaultMessage: 'Validation passing'
  },
  fulfillAllReqErrorMessage: {
    id: 'passwordRequirement.fulfillAllReqErrorMessage',
    defaultMessage: 'Please fulfill all password requirements.'
  },
  unnamedGroup: {
    id: 'passwordRequirement.unnamedGroup',
    defaultMessage: 'Condition not described'
  },
  passwordConfirmationMismatch: {
    id: 'passwordRequirement.passwordConfirmationMismatch',
    defaultMessage: "Passwords don't match"
  }
});

export const groupsAdminMessages = defineMessages({
  maxLengthError: {
    id: 'groupsAdmin.maxLengthError',
    defaultMessage: "{field} can't be longer than {size} characters"
  },
  displayName: {
    id: 'groupsAdmin.displayName',
    defaultMessage: 'Display Name'
  },
  groupCreated: {
    id: 'groupsAdmin.groupCreated',
    defaultMessage: '{group} created.'
  },
  groupEdited: {
    id: 'groupsAdmin.groupEdited',
    defaultMessage: '{group} edited.'
  },
  groupDeleted: {
    id: 'groupsAdmin.groupDeleted',
    defaultMessage: '{group} deleted.'
  },
  usersAdded: {
    id: 'groupsAdmin.usersAdded',
    defaultMessage: 'User(s) successfully added.'
  },
  userRemoved: {
    id: 'groupsAdmin.usereRemoved',
    defaultMessage: '{username} successfully removed from {group}'
  }
});

export const profileSettingsMessages = defineMessages({
  password: {
    id: 'profileSettings.password',
    defaultMessage: 'Password'
  },
  currentPassword: {
    id: 'profileSettings.currentPassword',
    defaultMessage: 'Current password'
  },
  isRequired: {
    id: 'profileSettings.isRequired',
    defaultMessage: 'is required'
  },
  mustMatchPreviousEntry: {
    id: 'profileSettings.mustMatchPreviousEntry',
    defaultMessage: 'Must match the previous entry'
  },
  languageSaveSuccesfully: {
    id: 'profileSettings.languageUpdatedSuccessfully',
    defaultMessage: 'Language Updated Successfully.'
  },
  languageSaveFailedWarning: {
    id: 'profileSettings.languageUpdateFailedWarning',
    defaultMessage: 'Language update has failed. Please retry momentarily.'
  },
  unSavedConfirmation: {
    id: 'profileSettings.unsavedConfirmation',
    defaultMessage: 'You have unsaved changes. Discard changes?'
  },
  unSavedConfirmationTitle: {
    id: 'profileSettings.unsavedConfirmationTitle',
    defaultMessage: 'Unsaved Changes'
  }
});

export const numericInputControlMessages = defineMessages({
  minimun: {
    id: 'numericInputControl.childContent',
    defaultMessage: 'Minimum'
  },
  maximun: {
    id: 'numericInputControl.maximun',
    defaultMessage: 'Maximum'
  },
  noDecimalsErrMessage: {
    id: 'numericInputControl.noDecimalsErrMessage',
    defaultMessage: "Decimals aren't allowed on this input."
  }
});

export const reposAdminMessages = defineMessages({
  pendingCommit: {
    id: 'reposAdmin.pendingCommit',
    defaultMessage: 'Repo contains files pending commit. See Repository status below for details.'
  },
  unstagedFiles: {
    id: 'reposAdmin.unstagedFilesMessage',
    defaultMessage: 'There are unstaged files in your repository.'
  },
  unreachableRemote: {
    id: 'reposAdmin.unreachableRemote',
    defaultMessage: 'Remote "{name}" is currently unreachable.'
  },
  repositoriesNote: {
    id: 'reposAdmin.repositoriesNote',
    defaultMessage:
      'Do not use Studio as a git merge and conflict resolution platform. ' +
      'All merge conflicts should be resolved upstream before getting pulled into Studio.'
  }
});

export const sharedContentDSMessages = defineMessages({
  sharedContent: {
    id: 'sharedContentDS.sharedContent',
    defaultMessage: 'Shared Content'
  }
});

export const embeddedContentDSMessages = defineMessages({
  embeddedContent: {
    id: 'embeddedContentDS.embeddedContent',
    defaultMessage: 'Embedded Content'
  }
});

export const childContentDSMessages = defineMessages({
  childContent: {
    id: 'childContentDS.childContent',
    defaultMessage: 'Child Content (Deprecated)'
  }
});

export const contentTypesMessages = defineMessages({
  notice: {
    id: 'contentType.notice',
    defaultMessage: 'Notice'
  },
  contenTypeWarningMessage: {
    id: 'contentType.contentTypeWarningMessage',
    defaultMessage:
      'Please note Child Content datasource is being phased out of CrafterCMS. For components that need to be shared across pages or components, please use Shared Content instead. For components that belong exclusively to this content object, please use Embedded Content.'
  },
  useSharedContent: {
    id: 'contentType.useSharedContent',
    defaultMessage: 'Use Shared Content'
  },
  useEmbeddedContent: {
    id: 'contentType.useEmbeddedContent',
    defaultMessage: 'Use Embedded Content'
  },
  useChildContent: {
    id: 'contentType.useChildContent',
    defaultMessage: 'Use Deprecated Control Anyway'
  },
  saveFailed: {
    id: 'contentType.saveFailed',
    defaultMessage: 'Save Failed'
  },
  fileNameErrorMessage: {
    id: 'contentType.fileNameErrorMessage',
    defaultMessage:
      'Content types require a file name. Please add either a "File Name" or "Auto Filename" control to this content type definition.'
  },
  internalNameErrorMessage: {
    id: 'contentType.internalNameErrorMessage',
    defaultMessage: 'This content type requires an Internal Name.'
  },
  flagTitleError: {
    id: 'contentType.flatTitleError',
    defaultMessage: 'Please fill every title for fields and datasources.'
  },
  idError: {
    id: 'contentType.idError',
    defaultMessage: 'Please fill variable name for: '
  },
  noTemplateAssoc: {
    id: 'contentType.noTemplateAssoc',
    defaultMessage:
      'There is no template associated with this content type. Click Save to proceed with save operation or Continue to update the content type (under Basic Content Type Properties) with a template.'
  },
  continueEditing: {
    id: 'contentType.continueEditing',
    defaultMessage: 'Continue Editing'
  },
  width: {
    id: 'contentType.width',
    defaultMessage: 'Width'
  },
  height: {
    id: 'contentType.height',
    defaultMessage: 'Height'
  },
  autoGrow: {
    id: 'contentType.autoGrow',
    defaultMessage: 'Auto Grow'
  },
  enableSpellCheck: {
    id: 'contentType.enableSpellCheck',
    defaultMessage: 'Enable Spell Check'
  },
  forceRootBlockP: {
    id: 'contentType.forceRootBlockP',
    defaultMessage: 'Force Root Block p Tag'
  },
  forcePNewLines: {
    id: 'contentType.forcePNewLines',
    defaultMessage: 'Force p tags New Lines'
  },
  forceBRNewLines: {
    id: 'contentType.forceBRNewLines',
    defaultMessage: 'Force br New Lines'
  },
  supportedChannels: {
    id: 'contentType.supportedChannels',
    defaultMessage: 'Supported Channels'
  },
  RTEConfiguration: {
    id: 'contentType.RTEConfiguration',
    defaultMessage: 'RTE Configuration'
  },
  imageManager: {
    id: 'contentType.imageManager',
    defaultMessage: 'Image Manager'
  },
  videoManager: {
    id: 'contentType.videoManager',
    defaultMessage: 'Video Manager'
  },
  fileManager: {
    id: 'contentType.fileManager',
    defaultMessage: 'File Manager'
  },
  siteConfigLandingMessage: {
    id: 'siteConfig.landingMessage',
    defaultMessage: 'Please choose a tool from the left.'
  },
  insertExpressionMessage: {
    id: 'siteConfig.insertExpressionMessage',
    defaultMessage: 'Insert Expression'
  },
  switchToMessage: {
    id: 'siteConfig.switchToMessage',
    defaultMessage: 'Switch to {type}'
  },
  invalidNumber: {
    id: 'siteConfig.invalidNumber',
    defaultMessage: '"{value}" is not a valid number.'
  },
  postfixes: {
    id: 'siteConfig.postfixes',
    defaultMessage: 'Postfixes'
  },
  controlNotAvailable: {
    id: 'siteConfig.controlNotAvailable',
    defaultMessage: 'Control not available'
  },
  loadModuleError: {
    id: 'siteConfig.loadModuleError',
    defaultMessage: 'Unable to load "{tool}". Check project tools configuration.'
  },
  toolNotFound: {
    id: 'siteConfig.toolNotFound',
    defaultMessage: '"{tool}" tool not found.'
  },
  dependsOn: {
    id: 'contentType.dependsOn',
    defaultMessage: 'This property depends on "{dependency}"'
  },
  minValueError: {
    id: 'contentType.minSizeError',
    defaultMessage: "Minimum value can't be higher than maximum value"
  },
  maxValueError: {
    id: 'contentType.maxSizeError',
    defaultMessage: "Maximum value can't be lower than minimum value"
  },
  missingTemplateTitle: {
    id: 'contentType.missingTemplateTitle',
    defaultMessage: 'Missing Template'
  },
  missingTemplateBody: {
    id: 'contentType.missingTemplateBody',
    defaultMessage:
      'Confirm a template is not required for this content type. Failing to assign a template would cause rendering issues on templated apps.'
  },
  templateNotRequiredSave: {
    id: 'contentType.templateNotRequiredSave',
    defaultMessage: 'Template not required, save'
  },
  templateNotRequiredSaveAndClose: {
    id: 'contentType.templateNotRequiredSaveAndClose',
    defaultMessage: 'Template not required, save & close'
  },
  templateNotRequiredSaveAndMinimize: {
    id: 'contentType.templateNotRequiredSaveAndMinimize',
    defaultMessage: 'Template not required, save & minimize'
  },
  createATemplate: {
    id: 'contentType.createATemplate',
    defaultMessage: 'Create a template'
  },
  chooseExistingTemplate: {
    id: 'contentType.chooseExistingTemplate',
    defaultMessage: 'Choose existing template'
  },
  stayEditing: {
    id: 'contentType.stayEditing',
    defaultMessage: 'Stay & continue editing'
  }
});

export const targetingDialog = defineMessages({
  setNow: {
    id: 'targetingDialog.setNow',
    defaultMessage: 'Set Now'
  },
  defaults: {
    id: 'words.defaults',
    defaultMessage: 'Defaults'
  }
});

export const words = defineMessages({
  notification: {
    id: 'words.notification',
    defaultMessage: 'Notification'
  },
  confirm: {
    id: 'words.confirm',
    defaultMessage: 'Confirm'
  },
  cancel: {
    id: 'words.cancel',
    defaultMessage: 'Cancel'
  },
  clear: {
    id: 'words.clear',
    defaultMessage: 'Clear'
  },
  update: {
    id: 'words.update',
    defaultMessage: 'Update'
  },
  save: {
    id: 'words.save',
    defaultMessage: 'Save'
  },
  reset: {
    id: 'words.reset',
    defaultMessage: 'Reset'
  },
  close: {
    id: 'words.close',
    defaultMessage: 'Close'
  },
  yes: {
    id: 'words.yes',
    defaultMessage: 'Yes'
  },
  no: {
    id: 'words.no',
    defaultMessage: 'No'
  },
  browse: {
    id: 'words.browse',
    defaultMessage: 'Browse'
  },
  upload: {
    id: 'words.upload',
    defaultMessage: 'Upload'
  },
  reason: {
    id: 'words.reason',
    defaultMessage: 'Reason'
  },
  select: {
    id: 'words.select',
    defaultMessage: 'Select'
  },
  view: {
    id: 'words.view',
    defaultMessage: 'View'
  }
});

export const simpleTaxonomyDSMessages = defineMessages({
  label: {
    id: 'simpleTaxonomyDS.label',
    defaultMessage: 'Taxonomy Selector'
  },
  unableLoad: {
    id: 'simpleTaxonomyDS.unableLoad',
    defaultMessage: 'The system was unable to load {file}.'
  },
  required: {
    id: 'simpleTaxonomyDS.required',
    defaultMessage: 'Required'
  },
  componentPath: {
    id: 'simpleTaxonomyDS.componentPath',
    defaultMessage: 'Component Path'
  },
  dataType: {
    id: 'simpleTaxonomyDS.dataType',
    defaultMessage: 'Data Type'
  },
  string: {
    id: 'simpleTaxonomyDS.string',
    defaultMessage: 'String'
  },
  integer: {
    id: 'simpleTaxonomyDS.integer',
    defaultMessage: 'Integer'
  },
  float: {
    id: 'simpleTaxonomyDS.float',
    defaultMessage: 'Float'
  },
  date: {
    id: 'simpleTaxonomyDS.date',
    defaultMessage: 'Date'
  },
  html: {
    id: 'simpleTaxonomyDS.html',
    defaultMessage: 'Data Type'
  },
  simpleTaxonomy: {
    id: 'simpleTaxonomyDS.simpleTaxonomy',
    defaultMessage: 'Simple Taxonomy'
  }
});

export const codeEditorMessages = defineMessages({
  inProgressConfirmation: {
    id: 'codeEditor.inProgressConfirmation',
    defaultMessage:
      'Another editor is currently open & minimized. Please close the current editor before opening another'
  },
  confirm: {
    id: 'codeEditor.confirm',
    defaultMessage: 'Confirm Close'
  },
  stay: {
    id: 'codeEditor.stay',
    defaultMessage: 'No, stay'
  },
  base: {
    id: 'words.base',
    defaultMessage: 'Base'
  },
  copy: {
    id: 'words.copy',
    defaultMessage: 'Copy'
  },
  save: {
    id: 'words.save',
    defaultMessage: 'Save'
  },
  insertCode: {
    id: 'codeEditor.insertCode',
    defaultMessage: 'Insert Code'
  },
  saved: {
    id: 'codeEditor.saved',
    defaultMessage: 'Item saved successfully'
  },
  saveAndClose: {
    id: 'codeEditor.saveAndClose',
    defaultMessage: 'Save & Close'
  },
  saveAndMinimize: {
    id: 'codeEditor.saveAndMinimize',
    defaultMessage: 'Save & Minimize'
  },
  localesHelperText: {
    id: 'codeEditor.localesHelperText',
    defaultMessage:
      "Select the locale for which to create/edit a template. Locales, like 'en' will cover sub-locales like 'en_us' or 'en_uk'."
  },
  localesConfirmTitle: {
    id: 'codeEditor.localesConfirmTitle',
    defaultMessage: 'Create Template'
  },
  localesConfirmBody: {
    id: 'codeEditor.localesConfirmBody',
    defaultMessage: 'The template for the locale you selected does not exist. Do you want to create it now?'
  },
  localesSnackBarTitle: {
    id: 'codeEditor.localesSnackBarTitle',
    defaultMessage: 'Template Created. Do you want to copy the base template?'
  }
});

export const globalConfigMessages = defineMessages({
  unSavedConfirmation: {
    id: 'globalConfig.unsavedConfirmation',
    defaultMessage: 'You have unsaved changes, do you want to leave?'
  },
  unSavedConfirmationTitle: {
    id: 'globalConfig.unsavedConfirmationTitle',
    defaultMessage: 'Unsaved changes'
  }
});

export const publishingMessages = defineMessages({
  idle: {
    id: 'publishing.idle',
    defaultMessage: 'Idle'
  },
  busy: {
    id: 'publishing.busy',
    defaultMessage: 'Busy'
  },
  ready: {
    id: 'publishing.ready',
    defaultMessage: 'Ready'
  },
  stopped: {
    id: 'publishing.stopped',
    defaultMessage: 'Stopped'
  },
  started: {
    id: 'publishing.started',
    defaultMessage: 'Started'
  },
  queued: {
    id: 'publishing.queued',
    defaultMessage: 'Queued'
  },
  bulkPublishNote: {
    id: 'publishing.bulkPublishNote',
    defaultMessage:
      'Bulk publish should be used to publish changes made in Studio via the UI. For changes made via direct git actions, use the "Publish by..." feature.'
  },
  publishByNote: {
    id: 'publishing.publishByNote',
    defaultMessage:
      '"Publish by..." feature must be used for changes made via direct git actions against the repository or pulled from a remote repository. For changes made via Studio on the UI, use "Bulk Publish".'
  }
});

export const browseCMISMessages = defineMessages({
  cmis: {
    id: 'browseCMIS.cmis',
    defaultMessage: 'CMIS'
  },
  cloningCMIS: {
    id: 'browseCMIS.cloningCMIS',
    defaultMessage: 'Cloning CMIS Asset'
  }
});

export const browseSearchMessages = defineMessages({
  lookUpParentError: {
    id: 'browseSearchMessages.lookUpChildError',
    defaultMessage: 'Unable to lookup child form callback for search: {searchId}'
  },
  lookUpChildError: {
    id: 'browseSearchMessages.lookUpParentError',
    defaultMessage: 'Unable to lookup parent context for search: {searchId}'
  }
});

export const formEngineMessages = defineMessages({
  inProgressConfirmation: {
    id: 'formEngine.inProgressConfirmation',
    defaultMessage: 'Another form is currently open & minimized. Please close the current form before opening another'
  },
  saveDraftCompleted: {
    id: 'formEngine.saveDraftCompleted',
    defaultMessage: 'Draft Save Completed'
  },
  save: {
    id: 'formEngine.save',
    defaultMessage: 'Save as Draft'
  },
  saveAndClose: {
    id: 'formEngine.saveAndClose',
    defaultMessage: 'Save & Close'
  },
  saveAndPreview: {
    id: 'formEngine.saveAndPreview',
    defaultMessage: 'Save & Preview'
  },
  saveAndMinimize: {
    id: 'formEngine.saveAndMinimize',
    defaultMessage: 'Save & Minimize'
  },
  saveDraft: {
    id: 'formEngine.saveDraft',
    defaultMessage: 'Save Draft'
  },
  createPolicy: {
    id: 'formEngine.createPolicy',
    defaultMessage:
      'The {originalPath} path goes against project policies. Suggested modified path is: "{path}". Would you like to use the suggested path?'
  },
  policyError: {
    id: 'formEngine.policyError',
    defaultMessage: 'The {path} path goes against project policies.'
  },
  formNotReadyForSaving: {
    id: 'formEngine.formNotReadyForSaving',
    defaultMessage: 'Form is not ready for saving. Please try again momentarily or use the cancel button.'
  },
  useMVS: {
    id: 'formEngine.useMVS',
    defaultMessage: 'Use _mvs postfix (backward compat)'
  },
  edit: {
    id: 'words.edit',
    defaultMessage: 'Edit'
  },
  embeddedComponent: {
    id: 'common.embeddedComponent',
    defaultMessage: 'Embedded component'
  },
  nodeSelectorItemNotFound: {
    defaultMessage: 'Item "{internalName}" doesn\'t exist'
  },
  removeItemFromNodeSelector: {
    defaultMessage: 'Remove from {controlLabel}'
  },
  keepItemInNodeSelector: {
    defaultMessage: 'Ignore'
  }
});

export const dragAndDropMessages = defineMessages({
  componentNotWelcomeWithinDropZone: {
    id: 'dragAndDropMessages.componentNotWelcomeWithinDropZone',
    defaultMessage: 'The drop zone does not support this type of component. Check your content model.'
  },
  embeddedComponentsDndNotSupported: {
    id: 'dragAndDropMessages.embeddedComponentsDndNotSupported',
    defaultMessage: "Drag and drop on embedded components it's not supported yet. Please use the forms to edit content."
  },
  embeddedComponentsDragWithinParentOnly: {
    id: 'dragAndDropMessages.embeddedComponentsDragWithinParentOnly',
    defaultMessage:
      'On this release, embedded components may only be dragged within their current parent. Please use the forms to edit content.'
  },
  moveOutEmbeddedComponentsNotSupported: {
    id: 'dragAndDropMessages.moveOutEmbeddedComponentsNotSupported',
    defaultMessage:
      'Moving components out of an embedded drop zone component is not supported yet. Please use the forms to edit content.'
  },
  embeddedComponentsDeleteChildNotSupported: {
    id: 'dragAndDropMessages.embeddedComponentsDeleteChildNotSupported',
    defaultMessage:
      'Deleting components from an embedded drop zone component is not supported yet. Please use the forms to edit content.'
  },
  contentTypeNotFound: {
    id: 'dragAndDropMessages.contentTypeNotFound',
    defaultMessage:
      'The content type id was not found in your template. Drag and drop will be impaired. More info at docs.craftercms.org/en/3.1/system-administrators/upgrade/index.html.'
  },
  pathNotFound: {
    id: 'dragAndDropMessages.pathNotFound',
    defaultMessage:
      'Path is missing. Drag and drop will be impaired. More info at docs.craftercms.org/en/3.1/system-administrators/upgrade/index.html.'
  },
  objectIdNotFound: {
    id: 'dragAndDropMessages.objectIdNotFound',
    defaultMessage:
      'Object id is missing. Drag and drop will be impaired. More info at docs.craftercms.org/en/3.1/system-administrators/upgrade/index.html.'
  }
});

export const internalNameControlMessages = defineMessages({
  label: {
    id: 'internalNameControl.label',
    defaultMessage: 'Internal Name'
  },
  displaySize: {
    id: 'internalNameControl.displaySize',
    defaultMessage: 'Display Size'
  },
  maxLength: {
    id: 'internalNameControl.maxLength',
    defaultMessage: 'Max Length'
  }
});

export const checkboxGroupControlMessages = defineMessages({
  datasource: {
    id: 'checkboxGroupControl.datasource',
    defaultMessage: 'Data Source'
  },
  showSelectAll: {
    id: 'checkboxGroupControl.showSelectAll',
    defaultMessage: 'Show "Select All"'
  },
  listDirection: {
    id: 'checkboxGroupControl.listDirection',
    defaultMessage: 'List Direction'
  },
  horizontal: {
    id: 'checkboxGroupControl.horizontal',
    defaultMessage: 'Horizonal'
  },
  vertical: {
    id: 'checkboxGroupControl.vertical',
    defaultMessage: 'Vertical'
  },
  readonly: {
    id: 'checkboxGroupControl.readonly',
    defaultMessage: 'Read Only'
  }
});

export const transcodedVideoPickerControlMessages = defineMessages({
  label: {
    id: 'transcodedVideoPickerControl.label',
    defaultMessage: 'Transcoded Video'
  }
});

export const globalMenuMessages = defineMessages({
  'home.globalMenu.sites': {
    id: 'words.projects',
    defaultMessage: 'Projects'
  },
  'home.globalMenu.users': {
    id: 'words.users',
    defaultMessage: 'Users'
  },
  'home.globalMenu.groups': {
    id: 'words.groups',
    defaultMessage: 'Groups'
  },
  'home.globalMenu.audit': {
    id: 'words.audit',
    defaultMessage: 'Audit'
  },
  'home.globalMenu.logging-levels': {
    id: 'globalMenu.loggingLevelsEntryLabel',
    defaultMessage: 'Logging Levels'
  },
  'home.globalMenu.log-console': {
    id: 'globalMenu.logConsoleEntryLabel',
    defaultMessage: 'Log Console'
  },
  'home.globalMenu.globalConfig': {
    id: 'globalMenu.globalConfigEntryLabel',
    defaultMessage: 'Global Config'
  },
  'home.globalMenu.encryptionTool': {
    id: 'globalMenu.encryptionTool',
    defaultMessage: 'Encryption Tool'
  },
  'home.globalMenu.tokenManagement': {
    id: 'globalMenu.tokenManagement',
    defaultMessage: 'Token Management'
  },
  'home.about-us': {
    id: 'words.about',
    defaultMessage: 'About'
  },
  'home.settings': {
    id: 'globalMenu.settings',
    defaultMessage: 'Account'
  },
  login: {
    id: 'words.login',
    defaultMessage: 'Login'
  },
  'login.recover': {
    id: 'globalMenu.recover',
    defaultMessage: 'Password Recovery'
  }
});

globalMenuMessages['home.globalMenu.about-us'] = globalMenuMessages['home.about-us'];
globalMenuMessages['home.globalMenu.settings'] = globalMenuMessages['home.settings'];

export const encryptToolMessages = defineMessages({
  pageTitle: {
    id: 'encryptTool.pageTitle',
    defaultMessage: 'Encryption Tool'
  },
  inputLabel: {
    id: 'encryptTool.inputLabel',
    defaultMessage: 'Raw Text'
  },
  buttonText: {
    id: 'encryptTool.buttonText',
    defaultMessage: 'Encrypt Text'
  },
  successMessage: {
    id: 'encryptTool.successMessage',
    defaultMessage: 'Encrypted text copied to clipboard.'
  },
  errorMessage: {
    id: 'encryptTool.errorMessage',
    defaultMessage: 'Text encryption failed. Please try again momentarily.'
  },
  clearResultButtonText: {
    id: 'encryptTool.clearResultButtonText',
    defaultMessage: 'Clear'
  }
});

export const fileNameControlMessages = defineMessages({
  urlChangeWaring: {
    id: 'fileNameControl.urlChangeWarning',
    defaultMessage: 'Changing this value may result in broken references and links.'
  }
});

export const rteControlMessages = defineMessages({
  escapeScripts: {
    id: 'rteControlMessages.escapeScripts',
    defaultMessage: 'Escape Scripts'
  },
  requiredField: {
    id: 'rteControlMessages.requiredField',
    defaultMessage: 'Field is Required'
  },
  incompatibleDatasource: {
    id: 'rteControlMessages.incompatibleDatasource',
    defaultMessage:
      'The data source configured for browse is not compatible with the Rich Text Editor. Please contact your administrator.'
  },
  noDatasourcesConfigured: {
    id: 'rteControlMessages.noDatasourcesConfigured',
    defaultMessage: 'No sources configured for this editor.'
  },
  chooseSource: {
    id: 'rteControlMessages.chooseSource',
    defaultMessage: 'Choose a Source'
  },
  dropImageUploaded: {
    id: 'rteControlMessages.dropImageUploaded',
    defaultMessage: '{title} was successfully uploaded.'
  }
});

export const ossAttribution = defineMessages({
  attribution: {
    id: 'aboutView.attribution',
    defaultMessage: 'CrafterCMS is made possible by these other <a>open source software projects</a>.'
  }
});

export const dashboardWidgetsMessages = defineMessages({
  publishingTarget: {
    id: 'common.publishingTarget',
    defaultMessage: 'Publishing Target'
  }
});

export const bulkUploadConfirmDialogMessages = defineMessages({
  title: {
    id: 'bulkUploadConfirmDialogMessages.title',
    defaultMessage: 'Upload in progress'
  },
  description: {
    id: 'bulkUploadConfirmDialogMessages.description',
    defaultMessage: 'There is still a bulk upload in progress. Only one bulk upload can be executed at the same time.'
  }
});

export const embeddedLegacyFormMessages = defineMessages({
  contentFormFailedToLoadErrorMessage: {
    id: 'embeddedLegacyFormMessages.openContentFormFailedError',
    defaultMessage:
      'An error occurred opening the content form. Please try again momentarily. Contact the administrator if the error persists.'
  }
});

export const componentsMessages = defineMessages({
  components: {
    id: 'componentsMessages.components',
    defaultMessage: 'Components'
  },
  createNewEmbedded: {
    id: 'componentsMessages.createNewEmbedded',
    defaultMessage: 'Create new embedded'
  },
  createNewShared: {
    id: 'componentsMessages.createNewShared',
    defaultMessage: 'Create new shared'
  },
  allowShared: {
    id: 'componentsMessages.allowShared',
    defaultMessage: 'Allow Shared'
  },
  allowEmbedded: {
    id: 'componentsMessages.allowEmbedded',
    defaultMessage: 'Allow Embedded'
  },
  enableBrowse: {
    id: 'componentsMessages.enableBrowse',
    defaultMessage: 'Enable Browse'
  },
  enableSearch: {
    id: 'componentsMessages.enableSearch',
    defaultMessage: 'Enable Search'
  },
  baseRepositoryPath: {
    id: 'componentsMessages.baseRepositoryPath',
    defaultMessage: 'Base Repository Path'
  },
  baseBrowsePath: {
    id: 'componentsMessages.baseBrowsePath',
    defaultMessage: 'Base Browse Path'
  },
  contentTypes: {
    id: 'componentsMessages.contentTypes',
    defaultMessage: 'Content Types'
  },
  tags: {
    id: 'componentsMessages.tags',
    defaultMessage: 'Tags'
  },
  browseExisting: {
    id: 'componentsMessages.browseExisting',
    defaultMessage: 'Browse existing'
  },
  searchExisting: {
    id: 'componentsMessages.searchExisting',
    defaultMessage: 'Search existing components'
  }
});

export const wcmRootFolder = defineMessages({
  pathNotFound: {
    id: 'wcmRootFolder.pathNotFound',
    defaultMessage: 'Folder {path} not found.'
  }
});

export const localeSelectorControlMessages = defineMessages({
  label: {
    id: 'localeSelectorControl.label',
    defaultMessage: 'Locale Selector'
  },
  requiredError: {
    id: 'localeSelectorControl.requiredError',
    defaultMessage: 'Field is Required'
  }
});

export const adminDashboardMessages = defineMessages({
  siteUpdated: {
    id: 'sitesAdmin.siteUpdated',
    defaultMessage: 'Project Updated.'
  }
});

export const controlsCommonMessages = defineMessages({
  escapeContent: {
    id: 'controlsCommonMessages.escapeContent',
    defaultMessage: 'Escape Content'
  }
});

export const languages = {
  af: 'Afrikaans',
  sq: 'Albanian',
  am: 'Amharic',
  ar_dz: 'Arabic - Algeria',
  ar_bh: 'Arabic - Bahrain',
  ar_eg: 'Arabic - Egypt',
  ar_iq: 'Arabic - Iraq',
  ar_jo: 'Arabic - Jordan',
  ar_kw: 'Arabic - Kuwait',
  ar_lb: 'Arabic - Lebanon',
  ar_ly: 'Arabic - Libya',
  ar_ma: 'Arabic - Morocco',
  ar_om: 'Arabic - Oman',
  ar_qa: 'Arabic - Qatar',
  ar_sa: 'Arabic - Saudi Arabia',
  ar_sy: 'Arabic - Syria',
  ar_tn: 'Arabic - Tunisia',
  ar_ae: 'Arabic - United Arab Emirates',
  ar_ye: 'Arabic - Yemen',
  hy: 'Armenian',
  as: 'Assamese',
  az_az: 'Azeri - Cyrillic',
  eu: 'Basque',
  be: 'Belarusian',
  bn: 'Bengali - Bangladesh',
  bs: 'Bosnian',
  bg: 'Bulgarian',
  my: 'Burmese',
  ca: 'Catalan',
  zh_cn: 'Chinese - China',
  zh_hk: 'Chinese - Hong Kong SAR',
  zh_mo: 'Chinese - Macau SAR',
  zh_sg: 'Chinese - Singapore',
  zh_tw: 'Chinese - Taiwan',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  Maldivian: 'Divehi',
  nl_be: 'Dutch - Belgium',
  nl_nl: 'Dutch - Netherlands',
  en_au: 'English - Australia',
  en_bz: 'English - Belize',
  en_ca: 'English - Canada',
  en_cb: 'English - Caribbean',
  en_gb: 'English - Great Britain',
  en_in: 'English - India',
  en_ie: 'English - Ireland',
  en_jm: 'English - Jamaica',
  en_nz: 'English - New Zealand',
  en_ph: 'English - Philippines',
  en_za: 'English - Southern Africa',
  en_tt: 'English - Trinidad',
  en_us: 'English - United States',
  et: 'Estonian',
  mk: 'FYRO Macedonia',
  fo: 'Faroese',
  fa: 'Farsi - Persian',
  fi: 'Finnish',
  fr_be: 'French - Belgium',
  fr_ca: 'French - Canada',
  fr_fr: 'French - France',
  fr_lu: 'French - Luxembourg',
  fr_ch: 'French - Switzerland',
  gd_ie: 'Gaelic - Ireland',
  gd: 'Gaelic - Scotland',
  de_at: 'German - Austria',
  de_de: 'German - Germany',
  de_li: 'German - Liechtenstein',
  de_lu: 'German - Luxembourg',
  de_ch: 'German - Switzerland',
  el: 'Greek',
  gn: 'Guarani - Paraguay',
  gu: 'Gujarati',
  he: 'Hebrew',
  hi: 'Hindi',
  hu: 'Hungarian',
  is: 'Icelandic',
  id: 'Indonesian',
  it_it: 'Italian - Italy',
  it_ch: 'Italian - Switzerland',
  ja: 'Japanese',
  kn: 'Kannada',
  ks: 'Kashmiri',
  kk: 'Kazakh',
  km: 'Khmer',
  ko: 'Korean',
  lo: 'Lao',
  la: 'Latin',
  lv: 'Latvian',
  lt: 'Lithuanian',
  ms_bn: 'Malay - Brunei',
  ms_my: 'Malay - Malaysia',
  ml: 'Malayalam',
  mt: 'Maltese',
  mi: 'Maori',
  mr: 'Marathi',
  mn: 'Mongolian',
  ne: 'Nepali',
  no_no: 'Norwegian - Bokml',
  or: 'Oriya',
  pl: 'Polish',
  pt_br: 'Portuguese - Brazil',
  pt_pt: 'Portuguese - Portugal',
  pa: 'Punjabi',
  rm: 'Raeto-Romance',
  ro_mo: 'Romanian - Moldova',
  ro: 'Romanian - Romania',
  ru: 'Russian',
  ru_mo: 'Russian - Moldova',
  sa: 'Sanskrit',
  sr_sp: 'Serbian - Cyrillic',
  tn: 'Setsuana',
  sd: 'Sindhi',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  sb: 'Sorbian',
  es_ar: 'Spanish - Argentina',
  es_bo: 'Spanish - Bolivia',
  es_cl: 'Spanish - Chile',
  es_co: 'Spanish - Colombia',
  es_cr: 'Spanish - Costa Rica',
  es_do: 'Spanish - Dominican Republic',
  es_ec: 'Spanish - Ecuador',
  es_sv: 'Spanish - El Salvador',
  es_gt: 'Spanish - Guatemala',
  es_hn: 'Spanish - Honduras',
  es_mx: 'Spanish - Mexico',
  es_ni: 'Spanish - Nicaragua',
  es_pa: 'Spanish - Panama',
  es_py: 'Spanish - Paraguay',
  es_pe: 'Spanish - Peru',
  es_pr: 'Spanish - Puerto Rico',
  es_es: 'Spanish - Spain (Traditional)',
  es_uy: 'Spanish - Uruguay',
  es_ve: 'Spanish - Venezuela',
  sw: 'Swahili',
  sv_fi: 'Swedish - Finland',
  sv_se: 'Swedish - Sweden',
  tg: 'Tajik',
  ta: 'Tamil',
  tt: 'Tatar',
  te: 'Telugu',
  th: 'Thai',
  bo: 'Tibetan',
  ts: 'Tsonga',
  tr: 'Turkish',
  tk: 'Turkmen',
  uk: 'Ukrainian',
  ur: 'Urdu',
  uz_uz: 'Uzbek - Cyrillic',
  vi: 'Vietnamese',
  cy: 'Welsh',
  xh: 'Xhosa',
  yi: 'Yiddish',
  zu: 'Zulu',
  aa: 'Afar',
  ab: 'Abkhazian',
  ae: 'Avestan',
  ak: 'Akan',
  an: 'Aragonese',
  ar: 'Arabic',
  av: 'Avaric',
  ay: 'Aymara',
  az: 'Azerbaijani',
  ba: 'Bashkir',
  bh: 'Bihari languages',
  bi: 'Bislama',
  bm: 'Bambara',
  br: 'Breton',
  ce: 'Chechen',
  ch: 'Chamorro',
  co: 'Corsican',
  cr: 'Cree',
  cu: 'Church Slavic; Slavonic; Old Bulgarian',
  cv: 'Chuvash',
  de: 'German',
  dv: 'Divehi; Dhivehi; Maldivian',
  dz: 'Dzongkha',
  ee: 'Ewe',
  en: 'English',
  eo: 'Esperanto',
  es: 'Spanish; Castilian',
  ff: 'Fulah',
  fj: 'Fijian',
  fr: 'French',
  fy: 'Western Frisian',
  ga: 'Irish',
  gl: 'Galician',
  gv: 'Manx',
  ha: 'Hausa',
  ho: 'Hiri Motu',
  ht: 'Haitian; Haitian Creole',
  hz: 'Herero',
  ia: 'Interlingua',
  ie: 'Interlingue; Occidental',
  ig: 'Igbo',
  ii: 'Sichuan Yi; Nuosu',
  ik: 'Inupiaq',
  io: 'Ido',
  it: 'Italian',
  iu: 'Inuktitut',
  jv: 'Javanese',
  ka: 'Georgian',
  kg: 'Kongo',
  ki: 'Kikuyu; Gikuyu',
  kj: 'Kuanyama; Kwanyama',
  kl: 'Kalaallisut; Greenlandic',
  kr: 'Kanuri',
  ku: 'Kurdish',
  kv: 'Komi',
  kw: 'Cornish',
  ky: 'Kirghiz; Kyrgyz',
  lb: 'Luxembourgish; Letzeburgesch',
  lg: 'Ganda',
  li: 'Limburgan; Limburger; Limburgish',
  ln: 'Lingala',
  lu: 'Luba-Katanga',
  mg: 'Malagasy',
  mh: 'Marshallese',
  ms: 'Malay',
  na: 'Nauru',
  nb: 'Bokmål, Norwegian; Norwegian Bokmål',
  nd: 'Ndebele, North; North Ndebele',
  ng: 'Ndonga',
  nl: 'Dutch; Flemish',
  nn: 'Norwegian Nynorsk; Nynorsk, Norwegian',
  no: 'Norwegian',
  nr: 'Ndebele, South; South Ndebele',
  nv: 'Navajo; Navaho',
  ny: 'Chichewa; Chewa; Nyanja',
  oc: 'Occitan (post 1500)',
  oj: 'Ojibwa',
  om: 'Oromo',
  os: 'Ossetian; Ossetic',
  pi: 'Pali',
  ps: 'Pushto; Pashto',
  pt: 'Portuguese',
  qu: 'Quechua',
  rn: 'Rundi',
  rw: 'Kinyarwanda',
  sc: 'Sardinian',
  se: 'Northern Sami',
  sg: 'Sango',
  sm: 'Samoan',
  sn: 'Shona',
  sr: 'Serbian',
  ss: 'Swati',
  st: 'Sotho, Southern',
  su: 'Sundanese',
  sv: 'Swedish',
  ti: 'Tigrinya',
  tl: 'Tagalog',
  to: 'Tonga (Tonga Islands)',
  tw: 'Twi',
  ty: 'Tahitian',
  ug: 'Uighur; Uyghur',
  uz: 'Uzbek',
  ve: 'Venda',
  vo: 'Volapük',
  wa: 'Walloon',
  wo: 'Wolof',
  yo: 'Yoruba',
  za: 'Zhuang; Chuang',
  zh: 'Chinese'
};

export const itemSuccessMessages = defineMessages({
  itemDeleted: {
    id: 'item.delete',
    defaultMessage:
      '{count, plural, one {The selected item is being deleted and will be removed soon} other {The selected items are being deleted and will be removed soon}}'
  },
  itemPublishedNow: {
    id: 'item.publishedNow',
    defaultMessage:
      '{count, plural, one {The selected item has been published to {environment}. It will be visible soon} other {The selected items have been published to {environment}. They will be visible soon}}'
  },
  itemRequestedToPublishNow: {
    id: 'item.requestedToPublishNow',
    defaultMessage:
      '{count, plural, one {The selected item has been requested to be published to {environment}} other {The selected items have been requested to be published to {environment}}}'
  },
  itemRequestedToSchedulePublish: {
    id: 'item.requestedToSchedulePublish',
    defaultMessage:
      '{count, plural, one {The selected item has been scheduled to go {environment}} other {The selected items have been scheduled to go {environment}}}'
  },
  itemSchedulePublished: {
    id: 'item.schedulePublished',
    defaultMessage:
      '{count, plural, one {The selected item has been scheduled to go {environment}} other {The selected items have been scheduled to go {environment}}}'
  },
  itemCreated: {
    id: 'item.created',
    defaultMessage: 'Item created successfully'
  },
  itemEdited: {
    id: 'item.edited',
    defaultMessage: 'Item updated successfully'
  },
  itemCopied: {
    id: 'item.copied',
    defaultMessage: '{count, plural, one {Item copied to clipboard} other {Items copied to clipboard}}'
  },
  itemPasted: {
    id: 'item.pasted',
    defaultMessage: 'Item pasted successfully'
  },
  itemUnlocked: {
    id: 'item.unlocked',
    defaultMessage: 'Item unlocked successfully'
  },
  itemDuplicated: {
    id: 'item.duplicated',
    defaultMessage: 'Item duplicated successfully'
  },
  itemCut: {
    id: 'item.cut',
    defaultMessage: 'Item cut successfully'
  },
  itemRejected: {
    id: 'item.rejected',
    defaultMessage: '{count, plural, one {Item rejected successfully} other {Items rejected successfully}}'
  },
  itemReverted: {
    id: 'item.reverted',
    defaultMessage: 'Item reverted successfully'
  },
  itemContentTypeChanged: {
    id: 'item.contentTypeChanged',
    defaultMessage: 'Item type changed successfully'
  },
  itemSavedAsDraft: {
    id: 'item.savedAsDraft',
    defaultMessage: 'Draft saved. Required fields left blank may cause errors when previewed or deployed.'
  },
  folderCreated: {
    id: 'folder.created',
    defaultMessage: 'Folder created successfully'
  }
});

export const siteSuccessMessages = defineMessages({
  siteDeleted: {
    id: 'site.deleted',
    defaultMessage: 'Project deleted successfully'
  }
});
