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

const uiConfigDefaults = {
  preview: {
    toolsPanel: {
      widgets: [
        {
          id: 'craftercms.component.ToolsPanelPageButton',
          roles: ['admin'],
          configuration: {
            title: 'previewSearchPanel.title',
            icon: {
              id: '@material-ui/icons/SearchRounded'
            },
            widgets: [
              {
                id: 'craftercms.component.PreviewSearchPanel'
              }
            ]
          }
        },
        {
          id: 'craftercms.component.ToolsPanelPageButton',
          roles: ['admin'],
          configuration: {
            title: 'previewComponentsPanel.title',
            icon: {
              id: '@material-ui/icons/ExtensionRounded'
            },
            widgets: [
              {
                id: 'craftercms.component.PreviewComponentsPanel'
              }
            ]
          }
        },
        {
          id: 'craftercms.component.ToolsPanelPageButton',
          roles: ['admin'],
          configuration: {
            title: 'previewAssetsPanel.title',
            icon: {
              id: '@material-ui/icons/ImageOutlined'
            },
            widgets: [
              {
                id: 'craftercms.component.PreviewAssetsPanel'
              }
            ]
          }
        },
        {
          id: 'craftercms.component.ToolsPanelPageButton',
          roles: ['admin'],
          configuration: {
            title: 'previewAudiencesPanel.title',
            icon: {
              id: '@material-ui/icons/EmojiPeopleRounded'
            },
            widgets: [
              {
                id: 'craftercms.component.PreviewAudiencesPanel',
                configuration: {
                  fields: {
                    segment: {
                      id: ''
                    }
                  }
                }
              }
            ]
          }
        },
        {
          id: 'craftercms.component.ToolsPanelPageButton',
          roles: ['admin'],
          configuration: {
            title: 'previewPageExplorerPanel.title',
            icon: {
              id: 'craftercms.icons.pageExplorer'
            },
            widgets: [
              {
                id: 'craftercms.component.PreviewPageExplorerPanel'
              }
            ]
          }
        },
        {
          id: 'craftercms.component.ToolsPanelPageButton',
          roles: ['admin'],
          configuration: {
            title: 'previewSimulatorPanel.title',
            icon: {
              id: '@material-ui/icons/DevicesRounded'
            },
            widgets: [
              {
                id: 'craftercms.component.PreviewSimulatorPanel',
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
          id: 'craftercms.component.ToolsPanelPageButton',
          roles: ['admin'],
          configuration: {
            title: 'previewSiteExplorerPanel.title',
            icon: {
              id: '@material-ui/icons/SearchRounded'
            },
            widgets: [
              {
                id: 'craftercms.component.ToolsPanelEmbeddedAppViewButton',
                configuration: {
                  title: 'words.dashboard',
                  icon: {
                    baseClass: 'fa fa-tasks'
                  },
                  widget: {
                    id: 'craftercms.component.LegacyDashboardFrame'
                  }
                }
              },
              {
                id: 'craftercms.component.ToolsPanelPageButton',
                configuration: {
                  title: 'Site Tools',
                  icon: {
                    baseClass: 'fa fa-sliders'
                  },
                  widgets: [
                    {
                      id: 'craftercms.component.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Content Types',
                        icon: {
                          baseClass: 'fa fa-lock'
                        },
                        widget: {
                          id: 'craftercms.component.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'content-types'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.component.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Encryption Tool',
                        icon: {
                          baseClass: 'fa fa-lock'
                        },
                        widget: {
                          id: 'craftercms.component.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'encrypt-tool'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.component.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Configuration',
                        icon: {
                          baseClass: 'fa fa-lock'
                        },
                        widget: {
                          id: 'craftercms.component.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'admin-configurations'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.component.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Audit',
                        icon: {
                          baseClass: 'fa fa-lock'
                        },
                        widget: {
                          id: 'craftercms.component.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'audit'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.component.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Workflow States',
                        icon: {
                          baseClass: 'fa fa-lock'
                        },
                        widget: {
                          id: 'craftercms.component.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'workflow-states'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.component.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Log Console',
                        icon: {
                          baseClass: 'fa fa-cloud-upload'
                        },
                        widget: {
                          id: 'craftercms.component.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'log-view'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.component.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Publishing',
                        icon: {
                          baseClass: 'fa fa-cloud-upload'
                        },
                        widget: {
                          id: 'craftercms.component.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'status-view'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.component.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Remote Repositories',
                        icon: {
                          baseClass: 'fa fa-database'
                        },
                        widget: {
                          id: 'craftercms.component.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'repository'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.component.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'GraphQL',
                        icon: {
                          baseClass: 'fa fa-line-chart'
                        },
                        widget: {
                          id: 'craftercms.component.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'graphiql'
                          }
                        }
                      }
                    }
                  ]
                }
              },
              {
                id: 'craftercms.component.PathNavigator',
                configuration: {
                  id: 'Pages',
                  label: 'Pages',
                  rootPath: '/site/website',
                  locale: 'en',
                  icon: {
                    baseClass: 'fa',
                    expandedClass: 'fa-file-text-o',
                    collapsedClass: 'fa-file-text'
                  }
                }
              },
              {
                id: 'craftercms.component.PathNavigator',
                configuration: {
                  id: 'Components',
                  label: 'Components',
                  rootPath: '/site/components',
                  locale: 'en',
                  icon: {
                    baseClass: 'fa fa-puzzle-piece'
                  }
                }
              },
              {
                id: 'craftercms.component.PathNavigator',
                roles: [],
                configuration: {
                  id: 'Taxonomy',
                  label: 'Taxonomy',
                  rootPath: '/site/taxonomy',
                  locale: 'en',
                  icon: {
                    baseClass: 'fa fa-tags'
                  }
                }
              },
              {
                id: 'craftercms.component.PathNavigator',
                roles: [],
                configuration: {
                  id: 'StaticAssets',
                  label: 'Static Assets',
                  rootPath: '/static-assets',
                  locale: 'en',
                  icon: {
                    baseClass: 'fa fa-image'
                  }
                }
              },
              {
                id: 'craftercms.component.PathNavigator',
                roles: [],
                configuration: {
                  id: 'Templates',
                  label: 'Templates',
                  rootPath: '/templates',
                  locale: 'en',
                  icon: {
                    baseClass: 'fa fa-file-code-o'
                  }
                }
              },
              {
                id: 'craftercms.component.PathNavigator',
                roles: [],
                configuration: {
                  id: 'Scripts',
                  label: 'Scripts',
                  rootPath: '/scripts',
                  locale: 'en',
                  icon: {
                    baseClass: 'fa fa-code'
                  }
                }
              }
            ]
          }
        }
      ]
    }
  }
};

export default uiConfigDefaults;
