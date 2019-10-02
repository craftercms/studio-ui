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

export default {
  approveDialogMessages,
  deleteDialogMessages
};
