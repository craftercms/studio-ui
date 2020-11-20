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
          id: 'craftercms.components.ToolsPanelPageButton',
          roles: ['admin'],
          configuration: {
            title: 'previewSearchPanel.title',
            icon: {
              id: '@material-ui/icons/SearchRounded'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewSearchPanel'
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          roles: ['admin'],
          configuration: {
            title: 'previewComponentsPanel.title',
            icon: {
              id: '@material-ui/icons/ExtensionRounded'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewComponentsPanel'
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          roles: ['admin'],
          configuration: {
            title: 'previewAssetsPanel.title',
            icon: {
              id: '@material-ui/icons/ImageOutlined'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewAssetsPanel'
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          roles: ['admin'],
          configuration: {
            title: 'previewAudiencesPanel.title',
            icon: {
              id: '@material-ui/icons/EmojiPeopleRounded'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewAudiencesPanel',
                configuration: {
                  fields: {
                    segment: {
                      id: 'segment',
                      name: 'Segment',
                      description: 'User segment.',
                      type: 'dropdown',
                      defaultValue: 'anonymous',
                      values: [
                        { label: 'Guy', value: 'guy' },
                        { label: 'Gal', value: 'gal' },
                        { label: 'Anonymous', value: 'anonymous' }
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
          roles: ['admin'],
          configuration: {
            title: 'previewPageExplorerPanel.title',
            icon: {
              id: 'craftercms.icons.PageExplorer'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewPageExplorerPanel'
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          roles: ['admin'],
          configuration: {
            title: 'previewSimulatorPanel.title',
            icon: {
              id: '@material-ui/icons/DevicesRounded'
            },
            widgets: [
              {
                id: 'craftercms.components.PreviewSimulatorPanel',
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
          roles: ['admin'],
          configuration: {
            title: 'previewSiteExplorerPanel.title',
            icon: {
              id: 'craftercms.icons.SiteExplorer'
            },
            widgets: [
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                configuration: {
                  title: 'words.dashboard',
                  icon: {
                    baseClass: 'fa fa-tasks'
                  },
                  widget: {
                    id: 'craftercms.components.LegacyDashboardFrame'
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelPageButton',
                configuration: {
                  title: 'Site Tools',
                  icon: {
                    baseClass: 'fa fa-sliders'
                  },
                  widgets: [
                    {
                      id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Content Types',
                        icon: {
                          baseClass: 'fa fa-th-large'
                        },
                        widget: {
                          id: 'craftercms.components.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'content-types'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Encryption Tool',
                        icon: {
                          baseClass: 'fa fa-lock'
                        },
                        widget: {
                          id: 'craftercms.components.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'encrypt-tool'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Configuration',
                        icon: {
                          baseClass: 'fa fa-cogs'
                        },
                        widget: {
                          id: 'craftercms.components.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'admin-configurations'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Audit',
                        icon: {
                          baseClass: 'fa fa-align-justify'
                        },
                        widget: {
                          id: 'craftercms.components.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'audit'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Workflow States',
                        icon: {
                          baseClass: 'fa fa-cog'
                        },
                        widget: {
                          id: 'craftercms.components.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'workflow-states'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Log Console',
                        icon: {
                          baseClass: 'fa fa-align-left'
                        },
                        widget: {
                          id: 'craftercms.components.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'log-view'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Publishing',
                        icon: {
                          baseClass: 'fa fa-cloud-upload'
                        },
                        widget: {
                          id: 'craftercms.components.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'status-view'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'Remote Repositories',
                        icon: {
                          baseClass: 'fa fa-database'
                        },
                        widget: {
                          id: 'craftercms.components.LegacySiteToolsFrame',
                          configuration: {
                            tool: 'repository'
                          }
                        }
                      }
                    },
                    {
                      id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                      configuration: {
                        title: 'GraphQL',
                        icon: {
                          baseClass: 'fa fa-line-chart'
                        },
                        widget: {
                          id: 'craftercms.components.LegacySiteToolsFrame',
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
                id: 'craftercms.components.PathNavigator',
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
                id: 'craftercms.components.PathNavigator',
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
                id: 'craftercms.components.PathNavigator',
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
                id: 'craftercms.components.PathNavigator',
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
                id: 'craftercms.components.PathNavigator',
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
                id: 'craftercms.components.PathNavigator',
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
