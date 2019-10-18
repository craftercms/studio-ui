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
import { CurrentFilters } from "../models/publishing";

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

const messages: any = defineMessages({
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
  READY_FOR_LIVE: {
    id: 'publishing.READY_FOR_LIVE',
    defaultMessage: 'Ready for Live'
  },
  PROCESSING: {
    id: 'publishing.PROCESSING',
    defaultMessage: 'Processing'
  },
  COMPLETED: {
    id: 'publishing.COMPLETED',
    defaultMessage: 'Completed'
  },
  CANCELLED: {
    id: 'publishing.CANCELLED',
    defaultMessage: 'Cancelled'
  },
  BLOCKED: {
    id: 'publishing.BLOCKED',
    defaultMessage: 'Blocked'
  }
});

interface FilterDropdown {
  text : string;
  className: any;
  handleFilterChange(event: any): any;
  currentFilters: CurrentFilters;
  filters: any;
}

export default function FilterDropdown(props: FilterDropdown) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles({});
  const {text, className, handleFilterChange, currentFilters, filters} = props;
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
              id="path"
              name="path"
              InputLabelProps={{shrink: true}}
              fullWidth
              placeholder={"e.g. /SOME/PATH/*"}
              onChange={handleFilterChange}
              value={currentFilters.path}
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
            <RadioGroup aria-label="environment" name="environment"
                        value={currentFilters.environment} onChange={handleFilterChange}>
              <FormControlLabel value={""} control={<Radio color="primary"/>}
                                label={formatMessage(messages.all)}/>
              {
                filters.environments &&
                filters.environments.map((filter: string, index: number) => {
                  return <FormControlLabel key={index} value={filter} control={<Radio color="primary"/>}
                                           label={filter}/>
                })
              }
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
              {
                filters.states.map((filter: string, index: number) => {
                  return <FormControlLabel
                    key={index}
                    control={<Checkbox checked={currentFilters.states[filter]} name={filter} value={filter} color="primary" onChange={handleFilterChange}/>}
                    label={formatMessage(messages[filter])}/>
                })
              }
            </FormGroup>
          </div>
        </section>
      </Popover>
    </div>
  )
}
