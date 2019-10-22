import { defineMessages, MessageDescriptor } from 'react-intl';
import { intl } from '../components/CrafterCMSNextBridge';

export function translateElements(
  elements: Element[],
  messages: { [key: string]: MessageDescriptor },
  formats: any = {}
) {
  messages = Object.entries(messages)
    .reduce(
      (table: any, [key, descriptor]) => {
        table[descriptor.id] = descriptor;
        return table;
      },
      {}
    );
  elements.forEach((elem) => {
    const key = elem.getAttribute('data-i18n');
    if (key) {
      const message = intl.formatMessage(messages[key], formats);
      elem.innerHTML = (
        Array.isArray(message) ? message.join('') : message
      );
    }
  })
}

const approveDialogMessages = defineMessages({
  approveForPublish: {
    id: 'publishDialog.approveForPublish',
    defaultMessage: 'Approve for Publish'
  },
  differentPublishDateWarning: {
    id: 'publishDialog.differentPublishDateWarning',
    defaultMessage: '<strong>Warning</strong> The items you have selected for approval were submitted with different requested publish dates/times.'
  },
  publishingScheduleTitle: {
    id: 'publishDialog.publishingScheduleTitle',
    defaultMessage: 'Selected Item Scheduling'
  },
  introductoryText: {
    id: 'publishDialog.introductoryText',
    defaultMessage: 'Selected files will be published. Hard dependencies are automatically included. Soft dependencies are optional and you may choose which to include.'
  },
  submissionCommentFieldError: {
    id: 'publishDialog.submissionCommentFieldError',
    defaultMessage: 'Please write submission comment.'
  }
});

const deleteDialogMessages = defineMessages({
  submissionCommentFieldError: {
    id: 'deleteDialog.submissionCommentFieldError',
    defaultMessage: 'Please write submission comment.'
  }
});

const usersAdminMessages = defineMessages({
  maxLengthError: {
    id: 'usersAdmin.maxLengthError',
    defaultMessage: '{field} can\'t be longer than {size} characters'
  },
  userName: {
    id: 'usersAdmin.userName',
    defaultMessage: 'User Name'
  },
  firstName: {
    id: 'usersAdmin.firstName',
    defaultMessage: 'First Name'
  },
  lastName: {
    id: 'usersAdmin.lastName',
    defaultMessage: 'Last Name'

  }
});

const numericInputControlMessages = defineMessages({
  minimun: {
    id: 'numericInputControl.childContent',
    defaultMessage: 'Minimun'
  },
  maximun: {
    id: 'numericInputControl.maximun',
    defaultMessage: 'Maximun'
  }
});

const reposAdminMessages = defineMessages({
  pendingCommit: {
    id: 'reposAdmin.pendingCommit',
    defaultMessage: 'Repo contains files pending commit. See Repository status below for details.'
  },
});

const sharedContentDSMessages = defineMessages({
  sharedContent: {
    id: 'sharedContentDS.sharedContent',
    defaultMessage: 'Shared Content'
  },
});

const embeddedContentDSMessages = defineMessages({
  embeddedContent: {
    id: 'embeddedContentDS.embeddedContent',
    defaultMessage: 'Embedded Content'
  },
});

const childContentDSMessages = defineMessages({
  childContent: {
    id: 'childContentDS.childContent',
    defaultMessage: 'Child Content (Deprecated)'
  },
});

const contentTypesMessages = defineMessages({
  notice: {
    id: 'contentType.notice',
    defaultMessage: 'Notice'
  },
  contenTypeWarningMessage: {
    id: 'contentType.contenTypeWarningMessage',
    defaultMessage: 'Please note Child Content datasource is being phased out of Crafter CMS. For components that need to be shared across pages or components, please use Shared Content instead. For components that belong exclusively to this content object, please use Embedded Content.'
  },
  useSharedContent: {
    id: 'contentType.useSharedContent',
    defaultMessage: 'Use Shared Content'
  },
  useEmbeddedContent: {
    id: 'contentType.useEmbeddedContent',
    defaultMessage: 'Use Embedded Content'
  },
  useChildContent: {
    id: 'contentType.useChildContent',
    defaultMessage: 'Use Deprecated Control Anyway'
  },
  fileNameErrorMessage: {
    id: 'contentType.fileNameErrorMessage',
    defaultMessage: 'Content types require a file name. Please add either a "File Name" or "Auto Filename" control to this content type definition.'
  }

});

export default {
  approveDialogMessages,
  deleteDialogMessages,
  reposAdminMessages,
  usersAdminMessages,
  numericInputControlMessages,
  sharedContentDSMessages,
  embeddedContentDSMessages,
  childContentDSMessages,
  contentTypesMessages
};
