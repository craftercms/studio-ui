/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect, useRef, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { get, post } from '../utils/ajax';
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import Grid from '@material-ui/core/Grid';
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import BlueprintCard from "./BlueprintCard";
import Spinner from "./Spinner";
import InputBase from '@material-ui/core/InputBase';
import makeStyles from "@material-ui/core/styles/makeStyles";
import SwipeableViews from 'react-swipeable-views';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import DialogActions from '@material-ui/core/DialogActions';
import BluePrintForm from "./BluePrintForm";
import BluePrintReview from "./BluePrintReview";

const CustomTabs = withStyles({
  root: {
    borderBottom: 'none',
    minHeight: 'inherit'
  }
})(Tabs);

const dialogTitleStyles = (theme: any) => ({
  root: {
    margin: 0,
    padding: '20px',
    paddingBottom: '20px',
    background: '#EBEBF0'
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

const useStyles = makeStyles((theme: any) => ({
  search: {
    position: 'relative',
    marginLeft: 0,
    width: '100%',
    marginBottom: '20px',
  },
  searchIcon: {
    width: theme.spacing(7),
    color: '#828282',
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  inputRoot: {
    color: 'inherit',
    width: '100%'
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    width: '100%',
    backgroundColor: '#EBEBF0',
    borderRadius: '5px',
    '&:focus': {
      backgroundColor: '#FFFFFF',
      boxShadow: '0px 0px 3px rgba(65, 69, 73, 0.15), 0px 4px 4px rgba(65, 69, 73, 0.15)'
    }
  },
  dialogContent: {
    padding: '20px',
    maxHeight: '570px',
  },
  slide: {
    padding: 16,
    minHeight: '485px',
  },
  dialogActions: {
    background: '#EBEBF0',
    padding: '8px 20px'
  },
  backBtn: {
    marginRight: 'auto'
  },
  tabs: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    background: '#EBEBF0'
  },
  simpleTab: {
    minWidth: '80px',
    minHeight: '0',
    padding: '0 0 5px 0',
    marginRight: '20px',
    opacity: 1,
    '& span': {
      textTransform: 'none',
      color: '#2F2707'
    }
  },
  tabIcon: {
    color: '#000000',
    fontSize: '1.2rem',
    cursor: 'pointer',
    '&.selected': {
      color: '#007AFF'
    }
  },
  loading: {
    position: 'relative',
    padding: 16,
    minHeight: '506px',
  }
}));

const views: any = {
  0: {
    title: 'Create Site',
    subtitle: 'Choose creation strategy: start from an existing git repo or create based on the blueprint to that suits you best.'
  },
  1: {
    title: 'Create Site',
    subtitle: 'Name and describe your "React" blueprint site',
    btnText: 'Finish'
  },
  2: {
    title: 'Finish',
    subtitle: 'Review set up summary and crete your site',
    btnText: 'Create Site'
  }
};

const inputsInitialState: any = {
  blueprint: null,
  siteId: '',
  description: '',
  push_site: false,
  use_remote: false,
  repo_url: '',
  repo_authentication: 'none',
  repo_remote_branch: '',
  repo_remote_name: '',
  repo_password: '',
  repo_username: '',
  repo_token: '',
  repo_key: ''
};

// @ts-ignore
const DialogTitle = withStyles(dialogTitleStyles)((props: any) => {
  const {classes, onClose, selectedView} = props;
  // @ts-ignore
  const {title, subtitle} = views[selectedView];
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      <div className={classes.title}>
        <Typography variant="h6">{title}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon/>
          </IconButton>
        ) : null}
      </div>
      <Typography variant="subtitle1">{subtitle}</Typography>
    </MuiDialogTitle>
  );
});

