/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import { intl } from '../components/CrafterCMSNextBridge';

export function translateElements(
  elements: Element[],
  messages: { [key: string]: MessageDescriptor },
  formats: any = {}
) {
  messages = Object.entries(messages)
    .reduce(
      (table: any, [key, descriptor]) => {
        table[descriptor.id] = descriptor;
        return table;
      },
      {}
    );
  elements.forEach((elem) => {
    const key = elem.getAttribute('data-i18n');
    if (key) {
      const message = intl.formatMessage(messages[key], formats);
      elem.innerHTML = (
        Array.isArray(message) ? message.join('') : message
      );
    }
  })
}

const approveDialogMessages = defineMessages({
  approveForPublish: {
    id: 'publishDialog.approveForPublish',
    defaultMessage: 'Approve for Publish'
  },
  differentPublishDateWarning: {
    id: 'publishDialog.differentPublishDateWarning',
    defaultMessage: '<strong>Warning</strong> The items you have selected for approval were submitted with different requested publish dates/times.'
  },
  publishingScheduleTitle: {
    id: 'publishDialog.publishingScheduleTitle',
    defaultMessage: 'Selected Item Scheduling'
  },
  introductoryText: {
    id: 'publishDialog.introductoryText',
    defaultMessage: 'Selected files will be published. Hard dependencies are automatically included. Soft dependencies are optional and you may choose which to include.'
  },
  submissionCommentFieldError: {
    id: 'publishDialog.submissionCommentFieldError',
    defaultMessage: 'Please write submission comment.'
  }
});

const deleteDialogMessages = defineMessages({
  submissionCommentFieldError: {
    id: 'deleteDialog.submissionCommentFieldError',
    defaultMessage: 'Please write submission comment.'
  }
});

const usersAdminMessages = defineMessages({
  maxLengthError: {
    id: 'usersAdmin.maxLengthError',
    defaultMessage: '{field} can\'t be longer than {size} characters'
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
  }

});

const passwordRequirementMessages = defineMessages({
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
  fulfillAllReqErrorMessage: {
    id: 'passwordRequirement.fulfillAllReqErrorMessage',
    defaultMessage: 'Please fulfill all password requirements.'
  }
});

const groupsAdminMessages = defineMessages({
  maxLengthError: {
    id: 'groupsAdmin.maxLengthError',
    defaultMessage: '{field} can\'t be longer than {size} characters'
  },
  displayName: {
    id: 'groupsAdmin.displayName',
    defaultMessage: 'Display Name'
  }
});

