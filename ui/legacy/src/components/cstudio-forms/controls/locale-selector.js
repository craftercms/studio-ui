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

(function () {
  const languages = {
    af: 'Afrikaans',
    sq: 'Albanian',
    am: 'Amharic',
    ar_dz: 'Arabic - Algeria',
    ar_bh: 'Arabic - Bahrain',
    ar_eg: 'Arabic - Egypt',
    ar_iq: 'Arabic - Iraq',
    ar_jo: 'Arabic - Jordan',
    ar_kw: 'Arabic - Kuwait',
    ar_lb: 'Arabic - Lebanon',
    ar_ly: 'Arabic - Libya',
    ar_ma: 'Arabic - Morocco',
    ar_om: 'Arabic - Oman',
    ar_qa: 'Arabic - Qatar',
    ar_sa: 'Arabic - Saudi Arabia',
    ar_sy: 'Arabic - Syria',
    ar_tn: 'Arabic - Tunisia',
    ar_ae: 'Arabic - United Arab Emirates',
    ar_ye: 'Arabic - Yemen',
    hy: 'Armenian',
    as: 'Assamese',
    az_az: 'Azeri - Cyrillic',
    eu: 'Basque',
    be: 'Belarusian',
    bn: 'Bengali - Bangladesh',
    bs: 'Bosnian',
    bg: 'Bulgarian',
    my: 'Burmese',
    ca: 'Catalan',
    zh_cn: 'Chinese - China',
    zh_hk: 'Chinese - Hong Kong SAR',
    zh_mo: 'Chinese - Macau SAR',
    zh_sg: 'Chinese - Singapore',
    zh_tw: 'Chinese - Taiwan',
    hr: 'Croatian',
    cs: 'Czech',
    da: 'Danish',
    Maldivian: 'Divehi',
    nl_be: 'Dutch - Belgium',
    nl_nl: 'Dutch - Netherlands',
    en_au: 'English - Australia',
    en_bz: 'English - Belize',
    en_ca: 'English - Canada',
    en_cb: 'English - Caribbean',
    en_gb: 'English - Great Britain',
    en_in: 'English - India',
    en_ie: 'English - Ireland',
    en_jm: 'English - Jamaica',
    en_nz: 'English - New Zealand',
    en_ph: 'English - Philippines',
    en_za: 'English - Southern Africa',
    en_tt: 'English - Trinidad',
    en_us: 'English - United States',
    et: 'Estonian',
    mk: 'FYRO Macedonia',
    fo: 'Faroese',
    fa: 'Farsi - Persian',
    fi: 'Finnish',
    fr_be: 'French - Belgium',
    fr_ca: 'French - Canada',
    fr_fr: 'French - France',
    fr_lu: 'French - Luxembourg',
    fr_ch: 'French - Switzerland',
    gd_ie: 'Gaelic - Ireland',
    gd: 'Gaelic - Scotland',
    de_at: 'German - Austria',
    de_de: 'German - Germany',
    de_li: 'German - Liechtenstein',
    de_lu: 'German - Luxembourg',
    de_ch: 'German - Switzerland',
    el: 'Greek',
    gn: 'Guarani - Paraguay',
    gu: 'Gujarati',
    he: 'Hebrew',
    hi: 'Hindi',
    hu: 'Hungarian',
    is: 'Icelandic',
    id: 'Indonesian',
    it_it: 'Italian - Italy',
    it_ch: 'Italian - Switzerland',
    ja: 'Japanese',
    kn: 'Kannada',
    ks: 'Kashmiri',
    kk: 'Kazakh',
    km: 'Khmer',
    ko: 'Korean',
    lo: 'Lao',
    la: 'Latin',
    lv: 'Latvian',
    lt: 'Lithuanian',
    ms_bn: 'Malay - Brunei',
    ms_my: 'Malay - Malaysia',
    ml: 'Malayalam',
    mt: 'Maltese',
    mi: 'Maori',
    mr: 'Marathi',
    mn: 'Mongolian',
    ne: 'Nepali',
    no_no: 'Norwegian - Bokml',
    or: 'Oriya',
    pl: 'Polish',
    pt_br: 'Portuguese - Brazil',
    pt_pt: 'Portuguese - Portugal',
    pa: 'Punjabi',
    rm: 'Raeto-Romance',
    ro_mo: 'Romanian - Moldova',
    ro: 'Romanian - Romania',
    ru: 'Russian',
    ru_mo: 'Russian - Moldova',
    sa: 'Sanskrit',
    sr_sp: 'Serbian - Cyrillic',
    tn: 'Setsuana',
    sd: 'Sindhi',
    si: 'Sinhala',
    sk: 'Slovak',
    sl: 'Slovenian',
    so: 'Somali',
    sb: 'Sorbian',
    es_ar: 'Spanish - Argentina',
    es_bo: 'Spanish - Bolivia',
    es_cl: 'Spanish - Chile',
    es_co: 'Spanish - Colombia',
    es_cr: 'Spanish - Costa Rica',
    es_do: 'Spanish - Dominican Republic',
    es_ec: 'Spanish - Ecuador',
    es_sv: 'Spanish - El Salvador',
    es_gt: 'Spanish - Guatemala',
    es_hn: 'Spanish - Honduras',
    es_mx: 'Spanish - Mexico',
    es_ni: 'Spanish - Nicaragua',
    es_pa: 'Spanish - Panama',
    es_py: 'Spanish - Paraguay',
    es_pe: 'Spanish - Peru',
    es_pr: 'Spanish - Puerto Rico',
    es_es: 'Spanish - Spain (Traditional)',
    es_uy: 'Spanish - Uruguay',
    es_ve: 'Spanish - Venezuela',
    sw: 'Swahili',
    sv_fi: 'Swedish - Finland',
    sv_se: 'Swedish - Sweden',
    tg: 'Tajik',
    ta: 'Tamil',
    tt: 'Tatar',
    te: 'Telugu',
    th: 'Thai',
    bo: 'Tibetan',
    ts: 'Tsonga',
    tr: 'Turkish',
    tk: 'Turkmen',
    uk: 'Ukrainian',
    ur: 'Urdu',
    uz_uz: 'Uzbek - Cyrillic',
    vi: 'Vietnamese',
    cy: 'Welsh',
    xh: 'Xhosa',
    yi: 'Yiddish',
    zu: 'Zulu',
    aa: 'Afar',
    ab: 'Abkhazian',
    ae: 'Avestan',
    ak: 'Akan',
    an: 'Aragonese',
    ar: 'Arabic',
    av: 'Avaric',
    ay: 'Aymara',
    az: 'Azerbaijani',
    ba: 'Bashkir',
    bh: 'Bihari languages',
    bi: 'Bislama',
    bm: 'Bambara',
    br: 'Breton',
    ce: 'Chechen',
    ch: 'Chamorro',
    co: 'Corsican',
    cr: 'Cree',
    cu: 'Church Slavic; Slavonic; Old Bulgarian',
    cv: 'Chuvash',
    de: 'German',
    dv: 'Divehi; Dhivehi; Maldivian',
    dz: 'Dzongkha',
    ee: 'Ewe',
    en: 'English',
    eo: 'Esperanto',
    es: 'Spanish; Castilian',
    ff: 'Fulah',
    fj: 'Fijian',
    fr: 'French',
    fy: 'Western Frisian',
    ga: 'Irish',
    gl: 'Galician',
    gv: 'Manx',
    ha: 'Hausa',
    ho: 'Hiri Motu',
    ht: 'Haitian; Haitian Creole',
    hz: 'Herero',
    ia: 'Interlingua',
    ie: 'Interlingue; Occidental',
    ig: 'Igbo',
    ii: 'Sichuan Yi; Nuosu',
    ik: 'Inupiaq',
    io: 'Ido',
    it: 'Italian',
    iu: 'Inuktitut',
    jv: 'Javanese',
    ka: 'Georgian',
    kg: 'Kongo',
    ki: 'Kikuyu; Gikuyu',
    kj: 'Kuanyama; Kwanyama',
    kl: 'Kalaallisut; Greenlandic',
    kr: 'Kanuri',
    ku: 'Kurdish',
    kv: 'Komi',
    kw: 'Cornish',
    ky: 'Kirghiz; Kyrgyz',
    lb: 'Luxembourgish; Letzeburgesch',
    lg: 'Ganda',
    li: 'Limburgan; Limburger; Limburgish',
    ln: 'Lingala',
    lu: 'Luba-Katanga',
    mg: 'Malagasy',
    mh: 'Marshallese',
    ms: 'Malay',
    na: 'Nauru',
    nb: 'Bokmål, Norwegian; Norwegian Bokmål',
    nd: 'Ndebele, North; North Ndebele',
    ng: 'Ndonga',
    nl: 'Dutch; Flemish',
    nn: 'Norwegian Nynorsk; Nynorsk, Norwegian',
    no: 'Norwegian',
    nr: 'Ndebele, South; South Ndebele',
    nv: 'Navajo; Navaho',
    ny: 'Chichewa; Chewa; Nyanja',
    oc: 'Occitan (post 1500)',
    oj: 'Ojibwa',
    om: 'Oromo',
    os: 'Ossetian; Ossetic',
    pi: 'Pali',
    ps: 'Pushto; Pashto',
    pt: 'Portuguese',
    qu: 'Quechua',
    rn: 'Rundi',
    rw: 'Kinyarwanda',
    sc: 'Sardinian',
    se: 'Northern Sami',
    sg: 'Sango',
    sm: 'Samoan',
    sn: 'Shona',
    sr: 'Serbian',
    ss: 'Swati',
    st: 'Sotho, Southern',
    su: 'Sundanese',
    sv: 'Swedish',
    ti: 'Tigrinya',
    tl: 'Tagalog',
    to: 'Tonga (Tonga Islands)',
    tw: 'Twi',
    ty: 'Tahitian',
    ug: 'Uighur; Uyghur',
    uz: 'Uzbek',
    ve: 'Venda',
    vo: 'Volapük',
    wa: 'Walloon',
    wo: 'Wolof',
    yo: 'Yoruba',
    za: 'Zhuang; Chuang',
    zh: 'Chinese'
  };

  function formatMessage(id) {
    return CrafterCMSNext.i18n.intl.formatMessage(CrafterCMSNext.i18n.messages.localeSelectorControlMessages[id]);
  }

  function formatLanguageMessage(id) {
    return languages[id] ?? id;
  }

  CStudioForms.Controls.LocaleSelector = function (id, form, owner, properties, constraints, readonly) {
    this.owner = owner;
    this.owner.registerField(this);
    this.errors = [];
    this.properties = properties;
    this.constraints = constraints;
    this.inputEl = null;
    this.countEl = null;
    this.required = false;
    this.value = '_not-set';
    this.form = form;
    this.id = id;
    this.readonly = readonly;
    return this;
  };

  YAHOO.extend(CStudioForms.Controls.LocaleSelector, CStudioForms.CStudioFormField, {
    getLabel: function () {
      return formatMessage('label');
    },

    validate: function (obj) {
      if (obj.inputEl) obj.value = obj.inputEl.value;
      if (obj.required) {
        if (obj.value === '') {
          obj.setError('required', formatMessage('requiredError'));
          obj.renderValidation(true, false);
        } else {
          obj.clearError('required');
          obj.renderValidation(true, true);
        }
      } else {
        obj.renderValidation(false, true);
      }
      obj.owner.notifyValidation();
    },

    _onChange: function (evt, obj) {
      this.validate(obj);
      obj.form.updateModel(obj.id, obj.getValue());
    },

    _onChangeVal: function (evt, obj) {
      obj.edited = true;
      obj._onChange(evt, obj);
    },

    render: function (config, containerEl) {
      var _self = this;
      containerEl.id = this.id;

      for (var i = 0; i < config.properties.length; i++) {
        var prop = config.properties[i];

        if (prop.name === 'readonly' && prop.value === 'true') {
          this.readonly = true;
        }
      }

      CrafterCMSNext.services.translation
        .fetchSiteLocales(CStudioAuthoringContext.site)
        .subscribe(({ localeCodes, defaultLocaleCode }) => {
          if (localeCodes) {
            var titleEl = document.createElement('span');

            YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
            titleEl.innerHTML = config.title;

            if (!_self.controlWidgetContainerEl) {
              var controlWidgetContainerEl = document.createElement('div');
              YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-dropdown-container');

              var validEl = document.createElement('span');
              YAHOO.util.Dom.addClass(validEl, 'validation-hint');
              YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');
              controlWidgetContainerEl.appendChild(validEl);

              var inputEl = document.createElement('select');
              _self.inputEl = inputEl;
              YAHOO.util.Dom.addClass(inputEl, 'datum');
              YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-dropdown');

              _self.controlWidgetContainerEl = controlWidgetContainerEl;
              _self.controlWidgetContainerEl.inputEl = inputEl;

              inputEl.value = _self.value === '_not-set' ? config.defaultValue : _self.value;
              _self.controlWidgetContainerEl.appendChild(inputEl);
              YAHOO.util.Event.on(
                inputEl,
                'focus',
                function (evt, context) {
                  context.form.setFocusedField(context);
                },
                _self
              );
              YAHOO.util.Event.on(inputEl, 'change', _self._onChangeVal, _self);

              _self.renderHelp(config, _self.controlWidgetContainerEl);

              var descriptionEl = document.createElement('span');
              YAHOO.util.Dom.addClass(descriptionEl, 'description');
              YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
              descriptionEl.innerHTML = config.description;

              containerEl.appendChild(titleEl);
              containerEl.appendChild(_self.controlWidgetContainerEl);
              containerEl.appendChild(descriptionEl);
            }

            if (_self.controlWidgetContainerEl.inputEl.options.length <= 0) {
              var optionElEmpty = document.createElement('option');
              optionElEmpty.classList.add('hide');
              optionElEmpty.disabled = true;
              optionElEmpty.selected = 'selected';
              _self.controlWidgetContainerEl.inputEl.add(optionElEmpty);
            }

            localeCodes.forEach((localeCode) => {
              var optionEl = document.createElement('option');
              optionEl.text = formatLanguageMessage(localeCode);
              optionEl.value = localeCode;
              _self.controlWidgetContainerEl.inputEl.add(optionEl);
            });

            if (_self.readonly === true) {
              inputEl.disabled = true;
            }

            var savedValue = _self.getValue();
            var configValue = savedValue && savedValue !== '' ? savedValue : defaultLocaleCode;

            for (var x = 0; x < _self.inputEl.options.length; x++) {
              if (_self.inputEl.options[x].value.toLowerCase() === configValue.toLowerCase()) {
                _self.inputEl.value = configValue; // set value
                _self.validate(_self);
              }
            }
          } else {
            containerEl.style.display = 'none';
          }
        });
    },

    getValue: function () {
      return this.value;
    },

    setValue: function (value) {
      this.value = value;
      if (this.inputEl) this.inputEl.value = value;
      this._onChange(null, this);
      this.edited = false;
    },

    getName: function () {
      return 'locale-selector';
    },

    getSupportedProperties: function () {
      return [{ label: CMgs.format(langBundle, 'readonly'), name: 'readonly', type: 'boolean' }];
    },

    getSupportedConstraints: function () {
      return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
    }
  });

  CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-locale-selector', CStudioForms.Controls.LocaleSelector);
})();
