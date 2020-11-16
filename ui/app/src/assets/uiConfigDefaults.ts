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
              id: 'material.icons.search'
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
              id: 'material.icons.component'
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
              id: 'material.icons.asset'
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
              id: 'material.icons.audiences'
            },
            widgets: [
              {
                id: 'craftercms.component.PreviewAudiencesPanel'
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
              id: 'material.icons.pageExplorer'
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
              id: 'material.icons.simulator'
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
              id: 'material.icons.siteExplorer'
            },
            widgets: [
              {
                id: 'craftercms.component.PathNavigator',
                roles: [],
                configuration: {
                  id: 'Pages',
                  label: 'Pages',
                  rootPath: '/site/website',
                  locale: 'en',
                  icon: {
                    baseClass: 'fa',
                    expandedClass: 'fa-file-text-o',
                    collapsedClass: 'fa-file-text'
                  },
                  container: {
                    baseClass: 'next-pages-widget',
                    expandedClass: 'next-pages-widget-open',
                    collapsedClass: 'next-pages-widget-closed',
                    baseStyle: {},
                    expandedStyle: {},
                    collapsedStyle: {}
                  }
                }
              },
              {
                id: 'craftercms.component.PathNavigator',
                roles: [],
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