const profileSettingsMessages = defineMessages({
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

const numericInputControlMessages = defineMessages({
  minimun: {
    id: 'numericInputControl.childContent',
    defaultMessage: 'Minimum'
  },
  maximun: {
    id: 'numericInputControl.maximun',
    defaultMessage: 'Maximum'
  }
});

const reposAdminMessages = defineMessages({
  pendingCommit: {
    id: 'reposAdmin.pendingCommit',
    defaultMessage: 'Repo contains files pending commit. See Repository status below for details.'
  },
  unstagedFiles: {
    id: 'reposAdmin.unstagedFilesMessage',
    defaultMessage: 'There are unstaged files in your repository.'
  },
});

const sharedContentDSMessages = defineMessages({
  sharedContent: {
    id: 'sharedContentDS.sharedContent',
    defaultMessage: 'Shared Content'
  },
});

const embeddedContentDSMessages = defineMessages({
  embeddedContent: {
    id: 'embeddedContentDS.embeddedContent',
    defaultMessage: 'Embedded Content'
  },
});

const childContentDSMessages = defineMessages({
  childContent: {
    id: 'childContentDS.childContent',
    defaultMessage: 'Child Content (Deprecated)'
  },
});

const contentTypesMessages = defineMessages({
  notice: {
    id: 'contentType.notice',
    defaultMessage: 'Notice'
  },
  contenTypeWarningMessage: {
    id: 'contentType.contenTypeWarningMessage',
    defaultMessage: 'Please note Child Content datasource is being phased out of Crafter CMS. For components that need to be shared across pages or components, please use Shared Content instead. For components that belong exclusively to this content object, please use Embedded Content.'
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
    defaultMessage: 'Content types require a file name. Please add either a "File Name" or "Auto Filename" control to this content type definition.'
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
    defaultMessage: 'There is no template associated with this content type. Click Save to proceed with save operation or Continue to update the content type (under Basic Content Type Properties) with a template.'
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
  }
});

const targetingDialog = defineMessages({
  setNow: {
    id: 'targetingDialog.setNow',
    defaultMessage: 'Set Now'
  },
  defaults: {
    id: 'words.defaults',
    defaultMessage: 'Defaults'
  }
});

const words = defineMessages({
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
  }
});

const siteComponentDSMessages = defineMessages({
  label: {
    id: 'siteComponentDS.label',
    defaultMessage: 'Taxonomy Selector'
  },
  unableLoad: {
    id: 'siteComponentDS.unableLoad',
    defaultMessage: 'The system was unable to load {file}.'
  },
  required: {
    id: 'siteComponentDS.required',
    defaultMessage: 'Required'
  },
  componentPath: {
    id: 'siteComponentDS.componentPath',
    defaultMessage: 'Component Path'
  },
  dataType: {
    id: 'siteComponentDS.dataType',
    defaultMessage: 'Data Type'
  },
  string: {
    id: 'siteComponentDS.string',
    defaultMessage: 'String'
  },
  integer: {
    id: 'siteComponentDS.integer',
    defaultMessage: 'Integer'
  },
  float: {
    id: 'siteComponentDS.float',
    defaultMessage: 'Float'
  },
  date: {
    id: 'siteComponentDS.date',
    defaultMessage: 'Date'
  },
  html: {
    id: 'siteComponentDS.html',
    defaultMessage: 'Data Type'
  },
  siteComponent: {
    id: 'siteComponentDS.siteComponent',
    defaultMessage: 'Site Component'
  }
});

const codeEditorMessages = defineMessages( {
  confirm: {
    id: 'codeEditor.confirm',
    defaultMessage: 'Confirm Close'
  },
  stay: {
    id: 'codeEditor.stay',
    defaultMessage: 'No, stay'
  }
});

const globalConfigMessages = defineMessages( {
  title: {
    id: 'globalConfig.title',
    defaultMessage: 'Global Config'
  },
  viewSample: {
    id: 'globalConfig.viewSample',
    defaultMessage: 'View Sample'
  },
  sampleFile: {
    id: 'globalConfig.sampleFile',
    defaultMessage: 'Sample File'
  },
  useSampleContent: {
    id: 'globalConfig.useSampleContent',
    defaultMessage: 'Use Sample Content'
  },
  replaceContent: {
    id: 'globalConfig.replaceContent',
    defaultMessage: 'Replace current value on background editor?'
  },
  appendContent: {
    id: 'globalConfig.appendContent',
    defaultMessage: 'Append sample on to background editor?'
  },
  confirmSave: {
    id: 'globalConfig.confirmSave',
    defaultMessage: 'Confirm Save?'
  },
  confirmReset: {
    id: 'globalConfig.confirmReset',
    defaultMessage: 'Confirm Reset?'
  },
  successfulSave: {
    id: 'globalConfig.successfulSave',
    defaultMessage: 'Configuration saved successfully.'
  },
  failedSave: {
    id: 'globalConfig.failedSave',
    defaultMessage: 'Save failed. Please retry momentarily.'
  },
  unSavedConfirmation: {
    id: 'globalConfig.unsavedConfirmation',
    defaultMessage: 'You have unsaved changes, do you want to leave?'
  },
  unSavedConfirmationTitle: {
    id: 'globalConfig.unsavedConfirmationTitle',
    defaultMessage: 'Unsaved changes'
  }
});

const publishingMessages = defineMessages({
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
  }
});

const browseCMISMessages = defineMessages({
  cmis: {
    id: 'browseCMIS.cmis',
    defaultMessage: 'CMIS'
  },
  cloningCMIS: {
    id: 'browseCMIS.cloningCMIS',
    defaultMessage: 'Cloning CMIS Asset'
  }
});

const formEngineMessages = defineMessages({
  saveDraftCompleted: {
    id: 'formEngine.saveDraftCompleted',
    defaultMessage: 'Draft Save Completed'
  },
});

const dragAndDropMessages = defineMessages({
  componentNotWelcomeWithinDropZone: {
    id: 'dragAndDropMessages.componentNotWelcomeWithinDropZone',
    defaultMessage: 'The drop zone does not support this type of component. Check your content model.'
  },
  embeddedComponentsDndNotSupported: {
    id: 'dragAndDropMessages.embeddedComponentsDndNotSupported',
    defaultMessage: 'Drag and drop on embedded components it\'s not supported yet. Please use the forms to edit content.'
  },
  embeddedComponentsDragWithinParentOnly: {
    id: 'dragAndDropMessages.embeddedComponentsDragWithinParentOnly',
    defaultMessage: 'On this release, embedded components may only be dragged within their current parent. Please use the forms to edit content.'
  },
  moveOutEmbeddedComponentsNotSupported: {
    id: 'dragAndDropMessages.moveOutEmbeddedComponentsNotSupported',
    defaultMessage: 'Moving components out of an embedded drop zone component is not supported yet. Please use the forms to edit content.'
  },
  embeddedComponentsDeleteChildNotSupported: {
    id:'dragAndDropMessages.embeddedComponentsDeleteChildNotSupported',
    defaultMessage: 'Deleting components from an embedded drop zone component is not supported yet. Please use the forms to edit content.'
  },
  contentTypeNotFound: {
    id: 'dragAndDropMessages.contentTypeNotFound',
    defaultMessage: 'The content type id was not found in your template. Drag and drop will be impaired. More info at docs.craftercms.org/en/3.1/system-administrators/upgrade/index.html.'
  },
  pathNotFound: {
    id: 'dragAndDropMessages.pathNotFound',
    defaultMessage: 'Path is missing. Drag and drop will be impaired. More info at docs.craftercms.org/en/3.1/system-administrators/upgrade/index.html.'
  },
  objectIdNotFound: {
    id:'dragAndDropMessages.objectIdNotFound',
    defaultMessage: 'Object id is missing. Drag and drop will be impaired. More info at docs.craftercms.org/en/3.1/system-administrators/upgrade/index.html.'
  }
});

