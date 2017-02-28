/**
 * File: dependencies.js
 * Component ID: viewcontroller-dependencies
 **/
(function(CStudioAuthoring){

    var Base = CStudioAuthoring.ViewController.Base,
        Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        agent = new CStudioAuthoring.TemplateHolder.TemplateAgent(CStudioAuthoring.TemplateHolder.Dependencies),
        each = CStudioAuthoring.Utils.each,
        itemsData,
        depController;
    $ = jQuery;

    Base.extend('Dependencies', {

        events: ['submitStart','submitComplete','submitEnd'],
        actions: ['.close-button', '.submit-button'],
        startup: ['itemsEventsDelegation'],

        itemsEventsDelegation: itemsEventsDelegation,

        loadItems: loadItems,

        renderItems: renderItems,

        closeButtonActionClicked: closeButtonClicked
    });

    function closeButtonClicked() {
        this.end();
    }

    function itemsEventsDelegation() {
        depController = this;

        $('.studio-view').on('change', '.dependencies-option', function() {
            loadItems(itemsData, $(this).val());
        });

    }

    function loadItems(data, dependenciesSelection) {
        itemsData = data;

        var me = this,
            data = CStudioAuthoring.Utils.createContentItemsJson(data),
            callback = {
                success: function(oResponse) {
                    var respJson = oResponse.responseText;
                    try {
                        var elements = eval("(" + respJson + ")");
                        depController.renderItems(elements.items);
                        //enable submit button after loading items;
                        verifyMixedSchedules(elements.items);

                    } catch(err) {
                        var error = err;
                    }
                },
                failure: function(oResponse) {

                }
            },
            select = $('.dependencies-option');

        select.val(dependenciesSelection);
        CStudioAuthoring.Service.loadItems(callback, data);
    }

    function traverse (items, referenceDate) {
        var allHaveSameDate = true,
            item, children;

        for ( var i = 0, l = items.length;
              allHaveSameDate === true && i < l;
              ++i ) {

            item = items[i];
            children = item.children;

            allHaveSameDate = (item.scheduledDate === referenceDate);

            if (!allHaveSameDate) {
                break;
            }
            /*
             if (children.length > 0) {
             allHaveSameDate = traverse(children, referenceDate);
             }

             */
        }

        return allHaveSameDate;

    }
    function verifyMixedSchedules(contentItems) {

        var reference = contentItems[0].scheduledDate,
            allHaveSameDate = traverse(contentItems, reference);

        if (allHaveSameDate) {
            if ((reference === '' || reference === null) && !ApproveType) {
                //YDom.get('globalSetToNow').checked = true;
                this.$('[name="schedulingMode"]')[0].checked = true;
                this.$('[name="schedulingMode"]')[1].checked = false;
                this.$('.date-picker-control').hide();
                this.$('.date-picker-control').value = "";
            } else {
                this.$('[name="schedulingMode"]')[0].checked = false;
                this.$('[name="schedulingMode"]')[1].checked = true;
                this.$('#approveSubmit').prop('disabled', true);
                this.$('#approveSubmitVal').hide();

                this.$('.date-picker-control').show();
                this.$('input.date-picker')[0].value = getScheduledDateTimeFromJson(reference);
            }
        } else {
            this.$('[name="schedulingMode"]')[0].checked = false;
            this.$('[name="schedulingMode"]')[1].checked = true;
        }


    }

    function renderItems(items) {

        //TODO: get data as needed - each element in items has all the item data

        var html = [],
            me = this,
            $container = $(this.getComponent('tbody'));

        $container.empty();

        each(items, function (index, item) {
            var temp = item.scheduledDate,
                itemDependenciesClass = "toggle-deps-" + index,
                internalName = item.internalName;

            item.scheduledDate = CStudioAuthoring.Utils.formatDateFromString(temp);
            item.index = itemDependenciesClass;
            var $parentRow = $(agent.get('ITEM_ROW', item));
            if(index == 0) $container.empty();
            // $container.append($parentRow);
            item.scheduledDate = temp;

            var $nameEl = $(me.getComponent('.view-caption .show-for-item'));
            $nameEl.text(internalName);
            $nameEl.addClass(CStudioAuthoring.Utils.getIconFWClasses(item));

            //get dependencies or depends on - according to dropdown selection

            var optionSelected = $(me.getComponent('.dependencies-option')).val();

            var depsCallback = {
                success: function(response){
                    var item = JSON.parse(response.responseText);

                    $.each(item, function(index, dependency){
                        var elem = {};
                        elem.uri = dependency.uri;
                        elem.internalName = dependency.internalName;
                        elem.scheduledDate = '';
                        elem.index = itemDependenciesClass;

                        if (dependency.uri.indexOf(".ftl") == -1
                            && dependency.uri.indexOf(".css") == -1
                            && dependency.uri.indexOf(".js") == -1
                            && dependency.uri.indexOf(".groovy") == -1
                            && dependency.uri.indexOf(".txt") == -1
                            && dependency.uri.indexOf(".html") == -1
                            && dependency.uri.indexOf(".hbs") == -1
                            && dependency.uri.indexOf(".xml") == -1) {
                            // editLink.hide();
                            elem.hidden = "hidden";
                        }

                        var row = agent.get('SUBITEM_ROW', elem);
                        // var editLink = $(row).find('.editLink');
                        row = $container.append(row);

                    });

                    $('.editLink').on('click', function() {
                        var url = $(this).attr('data-url');

                        CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, url, {
                            success: function (results) {

                                var isUserAllowed = CStudioAuthoring.Service.isUserAllowed(results.permissions);

                                if (isUserAllowed) {
                                    //add event
                                    var itemUrl = url;

                                    var getContentCallback = {
                                        success: function (contentTO) {
                                            var contentTO = contentTO.item;

                                            CStudioAuthoring.Operations.editContent(
                                                contentTO.form,
                                                CStudioAuthoringContext.siteId,
                                                contentTO.uri,
                                                contentTO.nodeRef,
                                                contentTO.uri,
                                                false,
                                                {});                ///TODO: complete

                                            setTimeout(function(){
                                                $('.studio-ice-dialog').last().css('z-index', 100103);
                                            }, 1000);
                                        },

                                        failure: function () {
                                            WcmDashboardWidgetCommon.Ajax.enableDashboard();
                                        }
                                    };

                                    CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, itemUrl, getContentCallback, false, false);
                                }
                            },
                            failure: function () {
                                throw new Error('Unable to retrieve user permissions');
                            }
                        });
                    });
                }
            }

            if(optionSelected == 'depends-on'){
                CStudioAuthoring.Service.loadDependantItems(
                    CStudioAuthoringContext.site,
                    item.uri,
                    depsCallback
                );
            }else{
                CStudioAuthoring.Service.loadDependencies(
                    CStudioAuthoringContext.site,
                    item.uri,
                    depsCallback
                );
            }

        });

        $('.toggleDependencies').on('click', function(){
            var $container = $(me.getComponent('tbody')),
                parentId = $(this).attr('id'),
                $childItems = $container.find("." + parentId);

            if($(this).attr('class') == "ttClose parent-div-widget"){
                $childItems.hide();
                $(this).attr('class', 'ttOpen parent-div-widget');
            }else{
                $childItems.show();
                $(this).attr('class', 'ttClose parent-div-widget');
            }
        })

    }

    function getScheduledDateTimeFromJson(dateTimeStr) {
        var dateTimeTokens = dateTimeStr.split('T');
        var dateTokens = dateTimeTokens[0].split('-');
        var timeTokens = dateTimeTokens[1].split(':');
        var dateTime = new Date(dateTokens[0], dateTokens[1]-1, dateTokens[2], timeTokens[0], timeTokens[1]);

        var hrs = ((dateTime.getHours() %12) ? dateTime.getHours() % 12 : 12);
        var mnts = dateTime.getMinutes();

        return '' + dateTokens[1] + '/' + dateTokens[2] + '/' + dateTokens[0] + ' '
            + (hrs < 10 ? '0' + hrs : hrs) + ':' + (mnts < 10 ? '0' + mnts : mnts) + (dateTime.getHours() < 12 ? ' am' : ' pm');
    }

}) (CStudioAuthoring);
