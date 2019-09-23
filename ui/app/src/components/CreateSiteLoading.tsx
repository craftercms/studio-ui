import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles((theme: any) => ({
  loadingView: {
    height: '100%',
    maxHeight: '700px',
    background: '#EBEBF0'
  },
}));

export default function CreateSiteLoading() {
  const classes = useStyles({});
  return (
    <div className={classes.loadingView}>
      holitron
    </div>
  )
}
