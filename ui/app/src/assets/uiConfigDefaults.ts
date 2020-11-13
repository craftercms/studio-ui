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
          id: 'craftercms.component.ToolsPanelEmbeddedAppViewButton',
          roles: ['admin'],
          configuration: {
            title: 'Search',
            icon: {
              baseClass: 'fa fa-sitemap'
            },
            widget: {
              id: 'craftercms.component.search'
            }
          }
        },
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
          id: 'craftercms.component.ToolsPanelPageButton',
          roles: [],
          configuration: {
            title: 'Search',
            icon: {
              baseClass: 'fa fa-sitemap'
            },
            widgets: [
              {
                id: 'craftercms.component.search',
                roles: [],
                configuration: {}
              },
              {
                id: 'org.craftercms.sampleComponentLibraryPlugin.components.reactComponent',
                plugin: {
                  type: 'plugin',
                  name: '/',
                  file: 'index.umd.js'
                },
                configuration: {
                  text: 'John Doe'
                }
              },
              {
                id: 'org.craftercms.sampleComponentLibraryPlugin.components.nonReactComponent',
                plugin: {
                  type: 'plugin',
                  name: '/',
                  file: 'index.umd.js'
                },
                configuration: {
                  fontColor: 'red'
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
