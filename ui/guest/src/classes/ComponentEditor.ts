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
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Markers } from './Markers';
import { debounceTime, throttleTime } from 'rxjs/operators';
import { Subject } from 'rxjs';

let cmpEditIds = 0;
const post = (...args: any[]) => void null;

export class ComponentEditor {

  static id = 0;

  $el;
  $marker;
  handlers;
  input$Sub;
  props;
  initialValue;

  terminated = false;

  constructor(props) {

    const { element, field, modelId } = props;
    this.props = props;

    if (field && ['text', 'html'].includes(field.type)) {

      const
        $el = $(element),
        $marker = Markers.highlightElement(element),
        input$ = new Subject(),
        handlers = {
          input: (e) => input$.next(e),
          blur: this.blurHandler.bind(this),
          keydown: this.keyDownHandler.bind(this)
        };

      this.$el = $el;
      this.handlers = handlers;
      this.$marker = $marker;
      this.initialValue = $el[field.type]();

      this.input$Sub = input$
        .pipe(debounceTime(200))
        .subscribe(() => {
          Markers.setZoneMarkerRect($marker, $el);
        });

      $marker.addClass('craftercms-zone-marker__editing-content');

      $el
        .attr('draggable', 'false')
        .removeAttr('draggable');

      input$
        .pipe(throttleTime(100))
        .subscribe(() => this.inputHandler);

      $el
        .attr('contenteditable', 'true')
        .on('keydown', handlers.keydown)
        .on('input', handlers.input)
        .on('blur', handlers.blur)
        .focus();

    } else {
      console.log('Don\'t know how to edit... yet. Only of type text.');
    }

  }

  blurHandler(e) {
    post({
      type: 'ALERT',
      payload: {
        message: 'Discard?',
        buttons: [
          { text: 'Yes', replyId: `componentEditor_${cmpEditIds++}` },
          { text: 'Cancel', replyId: `componentEditor_${cmpEditIds++}` }
        ],
      }
    });
  }

  inputHandler(e) {

  }

  keyDownHandler(e) {
    if (e.keyCode === 27) {
      const { props, $el } = this;
      this.cancelEdit();
      props.onCancel && props.onCancel({
        prev: this.initialValue,
        current: $el[props.field.type]()
      });
    }
  }

  cancelEdit() {
    if (this.terminated) {
      return;
    }
    this.terminated = true;
    this.$marker.remove();
    this.input$Sub.unsubscribe();
    this.$el
      .unbind('blur', this.handlers.blur)
      .unbind('input', this.handlers.input)
      .unbind('keydown', this.handlers.keydown)
      .removeAttr('contenteditable');
    // To avoid the click outside blur to immediately jump to editing
    // another zone, delay the disabling of editing content mode
    // setTimeout(() => editingContent$.next(false), 50);
    // editingContent$.next(false);
  }

}
