/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
 * along with this program.  If not, see <http://www.gnu.org/licenses}.
 */

import { defineMessages } from 'react-intl';
import GlobalState from '../models/GlobalState';

const messages = defineMessages({
  pageBuilder: {
    id: 'pageBuilder.title',
    defaultMessage: 'Page Building'
  },
  siteTools: {
    id: 'siteTools.title',
    defaultMessage: 'Site Tools'
  },
  siteDashboard: {
    id: 'words.dashboard',
    defaultMessage: 'Dashboard'
  },
  configuration: {
    id: 'words.configuration',
    defaultMessage: 'Configuration'
  },
  workflowStates: {
    id: 'workflowStates.title',
    defaultMessage: 'Workflow States'
  },
  publishing: {
    id: 'words.publishing',
    defaultMessage: 'Publishing'
  },
  remoteRepositories: {
    id: 'remoteRepositories.title',
    defaultMessage: 'Remote Repositories'
  },
  preview: {
    id: 'words.preview',
    defaultMessage: 'Preview'
  },
  site: {
    id: 'launcher.siteSectionTitle',
    defaultMessage: 'Site <muted>• {siteName}</muted>'
  }
});

let count = 0;

const uiConfigDefaults: Pick<GlobalState['uiConfig'], 'preview' | 'launcher'> = {
  preview: {
    toolsPanel: {
      widgets: [
        {
          id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
          uiKey: count++,
          configuration: {
            title: {
              id: 'words.dashboard',
              defaultMessage: 'Dashboard'
            },
            icon: {
              id: '@material-ui/icons/DashboardOutlined'
            },
            widget: {
              id: 'craftercms.components.LegacyDashboardFrame',
              uiKey: count++
            }
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: count++,
          configuration: {
            title: {
              id: 'previewSiteExplorerPanel.title',
              defaultMessage: 'Site Explorer'
            },
            icon: {
              id: 'craftercms.icons.SiteExplorer'
            },
            widgets: [
              {
                id: 'craftercms.components.PathNavigator',
                uiKey: count++,
                configuration: {
                  id: 'Pages',
                  label: 'Pages',
                  expandedIcon: { id: '@material-ui/icons/DescriptionOutlined' },
                  collapsedIcon: { id: '@material-ui/icons/DescriptionRounded' },
                  rootPath: '/site/website/index.xml',
                  locale: 'en'
                }
              },
              {
                id: 'craftercms.components.PathNavigator',
                uiKey: count++,
                configuration: {
                  id: 'Components',
                  label: 'Components',
                  expandedIcon: {
                    id: '@material-ui/icons/ExtensionOutlined'
                  },
                  collapsedIcon: {
                    id: '@material-ui/icons/ExtensionRounded'
                  },
                  rootPath: '/site/components',
                  locale: 'en'
                }
              },
              {
                id: 'craftercms.components.PathNavigator',
                uiKey: count++,
                configuration: {
                  id: 'Taxonomy',
                  label: 'Taxonomy',
                  expandedIcon: {
                    id: '@material-ui/icons/LocalOfferOutlined'
                  },
                  collapsedIcon: {
                    id: '@material-ui/icons/LocalOfferRounded'
                  },
                  rootPath: '/site/taxonomy',
                  locale: 'en'
                }
              },
              {
                id: 'craftercms.components.PathNavigator',
                uiKey: count++,
                configuration: {
                  id: 'StaticAssets',
                  label: 'Static Assets',
                  expandedIcon: {
                    id: '@material-ui/icons/ImageOutlined'
                  },
                  collapsedIcon: {
                    id: '@material-ui/icons/ImageRounded'
                  },
                  rootPath: '/static-assets',
                  locale: 'en'
                }
              },
              {
                id: 'craftercms.components.PathNavigatorTree',
                uiKey: count++,
                configuration: {
                  label: 'Templates',
                  expandedIcon: {
                    id: '@material-ui/icons/InsertDriveFileOutlined'
                  },
                  collapsedIcon: {
                    id: '@material-ui/icons/InsertDriveFileRounded'
                  },
                  rootPath: '/templates',
                  locale: 'en'
                }
              },
              {
                id: 'craftercms.components.PathNavigatorTree',
                uiKey: count++,
                configuration: {
                  label: 'Scripts',
                  icon: {
                    id: '@material-ui/icons/CodeRounded',
                    collapsed: '@material-ui/icons/CodeRounded'
                  },
                  container: {
                    baseStyle: {
                      marginBottom: '20px'
                    }
                  },
                  rootPath: '/scripts',
                  locale: 'en'
                }
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: count++,
          roles: ['admin', 'developer'],
          configuration: {
            title: messages.siteTools,
            icon: {
              id: '@material-ui/icons/TuneRounded'
            },
            widgets: [
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: count++,
                configuration: {
                  title: {
                    id: 'dropTargetsMessages.contentTypes',
                    defaultMessage: 'Content Types'
                  },
                  icon: {
                    id: '@material-ui/icons/WidgetsOutlined'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: count++,
                    configuration: {
                      tool: 'content-types'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: count++,
                configuration: {
                  title: {
                    id: 'GlobalMenu.EncryptionToolEntryLabel',
                    defaultMessage: 'Encryption Tool'
                  },
                  icon: {
                    id: '@material-ui/icons/LockOutlined'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: count++,
                    configuration: {
                      tool: 'encrypt-tool'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: count++,
                configuration: {
                  title: messages.configuration,
                  icon: {
                    id: '@material-ui/icons/SettingsApplicationsOutlined'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: count++,
                    configuration: {
                      tool: 'admin-configurations'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: count++,
                configuration: {
                  title: {
                    id: 'GlobalMenu.AuditEntryLabel',
                    defaultMessage: 'Audit'
                  },
                  icon: {
                    id: '@material-ui/icons/SubjectRounded'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: count++,
                    configuration: {
                      tool: 'audit'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: count++,
                configuration: {
                  title: messages.workflowStates,
                  icon: {
                    id: '@material-ui/icons/SettingsOutlined'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: count++,
                    configuration: {
                      tool: 'workflow-states'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: count++,
                configuration: {
                  title: {
                    id: 'GlobalMenu.LogConsoleEntryLabel',
                    defaultMessage: 'Log Console'
                  },
                  icon: {
                    id: '@material-ui/icons/FormatAlignCenterRounded'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: count++,
                    configuration: {
                      tool: 'log-view'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: count++,
                configuration: {
                  title: messages.publishing,
                  icon: {
                    id: '@material-ui/icons/CloudUploadOutlined'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: count++,
                    configuration: {
                      tool: 'status-view'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: count++,
                configuration: {
                  title: messages.remoteRepositories,
                  icon: {
                    id: '@material-ui/icons/StorageRounded'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: count++,
                    configuration: {
                      tool: 'repository'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: count++,
                configuration: {
                  title: 'GraphQL',
                  icon: {
                    id: '@material-ui/icons/PollOutlined'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: count++,
                    configuration: {
                      tool: 'graphiql'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: count++,
                configuration: {
                  title: {
                    id: 'PluginManagement.title',
                    defaultMessage: 'Plugin Management'
                  },
                  icon: {
                    id: '@material-ui/icons/ExtensionOutlined'
                  },
                  widget: {
                    id: 'craftercms.components.PluginManagement',
                    uiKey: count++,
                    configuration: {
                      embedded: true
                    }
                  }
                }
              }
            ]
          }
        }
      ]
    },
    pageBuilderPanel: {
      widgets: [
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: count++,
          configuration: {
            target: 'pageBuilderPanel',
            title: {
              id: 'previewSearchPanel.title',
              defaultMessage: 'Search'
            },
            icon: {
              id: '@material-ui/icons/SearchRounded'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewSearchPanel',
                uiKey: count++
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: count++,
          configuration: {
            target: 'pageBuilderPanel',
            title: {
              id: 'previewComponentsPanel.title',
              defaultMessage: 'Add Components'
            },
            icon: {
              id: '@material-ui/icons/ExtensionOutlined'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewComponentsPanel',
                uiKey: count++
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: count++,
          configuration: {
            target: 'pageBuilderPanel',
            title: {
              id: 'previewBrowseComponentsPanel.title',
              defaultMessage: 'Browse Components'
            },
            icon: {
              id: '@material-ui/icons/ExtensionOutlined'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewBrowseComponentsPanel',
                uiKey: count++
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: count++,
          configuration: {
            target: 'pageBuilderPanel',
            title: {
              id: 'previewDropTargetsPanel.title',
              defaultMessage: 'Component Drop Targets'
            },
            icon: {
              id: '@material-ui/icons/ExtensionOutlined'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewDropTargetsPanel',
                uiKey: count++
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: count++,
          configuration: {
            target: 'pageBuilderPanel',
            title: {
              id: 'previewAssetsPanel.title',
              defaultMessage: 'Assets'
            },
            icon: {
              id: '@material-ui/icons/ImageOutlined'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewAssetsPanel',
                uiKey: count++
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: count++,
          configuration: {
            target: 'pageBuilderPanel',
            title: {
              id: 'previewAudiencesPanel.title',
              defaultMessage: 'Audience Targeting'
            },
            icon: {
              id: '@material-ui/icons/EmojiPeopleRounded'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewAudiencesPanel',
                uiKey: count++,
                configuration: {
                  fields: {
                    segment: {
                      id: 'segment',
                      name: 'Segment',
                      description: 'User segment.',
                      type: 'dropdown',
                      defaultValue: 'anonymous',
                      values: [
                        {
                          label: 'Guy',
                          value: 'guy'
                        },
                        {
                          label: 'Gal',
                          value: 'gal'
                        },
                        {
                          label: 'Anonymous',
                          value: 'anonymous'
                        }
                      ],
                      helpText: 'Setting the segment will change content targeting to the audience selected.'
                    },
                    name: {
                      id: 'name',
                      name: 'Name',
                      description: "User's first and last name.",
                      type: 'input',
                      helpText: "Enter user's first and last name."
                    }
                  }
                }
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: count++,
          configuration: {
            target: 'pageBuilderPanel',
            title: {
              id: 'previewPageExplorerPanel.title',
              defaultMessage: 'Page Explorer'
            },
            icon: {
              id: 'craftercms.icons.PageExplorer'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewPageExplorerPanel',
                uiKey: count++
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: count++,
          configuration: {
            target: 'pageBuilderPanel',
            title: {
              id: 'previewSimulatorPanel.title',
              defaultMessage: 'Device Simulator'
            },
            icon: {
              id: '@material-ui/icons/DevicesRounded'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewSimulatorPanel',
                uiKey: count++,
                configuration: {
                  devices: [
                    {
                      title: 'smartPhone',
                      width: 375,
                      height: 667
                    },
                    {
                      title: 'tablet',
                      width: 768,
                      height: 1024
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: count++,
          configuration: {
            target: 'pageBuilderPanel',
            title: {
              id: 'words.settings',
              defaultMessage: 'Settings'
            },
            icon: {
              id: '@material-ui/icons/SettingsOutlined'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewSettingsPanel',
                uiKey: count++
              }
            ]
          }
        }
      ]
    }
  },
  launcher: {
    siteCardMenuLinks: [
      {
        systemLinkId: 'siteDashboard',
        title: messages.siteDashboard
      },
      {
        systemLinkId: 'preview',
        title: messages.preview
      },
      {
        systemLinkId: 'siteTools',
        title: messages.siteTools,
        roles: ['admin', 'developer']
      }
    ],
    widgets: [
      {
        id: 'craftercms.components.LauncherSection',
        uiKey: count++,
        configuration: {
          title: messages.site,
          widgets: [
            {
              id: 'craftercms.components.LauncherLinkTile',
              uiKey: count++,
              configuration: {
                title: {
                  id: 'words.dashboard',
                  defaultMessage: 'Dashboard'
                },
                systemLinkId: 'siteDashboard',
                icon: { id: '@material-ui/icons/DashboardRounded' }
              }
            },
            {
              id: 'craftercms.components.LauncherLinkTile',
              uiKey: count++,
              configuration: {
                title: {
                  id: 'words.preview',
                  defaultMessage: 'Preview'
                },
                systemLinkId: 'preview',
                icon: { id: 'craftercms.icons.Preview' }
              }
            },
            {
              id: 'craftercms.components.LauncherLinkTile',
              uiKey: count++,
              roles: ['admin', 'developer'],
              configuration: {
                title: {
                  id: 'siteTools.title',
                  defaultMessage: 'Site Tools'
                },
                systemLinkId: 'siteTools',
                icon: { id: '@material-ui/icons/BuildRounded' }
              }
            },
            {
              id: 'craftercms.components.LauncherLinkTile',
              uiKey: count++,
              configuration: {
                title: {
                  id: 'words.search',
                  defaultMessage: 'Search'
                },
                systemLinkId: 'siteSearch',
                icon: { id: '@material-ui/icons/SearchRounded' }
              }
            },
            {
              id: 'craftercms.components.LauncherPublishingStatusTile',
              uiKey: count++
            }
          ]
        }
      }
    ]
  }
};

export default uiConfigDefaults;
