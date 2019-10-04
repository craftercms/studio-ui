import withStyles from "@material-ui/styles/withStyles";
import Button from "@material-ui/core/Button";

const ColorButton = withStyles(theme => ({
  root: {
    color: 'red',
    backgroundColor: 'green',
    '&:hover': {
      backgroundColor: 'purple',
    },
  },
}))(Button);

export default function SelectButton() {

}