function CreateSiteDialog(props: any) {
  const [blueprints, setBlueprints] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(props.open || false);
  const [searchSelected, setSearchSelected] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inputs, setInputs] = useState(inputsInitialState);
  const [selectedView, setSelectedView] = useState(0);
  const classes = useStyles({});
  const swipeableViews = useRef(null);

  useEffect(() => {
      if(swipeableViews.current) {
        swipeableViews.current.updateHeight();
      }
      if (blueprints === null) {
        fetchBlueprints();
      }
    },
    // eslint-disable-next-line
    [tab],
  );

  function handleClose() {
    setOpen(false);
  }

  function handleSearchClick() {
    setSearchSelected(!searchSelected);
  }

  function handleBlueprintSelected(blueprint: any, view: number) {
    const _reset = {...inputsInitialState};
    _reset.blueprint = blueprint;
    setInputs(_reset);
    setSelectedView(view);
  }

  function handleChangeIndex() {
    setSelectedView(selectedView);
  }

  function handleBack() {
    setSelectedView(selectedView - 1);
  }

  function handleChange(e: any, value: number) {
    if (value == 1 && marketplace === null) {
      fetchMarketPlace();
    };
    setTab(value);
  }

  function handleGoTo(step: number) {
    setSelectedView(step);
  }

  function handleFinish(e: any) {
    e && e.preventDefault();
    setSubmitted(true);
    if (validateForm()) {
      if (selectedView === 2) {
        const params = createParams();
        createSite(params);
      } else {
        setSelectedView(2);
      }
    }
  }

  function validateForm() {
    if (!inputs.siteId) {
      return false;
    } else if (inputs.push_site) {
      if (!inputs.repo_url) return false;
      else if (!inputs.repo_remote_name) return false;
      else if (inputs.repo_authentication === 'basic' && (!inputs.repo_username || !inputs.repo_password)) return false;
      else if (inputs.repo_authentication === 'token' && (!inputs.repo_username || !inputs.repo_token)) return false;
      else if (inputs.repo_authentication === 'key' && !inputs.repo_key) return false;
      else return true;
    } else {
      return true;
    }
  }

  function createParams() {
    const params: any = {site_id: inputs.siteId, description: inputs.description};
    if (inputs.blueprint) {
      if (params.blueprint !== 'git') {
        params.blueprint = inputs.blueprint.id;
        params.use_remote = true;
      } else if (inputs.push_site) {
        params.use_remote = true;
      }
      if (inputs.repo_remote_name) params.remote_name = inputs.repo_remote_name;
      if (inputs.repo_url) params.remote_url = inputs.repo_url;
      params.single_branch = false;
      params.authentication_type = inputs.repo_authentication;
      if (inputs.repo_remote_branch) {
        params.remote_branch = inputs.repo_remote_branch;
        params.sandbox_branch = inputs.repo_remote_branch;
      }
      if (inputs.repo_authentication === 'basic') {
        params.remote_username = inputs.repo_username;
        params.remote_password = inputs.repo_password;
      }
      if (inputs.repo_authentication === 'token') {
        params.remote_username = inputs.repo_username;
        params.remote_token = inputs.repo_token;
      }
      if (inputs.repo_authentication === 'key') params.remote_private_key = inputs.repo_username;
      params.create_option = (inputs.blueprint.id === 'GIT') ? 'clone' : 'push';
      return params;
    }
  }

  function createSite(site: any) {
    post('/studio/api/1/services/api/1/site/create.json', site)
      .subscribe(
        (data) => {
          console.log(data)
        },
        (error: any) => {
          console.log(error);
        }
      )
  };

  function fetchMarketPlace() {
    get('/studio/api/2/marketplace/search?type=blueprint')
      .subscribe(
        ({response}) => {
          console.log(response);
        },
        () => {
          console.log('error')
        }
      );
  }

  function fetchBlueprints() {
    get('/studio/api/2/sites/available_blueprints')
      .subscribe(
        ({response}) => {
          const _blueprints: any = [{
            id: "GIT",
            name: "Remote Git Repository",
            description: "Create site from a existing remote git repository",
            media: {
              screenshots: [
                {
                  description: "Git logo",
                  title: "Remote Git Repository",
                  url: "https://www.embarcados.com.br/wp-content/uploads/2015/02/imagem-de-destaque-39.png"
                }
              ]
            }
          }];
          response.blueprints.forEach((bp: any) => {
            _blueprints.push(bp.plugin);
          });
          setBlueprints(_blueprints);
        },
        () => {
          console.log('error')
        }
      );
  }

  function renderBluePrints() {
    return blueprints.map((blueprint: any) => {
      return (
        <Grid item xs={12} sm={6} md={4} key={blueprint.id}>
          <BlueprintCard blueprint={blueprint} onBlueprintSelected={handleBlueprintSelected}/>
        </Grid>
      );
    })
  }

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="create-site-dialog" disableBackdropClick={true}
            fullWidth={true} maxWidth={'md'}>
      <DialogTitle id="create-site-dialog" onClose={handleClose} selectedView={selectedView}/>
      {(selectedView === 0) && <div className={classes.tabs}>
          <CustomTabs value={tab} onChange={handleChange} aria-label="blueprint tabs">
              <Tab label="Out of The Box" className={classes.simpleTab}/>
              <Tab label="Marketplace" className={classes.simpleTab}/>
          </CustomTabs>
          <SearchIcon className={clsx(classes.tabIcon, searchSelected && 'selected')} onClick={handleSearchClick}/>
      </div>}
      {blueprints ?
        <DialogContent className={classes.dialogContent}>
          {(searchSelected && selectedView === 0) &&
          <div className={classes.search}>
              <div className={classes.searchIcon}>
                  <SearchIcon/>
              </div>
              <InputBase
                  placeholder="Search…"
                  autoFocus={true}
                  classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                  }}
                  inputProps={{'aria-label': 'search'}}
              />
          </div>
          }
          <SwipeableViews
            animateHeight
            ref={swipeableViews}
            index={selectedView} onChangeIndex={handleChangeIndex}>
            <div className={classes.slide}>
              {(tab === 0) ?
                <div>
                  <Grid container spacing={3}>{renderBluePrints()}</Grid>
                </div> :
                <div>
                  <div className={classes.loading}>
                    <Spinner/>
                  </div>
                </div>
              }
            </div>
            <div className={classes.slide}>
              {inputs.blueprint &&
              <BluePrintForm swipeableViews={swipeableViews} inputs={inputs} setInputs={setInputs}
                             submitted={submitted} onSubmit={handleFinish} blueprint={inputs.blueprint}/>}
            </div>
            <div className={classes.slide}>
              {inputs.blueprint &&
              <BluePrintReview onGoTo={handleGoTo} inputs={inputs} blueprint={inputs.blueprint}/>}
            </div>
          </SwipeableViews>
        </DialogContent>
        :
        <div className={classes.loading}>
          <Spinner/>
        </div>
      }
      {(selectedView !== 0) && <DialogActions className={classes.dialogActions}>
          <Button variant="contained" className={classes.backBtn} onClick={handleBack}>
              Back
          </Button>
          <Button variant="contained">
              More Options
          </Button>
          <Button variant="contained" color="primary" onClick={handleFinish}>
            {views[selectedView].btnText}
          </Button>
      </DialogActions>}
    </Dialog>
  )
}

export default CreateSiteDialog;
