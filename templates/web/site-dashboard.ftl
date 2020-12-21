<!--
  ~ Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
  ~
  ~ This program is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU General Public License version 3 as published by
  ~ the Free Software Foundation.
  ~
  ~ This program is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ~ GNU General Public License for more details.
  ~
  ~ You should have received a copy of the GNU General Public License
  ~ along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <script>
    window.IS_LEGACY_TOP_WINDOW = true;
  </script>
  <title>${contentModel['internal-name']} - ${contentModel['common-title']!''}</title>

  <#include "/templates/web/common/page-fragments/head.ftl" />

  <#assign path="/studio/static-assets/components/cstudio-common/resources/" />
  <script src="${path}en/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}kr/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}es/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}de/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

  <#assign path="/studio/static-assets/components/cstudio-dashboard-widgets/" />
  <script src="${path}lib/wcm-dashboardwidget-common.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}go-live-queue.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}recently-made-live.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}my-recent-activity.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}my-notifications.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}icon-guide.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}approved-scheduled-items.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

  <#assign path="/studio/static-assets/libs/" />
  <script src="${path}momentjs/moment.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}momentjs/moment-timezone-with-data-2012-2022.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

  <#include "/templates/web/common/page-fragments/studio-context.ftl" />
  <#include "/templates/web/common/page-fragments/context-nav.ftl" />
  <script>CStudioAuthoringContext.isDashboard = true;</script>

  <script>
    var
      CMgs = CStudioAuthoring.Messages,
      langBundle = CMgs.getBundle('siteDashboard', CStudioAuthoringContext.lang),
      formsLangBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);
    siteDropdownLangBundle = CMgs.getBundle('siteDropdown', CStudioAuthoringContext.lang);
  </script>

  <script>window.entitlementValidator = '${applicationContext.get("crafter.entitlementValidator").getDescription()}';</script>

  <script src="/studio/static-assets/libs/amplify/lib/amplify.core.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/js-cache/cache.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/scripts/animator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

</head>

<#if RequestParameters.mode?? && RequestParameters.mode == "embedded">
  <#assign embedded = true />
<#else>
  <#assign embedded = false />
</#if>
<body class="site-dashboard-body <#if embedded>embedded</#if>">

