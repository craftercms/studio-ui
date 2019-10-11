import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Button from "@material-ui/core/Button";
import React from "react";
import Popover from '@material-ui/core/Popover';
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { defineMessages, useIntl } from "react-intl";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';

const useStyles = makeStyles(() => ({
  paper: {
    width: '300px'
  },
  header: {
    background: '#f9f9f9',
    padding: '10px',
    borderTop: '1px solid #dedede',
    borderBottom: '1px solid #dedede'
  },
  body: {
    padding: '10px'
  },
  formControl: {
    width: '100%',
    padding: '5px 15px 20px 15px',
  },
}));

const messages = defineMessages({
  pathExpression: {
    id: 'publishing.pathExpression',
    defaultMessage: 'Path Expression'
  },
  environment: {
    id: 'publishing.environment',
    defaultMessage: 'Environment'
  },
  state: {
    id: 'publishing.state',
    defaultMessage: 'State'
  },
  all: {
    id: 'publishing.all',
    defaultMessage: 'All'
  },
  live: {
    id: 'publishing.live',
    defaultMessage: 'Live'
  },
  staging: {
    id: 'publishing.staging',
    defaultMessage: 'Staging'
  }
});

export default function FilterDropdown(props: any) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles({});
  const {text, className} = props;
  const {formatMessage} = useIntl();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClick} className={className}>
        {text} <ArrowDropDownIcon/>
      </Button>
      <Popover
        id="simple-menu"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        classes={{paper: classes.paper}}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <section>
          <header className={classes.header}>
            <Typography variant="body1">
              <strong>{formatMessage(messages.pathExpression)}</strong>
            </Typography>
          </header>
          <div className={classes.body}>
            <TextField
              id="testing"
              name="testing"
              InputLabelProps={{shrink: true}}
              fullWidth
              placeholder={"e.g. /SOME/PATH/*"}
              //onChange={handleInputChange}
              //value={inputs.repoUrl}
            />
          </div>
        </section>
        <section>
          <header className={classes.header}>
            <Typography variant="body1">
              <strong>{formatMessage(messages.environment)}</strong>
            </Typography>
          </header>
          <div className={classes.formControl}>
            <RadioGroup aria-label="testing" name="testing"
                        value={'all'}>
              <FormControlLabel value="all" control={<Radio color="primary"/>}
                                label={formatMessage(messages.all)}/>
              <FormControlLabel value="live" control={<Radio color="primary"/>}
                                label={formatMessage(messages.live)}/>
              <FormControlLabel value="staging" control={<Radio color="primary"/>}
                                label={formatMessage(messages.staging)}/>
            </RadioGroup>
          </div>
        </section>
        <section>
          <header className={classes.header}>
            <Typography variant="body1">
              <strong>{formatMessage(messages.state)}</strong>
            </Typography>
          </header>
          <div className={classes.formControl}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={true} value="gilad" color="primary"/>}
                label="Gilad Gray"
              />
              <FormControlLabel
                control={<Checkbox checked={false} value="jason" color="primary"/>}
                label="Jason Killian"
              />
              <FormControlLabel
                control={
                  <Checkbox checked={true} value="antoine" color="primary"/>
                }
                label="Antoine Llorca"
              />
            </FormGroup>
          </div>
        </section>
      </Popover>
    </div>
  )
}
