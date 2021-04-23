/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect, useMemo } from 'react';
import { isBlank } from '../../utils/string';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';
import { passwordRequirementMessages } from '../../utils/i18n-legacy';

interface PasswordRequirementsDisplayProps {
  value: string;
  formatMessage: Function;
  onValidStateChanged: (isValid: boolean) => void;
  passwordRequirementsRegex: string;
  classes: { [props: string]: string };
}

export default function PasswordRequirementsDisplay(props: PasswordRequirementsDisplayProps) {
  const { passwordRequirementsRegex, formatMessage, value, classes, onValidStateChanged } = props;
  const { regEx, conditions } = useMemo(() => getPrimeMatter({ passwordRequirementsRegex, formatMessage }), [
    passwordRequirementsRegex,
    formatMessage
  ]);
  useEffect(() => {
    onValidStateChanged(isBlank(value) ? null : regEx.test(value));
  }, [onValidStateChanged, regEx, value]);
  return (
    <ul className={classes.listOfConditions}>
      {conditions.map(({ description, regEx: condition }, key) => {
        const blank = isBlank(value);
        const valid = condition.test(value);
        return (
          <Typography
            key={key}
            component="li"
            className={clsx(
              classes.conditionItem,
              !blank && {
                [classes.conditionItemNotMet]: !valid,
                [classes.conditionItemMet]: valid
              }
            )}
          >
            {valid && !blank ? (
              <CheckCircleOutlineRoundedIcon className={classes.conditionItemIcon} />
            ) : (
              <ErrorOutlineRoundedIcon className={classes.conditionItemIcon} />
            )}
            {description}
          </Typography>
        );
      })}
    </ul>
  );
}

function getPrimeMatter(props: Partial<PasswordRequirementsDisplayProps>) {
  const { passwordRequirementsRegex, formatMessage } = props;
  let regEx = null;
  let captureGroups = passwordRequirementsRegex.match(/\(\?<.*?>.*?\)/g);
  let namedCaptureGroupSupport = true;
  let fallback;
  if (!captureGroups) {
    // RegExp may be valid and have no capture groups
    fallback = {
      regEx,
      description: formatMessage(passwordRequirementMessages.validationPassing)
    };
  }
  try {
    regEx = new RegExp(passwordRequirementsRegex);
    captureGroups = passwordRequirementsRegex.match(/\(\?<.*?>.*?\)/g);
  } catch (error) {
    console.warn(error);
    try {
      // reg ex without the capture groups and just need to remove the capture
      // If the reg ex is parsable without the capture groups, we can use the
      // group from the individual pieces later on the mapping.
      namedCaptureGroupSupport = false;
      regEx = new RegExp(passwordRequirementsRegex.replace(/\?<(.*?)>/g, ''));
    } catch (error) {
      // Allow everything and default to backend as regex wasn't
      // parsable/valid for current navigator
      regEx = /(.|\s)*\S(.|\s)*/;
      fallback = {
        regEx,
        description: formatMessage(passwordRequirementMessages.notBlank)
      };
      console.warn('Defaulting password validation to server due to issues in RegExp compilation.');
    }
  }
  return {
    regEx,
    conditions: captureGroups
      ? captureGroups.map((captureGroup) => {
          let description;
          let captureGroupKey = captureGroup.match(/\?<(.*?)>/g)?.[0].replace(/\?<|>/g, '') ?? 'Unnamed condition';
          if (!namedCaptureGroupSupport) {
            captureGroup = captureGroup.replace(/\?<(.*?)>/g, '');
          }
          switch (captureGroupKey) {
            case 'hasSpecialChars':
              const allowedChars = (passwordRequirementsRegex.match(/\(\?<hasSpecialChars>(.*)\[(.*?)]\)/) || [
                '',
                '',
                ''
              ])[2];
              description = formatMessage(passwordRequirementMessages.hasSpecialChars, {
                chars: allowedChars ? `(${allowedChars})` : ''
              });
              break;
            case 'minLength':
              const min = ((passwordRequirementsRegex.match(/\(\?<minLength>(.*){(.*?)}\)/) || [''])[0].match(
                /{(.*?)}/
              ) || ['', ''])[1].split(',')[0];
              description = formatMessage(passwordRequirementMessages.minLength, { min });
              break;
            case 'maxLength':
              const max = ((passwordRequirementsRegex.match(/\(\?<maxLength>(.*){(.*?)}\)/) || [''])[0].match(
                /{(.*?)}/
              ) || ['', ''])[1].split(',')[1];
              description = formatMessage(passwordRequirementMessages.maxLength, { max });
              break;
            case 'minMaxLength':
              const minLength = ((passwordRequirementsRegex.match(/\(\?<minMaxLength>(.*){(.*?)}\)/) || [''])[0].match(
                /{(.*?)}/
              ) || ['', ''])[1].split(',')[0];
              const maxLength = ((passwordRequirementsRegex.match(/\(\?<minMaxLength>(.*){(.*?)}\)/) || [''])[0].match(
                /{(.*?)}/
              ) || ['', ''])[1].split(',')[1];
              description = formatMessage(passwordRequirementMessages.minMaxLength, {
                minLength,
                maxLength
              });
              break;
            default:
              description = formatMessage(
                passwordRequirementMessages[captureGroupKey] ?? passwordRequirementMessages.unnamedGroup
              );
              break;
          }
          return {
            regEx: new RegExp(captureGroup),
            description
          };
        })
      : [fallback]
  };
}
