import React from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from '@material-ui/core/Grid';
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
  form: {
    maxWidth: '600px',
    margin: 'auto'
  },
}));

function BluePrintForm(props: any) {
  const classes = useStyles({});
  const {inputs, setInputs, submitted} = props;

  const handleInputChange = (e: any) => {
    e.persist();
    setInputs((inputs: any) => ({...inputs, [e.target.name]: e.target.value}));
  };

  return (
    <form className={classes.form}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth error={(submitted && !inputs.siteId)}>
            <InputLabel required htmlFor="siteId">Site ID</InputLabel>
            <Input id="siteId" name="siteId" onChange={handleInputChange} value={inputs.siteId}/>
            <FormHelperText>Max length: 50 characters, consisting of: lowercase letters, numbers, dash (-) and
              underscore (_)</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <TextField
              id="description"
              name="description"
              label="Description"
              multiline
              rows="4"
              margin="normal"
              onChange={handleInputChange}
              value={inputs.description}
              inputProps={{maxLength: 4000}}
              helperText="Max length: 4000 characters"
            />
          </FormControl>
        </Grid>
      </Grid>
    </form>
  )
}

export default BluePrintForm;
