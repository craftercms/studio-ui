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
          id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
          uiKey: '13',
          configuration: {
            title: 'Dashboard',
            icon: {
              baseClass: 'fa fa-tasks'
            },
            widget: {
              id: 'craftercms.components.LegacyDashboardFrame',
              uiKey: '14'
            }
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: '40',
          configuration: {
            title: 'Page Builder',
            icon: {
              baseClass: 'fa fa-paint-brush'
            },
            widgets: [
              {
                id: 'craftercms.components.ToolsPanelPageButton',
                uiKey: '0',
                configuration: {
                  title: {
                    id: 'previewSearchPanel.title'
                  },
                  roles: ['admin'],
                  icon: {
                    id: '@material-ui/icons/SearchRounded'
                  },
                  widgets: [
                    {
                      id: 'craftercms.components.PreviewSearchPanel',
                      uiKey: '1'
                    }
                  ]
                }
              },
              {
                id: 'craftercms.components.ToolsPanelPageButton',
                uiKey: '2',
                configuration: {
                  title: {
                    id: 'previewComponentsPanel.title'
                  },
                  roles: ['admin'],
                  icon: {
                    id: '@material-ui/icons/ExtensionRounded'
                  },
                  widgets: [
                    {
                      id: 'craftercms.components.PreviewComponentsPanel',
                      uiKey: '3'
                    }
                  ]
                }
              },
              {
                id: 'craftercms.components.ToolsPanelPageButton',
                uiKey: '4',
                configuration: {
                  title: {
                    id: 'previewAssetsPanel.title'
                  },
                  roles: ['admin'],
                  icon: {
                    id: '@material-ui/icons/ImageOutlined'
                  },
                  widgets: [
                    {
                      id: 'craftercms.components.PreviewAssetsPanel',
                      uiKey: '5'
                    }
                  ]
                }
              },
              {
                id: 'craftercms.components.ToolsPanelPageButton',
                uiKey: '6',
                configuration: {
                  title: {
                    id: 'previewAudiencesPanel.title'
                  },
                  roles: ['admin'],
                  icon: {
                    id: '@material-ui/icons/EmojiPeopleRounded'
                  },
                  widgets: [
                    {
                      id: 'craftercms.components.PreviewAudiencesPanel',
                      uiKey: '7',
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
                uiKey: '8',
                configuration: {
                  title: {
                    id: 'previewPageExplorerPanel.title'
                  },
                  roles: ['admin'],
                  icon: {
                    id: 'craftercms.icons.PageExplorer'
                  },
                  widgets: [
                    {
                      id: 'craftercms.components.PreviewPageExplorerPanel',
                      uiKey: '9'
                    }
                  ]
                }
              },
              {
                id: 'craftercms.components.ToolsPanelPageButton',
                uiKey: '10',
                configuration: {
                  title: {
                    id: 'previewSimulatorPanel.title'
                  },
                  roles: ['admin'],
                  icon: {
                    id: '@material-ui/icons/DevicesRounded'
                  },
                  widgets: [
                    {
                      id: 'craftercms.components.PreviewSimulatorPanel',
                      uiKey: '11',
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
              }
            ]
          }
        },
        {
          id: 'craftercms.components.ToolsPanelPageButton',
          uiKey: '12',
          roles: ['admin'],
          configuration: {
            title: {
              id: 'previewSiteExplorerPanel.title'
            },
            icon: {
              id: 'craftercms.icons.SiteExplorer'
            },
            widgets: [
              {
                id: 'craftercms.components.PathNavigator',
                uiKey: '34',
                configuration: {
                  id: 'Pages',
                  label: 'Pages',
                  icon: {
                    baseClass: 'fa',
                    expandedClass: 'fa-file-text-o',
                    collapsedClass: 'fa-file-text'
                  },
                  rootPath: '/site/website',
                  locale: 'en'
                }
              },
              {
                id: 'craftercms.components.PathNavigator',
                uiKey: '35',
                configuration: {
                  id: 'Components',
                  label: 'Components',
                  icon: {
                    baseClass: 'fa fa-puzzle-piece'
                  },
                  rootPath: '/site/components',
                  locale: 'en'
                }
              },
              {
                id: 'craftercms.components.PathNavigator',
                uiKey: '36',
                configuration: {
                  id: 'Taxonomy',
                  label: 'Taxonomy',
                  icon: {
                    baseClass: 'fa fa-tags'
                  },
                  rootPath: '/site/taxonomy',
                  locale: 'en'
                }
              },
              {
                id: 'craftercms.components.PathNavigator',
                uiKey: '37',
                configuration: {
                  id: 'StaticAssets',
                  label: 'Static Assets',
                  icon: {
                    baseClass: 'fa fa-image'
                  },
                  rootPath: '/static-assets',
                  locale: 'en'
                }
              },
              {
                id: 'craftercms.components.PathNavigator',
                uiKey: '38',
                configuration: {
                  label: 'Templates',
                  icon: {
                    baseClass: 'fa fa-file-code-o'
                  },
                  rootPath: '/templates',
                  locale: 'en'
                }
              },
              {
                id: 'craftercms.components.PathNavigator',
                uiKey: '39',
                configuration: {
                  label: 'Scripts',
                  icon: {
                    baseClass: 'fa fa-code'
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
          uiKey: '15',
          configuration: {
            title: 'Site Tools',
            icon: {
              baseClass: 'fa fa-sliders'
            },
            widgets: [
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: '16',
                configuration: {
                  title: 'Content Types',
                  icon: {
                    baseClass: 'fa fa-th-large'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: '17',
                    configuration: {
                      tool: 'content-types'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: '18',
                configuration: {
                  title: 'Encryption Tool',
                  icon: {
                    baseClass: 'fa fa-lock'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: '19',
                    configuration: {
                      tool: 'encrypt-tool'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: '20',
                configuration: {
                  title: 'Configuration',
                  icon: {
                    baseClass: 'fa fa-cogs'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: '21',
                    configuration: {
                      tool: 'admin-configurations'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: '22',
                configuration: {
                  title: 'Audit',
                  icon: {
                    baseClass: 'fa fa-align-justify'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: '23',
                    configuration: {
                      tool: 'audit'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: '24',
                configuration: {
                  title: 'Workflow States',
                  icon: {
                    baseClass: 'fa fa-cog'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: '25',
                    configuration: {
                      tool: 'workflow-states'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: '26',
                configuration: {
                  title: 'Log Console',
                  icon: {
                    baseClass: 'fa fa-align-left'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: '27',
                    configuration: {
                      tool: 'log-view'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: '28',
                configuration: {
                  title: 'Publishing',
                  icon: {
                    baseClass: 'fa fa-cloud-upload'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: '29',
                    configuration: {
                      tool: 'status-view'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: '30',
                configuration: {
                  title: 'Remote Repositories',
                  icon: {
                    baseClass: 'fa fa-database'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: '31',
                    configuration: {
                      tool: 'repository'
                    }
                  }
                }
              },
              {
                id: 'craftercms.components.ToolsPanelEmbeddedAppViewButton',
                uiKey: '32',
                configuration: {
                  title: 'GraphQL',
                  icon: {
                    baseClass: 'fa fa-line-chart'
                  },
                  widget: {
                    id: 'craftercms.components.LegacySiteToolsFrame',
                    uiKey: '33',
                    configuration: {
                      tool: 'graphiql'
                    }
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
