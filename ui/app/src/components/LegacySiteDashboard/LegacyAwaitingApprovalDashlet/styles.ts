import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  collapseAll: {
    marginRight: '10px'
  },
  actionsBarRoot: {
    left: '0',
    right: '0',
    zIndex: 2,
    position: 'absolute'
  },
  actionsBarCheckbox: {
    margin: '2px'
  }
}));

export default useStyles;
