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

const uiConfigMock = {
  preview: {
    sidebar: {
      panels: [
        {
          id: 'craftercms.searchPanel'
        },
        {
          id: 'craftercms.componentsPanel'
        },
        {
          id: 'craftercms.assetsPanel'
        },
        {
          id: 'craftercms.audiencesPanel'
        },
        {
          id: 'craftercms.pageExplorerPanel'
        },
        {
          id: 'craftercms.simulatorPanel',
          parameters: {
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
        },
        {
          id: 'craftercms.siteExplorerPanel',
          roles: ['admin', 'developer'],
          parameters: {
            widgets: [
              {
                id: 'craftercms.siteDashboardLink'
              },
              {
                id: 'craftercms.siteConfigLink',
                roles: ['admin', 'developer']
              },
              {
                id: 'craftercms.pathNavigator',
                roles: ['admin', 'developer'],
                parameters: {
                  id: 'pages',
                  label: 'Pages',
                  rootPath: '/site/website',
                  locale: 'en',
                  icon: {
                    baseClass: 'fa',
                    expandedClass: 'fa-file-text-o',
                    collapsedClass: 'fa-file-text-o',
                    baseStyle: {},
                    expandedStyle: {},
                    collapsedStyle: {}
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
                id: 'craftercms.pathNavigator',
                roles: ['admin', 'developer'],
                parameters: {
                  id: 'components',
                  label: 'Components',
                  rootPath: '/site/components',
                  locale: 'en',
                  icon: {
                    baseClass: 'fa fa-puzzle-piece'
                  }
                }
              },
              {
                id: 'craftercms.pathNavigator',
                roles: ['admin', 'developer'],
                parameters: {
                  id: 'taxonomy',
                  label: 'Taxonomy',
                  rootPath: '/site/taxonomy',
                  icon: {
                    baseClass: 'fa fa-tags'
                  }
                }
              },
              {
                id: 'craftercms.pathNavigator',
                roles: ['admin', 'developer'],
                parameters: {
                  id: 'staticAssets',
                  label: 'Static Assets',
                  rootPath: '/static-assets',
                  icon: {
                    baseClass: 'fa fa-image'
                  }
                }
              },
              {
                id: 'craftercms.pathNavigator',
                roles: ['admin', 'developer'],
                parameters: {
                  id: 'templates',
                  label: 'Templates',
                  rootPath: '/templates',
                  icon: {
                    baseClass: 'fa fa-file-code-o'
                  }
                }
              },
              {
                id: 'craftercms.pathNavigator',
                roles: ['admin', 'developer'],
                parameters: {
                  id: 'scripts',
                  label: 'Scripts',
                  rootPath: '/scripts',
                  icon: {
                    baseClass: 'fa fa-code'
                  }
                }
              }
            ]
          }
        }
      ]
    },
    siteNav: {
      links: [
        {
          id: 'craftercms.siteDashboardLink',
          roles: ['admin', 'developer']
        },
        {
          id: 'craftercms.sitePreviewLink',
          roles: ['admin', 'developer']
        },
        {
          id: 'craftercms.siteSearchLink',
          roles: ['admin', 'developer']
        },
        {
          id: 'craftercms.siteConfigLink',
          roles: ['admin', 'developer']
        }
      ]
    }
  }
};

export default uiConfigMock;