const internalNameControlMessages = defineMessages({
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

const checkboxGroupControlMessages = defineMessages({
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

const globalMenuMessages = defineMessages({
  'home.globalMenu.sites': {
    id: 'GlobalMenu.SitesEntryLabel',
    defaultMessage: 'Sites'
  },
  'home.globalMenu.users': {
    id: 'GlobalMenu.UsersEntryLabel',
    defaultMessage: 'Users'
  },
  'home.globalMenu.groups': {
    id: 'GlobalMenu.GroupsEntryLabel',
    defaultMessage: 'Groups'
  },
  'home.globalMenu.cluster': {
    id: 'GlobalMenu.ClusterEntryLabel',
    defaultMessage: 'Cluster'
  },
  'home.globalMenu.audit': {
    id: 'GlobalMenu.AuditEntryLabel',
    defaultMessage: 'Audit'
  },
  'home.globalMenu.logging-levels': {
    id: 'GlobalMenu.LoggingLevelsEntryLabel',
    defaultMessage: 'Logging Levels'
  },
  'home.globalMenu.log-console': {
    id: 'GlobalMenu.LogConsoleEntryLabel',
    defaultMessage: 'Log Console'
  },
  'home.globalMenu.globalConfig': {
    id: 'GlobalMenu.GlobalConfigEntryLabel',
    defaultMessage: 'Global Config'
  },
  'home.about-us': {
    id: 'GlobalMenu.AboutUs',
    defaultMessage: 'About'
  },
  'home.settings': {
    id: 'GlobalMenu.Settings',
    defaultMessage: 'Account Management'
  },
  'login': {
    id: 'GlobalMenu.Login',
    defaultMessage: 'Login'
  },
  'login.recover': {
    id: 'GlobalMenu.Recover',
    defaultMessage: 'Password Recovery'
  }
});

const adminConfigurationMessages = defineMessages({
  encryptMarked: {
    id: 'adminConfigurations.encryptMarked',
    defaultMessage: 'Encrypt Marked'
  },
  encryptError: {
    id: 'adminConfigurations.encryptError',
    defaultMessage: 'An error has occurred attempting to encrypt items.'
  },
  noEncryptItems: {
    id: 'adminConfigurations.noEncryptItems',
    defaultMessage: 'No items to encrypt were found in XML markup. Add attribute `encrypted=""` to mark for encryption.'
  },
  allEncrypted: {
    id: 'adminConfigurations.allEncrypted',
    defaultMessage: 'All marked items are already encrypted. The `encrypted` attribute should have a blank value to be marked for encryption (e.g. `encrypted=""`)'
  },
  xmlContainsErrors: {
    id: 'adminConfigurations.xmlContainsErrors',
    defaultMessage: 'The XML document contains errors: {errors}'
  },
  encryptionDetail: {
    id: 'adminConfigurations.encryptionDetail',
    defaultMessage: '"{name}" with value "{value}"'
  },
  pendingEncryptions: {
    id: 'adminConfigurations.pendingEncryptions',
    defaultMessage: '{itemCount, plural, one {Tag Name {tags} is marked for encryption but hasn\'t been encrypted, please trigger encryption or remove the tag flagging.}' +
                    'other {Tag names: \n {tags}\nare marked for encryption but haven\'t been encrypted, please trigger encryption or remove the tag flagging.}}'
  },
  testIntl: {
    id: 'adminConfigurations.testIntl',
    defaultMessage: '{itemCount, plural, one {Item} other {Items}}',
  }
});

export default {
  approveDialogMessages,
  deleteDialogMessages,
  reposAdminMessages,
  usersAdminMessages,
  passwordRequirementMessages,
  groupsAdminMessages,
  profileSettingsMessages,
  numericInputControlMessages,
  sharedContentDSMessages,
  embeddedContentDSMessages,
  childContentDSMessages,
  contentTypesMessages,
  codeEditorMessages,
  targetingDialog,
  words,
  globalConfigMessages,
  publishingMessages,
  siteComponentDSMessages,
  formEngineMessages,
  browseCMISMessages,
  dragAndDropMessages,
  internalNameControlMessages,
  checkboxGroupControlMessages,
  globalMenuMessages,
  adminConfigurationMessages
};
