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

import { defineMessages } from 'react-intl';

export const translations = defineMessages({
  // region Config Files translations
  confTabConfigurations: { id: 'siteConfigurationManagement.confTabConfigurations', defaultMessage: 'Configurations' },
  confTabConfDesc: {
    id: 'siteConfigurationManagement.confTabConfDesc',
    defaultMessage: 'Defines this list of configurations'
  },
  confTabContextualNavigationConf: {
    id: 'siteConfigurationManagement.confTabContextualNavigationConf',
    defaultMessage: 'Contextual Navigation Configuration'
  },
  confTabContextualNavigationConfDesc: {
    id: 'siteConfigurationManagement.confTabContextualNavigationConfDesc',
    defaultMessage: 'Defines modules on the site contextual navigation bar'
  },
  confTabSidebarConf: { id: 'siteConfigurationManagement.confTabSidebarConf', defaultMessage: 'Sidebar Configuration' },
  confTabSidebarConfDesc: {
    id: 'siteConfigurationManagement.confTabSidebarConfDesc',
    defaultMessage: 'Defines modules on the sidebar'
  },
  confTabEndpointsConf: {
    id: 'siteConfigurationManagement.confTabEndpointsConf',
    defaultMessage: 'Endpoints Configuration'
  },
  confTabEndpointsConfDesc: {
    id: 'siteConfigurationManagement.confTabEndpointsConfDesc',
    defaultMessage: 'Defines a list of end points available'
  },
  confTabDevEnvironmentConf: {
    id: 'siteConfigurationManagement.confTabDevEnvironmentConf',
    defaultMessage: 'Dev Environment Configuration'
  },
  confTabDevEnvironmentConfDesc: {
    id: 'siteConfigurationManagement.confTabDevEnvironmentConfDesc',
    defaultMessage: 'Defines a dev environment configuration'
  },
  confTabTargetsConf: { id: 'siteConfigurationManagement.confTabTargetsConf', defaultMessage: 'Targets Configuration' },
  confTabTargetsConfDesc: {
    id: 'siteConfigurationManagement.confTabTargetsConfDesc',
    defaultMessage: 'Defines a list of targets used for form datasource'
  },
  confTabRTEConf: { id: 'siteConfigurationManagement.confTabRTEConf', defaultMessage: 'RTE (TinyMCE 2) Configuration' },
  confTabRTEConfDesc: {
    id: 'siteConfigurationManagement.confTabRTEConfDesc',
    defaultMessage: 'Defines Rich Text Editors configurations in form'
  },
  confTabRTEtMCE5Conf: {
    id: 'siteConfigurationManagement.confTabRTEtMCE5Conf',
    defaultMessage: 'RTE (TinyMCE 5) Configuration'
  },
  confTabRTEtMCE5ConfDesc: {
    id: 'siteConfigurationManagement.confTabRTEtMCE5ConfDesc',
    defaultMessage: 'Defines Rich Text Editors configurations in form'
  },
  confTabCodeEditorConf: {
    id: 'siteConfigurationManagement.confTabCodeEditorConf',
    defaultMessage: 'Code Editor Configuration'
  },
  confTabCodeEditorConfDesc: {
    id: 'siteConfigurationManagement.confTabCodeEditorConfDesc',
    defaultMessage: 'Defines Code Editor configurations'
  },
  confTabPreviewAssetConf: {
    id: 'siteConfigurationManagement.confTabPreviewAssetConf',
    defaultMessage: 'Preview Asset Configuration'
  },
  confTabPreviewAssetConfDesc: {
    id: 'siteConfigurationManagement.confTabPreviewAssetConfDesc',
    defaultMessage: 'Defines a list of editable assets associated with XML contents'
  },
  confTabPreviewComponentsConf: {
    id: 'siteConfigurationManagement.confTabPreviewComponentsConf',
    defaultMessage: 'Preview Components Configuration'
  },
  confTabPreviewComponentsConfDesc: {
    id: 'siteConfigurationManagement.confTabPreviewComponentsConfDesc',
    defaultMessage: 'Defines a list of components that can be created dynamically in preview'
  },
  confTabPreviewPanelConf: {
    id: 'siteConfigurationManagement.confTabPreviewPanelConf',
    defaultMessage: 'Preview Panel Configuration'
  },
  confTabconfTabPreviewPanelConfDesc: {
    id: 'siteConfigurationManagement.confTabconfTabPreviewPanelConfDesc',
    defaultMessage: 'Defines a list of tools available in preview'
  },
  confTabPersonasConf: {
    id: 'siteConfigurationManagement.confTabPersonasConf',
    defaultMessage: 'Personas Configuration'
  },
  confTabPersonasConfDesc: {
    id: 'siteConfigurationManagement.confTabPersonasConfDesc',
    defaultMessage: 'Defines a list of personas available to assume in preview'
  },
  confTabNotificationConf: {
    id: 'siteConfigurationManagement.confTabNotificationConf',
    defaultMessage: 'Notification Configuration'
  },
  confTabNotificationConfDesc: {
    id: 'siteConfigurationManagement.confTabNotificationConfDesc',
    defaultMessage: 'Defines a list of UI messages'
  },
  confTabPermissionsMappings: {
    id: 'siteConfigurationManagement.confTabPermissionsMappings',
    defaultMessage: 'Permissions Mapping'
  },
  confTabPermissionsMappingsDesc: {
    id: 'siteConfigurationManagement.confTabPermissionsMappingsDesc',
    defaultMessage: 'Defines a map of permissions and paths'
  },
  confTabRoleMappings: { id: 'siteConfigurationManagement.confTabRoleMappings', defaultMessage: 'Role Mappings' },
  confTabRoleMappingsDesc: {
    id: 'siteConfigurationManagement.confTabRoleMappingsDesc',
    defaultMessage: 'Defines a list of roles available in site'
  },
  confTabSiteConfiguration: {
    id: 'siteConfigurationManagement.confTabSiteConfiguration',
    defaultMessage: 'Site Configuration'
  },
  confTabSiteConfigurationDesc: {
    id: 'siteConfigurationManagement.confTabSiteConfigurationDesc',
    defaultMessage: 'Defines the general site configuration'
  },
  confTabSiteConf: { id: 'siteConfigurationManagement.confTabSiteConf', defaultMessage: 'Site Config Tools' },
  confTabSiteConfDesc: {
    id: 'siteConfigurationManagement.confTabSiteConfDesc',
    defaultMessage: 'Defines the list of admin tools available'
  },
  confTabWorkflowConf: {
    id: 'siteConfigurationManagement.confTabWorkflowConf',
    defaultMessage: 'Workflow Configuration'
  },
  confTabWorkflowConfDesc: {
    id: 'siteConfigurationManagement.confTabWorkflowConfDesc',
    defaultMessage: 'Defines workflows available in the system'
  },
  confTabTargetingConfiguration: {
    id: 'siteConfigurationManagement.confTabTargetingConfiguration',
    defaultMessage: 'Targeting Configuration'
  },
  confTabTargetingConfigurationDesc: {
    id: 'siteConfigurationManagement.confTabTargetingConfigurationDesc',
    defaultMessage:
      'This file configures the targeting system of Crafter Studio to help provide Crafter Engine with fake user properties that help drive the targeting system'
  },
  confTabEnvironmentConfiguration: {
    id: 'siteConfigurationManagement.confTabEnvironmentConfiguration',
    defaultMessage: 'Environment Configuration'
  },
  confTabEnvironmentConfigurationDesc: {
    id: 'siteConfigurationManagement.confTabEnvironmentConfigurationDesc',
    defaultMessage: 'This file configures the environments Crafter Studio can publish to'
  },
  confTabCMISConfiguration: {
    id: 'siteConfigurationManagement.confTabCMISConfiguration',
    defaultMessage: 'CMIS Configuration'
  },
  confTabCMISConfigurationDesc: {
    id: 'siteConfigurationManagement.confTabCMISConfigurationDesc',
    defaultMessage:
      'This files configures 0 or more CMIS-capable repositories as data-sources for content authors to pick from'
  },
  confTabEngineSiteConfiguration: {
    id: 'siteConfigurationManagement.confTabEngineSiteConfiguration',
    defaultMessage: 'Engine Site Configuration'
  },
  confTabEngineSiteConfigurationDesc: {
    id: 'siteConfigurationManagement.confTabEngineSiteConfigurationDesc',
    defaultMessage: 'Site configuration used by Crafter Engine'
  },
  confTabEngineSiteConfigurationPreview: {
    id: 'siteConfigurationManagement.confTabEngineSiteConfigurationPreview',
    defaultMessage: 'Engine Site Configuration - Preview'
  },
  confTabEngineSiteConfigurationStaging: {
    id: 'siteConfigurationManagement.confTabEngineSiteConfigurationStaging',
    defaultMessage: 'Engine Site Configuration - Staging'
  },
  confTabEngineSiteConfigurationLive: {
    id: 'siteConfigurationManagement.confTabEngineSiteConfigurationLive',
    defaultMessage: 'Engine Site Configuration - Live'
  },
  confTabEngineSiteAppContextConfiguration: {
    id: 'siteConfigurationManagement.confTabEngineSiteAppContextConfiguration',
    defaultMessage: 'Engine Site Application Context'
  },
  confTabEngineSiteAppContextConfigurationDesc: {
    id: 'siteConfigurationManagement.confTabEngineSiteAppContextConfigurationDesc',
    defaultMessage: 'Site application context used by Crafter Engine'
  },
  confTabEngineSiteAppContextConfigurationPreview: {
    id: 'siteConfigurationManagement.confTabEngineSiteAppContextConfigurationPreview',
    defaultMessage: 'Engine Site Application Context - Preview'
  },
  confTabEngineSiteAppContextConfigurationStaging: {
    id: 'siteConfigurationManagement.confTabEngineSiteAppContextConfigurationStaging',
    defaultMessage: 'Engine Site Application Context - Staging'
  },
  confTabEngineSiteAppContextConfigurationLive: {
    id: 'siteConfigurationManagement.confTabEngineSiteAppContextConfigurationLive',
    defaultMessage: 'Engine Site Application Context - Live'
  },
  confTabTranslationConf: {
    id: 'siteConfigurationManagement.confTabTranslationConf',
    defaultMessage: 'Translation Configuration'
  },
  confTabTranslationConfDesc: {
    id: 'siteConfigurationManagement.confTabTranslationConfDesc',
    defaultMessage: 'Defines supported languages and how to resolve them'
  },
  confTabSitePolicyConf: {
    id: 'siteConfigurationManagement.confTabSitePolicyConf',
    defaultMessage: 'Site Policy Configuration'
  },
  confTabSitePolicyConfDesc: {
    id: 'siteConfigurationManagement.confTabSitePolicyConfDesc',
    defaultMessage: 'Defines policies to validate content operations'
  },
  confTabUiConf: { id: 'siteConfigurationManagement.confTabUiConf', defaultMessage: 'User Interface Configuration' },
  confTabUiConfDesc: {
    id: 'siteConfigurationManagement.confTabUiConfDesc',
    defaultMessage: 'Defines the widgets shown in the user interface'
  },
  confTabMimeTypes: { id: 'siteConfigurationManagement.confTabMimeTypes', defaultMessage: 'Mime Types' },
  confTabMimeTypesDesc: {
    id: 'siteConfigurationManagement.confTabMimeTypesDesc',
    defaultMessage: 'This file configures the mime types icons overrides for this site/blueprint.'
  },
  confTabEngineUrlRewriteConf: {
    id: 'siteConfigurationManagement.confTabEngineUrlRewriteConf',
    defaultMessage: 'Engine URL Rewrite Configuration (XML Style)'
  },
  confTabEngineUrlRewriteConfDesc: {
    id: 'siteConfigurationManagement.confTabEngineUrlRewriteConfDesc',
    defaultMessage: 'This file configures site properties used by Crafter Engine'
  },
  confTabEngineUrlRewriteConfPreview: {
    id: 'siteConfigurationManagement.confTabEngineUrlRewriteConfPreview',
    defaultMessage: 'Engine URL Rewrite Configuration (XML Style) - Preview'
  },
  confTabEngineUrlRewriteConfStaging: {
    id: 'siteConfigurationManagement.confTabEngineUrlRewriteConfStaging',
    defaultMessage: 'Engine URL Rewrite Configuration (XML Style) - Staging'
  },
  confTabEngineUrlRewriteConfLive: {
    id: 'siteConfigurationManagement.confTabEngineUrlRewriteConfLive',
    defaultMessage: 'Engine URL Rewrite Configuration (XML Style) - Live'
  },
  confTabDependencyResolverConf: {
    id: 'siteConfigurationManagement.confTabDependencyResolverConf',
    defaultMessage: 'Dependency Resolver Configuration'
  },
  confTabDependencyResolverConfDesc: {
    id: 'siteConfigurationManagement.confTabDependencyResolverConfDesc',
    defaultMessage:
      'This file configures what file paths Crafter considers a dependency and how they should be extracted.'
  },
  confTabAWSProfiles: { id: 'siteConfigurationManagement.confTabAWSProfiles', defaultMessage: 'AWS Profiles' },
  confTabAWSProfilesDesc: {
    id: 'siteConfigurationManagement.confTabAWSProfilesDesc',
    defaultMessage: 'AWS profiles configuration file.'
  },
  confTabBoxProfiles: { id: 'siteConfigurationManagement.confTabBoxProfiles', defaultMessage: 'Box Profiles' },
  confTabBoxProfilesDesc: {
    id: 'siteConfigurationManagement.confTabBoxProfilesDesc',
    defaultMessage: 'Box profiles configuration file.'
  },
  confTabWebDAVProfiles: { id: 'siteConfigurationManagement.confTabWebDAVProfiles', defaultMessage: 'WebDAV Profiles' },
  confTabWebDAVProfilesDesc: {
    id: 'siteConfigurationManagement.confTabWebDAVProfilesDesc',
    defaultMessage: 'WebDAV profiles configuration file.'
  },
  confTabAssetProcessing: {
    id: 'siteConfigurationManagement.confTabAssetProcessing',
    defaultMessage: 'Asset Processing'
  },
  confTabAssetProcessingDesc: {
    id: 'siteConfigurationManagement.confTabAssetProcessingDesc',
    defaultMessage: 'Asset processing configuration file.'
  },
  confTabBlobStores: { id: 'siteConfigurationManagement.confTabBlobStores', defaultMessage: 'Blob Stores' },
  confTabBlobStoresDesc: {
    id: 'siteConfigurationManagement.confTabBlobStoresDesc',
    defaultMessage: 'Blob stores configuration file.'
  },
  confTabProxyConfig: { id: 'siteConfigurationManagement.confTabProxyConfig', defaultMessage: 'Proxy Config' },
  confTabProxyConfigDesc: {
    id: 'siteConfigurationManagement.confTabProxyConfigDesc',
    defaultMessage: 'This file configures the proxy servers for preview.'
  },
  // endregion
  // region Encrypt translations
  xmlContainsErrors: {
    id: 'adminConfigurations.xmlContainsErrors',
    defaultMessage: 'The XML document contains errors: {errors}'
  },
  noEncryptItems: {
    id: 'adminConfigurations.noEncryptItems',
    defaultMessage: 'No items to encrypt were found in XML markup. Add attribute `encrypted=""` to mark for encryption.'
  },
  allEncrypted: {
    id: 'adminConfigurations.allEncrypted',
    defaultMessage:
      'All marked items are already encrypted. The `encrypted` attribute should have a blank value to be marked for encryption (e.g. `encrypted=""`)'
  },
  pendingEncryptions: {
    id: 'adminConfigurations.pendingEncryptions',
    defaultMessage:
      "{count, plural, one {One tag is marked for encryption but hasn't} other {Tags are marked for encryption but haven't been encrypted, please trigger encryption or remove the tag flagging}}"
  },
  encryptMarked: {
    id: 'adminConfigurations.encryptMarked',
    defaultMessage: 'Encrypt Marked'
  },
  encryptHintPt1: {
    id: 'adminConfigurations.encryptHinPt1',
    defaultMessage:
      'To encrypt the content of a tag, (1) mark the desired tags for encryption, then (2) click on the "Encrypt Marked" button.'
  },
  encryptHintPt2: {
    id: 'adminConfigurations.encryptHinPt2',
    defaultMessage: '(1) Mark your tags for encryption by adding the attribute <bold>`encrypted=""`</bold>. '
  },
  encryptHintPt3: {
    id: 'adminConfigurations.encryptHinPt3',
    defaultMessage: 'Example: {lt}accessKey encrypted=""{gt}AKIAIOSFODNN7EXAMPLE{lt}/accessKey{gt}'
  },
  encryptHintPt4: {
    id: 'adminConfigurations.encryptHinPt4',
    defaultMessage:
      '(2) Click on the <bold>`Encrypt Marked`</bold> button. Once the process completes, your tag should now look like:'
  },
  encryptHintPt5: {
    id: 'adminConfigurations.encryptHinPt5',
    defaultMessage:
      // eslint-disable-next-line no-template-curly-in-string
      '{lt}accessKey encrypted="true"{gt}${lc}enc:xeJW23SomeEncryptedValuesListedHere{rc}{lt}/accessKey{gt}'
  },
  encryptHintPt6: {
    id: 'adminConfigurations.encryptHinPt6',
    defaultMessage: 'Remember:'
  },
  encryptHintPt7: {
    id: 'adminConfigurations.encryptHinPt7',
    defaultMessage:
      'Use the `encrypted=""` attribute only on tags which directly hold the value to be encrypted (text).'
  },
  encryptHintPt8: {
    id: 'adminConfigurations.encryptHinPt8',
    defaultMessage:
      'Don’t add the attribute on tags that contain other tags - unless you actually want to encrypt a chunk of XML.'
  },
  encryptHintPt9: {
    id: 'adminConfigurations.encryptHinPt9',
    defaultMessage: 'Do not manipulate encryption results manually.'
  },
  // endregion
  configSaved: {
    id: 'adminConfigurations.configSaved',
    defaultMessage: 'Configuration saved successfully.'
  }
});
