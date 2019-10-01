import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import { fade } from "@material-ui/core/styles";

const defaultTheme = createMuiTheme();
export  const theme = createMuiTheme({
  typography: {
    button: {
      textTransform: "none"
    },
    fontSize: 14,
    fontFamily: [
      '"Open Sans"',
      'sans-serif'
    ].join(',')
  },
  palette:{
    primary: {
      main: '#007AFF',
      contrastText: '#FFFFFF'
    },
    text: {
      secondary: '#636366'
    }
  },
  overrides: {
    MuiFormLabel:{
      root: {
        transform: 'translate(0, 1.5px) scale(1) !important',
        transformOrigin: 'top left !important'
      },
    },
    MuiInputBase: {
      root: {
        'label + &': {
          marginTop: `${defaultTheme.spacing(3)}px !important`,
        },
        '&.MuiInput-underline:before':{
          display: 'none'
        },
        '&.MuiInput-underline:after':{
          display: 'none'
        },
        '&$error .MuiInputBase-input': {
          color: '#f44336',
          borderColor: '#f44336',
          '&:focus':{
            boxShadow: 'rgba(244, 67, 54, 0.25) 0 0 0 0.2rem'
          }

        },
        '&$multiline textarea': {
          padding: '10px 12px',
        }
      },
      input: {
        borderRadius: 4,
        position: 'relative',
        backgroundColor: '#FFFFFF',
        border: '1px solid #ced4da',
        fontSize: 16,
        width: '100%',
        padding: '10px 12px',
        transition: defaultTheme.transitions.create(['border-color', 'box-shadow']),
        '&:focus:invalid': {
          boxShadow: `${fade('#007AFF', 0.25)} 0 0 0 0.2rem`,
        },
        '&:focus': {
          boxShadow: `${fade('#007AFF', 0.25)} 0 0 0 0.2rem`,
          borderColor: '#007AFF',
        },
      },
    },
    MuiTabs: {
      indicator: {
        backgroundColor: '#007AFF'
      }
    },
    MuiButton: {
      contained: {
        color: '#4F4F4F',
        backgroundColor: '#FFFFFF',
        textTransform: 'inherit',
        '&:hover': {
          backgroundColor: '#FFFFFF',
        },
      }
    }
  }
});
