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

import React from 'react';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { ListItem } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { FullSxRecord, PartialSxRecord } from '../../models';
import zxcvbn from 'zxcvbn';
import Divider from '@mui/material/Divider';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';

export type PasswordStrengthDisplayClassKey =
  | 'scoreList'
  | 'scoreListItem'
  | 'scoreListItemDisplay'
  | 'scoreListItemText'
  | 'scoreActive20'
  | 'scoreActive40'
  | 'scoreActive60'
  | 'scoreActive80'
  | 'scoreActive100'
  | 'yourScoreText'
  | 'yourScoreIcon'
  | 'yourScoreTextInvalid'
  | 'yourScoreTextValid';

export type PasswordStrengthDisplayFullSx = FullSxRecord<PasswordStrengthDisplayClassKey>;

export type PasswordStrengthDisplayPartialSx = PartialSxRecord<PasswordStrengthDisplayClassKey>;

export interface PasswordStrengthDisplayProps {
  value: string;
  passwordRequirementsMinComplexity: number;
}

// TODO: create styles file
function getStyles(sx?: PasswordStrengthDisplayPartialSx): PasswordStrengthDisplayFullSx {
  return {
    scoreList: {
      display: 'flex',
      flexDirection: 'row',
      padding: 0,
      columnGap: '5px',
      marginTop: (theme) => theme.spacing(1),
      marginBottom: '5px'
    },
    scoreListItem: {
      width: 'auto',
      padding: 0
    },
    scoreListItemDisplay: {
      width: '40px',
      textAlign: 'center',
      borderTop: '4px solid',
      borderColor: (theme) => theme.palette.grey.A400
    },
    scoreListItemText: {
      margin: 0
    },
    scoreActive20: {
      borderColor: (theme) => theme.palette.error.light
    },
    scoreActive40: {
      borderColor: '#FB8C00'
    },
    scoreActive60: {
      borderColor: '#FFB400'
    },
    scoreActive80: {
      borderColor: (theme) => theme.palette.info.light
    },
    scoreActive100: {
      borderColor: (theme) => theme.palette.success.light
    },
    yourScoreText: {
      display: 'flex',
      alignItems: 'center'
    },
    yourScoreTextInvalid: {
      color: (theme) => theme.palette.error.main
    },
    yourScoreTextValid: {
      color: (theme) => theme.palette.success.main
    },
    yourScoreIcon: {
      fontSize: '15px',
      marginRight: (theme) => theme.spacing(1)
    }
  };
}

function getDisplayScore(score) {
  return (score + 1) * 20;
}

export function PasswordStrengthDisplay(props: PasswordStrengthDisplayProps) {
  const { value, passwordRequirementsMinComplexity } = props;
  const sx = getStyles();
  const minScore = getDisplayScore(passwordRequirementsMinComplexity);
  const password = zxcvbn(value);
  const passwordScore = value === '' ? 0 : getDisplayScore(password.score);

  console.log('password', password);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Typography variant="subtitle2">
        <FormattedMessage id="passwordStrengthDisplay.passwordStrengthTitle" defaultMessage="Password Strength Score" />
      </Typography>
      <Typography variant="body2">
        <FormattedMessage
          id="passwordStrengthDisplay.minimumScore"
          defaultMessage="Minimum score {minScore}"
          values={{ minScore }}
        />
      </Typography>
      <Box>
        <List sx={sx.scoreList}>
          {new Array(5).fill(null).map((x, i) => (
            <ListItem sx={sx.scoreListItem} key={i}>
              {/* @ts-ignore - spread styles not recognized as valid */}
              <Box
                sx={{
                  ...sx.scoreListItemDisplay,
                  ...(passwordScore >= getDisplayScore(i) && {
                    ...sx[`scoreActive${getDisplayScore(i)}`]
                  })
                }}
              >
                <ListItemText primary={getDisplayScore(i)} sx={sx.scoreListItemText} />
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
      <Typography
        variant="body2"
        /* @ts-ignore - spread styles not recognized as valid */
        sx={{
          ...sx.yourScoreText,
          ...(passwordScore > 0 && passwordScore < minScore
            ? { ...sx.yourScoreTextInvalid }
            : passwordScore >= minScore
            ? { ...sx.yourScoreTextValid }
            : {})
        }}
      >
        {passwordScore === minScore ? (
          <CheckCircleOutlineRoundedIcon sx={sx.yourScoreIcon} />
        ) : passwordScore === 100 ? (
          <StarOutlineRoundedIcon sx={sx.yourScoreIcon} />
        ) : (
          <InfoOutlinedIcon sx={sx.yourScoreIcon} />
        )}
        <FormattedMessage
          id="passwordStrengthDisplay.passwordScore"
          defaultMessage="Your score: {score}"
          values={{ score: passwordScore }}
        />
      </Typography>
      <Divider />
    </Box>
  );
}

export default PasswordStrengthDisplay;
