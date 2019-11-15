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

//TODO : REMOVE imports
import RequestPublishDialog from "../modules/Content/Submit/RequestPublishDialog";
import { Item } from '../models/Item';

function App() {
  const items: Item[] = [{"name":"index.xml","internalName":"Test","contentType":"/page/test","uri":"/site/website/test/index.xml","path":"/site/website/test","browserUri":"/test","navigation":false,"floating":true,"hideInAuthoring":false,"previewable":true,"lockOwner":"","user":"admin","userFirstName":"admin","userLastName":"","nodeRef":null,"metaDescription":null,"site":"editorial","page":true,"component":false,"document":false,"asset":false,"isContainer":false,"container":false,"disabled":false,"savedAsDraft":false,"submitted":false,"submittedForDeletion":false,"scheduled":false,"published":false,"deleted":false,"inProgress":true,"live":false,"inFlight":false,"isDisabled":false,"isSavedAsDraft":false,"isInProgress":true,"isLive":false,"isSubmittedForDeletion":false,"isScheduled":false,"isPublished":false,"isNavigation":false,"isDeleted":false,"isNew":true,"isSubmitted":false,"isFloating":false,"isPage":true,"isPreviewable":true,"isComponent":false,"isDocument":false,"isAsset":false,"isInFlight":false,"eventDate":"2019-11-11T15:39:57Z","endpoint":null,"timezone":null,"numOfChildren":0,"scheduledDate":null,"publishedDate":null,"mandatoryParent":null,"isLevelDescriptor":false,"categoryRoot":null,"lastEditDate":"2019-11-11T15:39:57Z","form":"/page/test","formPagePath":"simple","renderingTemplates":[{"uri":"","name":"DEFAULT"}],"folder":false,"submissionComment":null,"components":null,"documents":null,"levelDescriptors":null,"pages":null,"parentPath":null,"orders":[{"id":"default","order":-1,"name":null,"disabled":null,"placeInNav":null}],"children":[],"size":0,"sizeUnit":null,"mimeType":"application/xml","environment":null,"submittedToEnvironment":null,"packageId":null,"levelDescriptor":false,"new":true,"newFile":false,"reference":false},{"name":"index.xml","internalName":"Home","contentType":"/page/home","uri":"/site/website/index.xml","path":"/site/website","browserUri":"","navigation":false,"floating":true,"hideInAuthoring":false,"previewable":true,"lockOwner":"","user":"admin","userFirstName":"admin","userLastName":"","nodeRef":null,"metaDescription":null,"site":"editorial","page":true,"component":false,"document":false,"asset":false,"isContainer":false,"container":false,"disabled":false,"savedAsDraft":false,"submitted":false,"submittedForDeletion":false,"scheduled":false,"published":false,"deleted":false,"inProgress":true,"live":false,"inFlight":false,"isDisabled":false,"isSavedAsDraft":false,"isInProgress":true,"isLive":false,"isSubmittedForDeletion":false,"isScheduled":false,"isPublished":false,"isNavigation":false,"isDeleted":false,"isNew":false,"isSubmitted":false,"isFloating":false,"isPage":true,"isPreviewable":true,"isComponent":false,"isDocument":false,"isAsset":false,"isInFlight":false,"eventDate":"2019-11-08T22:16:50Z","endpoint":null,"timezone":null,"numOfChildren":0,"scheduledDate":null,"publishedDate":null,"mandatoryParent":null,"isLevelDescriptor":false,"categoryRoot":null,"lastEditDate":"2019-11-08T22:16:50Z","form":"/page/home","formPagePath":"simple","renderingTemplates":[{"uri":"/templates/web/pages/home.ftl","name":"DEFAULT"}],"folder":false,"submissionComment":null,"components":null,"documents":null,"levelDescriptors":null,"pages":null,"parentPath":null,"orders":[{"id":"default","order":-1,"name":null,"disabled":null,"placeInNav":null}],"children":[],"size":0,"sizeUnit":null,"mimeType":"application/xml","environment":null,"submittedToEnvironment":null,"packageId":null,"levelDescriptor":false,"new":false,"newFile":false,"reference":false}];

  return (
    <CrafterCMSNextBridge>
      Hello World!

      <RequestPublishDialog onClose={ function() { console.log('closed') } } items={items} siteId={'editorial'}/>
    </CrafterCMSNextBridge>
  );
}

export default App;
