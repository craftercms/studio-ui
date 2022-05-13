import { css } from '@emotion/react';

export const staticGlobalStyles = css(`

/* cyrillic-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light Italic'), local('SourceSansPro-LightItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkidh18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}

/* cyrillic */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light Italic'), local('SourceSansPro-LightItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkido18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}

/* greek-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light Italic'), local('SourceSansPro-LightItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkidg18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+1F00-1FFF;
}

/* greek */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light Italic'), local('SourceSansPro-LightItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkidv18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0370-03FF;
}

/* vietnamese */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light Italic'), local('SourceSansPro-LightItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkidj18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}

/* latin-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light Italic'), local('SourceSansPro-LightItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkidi18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

/* latin */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light Italic'), local('SourceSansPro-LightItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkids18S0xR41.woff2)
      format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC,
    U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* cyrillic-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Italic'), local('SourceSansPro-Italic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7qsDJB9cme_xc.woff2)
      format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}

/* cyrillic */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Italic'), local('SourceSansPro-Italic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7jsDJB9cme_xc.woff2)
      format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}

/* greek-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Italic'), local('SourceSansPro-Italic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7rsDJB9cme_xc.woff2)
      format('woff2');
  unicode-range: U+1F00-1FFF;
}

/* greek */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Italic'), local('SourceSansPro-Italic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7ksDJB9cme_xc.woff2)
      format('woff2');
  unicode-range: U+0370-03FF;
}

/* vietnamese */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Italic'), local('SourceSansPro-Italic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7osDJB9cme_xc.woff2)
      format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}

/* latin-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Italic'), local('SourceSansPro-Italic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7psDJB9cme_xc.woff2)
      format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

/* latin */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Italic'), local('SourceSansPro-Italic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7nsDJB9cme.woff2)
      format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC,
    U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* cyrillic-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold Italic'), local('SourceSansPro-SemiBoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCdh18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}

/* cyrillic */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold Italic'), local('SourceSansPro-SemiBoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCdo18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}

/* greek-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold Italic'), local('SourceSansPro-SemiBoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCdg18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+1F00-1FFF;
}

/* greek */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold Italic'), local('SourceSansPro-SemiBoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCdv18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0370-03FF;
}

/* vietnamese */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold Italic'), local('SourceSansPro-SemiBoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCdj18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}

/* latin-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold Italic'), local('SourceSansPro-SemiBoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCdi18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

/* latin */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold Italic'), local('SourceSansPro-SemiBoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCds18S0xR41.woff2)
      format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC,
    U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* cyrillic-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold Italic'), local('SourceSansPro-BoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSdh18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}

/* cyrillic */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold Italic'), local('SourceSansPro-BoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSdo18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}

/* greek-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold Italic'), local('SourceSansPro-BoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSdg18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+1F00-1FFF;
}

/* greek */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold Italic'), local('SourceSansPro-BoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSdv18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0370-03FF;
}

/* vietnamese */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold Italic'), local('SourceSansPro-BoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSdj18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}

/* latin-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold Italic'), local('SourceSansPro-BoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSdi18S0xR41YDw.woff2)
      format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

/* latin */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold Italic'), local('SourceSansPro-BoldItalic'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSds18S0xR41.woff2)
      format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC,
    U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* cyrillic-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light'), local('SourceSansPro-Light'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmhdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}

/* cyrillic */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light'), local('SourceSansPro-Light'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwkxdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}

/* greek-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light'), local('SourceSansPro-Light'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmxdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+1F00-1FFF;
}

/* greek */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light'), local('SourceSansPro-Light'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwlBdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0370-03FF;
}

/* vietnamese */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light'), local('SourceSansPro-Light'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmBdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}

/* latin-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light'), local('SourceSansPro-Light'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmRdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

/* latin */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: local('Source Sans Pro Light'), local('SourceSansPro-Light'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwlxdu3cOWxw.woff2)
      format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC,
    U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* cyrillic-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK3dSBYKcSV-LCoeQqfX1RYOo3qNa7lujVj9_mf.woff2)
      format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}

/* cyrillic */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK3dSBYKcSV-LCoeQqfX1RYOo3qPK7lujVj9_mf.woff2)
      format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}

/* greek-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK3dSBYKcSV-LCoeQqfX1RYOo3qNK7lujVj9_mf.woff2)
      format('woff2');
  unicode-range: U+1F00-1FFF;
}

/* greek */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK3dSBYKcSV-LCoeQqfX1RYOo3qO67lujVj9_mf.woff2)
      format('woff2');
  unicode-range: U+0370-03FF;
}

/* vietnamese */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK3dSBYKcSV-LCoeQqfX1RYOo3qN67lujVj9_mf.woff2)
      format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}

/* latin-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK3dSBYKcSV-LCoeQqfX1RYOo3qNq7lujVj9_mf.woff2)
      format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

/* latin */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7lujVj9w.woff2)
      format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC,
    U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* cyrillic-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold'), local('SourceSansPro-SemiBold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwmhdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}

/* cyrillic */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold'), local('SourceSansPro-SemiBold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwkxdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}

/* greek-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold'), local('SourceSansPro-SemiBold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwmxdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+1F00-1FFF;
}

/* greek */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold'), local('SourceSansPro-SemiBold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwlBdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0370-03FF;
}

/* vietnamese */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold'), local('SourceSansPro-SemiBold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwmBdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}

/* latin-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold'), local('SourceSansPro-SemiBold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwmRdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

/* latin */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local('Source Sans Pro SemiBold'), local('SourceSansPro-SemiBold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwlxdu3cOWxw.woff2)
      format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC,
    U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* cyrillic-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwmhdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}

/* cyrillic */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwkxdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}

/* greek-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwmxdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+1F00-1FFF;
}

/* greek */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwlBdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0370-03FF;
}

/* vietnamese */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwmBdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}

/* latin-ext */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwmRdu3cOWxy40.woff2)
      format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

/* latin */
@font-face {
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'),
    url(/studio/static-assets/themes/cstudioTheme/fonts/source-sans/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwlxdu3cOWxw.woff2)
      format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC,
    U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

#root {
  margin: 0;
  padding: 0;
  height: 100vh;
}

`);