<section class="site-dashboard" style="visibility: hidden">
  <div class="container">

    <div id="GoLiveQueue" class="panel panel-default">
      <div class="panel-heading">
        <div
          id="section-widget-GoLiveQueue" class="studio-section-widget"
          onclick="return WcmDashboardWidgetCommon.toggleTable('GoLiveQueue');"
        ></div>
        <h2 class="panel-title">
          <span></span> (<span class="cstudio-dash-totalcount" id="GoLiveQueue-total-count"></span>)
        </h2>
        <ul class="widget-controls">
          <li>
            <button
              id="expand-all-GoLiveQueue" class="btn btn-default btn-sm"
              onclick="return WcmDashboardWidgetCommon.toggleAllItems('GoLiveQueue');"
            ></button>
          </li>
        </ul>
      </div>
      <div id="sortedBy-GoLiveQueue" style="display:none"></div>
      <div id="sort-type-GoLiveQueue" style="display:none"></div>
      <div id="GoLiveQueue-body" style="display:none"></div>
    </div>

    <div id="approvedScheduledItems" class="panel panel-default">
      <div class="panel-heading">
        <div
                id="section-widget-approvedScheduledItems" class="studio-section-widget"
                onclick="return WcmDashboardWidgetCommon.toggleTable('approvedScheduledItems');"
        ></div>
        <h2 class="panel-title">
          <span></span> (<span
                  class="cstudio-dash-totalcount" id="approvedScheduledItems-total-count"
          ></span>)
        </h2>
        <ul class="widget-controls">
          <li>
            <button
                    id="expand-all-approvedScheduledItems" class="btn btn-default btn-sm"
                    onclick="return WcmDashboardWidgetCommon.toggleAllItems('approvedScheduledItems');"
            ></button>
          </li>
        </ul>
      </div>
      <div id="sortedBy-approvedScheduledItems" style="display:none"></div>
      <div id="sort-type-approvedScheduledItems" style="display:none"></div>
      <div id="approvedScheduledItems-body" style="display:none"></div>
    </div>

    <div id="recentlyMadeLive" class="panel panel-default">
      <div class="panel-heading">
        <div
          id="section-widget-recentlyMadeLive" class="studio-section-widget"
          onclick="return WcmDashboardWidgetCommon.toggleTable('recentlyMadeLive');"
        ></div>
        <h2 class="panel-title">
          <span></span>
        </h2>
        <ul class="widget-controls">
          <li class="form-inline">
            <div class="input-group">
              <label
                id="widget-showitems-recentlyMadeLive-label"
                for="widget-showitems-recentlyMadeLive" class="input-group-addon"
              >Show</label>
              <input
                id="widget-showitems-recentlyMadeLive" type="text" maxlength="3" value="10"
                class="form-control input-sm"
              />
            </div>
          </li>
          <li>
            <button
              id="expand-all-recentlyMadeLive" class="btn btn-default btn-sm"
              onclick="return WcmDashboardWidgetCommon.toggleAllItems('recentlyMadeLive');"
            ></button>
          </li>
        </ul>
      </div>
      <div id="sortedBy-recentlyMadeLive" style="display:none"></div>
      <div id="sort-type-recentlyMadeLive" style="display:none"></div>
      <div id="recentlyMadeLive-body" style="display:none"></div>
    </div>

    <div id="MyRecentActivity" class="panel panel-default">
      <div class="panel-heading">
        <div
          id="section-widget-MyRecentActivity" class="studio-section-widget"
          onclick="return WcmDashboardWidgetCommon.toggleTable('MyRecentActivity');"
        ></div>
        <h2 class="panel-title">
          <span></span> (<span
              class="cstudio-dash-totalcount" id="MyRecentActivity-total-count"
          ></span>)
        </h2>
        <ul class="widget-controls">
          <li class="form-inline">
            <div class="input-group">
              <label
                id="widget-showitems-MyRecentActivity-label"
                for="widget-showitems-MyRecentActivity" class="input-group-addon"
              >Show</label>
              <input
                type="text" id="widget-showitems-MyRecentActivity" maxlength="3" value="10"
                class="form-control input-sm"
              />
            </div>
          </li>
        </ul>
      </div>
      <div id="MyRecentActivity-body" style="display:none"></div>
      <div id="sortedBy-MyRecentActivity" style="display:none"></div>
      <div id="sort-type-MyRecentActivity" style="display:none"></div>
    </div>

    <div id="iconGuide" class="panel panel-default">
      <div class="panel-heading">
        <h2 class="panel-title">
          <span></span>
        </h2>
      </div>
      <div class="panel-body">
        <#assign classes="col-xs-6 col-sm-4 col-md-3 mb10" />
        <div class="row workflow-states">
          <div class="col-md-12 title">
            <p id="workflow-states-text" style="color: #7e9dbb; margin-bottom: 15px;"></p>
          </div>

          <div class="${classes} guide-neverpublished">
            <#-- Never Published -->
            <div class="iconName">
              <span id="guide-neverpublished" class="fa mr5"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideStateNew');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-edited">
            <#-- Edited -->
            <div class="iconName">
              <span id="guide-edited" class="fa mr5"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideStateInProgress');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-inworkflow">
            <#-- In Workflow-->
            <div class="iconName">
              <span id="guide-inworkflow" class="fa mr5"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideStateInWorkflow');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-scheduled">
            <#-- Scheduled -->
            <div class="iconName">
              <span id="guide-scheduled" class="fa mr5"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideStateScheduled');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-processing">
            <#-- Processing -->
            <div class="iconName">
              <span id="guide-processing" class="fa mr5"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideStateSystemProcessing');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-disabled">
            <#-- Disabled -->
            <div class="iconText" style="margin: 0 0 0 20px; padding: 2px 0 1px;">
              <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideStateDisabled');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-deleted">
            <#-- Deleted -->
            <div class="iconName">
              <span id="guide-deleted" class="fa mr5"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideStateDeleted');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-locked">
            <#-- Locked -->
            <div class="iconName">
              <span id="guide-locked" class="fa mr5"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideStateLocked');</script>
              </span>
            </div>
          </div>
        </div>

        <div class="row item-types">
          <div class="col-md-12 title">
            <p
                    id="item-types-text"
                    style="color: #7e9dbb; margin-top: 15px; margin-bottom: 15px;"
            ></p>
          </div>

          <div class="${classes} guide-navigation-page">
            <#-- Navigation Page -->
            <div class="iconName">
              <span class="fa fa-file mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideNavigationPage');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-floating-page">
            <#-- Floating Page -->
            <div class="iconName">
              <span class="fa fa-file-o mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideFloatingPage');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-component">
            <#-- Component -->
            <div class="iconName">
              <span class="fa fa-puzzle-piece mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideComponent');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-template-script">
            <#-- Template or Script -->
            <div class="iconName">
              <span class="fa fa-file-code-o mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideTemplateScript');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-taxonomy">
            <#-- Taxonomy -->
            <div class="iconName">
              <span class="fa fa-tags mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideTaxonomy');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-image">
            <#-- Image -->
            <div class="iconName">
              <span class="fa fa-file-image-o mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideImage');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-video">
            <#-- Video -->
            <div class="iconName">
              <span class="fa fa-file-video-o mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideVideo');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-css">
            <#-- CSS -->
            <div class="iconName">
              <span class="fa fa-css3 mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideCss');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-font">
            <#-- Font -->
            <div class="iconName">
              <span class="fa fa-font mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideFont');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-pdf">
            <#-- Pdf -->
            <div class="iconName">
              <span class="fa fa-file-pdf-o mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuidePdf');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-power-point">
            <#-- PowerPoint -->
            <div class="iconName">
              <span
                      class="fa fa-file-powerpoint-o mr5" style="color: #8fc6fd; font-size: 14px;"
              ></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuidePowerPoint');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-word">
            <#-- Word -->
            <div class="iconName">
              <span class="fa fa-file-word-o mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideWord');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-excel">
            <#-- Excel -->
            <div class="iconName">
              <span class="fa fa-file-excel-o mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideExcel');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-zip">
            <#-- Zip -->
            <div class="iconName">
              <span
                      class="fa fa-file-archive-o mr5" style="color: #8fc6fd; font-size: 14px;"
              ></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideZip');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-groovy">
            <#-- groovy -->
            <div class="iconName">
              <span class="fa fa-file-code-o mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideGroovy');</script>
              </span>
            </div>
          </div>
          <div class="${classes} guide-other-files">
            <#-- Other -->
            <div class="iconName">
              <span class="fa fa-file-text mr5" style="color: #8fc6fd; font-size: 14px;"></span>
              <span class="iconMess">
                <script>CStudioAuthoring.Messages.display(langBundle, 'dashletIconGuideOtherFiles');</script>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>
