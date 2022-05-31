import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(() => ({
  iframe: {
    height: '0',
    border: 0,
    '&.complete': {
      height: '100%',
      flexGrow: 1
    }
  },
  dialog: {
    minHeight: '90vh'
  },
  loadingRoot: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  edited: {
    width: '12px',
    height: '12px',
    marginLeft: '5px'
  }
}));
