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

import React from 'react';
import CrafterCMSNextBridge from './CrafterCMSNextBridge';

import DependencySelection from './DependecySelection';

function App() {
  return (
    <CrafterCMSNextBridge>
      <DependencySelection  
        result={{}}
        siteId={'editorial'}
        items={
          [
            {"name":"index.xml","internalName":"Home","contentType":"/page/home","uri":"/site/website/index.xml","path":"/site/website","browserUri":"","navigation":false,"floating":true,"hideInAuthoring":false,"previewable":true,"lockOwner":"","user":"admin","userFirstName":"admin","userLastName":"","nodeRef":null,"metaDescription":null,"site":"editorial","page":true,"component":false,"document":false,"asset":false,"isContainer":false,"container":false,"disabled":false,"savedAsDraft":false,"submitted":false,"submittedForDeletion":false,"scheduled":false,"published":false,"deleted":false,"inProgress":true,"live":false,"inFlight":false,"isDisabled":false,"isSavedAsDraft":false,"isInProgress":true,"isLive":false,"isSubmittedForDeletion":false,"isScheduled":false,"isPublished":false,"isNavigation":false,"isDeleted":false,"isNew":false,"isSubmitted":false,"isFloating":false,"isPage":true,"isPreviewable":true,"isComponent":false,"isDocument":false,"isAsset":false,"isInFlight":false,"eventDate":"2019-08-12T22:37:11Z","endpoint":null,"timezone":null,"numOfChildren":0,"scheduledDate":null,"publishedDate":null,"mandatoryParent":null,"isLevelDescriptor":false,"categoryRoot":null,"lastEditDate":"2019-08-12T22:37:11Z","form":"/page/home","formPagePath":"simple","renderingTemplates":[{"uri":"/templates/web/pages/home.ftl","name":"DEFAULT"}],"folder":false,"submissionComment":null,"components":null,"documents":null,"levelDescriptors":null,"pages":null,"parentPath":null,"orders":[{"name":null,"id":"default","disabled":null,"order":-1,"placeInNav":null}],"children":[],"size":0,"sizeUnit":null,"mimeType":"application/xml","environment":null,"submittedToEnvironment":null,"packageId":null,"reference":false,"new":false,"newFile":false,"levelDescriptor":false},
            {"name":"index.xml","internalName":"Coffee is Good for Your Health","contentType":"/page/article","uri":"/site/website/articles/2016/6/coffee-is-good-for-your-health/index.xml","path":"/site/website/articles/2016/6/coffee-is-good-for-your-health","browserUri":"/articles/2016/6/coffee-is-good-for-your-health","navigation":false,"floating":true,"hideInAuthoring":false,"previewable":true,"lockOwner":"","user":"admin","userFirstName":"admin","userLastName":"","nodeRef":null,"metaDescription":null,"site":"editorial","page":true,"component":false,"document":false,"asset":false,"isContainer":false,"container":false,"disabled":false,"savedAsDraft":false,"submitted":false,"submittedForDeletion":false,"scheduled":false,"published":false,"deleted":false,"inProgress":true,"live":false,"inFlight":false,"isDisabled":false,"isSavedAsDraft":false,"isInProgress":true,"isLive":false,"isSubmittedForDeletion":false,"isScheduled":false,"isPublished":false,"isNavigation":false,"isDeleted":false,"isNew":false,"isSubmitted":false,"isFloating":false,"isPage":true,"isPreviewable":true,"isComponent":false,"isDocument":false,"isAsset":false,"isInFlight":false,"eventDate":"2019-08-09T23:04:53Z","endpoint":null,"timezone":null,"numOfChildren":0,"scheduledDate":null,"publishedDate":null,"mandatoryParent":null,"isLevelDescriptor":false,"categoryRoot":null,"lastEditDate":"2019-08-09T23:04:53Z","form":"/page/article","formPagePath":"simple","renderingTemplates":[{"uri":"/templates/web/pages/article.ftl","name":"DEFAULT"}],"folder":false,"submissionComment":null,"components":null,"documents":null,"levelDescriptors":null,"pages":null,"parentPath":null,"orders":[],"children":[],"size":0,"sizeUnit":null,"mimeType":"application/xml","environment":null,"submittedToEnvironment":null,"packageId":null,"reference":false,"new":false,"newFile":false,"levelDescriptor":false}
          ]} />
    </CrafterCMSNextBridge>
  );
}

export default App;