<script>
  (function (CStudioAuthoring) {

    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('siteDashboard', CStudioAuthoringContext.lang);
    var formsLangBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);
    var loc = CStudioAuthoring.Messages.format;

    document.querySelector('#GoLiveQueue .panel-title span').innerHTML = loc(langBundle, 'dashletGoLiveQueueTitle');
    document.querySelector('#approvedScheduledItems .panel-title span').innerHTML = loc(langBundle, 'dashletApprovedSchedTitle');
    document.querySelector('#recentlyMadeLive .panel-title span').innerHTML = loc(langBundle, 'dashletRecentDeployTitle');
    document.querySelector('#MyRecentActivity .panel-title span').innerHTML = loc(langBundle, 'dashletMyRecentActivityTitle');
    document.querySelector('#iconGuide .panel-title span').innerHTML = loc(langBundle, 'dashletIconGuideTitle');
    document.querySelector('.workflow-states .title p').innerHTML = loc(langBundle, 'dashletWorkflowStatesTitle');
    document.querySelector('.item-types .title p').innerHTML = loc(langBundle, 'dashletItemTypesTitle');

    document.querySelector('#expand-all-GoLiveQueue').innerHTML = loc(langBundle, 'dashletGoLiveCollapseAll');
    document.querySelector('#expand-all-recentlyMadeLive').innerHTML = loc(langBundle, 'dashletRecentDeployCollapseAll');
    document.querySelector('#expand-all-approvedScheduledItems').innerHTML = loc(langBundle, 'approvedScheduledCollapseAll');

    new CStudioAuthoringWidgets.GoLiveQueueDashboard('GoLiveQueue', 'site/rosie/dashboard');
    new CStudioAuthoringWidgets.ApprovedScheduledItemsDashboard('approvedScheduledItems', 'site/rosie/dashboard');
    new CStudioAuthoringWidgets.RecentlyMadeLiveDashboard('recentlyMadeLive', 'site/rosie/dashboard');
    new CStudioAuthoringWidgets.MyRecentActivityDashboard('MyRecentActivity', 'site/rosie/dashboard');
    new CStudioAuthoringWidgets.IconGuideDashboard('icon-guide', 'site/rosie/dashboard');

    const reveal = () => {
      document.querySelector('.site-dashboard').style.visibility = '';
    };

    try {
      CStudioAuthoring.Events.widgetScriptLoaded.subscribe(reveal);
    } catch {
      setTimeout(reveal, 1000);
    }

  })(CStudioAuthoring);
</script>

</body>
</html>


