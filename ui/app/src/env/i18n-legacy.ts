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
  removeItemFromNodeSelector: {
    defaultMessage: 'Remove from control'
  },
  keepItemInNodeSelector: {
    defaultMessage: 'Keep in control'
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

export const languages = defineMessages({
  af: { id: 'languages.af', defaultMessage: 'Afrikaans' },
  sq: { id: 'languages.sq', defaultMessage: 'Albanian' },
  am: { id: 'languages.am', defaultMessage: 'Amharic' },
  ar_dz: { id: 'languages.ar_dz', defaultMessage: 'Arabic - Algeria' },
  ar_bh: { id: 'languages.ar_bh', defaultMessage: 'Arabic - Bahrain' },
  ar_eg: { id: 'languages.ar_eg', defaultMessage: 'Arabic - Egypt' },
  ar_iq: { id: 'languages.ar_iq', defaultMessage: 'Arabic - Iraq' },
  ar_jo: { id: 'languages.ar_jo', defaultMessage: 'Arabic - Jordan' },
  ar_kw: { id: 'languages.ar_kw', defaultMessage: 'Arabic - Kuwait' },
  ar_lb: { id: 'languages.ar_lb', defaultMessage: 'Arabic - Lebanon' },
  ar_ly: { id: 'languages.ar_ly', defaultMessage: 'Arabic - Libya' },
  ar_ma: { id: 'languages.ar_ma', defaultMessage: 'Arabic - Morocco' },
  ar_om: { id: 'languages.ar_om', defaultMessage: 'Arabic - Oman' },
  ar_qa: { id: 'languages.ar_qa', defaultMessage: 'Arabic - Qatar' },
  ar_sa: { id: 'languages.ar_sa', defaultMessage: 'Arabic - Saudi Arabia' },
  ar_sy: { id: 'languages.ar_sy', defaultMessage: 'Arabic - Syria' },
  ar_tn: { id: 'languages.ar_tn', defaultMessage: 'Arabic - Tunisia' },
  ar_ae: { id: 'languages.ar_ae', defaultMessage: 'Arabic - United Arab Emirates' },
  ar_ye: { id: 'languages.ar_ye', defaultMessage: 'Arabic - Yemen' },
  hy: { id: 'languages.hy', defaultMessage: 'Armenian' },
  as: { id: 'languages.as', defaultMessage: 'Assamese' },
  az_az: { id: 'languages.az_az', defaultMessage: 'Azeri - Cyrillic' },
  eu: { id: 'languages.eu', defaultMessage: 'Basque' },
  be: { id: 'languages.be', defaultMessage: 'Belarusian' },
  bn: { id: 'languages.bn', defaultMessage: 'Bengali - Bangladesh' },
  bs: { id: 'languages.bs', defaultMessage: 'Bosnian' },
  bg: { id: 'languages.bg', defaultMessage: 'Bulgarian' },
  my: { id: 'languages.my', defaultMessage: 'Burmese' },
  ca: { id: 'languages.ca', defaultMessage: 'Catalan' },
  zh_cn: { id: 'languages.zh_cn', defaultMessage: 'Chinese - China' },
  zh_hk: { id: 'languages.zh_hk', defaultMessage: 'Chinese - Hong Kong SAR' },
  zh_mo: { id: 'languages.zh_mo', defaultMessage: 'Chinese - Macau SAR' },
  zh_sg: { id: 'languages.zh_sg', defaultMessage: 'Chinese - Singapore' },
  zh_tw: { id: 'languages.zh_tw', defaultMessage: 'Chinese - Taiwan' },
  hr: { id: 'languages.hr', defaultMessage: 'Croatian' },
  cs: { id: 'languages.cs', defaultMessage: 'Czech' },
  da: { id: 'languages.da', defaultMessage: 'Danish' },
  Maldivian: { id: 'languages.Maldivian', defaultMessage: 'Divehi' },
  nl_be: { id: 'languages.nl_be', defaultMessage: 'Dutch - Belgium' },
  nl_nl: { id: 'languages.nl_nl', defaultMessage: 'Dutch - Netherlands' },
  en_au: { id: 'languages.en_au', defaultMessage: 'English - Australia' },
  en_bz: { id: 'languages.en_bz', defaultMessage: 'English - Belize' },
  en_ca: { id: 'languages.en_ca', defaultMessage: 'English - Canada' },
  en_cb: { id: 'languages.en_cb', defaultMessage: 'English - Caribbean' },
  en_gb: { id: 'languages.en_gb', defaultMessage: 'English - Great Britain' },
  en_in: { id: 'languages.en_in', defaultMessage: 'English - India' },
  en_ie: { id: 'languages.en_ie', defaultMessage: 'English - Ireland' },
  en_jm: { id: 'languages.en_jm', defaultMessage: 'English - Jamaica' },
  en_nz: { id: 'languages.en_nz', defaultMessage: 'English - New Zealand' },
  en_ph: { id: 'languages.en_ph', defaultMessage: 'English - Philippines' },
  en_za: { id: 'languages.en_za', defaultMessage: 'English - Southern Africa' },
  en_tt: { id: 'languages.en_tt', defaultMessage: 'English - Trinidad' },
  en_us: { id: 'languages.en_us', defaultMessage: 'English - United States' },
  et: { id: 'languages.et', defaultMessage: 'Estonian' },
  mk: { id: 'languages.mk', defaultMessage: 'FYRO Macedonia' },
  fo: { id: 'languages.fo', defaultMessage: 'Faroese' },
  fa: { id: 'languages.fa', defaultMessage: 'Farsi - Persian' },
  fi: { id: 'languages.fi', defaultMessage: 'Finnish' },
  fr_be: { id: 'languages.fr_be', defaultMessage: 'French - Belgium' },
  fr_ca: { id: 'languages.fr_ca', defaultMessage: 'French - Canada' },
  fr_fr: { id: 'languages.fr_fr', defaultMessage: 'French - France' },
  fr_lu: { id: 'languages.fr_lu', defaultMessage: 'French - Luxembourg' },
  fr_ch: { id: 'languages.fr_ch', defaultMessage: 'French - Switzerland' },
  gd_ie: { id: 'languages.gd_ie', defaultMessage: 'Gaelic - Ireland' },
  gd: { id: 'languages.gd', defaultMessage: 'Gaelic - Scotland' },
  de_at: { id: 'languages.de_at', defaultMessage: 'German - Austria' },
  de_de: { id: 'languages.de_de', defaultMessage: 'German - Germany' },
  de_li: { id: 'languages.de_li', defaultMessage: 'German - Liechtenstein' },
  de_lu: { id: 'languages.de_lu', defaultMessage: 'German - Luxembourg' },
  de_ch: { id: 'languages.de_ch', defaultMessage: 'German - Switzerland' },
  el: { id: 'languages.el', defaultMessage: 'Greek' },
  gn: { id: 'languages.gn', defaultMessage: 'Guarani - Paraguay' },
  gu: { id: 'languages.gu', defaultMessage: 'Gujarati' },
  he: { id: 'languages.he', defaultMessage: 'Hebrew' },
  hi: { id: 'languages.hi', defaultMessage: 'Hindi' },
  hu: { id: 'languages.hu', defaultMessage: 'Hungarian' },
  is: { id: 'languages.is', defaultMessage: 'Icelandic' },
  id: { id: 'languages.id', defaultMessage: 'Indonesian' },
  it_it: { id: 'languages.it_it', defaultMessage: 'Italian - Italy' },
  it_ch: { id: 'languages.it_ch', defaultMessage: 'Italian - Switzerland' },
  ja: { id: 'languages.ja', defaultMessage: 'Japanese' },
  kn: { id: 'languages.kn', defaultMessage: 'Kannada' },
  ks: { id: 'languages.ks', defaultMessage: 'Kashmiri' },
  kk: { id: 'languages.kk', defaultMessage: 'Kazakh' },
  km: { id: 'languages.km', defaultMessage: 'Khmer' },
  ko: { id: 'languages.ko', defaultMessage: 'Korean' },
  lo: { id: 'languages.lo', defaultMessage: 'Lao' },
  la: { id: 'languages.la', defaultMessage: 'Latin' },
  lv: { id: 'languages.lv', defaultMessage: 'Latvian' },
  lt: { id: 'languages.lt', defaultMessage: 'Lithuanian' },
  ms_bn: { id: 'languages.ms_bn', defaultMessage: 'Malay - Brunei' },
  ms_my: { id: 'languages.ms_my', defaultMessage: 'Malay - Malaysia' },
  ml: { id: 'languages.ml', defaultMessage: 'Malayalam' },
  mt: { id: 'languages.mt', defaultMessage: 'Maltese' },
  mi: { id: 'languages.mi', defaultMessage: 'Maori' },
  mr: { id: 'languages.mr', defaultMessage: 'Marathi' },
  mn: { id: 'languages.mn', defaultMessage: 'Mongolian' },
  ne: { id: 'languages.ne', defaultMessage: 'Nepali' },
  no_no: { id: 'languages.no_no', defaultMessage: 'Norwegian - Bokml' },
  or: { id: 'languages.or', defaultMessage: 'Oriya' },
  pl: { id: 'languages.pl', defaultMessage: 'Polish' },
  pt_br: { id: 'languages.pt_br', defaultMessage: 'Portuguese - Brazil' },
  pt_pt: { id: 'languages.pt_pt', defaultMessage: 'Portuguese - Portugal' },
  pa: { id: 'languages.pa', defaultMessage: 'Punjabi' },
  rm: { id: 'languages.rm', defaultMessage: 'Raeto-Romance' },
  ro_mo: { id: 'languages.ro_mo', defaultMessage: 'Romanian - Moldova' },
  ro: { id: 'languages.ro', defaultMessage: 'Romanian - Romania' },
  ru: { id: 'languages.ru', defaultMessage: 'Russian' },
  ru_mo: { id: 'languages.ru_mo', defaultMessage: 'Russian - Moldova' },
  sa: { id: 'languages.sa', defaultMessage: 'Sanskrit' },
  sr_sp: { id: 'languages.sr_sp', defaultMessage: 'Serbian - Cyrillic' },
  tn: { id: 'languages.tn', defaultMessage: 'Setsuana' },
  sd: { id: 'languages.sd', defaultMessage: 'Sindhi' },
  si: { id: 'languages.si', defaultMessage: 'Sinhala' },
  sk: { id: 'languages.sk', defaultMessage: 'Slovak' },
  sl: { id: 'languages.sl', defaultMessage: 'Slovenian' },
  so: { id: 'languages.so', defaultMessage: 'Somali' },
  sb: { id: 'languages.sb', defaultMessage: 'Sorbian' },
  es_ar: { id: 'languages.es_ar', defaultMessage: 'Spanish - Argentina' },
  es_bo: { id: 'languages.es_bo', defaultMessage: 'Spanish - Bolivia' },
  es_cl: { id: 'languages.es_cl', defaultMessage: 'Spanish - Chile' },
  es_co: { id: 'languages.es_co', defaultMessage: 'Spanish - Colombia' },
  es_cr: { id: 'languages.es_cr', defaultMessage: 'Spanish - Costa Rica' },
  es_do: { id: 'languages.es_do', defaultMessage: 'Spanish - Dominican Republic' },
  es_ec: { id: 'languages.es_ec', defaultMessage: 'Spanish - Ecuador' },
  es_sv: { id: 'languages.es_sv', defaultMessage: 'Spanish - El Salvador' },
  es_gt: { id: 'languages.es_gt', defaultMessage: 'Spanish - Guatemala' },
  es_hn: { id: 'languages.es_hn', defaultMessage: 'Spanish - Honduras' },
  es_mx: { id: 'languages.es_mx', defaultMessage: 'Spanish - Mexico' },
  es_ni: { id: 'languages.es_ni', defaultMessage: 'Spanish - Nicaragua' },
  es_pa: { id: 'languages.es_pa', defaultMessage: 'Spanish - Panama' },
  es_py: { id: 'languages.es_py', defaultMessage: 'Spanish - Paraguay' },
  es_pe: { id: 'languages.es_pe', defaultMessage: 'Spanish - Peru' },
  es_pr: { id: 'languages.es_pr', defaultMessage: 'Spanish - Puerto Rico' },
  es_es: { id: 'languages.es_es', defaultMessage: 'Spanish - Spain (Traditional)' },
  es_uy: { id: 'languages.es_uy', defaultMessage: 'Spanish - Uruguay' },
  es_ve: { id: 'languages.es_ve', defaultMessage: 'Spanish - Venezuela' },
  sw: { id: 'languages.sw', defaultMessage: 'Swahili' },
  sv_fi: { id: 'languages.sv_fi', defaultMessage: 'Swedish - Finland' },
  sv_se: { id: 'languages.sv_se', defaultMessage: 'Swedish - Sweden' },
  tg: { id: 'languages.tg', defaultMessage: 'Tajik' },
  ta: { id: 'languages.ta', defaultMessage: 'Tamil' },
  tt: { id: 'languages.tt', defaultMessage: 'Tatar' },
  te: { id: 'languages.te', defaultMessage: 'Telugu' },
  th: { id: 'languages.th', defaultMessage: 'Thai' },
  bo: { id: 'languages.bo', defaultMessage: 'Tibetan' },
  ts: { id: 'languages.ts', defaultMessage: 'Tsonga' },
  tr: { id: 'languages.tr', defaultMessage: 'Turkish' },
  tk: { id: 'languages.tk', defaultMessage: 'Turkmen' },
  uk: { id: 'languages.uk', defaultMessage: 'Ukrainian' },
  ur: { id: 'languages.ur', defaultMessage: 'Urdu' },
  uz_uz: { id: 'languages.uz_uz', defaultMessage: 'Uzbek - Cyrillic' },
  vi: { id: 'languages.vi', defaultMessage: 'Vietnamese' },
  cy: { id: 'languages.cy', defaultMessage: 'Welsh' },
  xh: { id: 'languages.xh', defaultMessage: 'Xhosa' },
  yi: { id: 'languages.yi', defaultMessage: 'Yiddish' },
  zu: { id: 'languages.zu', defaultMessage: 'Zulu' },
  aa: { id: 'languages.aa', defaultMessage: 'Afar' },
  ab: { id: 'languages.ab', defaultMessage: 'Abkhazian' },
  ae: { id: 'languages.ae', defaultMessage: 'Avestan' },
  ak: { id: 'languages.ak', defaultMessage: 'Akan' },
  an: { id: 'languages.an', defaultMessage: 'Aragonese' },
  ar: { id: 'languages.ar', defaultMessage: 'Arabic' },
  av: { id: 'languages.av', defaultMessage: 'Avaric' },
  ay: { id: 'languages.ay', defaultMessage: 'Aymara' },
  az: { id: 'languages.az', defaultMessage: 'Azerbaijani' },
  ba: { id: 'languages.ba', defaultMessage: 'Bashkir' },
  bh: { id: 'languages.bh', defaultMessage: 'Bihari languages' },
  bi: { id: 'languages.bi', defaultMessage: 'Bislama' },
  bm: { id: 'languages.bm', defaultMessage: 'Bambara' },
  br: { id: 'languages.br', defaultMessage: 'Breton' },
  ce: { id: 'languages.ce', defaultMessage: 'Chechen' },
  ch: { id: 'languages.ch', defaultMessage: 'Chamorro' },
  co: { id: 'languages.co', defaultMessage: 'Corsican' },
  cr: { id: 'languages.cr', defaultMessage: 'Cree' },
  cu: { id: 'languages.cu', defaultMessage: 'Church Slavic; Slavonic; Old Bulgarian' },
  cv: { id: 'languages.cv', defaultMessage: 'Chuvash' },
  de: { id: 'languages.de', defaultMessage: 'German' },
  dv: { id: 'languages.dv', defaultMessage: 'Divehi; Dhivehi; Maldivian' },
  dz: { id: 'languages.dz', defaultMessage: 'Dzongkha' },
  ee: { id: 'languages.ee', defaultMessage: 'Ewe' },
  en: { id: 'languages.en', defaultMessage: 'English' },
  eo: { id: 'languages.eo', defaultMessage: 'Esperanto' },
  es: { id: 'languages.es', defaultMessage: 'Spanish; Castilian' },
  ff: { id: 'languages.ff', defaultMessage: 'Fulah' },
  fj: { id: 'languages.fj', defaultMessage: 'Fijian' },
  fr: { id: 'languages.fr', defaultMessage: 'French' },
  fy: { id: 'languages.fy', defaultMessage: 'Western Frisian' },
  ga: { id: 'languages.ga', defaultMessage: 'Irish' },
  gl: { id: 'languages.gl', defaultMessage: 'Galician' },
  gv: { id: 'languages.gv', defaultMessage: 'Manx' },
  ha: { id: 'languages.ha', defaultMessage: 'Hausa' },
  ho: { id: 'languages.ho', defaultMessage: 'Hiri Motu' },
  ht: { id: 'languages.ht', defaultMessage: 'Haitian; Haitian Creole' },
  hz: { id: 'languages.hz', defaultMessage: 'Herero' },
  ia: { id: 'languages.ia', defaultMessage: 'Interlingua' },
  ie: { id: 'languages.ie', defaultMessage: 'Interlingue; Occidental' },
  ig: { id: 'languages.ig', defaultMessage: 'Igbo' },
  ii: { id: 'languages.ii', defaultMessage: 'Sichuan Yi; Nuosu' },
  ik: { id: 'languages.ik', defaultMessage: 'Inupiaq' },
  io: { id: 'languages.io', defaultMessage: 'Ido' },
  it: { id: 'languages.it', defaultMessage: 'Italian' },
  iu: { id: 'languages.iu', defaultMessage: 'Inuktitut' },
  jv: { id: 'languages.jv', defaultMessage: 'Javanese' },
  ka: { id: 'languages.ka', defaultMessage: 'Georgian' },
  kg: { id: 'languages.kg', defaultMessage: 'Kongo' },
  ki: { id: 'languages.ki', defaultMessage: 'Kikuyu; Gikuyu' },
  kj: { id: 'languages.kj', defaultMessage: 'Kuanyama; Kwanyama' },
  kl: { id: 'languages.kl', defaultMessage: 'Kalaallisut; Greenlandic' },
  kr: { id: 'languages.kr', defaultMessage: 'Kanuri' },
  ku: { id: 'languages.ku', defaultMessage: 'Kurdish' },
  kv: { id: 'languages.kv', defaultMessage: 'Komi' },
  kw: { id: 'languages.kw', defaultMessage: 'Cornish' },
  ky: { id: 'languages.ky', defaultMessage: 'Kirghiz; Kyrgyz' },
  lb: { id: 'languages.lb', defaultMessage: 'Luxembourgish; Letzeburgesch' },
  lg: { id: 'languages.lg', defaultMessage: 'Ganda' },
  li: { id: 'languages.li', defaultMessage: 'Limburgan; Limburger; Limburgish' },
  ln: { id: 'languages.ln', defaultMessage: 'Lingala' },
  lu: { id: 'languages.lu', defaultMessage: 'Luba-Katanga' },
  mg: { id: 'languages.mg', defaultMessage: 'Malagasy' },
  mh: { id: 'languages.mh', defaultMessage: 'Marshallese' },
  ms: { id: 'languages.ms', defaultMessage: 'Malay' },
  na: { id: 'languages.na', defaultMessage: 'Nauru' },
  nb: { id: 'languages.nb', defaultMessage: 'Bokmål, Norwegian; Norwegian Bokmål' },
  nd: { id: 'languages.nd', defaultMessage: 'Ndebele, North; North Ndebele' },
  ng: { id: 'languages.ng', defaultMessage: 'Ndonga' },
  nl: { id: 'languages.nl', defaultMessage: 'Dutch; Flemish' },
  nn: { id: 'languages.nn', defaultMessage: 'Norwegian Nynorsk; Nynorsk, Norwegian' },
  no: { id: 'languages.no', defaultMessage: 'Norwegian' },
  nr: { id: 'languages.nr', defaultMessage: 'Ndebele, South; South Ndebele' },
  nv: { id: 'languages.nv', defaultMessage: 'Navajo; Navaho' },
  ny: { id: 'languages.ny', defaultMessage: 'Chichewa; Chewa; Nyanja' },
  oc: { id: 'languages.oc', defaultMessage: 'Occitan (post 1500)' },
  oj: { id: 'languages.oj', defaultMessage: 'Ojibwa' },
  om: { id: 'languages.om', defaultMessage: 'Oromo' },
  os: { id: 'languages.os', defaultMessage: 'Ossetian; Ossetic' },
  pi: { id: 'languages.pi', defaultMessage: 'Pali' },
  ps: { id: 'languages.ps', defaultMessage: 'Pushto; Pashto' },
  pt: { id: 'languages.pt', defaultMessage: 'Portuguese' },
  qu: { id: 'languages.qu', defaultMessage: 'Quechua' },
  rn: { id: 'languages.rn', defaultMessage: 'Rundi' },
  rw: { id: 'languages.rw', defaultMessage: 'Kinyarwanda' },
  sc: { id: 'languages.sc', defaultMessage: 'Sardinian' },
  se: { id: 'languages.se', defaultMessage: 'Northern Sami' },
  sg: { id: 'languages.sg', defaultMessage: 'Sango' },
  sm: { id: 'languages.sm', defaultMessage: 'Samoan' },
  sn: { id: 'languages.sn', defaultMessage: 'Shona' },
  sr: { id: 'languages.sr', defaultMessage: 'Serbian' },
  ss: { id: 'languages.ss', defaultMessage: 'Swati' },
  st: { id: 'languages.st', defaultMessage: 'Sotho, Southern' },
  su: { id: 'languages.su', defaultMessage: 'Sundanese' },
  sv: { id: 'languages.sv', defaultMessage: 'Swedish' },
  ti: { id: 'languages.ti', defaultMessage: 'Tigrinya' },
  tl: { id: 'languages.tl', defaultMessage: 'Tagalog' },
  to: { id: 'languages.to', defaultMessage: 'Tonga (Tonga Islands)' },
  tw: { id: 'languages.tw', defaultMessage: 'Twi' },
  ty: { id: 'languages.ty', defaultMessage: 'Tahitian' },
  ug: { id: 'languages.ug', defaultMessage: 'Uighur; Uyghur' },
  uz: { id: 'languages.uz', defaultMessage: 'Uzbek' },
  ve: { id: 'languages.ve', defaultMessage: 'Venda' },
  vo: { id: 'languages.vo', defaultMessage: 'Volapük' },
  wa: { id: 'languages.wa', defaultMessage: 'Walloon' },
  wo: { id: 'languages.wo', defaultMessage: 'Wolof' },
  yo: { id: 'languages.yo', defaultMessage: 'Yoruba' },
  za: { id: 'languages.za', defaultMessage: 'Zhuang; Chuang' },
  zh: { id: 'languages.zh', defaultMessage: 'Chinese' }
});

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
