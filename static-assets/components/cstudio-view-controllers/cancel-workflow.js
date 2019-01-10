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

/**
 * Component ID: viewcontroller-cancel-workflow
 * @author: Roy Art
 * @date: 21.03.2013
 */

(function (Y, CSA) {

    var CancelWorkflowController,
        CancelWorkflowView,

        Agent = CSA.TemplateHolder.TemplateAgent,
        tmpl = CSA.TemplateHolder.CancelWorkflow;

    CSA.register("ViewController.CancelWorkflowController", function() {
        CSA.ViewController.CancelWorkflowController.superclass.constructor.apply(this, arguments);
    });

    CancelWorkflowController = CSA.ViewController.CancelWorkflowController;

    CancelWorkflowView = function () {
        this.init.apply(this, arguments);
    };

    CancelWorkflowView.prototype = {
        init: function (controller) {
            this.controller = controller;

            var me = this;

            me.setHTML('.cstudio-dialogue-body', tmpl.ROOT);
            me.get('.continue').disabled = !controller.mayContinue();
            controller._initActions();

            controller.on('fileschanged', function (e, args) {
                me.get('.continue').disabled = false;
                me.filesChanged(args[0]);
            });

            controller.on('loadstart', function (e, args) {
                me.get('.continue').disabled = true;
                me.setHTML('.dependencies-table', tmpl.LOADING_ROW);
            });

            controller.on('loaderror', function () {
                me.setHTML('.dependencies-table', tmpl.ERROR_ROW);
                controller._initAction('.load-retry');
            });

            controller.on('cancel', function() {
                if (typeof CStudioAuthoring.editDisabled !== 'undefined') {
                    for(var x = 0; x < window.parent.CStudioAuthoring.editDisabled.length; x++){
                        window.parent.CStudioAuthoring.editDisabled[x].style.pointerEvents = "";
                    }
                    window.parent.CStudioAuthoring.editDisabled = [];
                }
            });

            $("body").on("keyup", function(e) {
                if(e.keyCode === 13 || e.keyCode === 10) {
                    controller.fire('end');
                    controller.fire('continue');
                    $("body").off("keyup");
                }
                if (e.keyCode === 27) {	// esc
                    controller.fire('end');
                    controller.fire('cancel');
                    $("body").off("keyup");
                }
            });

        },
        get: function (elem) {
            return this.controller.getComponent(elem);
        },
        setHTML: function (elem, html) {
            elem = this.get(elem);
            elem.innerHTML = html;
        },
        filesChanged: function (files) {
            var i, file, l,
                html = [],
                agent = new Agent(tmpl);
            for (i = 0, file = files[i], l = files.length; i < l; file = files[++i]) {
                html.push(agent.get('FILE_ROW', file));
            }
            this.setHTML('.dependencies-table', html.join(''));
        }
    }

    Y.extend(CancelWorkflowController, CSA.ViewController.Base, {

        actions: ['.cancel', '.continue'],
        events: ['loadend', 'loadstart', 'loaderror','continue','cancel','fileschanged'],

        initialise: function () {
            new CancelWorkflowView(this);
        },

        findFiles: function () {

            this.fire('loadstart');

            var me = this,
                params = {
                    site: CStudioAuthoringContext.site,
                    path: '' // TODO where can we get this? send to constructor or set to instance?
                };

            CSA.Operations.getWorkflowAffectedFiles(params, {
                success: function (content) {
                    me.setContent(content);
                    me.fire('loadend', content);    
                },
                failure: function () {
                    me.fire('loaderror');
                }
            });
        },

        continueActionClicked: function () {
            if (this.mayContinue()) {
                this.fire('end');
                this.fire('continue');
            }
        },
        cancelActionClicked: function () {
            this.fire('end');
            this.fire('cancel');
        },
        loadRetryActionClicked: function () {
            this.findFiles();
        },
        setContent: function (content) {
            this.content = content;
            this.fire('fileschanged', content);
        },
        mayContinue: function () {
            /* Current logic is:
             * This dialog will not be shown unless there are items in
             * workflow, hence if instance.content is null (or empty) stuff
             * is either getting loaded or something happened */
            var ok = (this.content && this.content.length);
            return ok;
        }
    });

    CSA.Env.ModuleMap.map("viewcontroller-cancel-workflow", CancelWorkflowController);

}) (YAHOO, CStudioAuthoring);