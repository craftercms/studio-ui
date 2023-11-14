/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

// npm:slugify@1.6.5
// Stripped out the umd, only copied in the factory function and using it as an iife.
var slugify = (function () {
  var charMap = JSON.parse(
    '{"$":"dollar","%":"percent","&":"and","<":"less",">":"greater","|":"or","¢":"cent","£":"pound","¤":"currency","¥":"yen","©":"(c)","ª":"a","®":"(r)","º":"o","À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","Æ":"AE","Ç":"C","È":"E","É":"E","Ê":"E","Ë":"E","Ì":"I","Í":"I","Î":"I","Ï":"I","Ð":"D","Ñ":"N","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","Ù":"U","Ú":"U","Û":"U","Ü":"U","Ý":"Y","Þ":"TH","ß":"ss","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","æ":"ae","ç":"c","è":"e","é":"e","ê":"e","ë":"e","ì":"i","í":"i","î":"i","ï":"i","ð":"d","ñ":"n","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","ù":"u","ú":"u","û":"u","ü":"u","ý":"y","þ":"th","ÿ":"y","Ā":"A","ā":"a","Ă":"A","ă":"a","Ą":"A","ą":"a","Ć":"C","ć":"c","Č":"C","č":"c","Ď":"D","ď":"d","Đ":"DJ","đ":"dj","Ē":"E","ē":"e","Ė":"E","ė":"e","Ę":"e","ę":"e","Ě":"E","ě":"e","Ğ":"G","ğ":"g","Ģ":"G","ģ":"g","Ĩ":"I","ĩ":"i","Ī":"i","ī":"i","Į":"I","į":"i","İ":"I","ı":"i","Ķ":"k","ķ":"k","Ļ":"L","ļ":"l","Ľ":"L","ľ":"l","Ł":"L","ł":"l","Ń":"N","ń":"n","Ņ":"N","ņ":"n","Ň":"N","ň":"n","Ō":"O","ō":"o","Ő":"O","ő":"o","Œ":"OE","œ":"oe","Ŕ":"R","ŕ":"r","Ř":"R","ř":"r","Ś":"S","ś":"s","Ş":"S","ş":"s","Š":"S","š":"s","Ţ":"T","ţ":"t","Ť":"T","ť":"t","Ũ":"U","ũ":"u","Ū":"u","ū":"u","Ů":"U","ů":"u","Ű":"U","ű":"u","Ų":"U","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","ź":"z","Ż":"Z","ż":"z","Ž":"Z","ž":"z","Ə":"E","ƒ":"f","Ơ":"O","ơ":"o","Ư":"U","ư":"u","ǈ":"LJ","ǉ":"lj","ǋ":"NJ","ǌ":"nj","Ș":"S","ș":"s","Ț":"T","ț":"t","ə":"e","˚":"o","Ά":"A","Έ":"E","Ή":"H","Ί":"I","Ό":"O","Ύ":"Y","Ώ":"W","ΐ":"i","Α":"A","Β":"B","Γ":"G","Δ":"D","Ε":"E","Ζ":"Z","Η":"H","Θ":"8","Ι":"I","Κ":"K","Λ":"L","Μ":"M","Ν":"N","Ξ":"3","Ο":"O","Π":"P","Ρ":"R","Σ":"S","Τ":"T","Υ":"Y","Φ":"F","Χ":"X","Ψ":"PS","Ω":"W","Ϊ":"I","Ϋ":"Y","ά":"a","έ":"e","ή":"h","ί":"i","ΰ":"y","α":"a","β":"b","γ":"g","δ":"d","ε":"e","ζ":"z","η":"h","θ":"8","ι":"i","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"3","ο":"o","π":"p","ρ":"r","ς":"s","σ":"s","τ":"t","υ":"y","φ":"f","χ":"x","ψ":"ps","ω":"w","ϊ":"i","ϋ":"y","ό":"o","ύ":"y","ώ":"w","Ё":"Yo","Ђ":"DJ","Є":"Ye","І":"I","Ї":"Yi","Ј":"J","Љ":"LJ","Њ":"NJ","Ћ":"C","Џ":"DZ","А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ж":"Zh","З":"Z","И":"I","Й":"J","К":"K","Л":"L","М":"M","Н":"N","О":"O","П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"Ch","Ш":"Sh","Щ":"Sh","Ъ":"U","Ы":"Y","Ь":"","Э":"E","Ю":"Yu","Я":"Ya","а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ж":"zh","з":"z","и":"i","й":"j","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sh","ъ":"u","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","ё":"yo","ђ":"dj","є":"ye","і":"i","ї":"yi","ј":"j","љ":"lj","њ":"nj","ћ":"c","ѝ":"u","џ":"dz","Ґ":"G","ґ":"g","Ғ":"GH","ғ":"gh","Қ":"KH","қ":"kh","Ң":"NG","ң":"ng","Ү":"UE","ү":"ue","Ұ":"U","ұ":"u","Һ":"H","һ":"h","Ә":"AE","ә":"ae","Ө":"OE","ө":"oe","Ա":"A","Բ":"B","Գ":"G","Դ":"D","Ե":"E","Զ":"Z","Է":"E\'","Ը":"Y\'","Թ":"T\'","Ժ":"JH","Ի":"I","Լ":"L","Խ":"X","Ծ":"C\'","Կ":"K","Հ":"H","Ձ":"D\'","Ղ":"GH","Ճ":"TW","Մ":"M","Յ":"Y","Ն":"N","Շ":"SH","Չ":"CH","Պ":"P","Ջ":"J","Ռ":"R\'","Ս":"S","Վ":"V","Տ":"T","Ր":"R","Ց":"C","Փ":"P\'","Ք":"Q\'","Օ":"O\'\'","Ֆ":"F","և":"EV","ء":"a","آ":"aa","أ":"a","ؤ":"u","إ":"i","ئ":"e","ا":"a","ب":"b","ة":"h","ت":"t","ث":"th","ج":"j","ح":"h","خ":"kh","د":"d","ذ":"th","ر":"r","ز":"z","س":"s","ش":"sh","ص":"s","ض":"dh","ط":"t","ظ":"z","ع":"a","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ى":"a","ي":"y","ً":"an","ٌ":"on","ٍ":"en","َ":"a","ُ":"u","ِ":"e","ْ":"","٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","پ":"p","چ":"ch","ژ":"zh","ک":"k","گ":"g","ی":"y","۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","฿":"baht","ა":"a","ბ":"b","გ":"g","დ":"d","ე":"e","ვ":"v","ზ":"z","თ":"t","ი":"i","კ":"k","ლ":"l","მ":"m","ნ":"n","ო":"o","პ":"p","ჟ":"zh","რ":"r","ს":"s","ტ":"t","უ":"u","ფ":"f","ქ":"k","ღ":"gh","ყ":"q","შ":"sh","ჩ":"ch","ც":"ts","ძ":"dz","წ":"ts","ჭ":"ch","ხ":"kh","ჯ":"j","ჰ":"h","Ṣ":"S","ṣ":"s","Ẁ":"W","ẁ":"w","Ẃ":"W","ẃ":"w","Ẅ":"W","ẅ":"w","ẞ":"SS","Ạ":"A","ạ":"a","Ả":"A","ả":"a","Ấ":"A","ấ":"a","Ầ":"A","ầ":"a","Ẩ":"A","ẩ":"a","Ẫ":"A","ẫ":"a","Ậ":"A","ậ":"a","Ắ":"A","ắ":"a","Ằ":"A","ằ":"a","Ẳ":"A","ẳ":"a","Ẵ":"A","ẵ":"a","Ặ":"A","ặ":"a","Ẹ":"E","ẹ":"e","Ẻ":"E","ẻ":"e","Ẽ":"E","ẽ":"e","Ế":"E","ế":"e","Ề":"E","ề":"e","Ể":"E","ể":"e","Ễ":"E","ễ":"e","Ệ":"E","ệ":"e","Ỉ":"I","ỉ":"i","Ị":"I","ị":"i","Ọ":"O","ọ":"o","Ỏ":"O","ỏ":"o","Ố":"O","ố":"o","Ồ":"O","ồ":"o","Ổ":"O","ổ":"o","Ỗ":"O","ỗ":"o","Ộ":"O","ộ":"o","Ớ":"O","ớ":"o","Ờ":"O","ờ":"o","Ở":"O","ở":"o","Ỡ":"O","ỡ":"o","Ợ":"O","ợ":"o","Ụ":"U","ụ":"u","Ủ":"U","ủ":"u","Ứ":"U","ứ":"u","Ừ":"U","ừ":"u","Ử":"U","ử":"u","Ữ":"U","ữ":"u","Ự":"U","ự":"u","Ỳ":"Y","ỳ":"y","Ỵ":"Y","ỵ":"y","Ỷ":"Y","ỷ":"y","Ỹ":"Y","ỹ":"y","–":"-","‘":"\'","’":"\'","“":"\\"","”":"\\"","„":"\\"","†":"+","•":"*","…":"...","₠":"ecu","₢":"cruzeiro","₣":"french franc","₤":"lira","₥":"mill","₦":"naira","₧":"peseta","₨":"rupee","₩":"won","₪":"new shequel","₫":"dong","€":"euro","₭":"kip","₮":"tugrik","₯":"drachma","₰":"penny","₱":"peso","₲":"guarani","₳":"austral","₴":"hryvnia","₵":"cedi","₸":"kazakhstani tenge","₹":"indian rupee","₺":"turkish lira","₽":"russian ruble","₿":"bitcoin","℠":"sm","™":"tm","∂":"d","∆":"delta","∑":"sum","∞":"infinity","♥":"love","元":"yuan","円":"yen","﷼":"rial","ﻵ":"laa","ﻷ":"laa","ﻹ":"lai","ﻻ":"la"}'
  );
  var locales = JSON.parse(
    '{"bg":{"Й":"Y","Ц":"Ts","Щ":"Sht","Ъ":"A","Ь":"Y","й":"y","ц":"ts","щ":"sht","ъ":"a","ь":"y"},"de":{"Ä":"AE","ä":"ae","Ö":"OE","ö":"oe","Ü":"UE","ü":"ue","ß":"ss","%":"prozent","&":"und","|":"oder","∑":"summe","∞":"unendlich","♥":"liebe"},"es":{"%":"por ciento","&":"y","<":"menor que",">":"mayor que","|":"o","¢":"centavos","£":"libras","¤":"moneda","₣":"francos","∑":"suma","∞":"infinito","♥":"amor"},"fr":{"%":"pourcent","&":"et","<":"plus petit",">":"plus grand","|":"ou","¢":"centime","£":"livre","¤":"devise","₣":"franc","∑":"somme","∞":"infini","♥":"amour"},"pt":{"%":"porcento","&":"e","<":"menor",">":"maior","|":"ou","¢":"centavo","∑":"soma","£":"libra","∞":"infinito","♥":"amor"},"uk":{"И":"Y","и":"y","Й":"Y","й":"y","Ц":"Ts","ц":"ts","Х":"Kh","х":"kh","Щ":"Shch","щ":"shch","Г":"H","г":"h"},"vi":{"Đ":"D","đ":"d"},"da":{"Ø":"OE","ø":"oe","Å":"AA","å":"aa","%":"procent","&":"og","|":"eller","$":"dollar","<":"mindre end",">":"større end"},"nb":{"&":"og","Å":"AA","Æ":"AE","Ø":"OE","å":"aa","æ":"ae","ø":"oe"},"it":{"&":"e"},"nl":{"&":"en"},"sv":{"&":"och","Å":"AA","Ä":"AE","Ö":"OE","å":"aa","ä":"ae","ö":"oe"}}'
  );

  function replace(string, options) {
    if (typeof string !== 'string') {
      throw new Error('slugify: string argument expected');
    }

    options = typeof options === 'string' ? { replacement: options } : options || {};

    var locale = locales[options.locale] || {};

    var replacement = options.replacement === undefined ? '-' : options.replacement;

    var trim = options.trim === undefined ? true : options.trim;

    var slug = string
      .normalize()
      .split('')
      // replace characters based on charMap
      .reduce(function (result, ch) {
        var appendChar = locale[ch] || charMap[ch] || ch;
        if (appendChar === replacement) {
          appendChar = ' ';
        }
        return (
          result +
          appendChar
            // remove not allowed characters
            .replace(options.remove || /[^\w\s$*_+~.()'"!\-:@]+/g, '')
        );
      }, '');

    if (options.strict) {
      slug = slug.replace(/[^A-Za-z0-9\s]/g, '');
    }

    if (trim) {
      slug = slug.trim();
    }

    // Replace spaces with replacement character, treating multiple consecutive
    // spaces as a single space.
    slug = slug.replace(/\s+/g, replacement);

    if (options.lower) {
      slug = slug.toLowerCase();
    }

    return slug;
  }

  replace.extend = function (customMap) {
    Object.assign(charMap, customMap);
  };

  return replace;
})();

CStudioForms.Controls.FileName =
  CStudioForms.Controls.FileName ||
  function (id, form, owner, properties, constraints, readonly, allowEditWithoutWarning) {
    this.owner = owner;
    this.owner.registerField(this);
    this.errors = [];
    this.properties = properties;
    this.constraints = constraints;
    this.inputEl = null;
    this.countEl = null;
    this.required = true;
    this.value = '_not-set';
    this.form = form;
    this.id = 'file-name';
    this.contentAsFolder = form.definition ? form.definition.contentAsFolder : null;
    this.readonly = readonly;
    this.allowEditWithoutWarning = allowEditWithoutWarning;
    this.defaultValue = '';
    this.showWarnOnEdit = true;
    this.messages = {
      fileNameControlMessages: CrafterCMSNext.i18n.messages.fileNameControlMessages
    };

    return this;
  };

YAHOO.extend(CStudioForms.Controls.FileName, CStudioForms.CStudioFormField, {
  getFixedId: function () {
    return 'file-name';
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'fileName');
  },

  getRequirementCount: function () {
    // 2 Requirement:
    // 1. The field is required
    // 2. The Path must be valid
    return 2;
  },

  getCurrentPath: function () {
    return this.form.path ? this.form.path : CStudioAuthoring.Utils.getQueryVariable(location.search, 'path');
  },

  isRootPath: function () {
    if (this.getCurrentPath() == '/site/website/index.xml') return true;
    return false;
  },

  _onChange: function (evt, obj) {
    var oldValue = obj.value;
    obj.value = obj.inputEl.value;
    if (obj.value != '' && oldValue != obj.value)
      // Just check if the value was changed
      obj.filenameAvailable();

    if (obj.required) {
      if (obj.inputEl.value == '' && !obj.isRootPath()) {
        obj.setError('required', 'Field is Required');
        obj.renderValidation(true, false);
      } else {
        obj.clearError('required');
        obj.renderValidation(true, true);
      }
    } else {
      obj.renderValidation(false, true);
    }

    obj.owner.notifyValidation();

    if (obj.contentAsFolder == true || obj.contentAsFolder == 'true') {
      obj.form.updateModel('file-name', 'index.xml');
      obj.form.updateModel('folder-name', obj.inputEl.value);
    } else {
      obj.form.updateModel('file-name', obj.inputEl.value + '.xml');
      obj.form.updateModel('folder-name', '');
    }
  },

  _onChangeVal: function (evt, obj) {
    obj.edited = true;
    obj._onChange(evt, obj);
  },

  /**
   * perform count calculation on keypress
   * @param evt event
   * @param el element
   */
  count: function (evt, countEl, el) {
    // 'this' is the input box
    el = el ? el : this;
    var text = el.value;

    var charCount = text.length ? text.length : el.textLength ? el.textLength : 0;
    var maxlength = el.maxlength && el.maxlength != '' ? el.maxlength : -1;

    if (maxlength != -1) {
      if (charCount > el.maxlength) {
        // truncate if exceeds max chars
        if (charCount > el.maxlength) {
          this.value = text.substr(0, el.maxlength);
          charCount = el.maxlength;
        }

        if (
          evt &&
          evt != null &&
          evt.keyCode != 8 &&
          evt.keyCode != 46 &&
          evt.keyCode != 37 &&
          evt.keyCode != 38 &&
          evt.keyCode != 39 &&
          evt.keyCode != 40 && // arrow keys
          evt.keyCode != 88 &&
          evt.keyCode != 86
        ) {
          // allow backspace and
          // delete key and arrow keys (37-40)
          // 86 -ctrl-v, 90-ctrl-z,
          if (evt) YAHOO.util.Event.stopEvent(evt);
        }
      }
    }

    if (maxlength != -1) {
      countEl.innerHTML = charCount + ' / ' + el.maxlength;
    } else {
      countEl.innerHTML = charCount;
    }
  },

  /**
   * don't allow characters which are invalid for file names and check length
   */
  processKey: function (evt, el) {
    var invalid = new RegExp('[.!@#$%^&*\\(\\)\\+=\\[\\]\\\\\\\'`;,\\/\\{\\}|":<>\\?~ ]', 'g');
    // Prevent the use of non english characters
    var nonEnglishChar = new RegExp('[^\x00-\x80]', 'g');
    var cursorPosition = el.selectionStart;
    // change url to lower case
    if (el.value != '' && el.value != el.value.toLowerCase()) {
      el.value = el.value.toLowerCase();
      if (cursorPosition && typeof cursorPosition == 'number') {
        el.selectionStart = cursorPosition;
        el.selectionEnd = cursorPosition;
      }
    }

    el.value = window
      .slugify(el.value, {
        lower: true,
        // Setting `strict: true` would disallow `_`, which we don't want.
        strict: false,
        // Because of the moment where the library trims, `trim: true` caused undesired replacement of `-`
        // at the beginning or end of the slug.
        trim: false
      })
      // Trim post-slugify to avoid undesired losses of hyphens at the beginning or end of slugs.
      .trim();

    var data = el.value;

    if (invalid.exec(data) != null) {
      el.value = data.replace(invalid, '-');
      YAHOO.util.Event.stopEvent(evt);
    }

    if (nonEnglishChar.exec(data) != null) {
      el.value = data.replace(nonEnglishChar, '-');
      YAHOO.util.Event.stopEvent(evt);
    }

    var maxlength = el.maxlength && el.maxlength != '' ? el.maxlength : -1;

    if (maxlength != -1 && data.length > maxlength) {
      data = data.substr(0, maxlength);
      el.value = data;
    }
  },

  /**
   * check availability on mouse out
   */
  filenameAvailable: function () {
    var newPath = '';
    var path = this.getCurrentPath();

    if (this.contentAsFolder == true || this.contentAsFolder == 'true') {
      newPath = this._getPath() + '/' + this.value + '/index.xml';
    } else {
      newPath = this._getPath() + '/' + this.value + '.xml';
    }

    newPath = newPath.replace('//', '/');

    var checkCb = {
      exists: function (exists) {
        if (exists == true) {
          this.obj.setError('exists', 'Path exists already');
          this.obj.renderValidation(true, false);
          YAHOO.util.Dom.addClass(this.obj.urlErrEl, 'on');
        } else {
          this.obj.clearError('exists');
          this.obj.renderValidation(true, true);
          YAHOO.util.Dom.removeClass(this.obj.urlErrEl, 'on');
        }
      },
      failure: function () {
        this.availableEl.style.display = 'none';
        this.availableEl.innerHTML = '';
      },
      obj: this
    };

    if (path != '' && path != newPath) {
      CStudioAuthoring.Service.contentExists(newPath, checkCb);
    } else {
      YAHOO.util.Dom.removeClass(this.urlErrEl, 'on');
      this.clearError('exists');
      this.renderValidation(true, true);
    }
  },

  // Dynamically adjust the input and the pathEl width according to the input's character count
  adjustInputsWidth: function (inputEl, pathEl) {
    const newLength = inputEl.value.length > 0 ? inputEl.value.length : 1;
    inputEl.style.width = `${newLength}ch`;

    pathEl.style.maxWidth = `calc(100% - ${newLength}ch)`;
  },

  render: function (config, containerEl) {
    // we need to make the general layout of a control inherit from common
    // you should be able to override it -- but most of the time it wil be the same
    containerEl.id = this.id;

    const self = this;

    var titleEl = document.createElement('span');

    YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
    titleEl.textContent = config.title;

    var controlWidgetContainerEl = document.createElement('div');
    YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-file-name-container');

    var validEl = document.createElement('span');
    YAHOO.util.Dom.addClass(validEl, 'validation-hint');
    YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');

    var path = this._getPath();
    path = path.replace(/^\/site\/website/, ''); // From Pages
    if (path.match(/^\/site\/components\//)) path = path.replace(/^\/site/, ''); // From Components
    path = path + '/';
    path = path.replace('//', '/');

    var pathEl = document.createElement('span');
    YAHOO.util.Dom.addClass(pathEl, 'input-path');
    pathEl.innerHTML = path + ' ';
    this.pathEl = pathEl;

    var inputContainer = document.createElement('div');
    YAHOO.util.Dom.addClass(inputContainer, 'cstudio-form-control-input-container no-wrap input-wrapper');
    inputContainer.appendChild(pathEl);
    this.inputContainer = inputContainer;
    controlWidgetContainerEl.appendChild(inputContainer);

    var inputEl = document.createElement('input');
    inputEl.setAttribute('autocomplete', 'off');
    inputEl.setAttribute('spellcheck', 'false');
    inputEl.setAttribute('autocapitalize', 'none');
    this.inputEl = inputEl;
    YAHOO.util.Dom.addClass(inputEl, 'datum');
    YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-input');
    YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-file-name');

    inputEl.oninput = () => this.adjustInputsWidth(inputEl, pathEl);
    inputContainer.onclick = () => inputEl.focus();

    inputEl.id = 'studioFileName';
    inputContainer.appendChild(inputEl);

    this.defaultValue = config.defaultValue;

    var Event = YAHOO.util.Event,
      me = this;
    Event.on(
      inputEl,
      'click',
      function (evt, context) {
        context.form.setFocusedField(context);
      },
      this
    );
    Event.on(
      inputEl,
      'focus',
      function () {
        YAHOO.util.Dom.addClass(inputContainer, 'focused');
      },
      this
    );
    Event.on(inputEl, 'change', this._onChangeVal, this);
    Event.on(
      inputEl,
      'blur',
      function (evt, obj) {
        YAHOO.util.Dom.removeClass(inputContainer, 'focused');
        self._onChange(evt, obj);
      },
      this
    );
    Event.on(inputEl, 'input', this.processKey, inputEl);

    for (var i = 0; i < config.properties.length; i++) {
      var prop = config.properties[i];
      if (prop.name == 'maxlength') {
        inputEl.maxlength = prop.value;
      }

      if (prop.name == 'readonly' && prop.value == 'true') {
        this.readonly = true;
      }

      if (prop.name == 'allowEditWithoutWarning' && prop.value == 'true') {
        this.allowEditWithoutWarning = true;
      }
    }

    if (this.isRootPath() || this.readonly == true) {
      inputEl.disabled = true;
    }

    var urlErrEl = document.createElement('div');
    urlErrEl.innerHTML = 'URL is NOT available';
    YAHOO.util.Dom.addClass(urlErrEl, 'cstudio-form-control-input-url-err');
    controlWidgetContainerEl.appendChild(urlErrEl);
    this.urlErrEl = urlErrEl;

    var countEl = document.createElement('div');
    YAHOO.util.Dom.addClass(countEl, 'char-count');
    YAHOO.util.Dom.addClass(countEl, 'cstudio-form-control-input-count');
    controlWidgetContainerEl.appendChild(countEl);
    this.countEl = countEl;

    YAHOO.util.Event.on(inputEl, 'keyup', this.count, countEl);
    YAHOO.util.Event.on(inputEl, 'mouseup', this.count, countEl);

    this.renderHelp(config, controlWidgetContainerEl);

    var descriptionEl = document.createElement('span');
    YAHOO.util.Dom.addClass(descriptionEl, 'description');
    YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
    descriptionEl.textContent = config.description;

    containerEl.appendChild(titleEl);
    containerEl.appendChild(validEl);
    if (!this.allowEditWithoutWarning) {
      this._renderEdit(containerEl);
    }
    containerEl.appendChild(controlWidgetContainerEl);
    containerEl.appendChild(descriptionEl);
  },

  _renderEdit: function (containerEl) {
    var _self = this;
    if (CStudioAuthoring.Utils.getQueryVariable(location.search, 'edit') && this.readonly == false) {
      var editFileNameEl = document.createElement('div');
      YAHOO.util.Dom.addClass(editFileNameEl, 'cstudio-form-control-filename-edit');
      var editFileNameBtn = document.createElement('input');
      editFileNameBtn.type = 'button';
      editFileNameBtn.value = 'Edit';
      editFileNameBtn.style.padding = '1px 5px';
      editFileNameBtn.style.minWidth = '0';
      editFileNameBtn.style.marginLeft = '5px';
      YAHOO.util.Dom.addClass(editFileNameBtn, 'btn btn-default btn-sm cstudio-button');
      editFileNameEl.appendChild(editFileNameBtn);
      containerEl.appendChild(editFileNameEl);

      this.inputEl.disabled = true;
      YAHOO.util.Dom.addClass(this.inputContainer, 'disabled');

      const onRenamed = (newName) => {
        _self.inputEl.value = _self._getValue(newName);
        _self.inputEl.title = _self.inputEl.value;
        _self._onChangeVal(null, _self);
        _self.adjustInputsWidth(_self.inputEl, _self.pathEl);
        // enable input
        _self.inputEl.disabled = false;
        _self.inputEl.focus();
        editFileNameEl.style.display = 'none';
      };

      const id = CStudioAuthoring.Utils.generateUUID();
      const { fromEvent, filter } = CrafterCMSNext.rxjs;
      fromEvent(window, 'message')
        .pipe(filter((event) => event.data && event.data.type))
        .subscribe((event) => {
          if (event.data.type === 'LEGACY_FORM_DIALOG_RENAMED_CONTENT' && event.data.id === id) {
            onRenamed(event.data.newName);
          }
        });

      YAHOO.util.Event.on(editFileNameBtn, 'click', function () {
        _self.form.setFocusedField(_self);
        if (_self.showWarnOnEdit) {
          const isPage = _self.form.model['file-name'] === 'index.xml';
          // example of fileName of a page: 'style/index.xml'
          // example of fileName of a non-page: 'left-rails-with-latest-articles.xml'
          const fileName = `${isPage ? `${_self.form.model['folder-name']}/` : ''}${_self.form.model['file-name']}`;
          const path = _self._getPath();
          window.top.postMessage({ type: 'LEGACY_FORM_DIALOG_RENAME_CONTENT', path, fileName, id }, '*');
          // There's a timemout in the forms-engine to set the focus on the first input element of the form, this avoids
          // the timeout code to execute if the rename dialog is opened before the timeout runs out.
          window.postMessage({ type: 'CLEAR_FORM_INPUT_FOCUS_TIMEOUT' }, '*');
        }
      });
    }
  },

  getValue: function () {
    return this.value;
  },

  setValue: function (value) {
    var path = this.getCurrentPath();
    if (value == '') {
      this.value = this.defaultValue;
      this.inputEl.value = this.defaultValue;
    } else {
      this.value = value;
      this.inputEl.value = this._getValue();
      if (this.inputEl.value == '' && !this.isRootPath() && this.defaultValue != '') {
        this.value = this.defaultValue;
        this.inputEl.value = this.defaultValue;
      }
    }
    this.inputEl.title = this.inputEl.value;
    this.count(null, this.countEl, this.inputEl);
    this._onChange(null, this);
    this.edited = false;
    this.adjustInputsWidth(this.inputEl, this.pathEl);
  },

  _getValue: function (path) {
    var value = '';
    var path = path ?? this.getCurrentPath();
    path = path.replace('/site/website', '');

    if (path.indexOf('.xml') != -1) {
      if (path.indexOf('/index.xml') != -1) {
        path = path.replace('/index.xml', '');

        var value = path.substring(path.lastIndexOf('/'));
        path = path.replace(value, '');

        if (path == '') {
          path = '/';
        }
        if (value.startsWith('/')) {
          value = value.substring(1);
        }
      } else {
        value = path.substring(path.lastIndexOf('/') + 1).replace('.xml', '');
      }
    } else {
      value = '';
    }

    return value;
  },

  _getPath: function () {
    var path = this.getCurrentPath();
    var hasXmlFile = path.indexOf('.xml') >= 0;

    if (this.contentAsFolder == true || '/component/level-descriptor' === this.form.id) {
      path = path.replace('/index.xml', '');
    }

    if (hasXmlFile) {
      var trimmedPath = path.substring(0, path.lastIndexOf('/'));
      if (trimmedPath != '/site') {
        path = trimmedPath;
      }
    }

    return path;
  },

  getName: function () {
    return 'file-name';
  },

  getSupportedProperties: function () {
    return [
      {
        label: CMgs.format(langBundle, 'maxLength'),
        name: 'maxlength',
        type: 'int',
        defaultValue: '50'
      },
      { label: CMgs.format(langBundle, 'readonly'), name: 'readonly', type: 'boolean' },
      { label: CMgs.format(langBundle, 'allowEditWithoutWarning'), name: 'allowEditWithoutWarning', type: 'boolean' }
    ];
  },

  getSupportedConstraints: function () {
    return [
      // required is assumed
    ];
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-file-name', CStudioForms.Controls.FileName);
