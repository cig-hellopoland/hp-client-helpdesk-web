import React, { Component, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconBlock from '@material-ui/icons/Block';
import IconClear from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import {
  actions as sightEventsActions,
  selectors as sightEventsSelectors,
} from '@hello-poland/commons/redux/sightEvents';
import AlertDialog from 'components/AlertDialog';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import PromotionDialog from './PromotionDialog';

const styles = {
  error: {
    color: 'red',
  },
  list: {
    marginBottom: 10,
  },
};

class PromotedSightEvents extends Component {
  initialState = {
    alertDialog: {
      content: null,
      onSuccess: null,
      open: false,
      title: null,
    },
    promotionDialog: {
      open: false,
      erros: false,
    },
    error: false,
  };

  state = this.initialState;

  componentDidMount() {
    const { fetchSightEventsList } = this.props;

    fetchSightEventsList({
      options: {
        headers: {
          'Content-Language': DEFAULT_LANGUAGE,
        },
      },
    });
  }

  handleClose = () => {
    this.setState({
      ...this.initialState,
    });
  };

  handlePromotionChange = (id, value) => {
    const { changePromotion, fetchSightEventsList } = this.props;
    const { promotionDialog } = this.state;
    const pathParams = { promotion: value };
    changePromotion({
      id,
      pathParams,
      options: {
        headers: {
          'Content-Language': DEFAULT_LANGUAGE,
        },
      },
      onSuccess: () => {
        fetchSightEventsList();
        this.handleClose();
      },
      onFailure: () => {
        this.setState({ promotionDialog: { ...promotionDialog, error: true } });
      },
    });
  };

  handleRemovePromotion = (id) => {
    const { deletePromotion, fetchSightEventsList } = this.props;
    deletePromotion({
      id,
      options: {
        headers: {
          'Content-Language': DEFAULT_LANGUAGE,
        },
      },
      onSuccess: () => {
        fetchSightEventsList();
        this.handleClose();
      },
      onFailure: () => {
        this.setState({ listError: true });
      },
    });
  };

  handleRemovePromotionDialogOpen = (id, name) => this.setState({
    alertDialog: {
      open: true,
      onCancel: this.handleClose,
      onSuccess: () => this.handleRemovePromotion(id),
      title: 'Uwaga',
      content: `Oferta ${name} przestanie być promowana, czy chcesz kontynuować?`,
    },
  });

  handlePromotionDialogOpen = () => this.setState({ promotionDialog: { open: true } });

  render() {
    const { sightEventsList, classes } = this.props;
    const promotedSightEvents = sightEventsList.filter(
      item => item.promotion,
    ).sort((a, b) => a.promotion - b.promotion);
    const {
      alertDialog, listError, promotionDialog: { open, error },
    } = this.state;

    return (
      <Fragment>
        <Grid>
          <Typography className={classes.error}>{ listError ? 'Wystąpił błąd' : ' '}</Typography>
          <List dense className={classes.list}>
            { promotedSightEvents.length > 0
              ? (promotedSightEvents.map(({ name, promotion, id }) => (
                <Fragment key={id}>
                  <ListItem>
                    <ListItemText primary={name} secondary={`Kolejność na liście: ${promotion}`}>{name}</ListItemText>
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => this.handleRemovePromotionDialogOpen(id, name)}
                      >
                        <IconClear />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </Fragment>
              ))) : (
                <Grid container alignItems="center">
                  <IconBlock />
                  <Typography variant="subtitle2">Brak promowanych ofert</Typography>
                </Grid>
              )
            }
          </List>
          <Button onClick={this.handlePromotionDialogOpen}>Ustal kolejność</Button>
        </Grid>
        <PromotionDialog
          onSubmit={this.handlePromotionChange}
          onClose={this.handleClose}
          open={open}
          error={error}
          sightEvents={sightEventsList}
        />
        <AlertDialog {...alertDialog} />
      </Fragment>
    );
  }
}

PromotedSightEvents.propTypes = {
  changePromotion: PropTypes.func.isRequired,
  classes: PropTypes.shape({}).isRequired,
  deletePromotion: PropTypes.func.isRequired,
  fetchSightEventsList: PropTypes.func.isRequired,
  sightEventsList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

const mapStateToProps = state => ({
  sightEventsList: sightEventsSelectors.getSightEvents(state),
});

const mapDispatchToProps = {
  changePromotion: sightEventsActions.changePromotion,
  deletePromotion: sightEventsActions.deletePromotion,
  fetchSightEventsList: sightEventsActions.fetchList,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(PromotedSightEvents);
