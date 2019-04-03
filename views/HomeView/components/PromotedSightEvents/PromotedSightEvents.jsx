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
  actions as sightEventActions,
  selectors as sightEventSelectors,
} from '@hello-poland/commons/redux/sightEvents';
import DialogWindow from 'components/DialogWindow';
import PromoteSightEventsModalBody from './PromoteSightEventModalBody';

const styles = {
  error: {
    color: 'red',
  },
  list: {
    marginBottom: 10,
  },
};

class PromotedSightEvents extends Component {
  state = {
    open: false,
    error: false,
    listError: false,
    newPromotionValue: '1',
    newPromotionId: 0,
  }

  componentDidMount() {
    const { fetchSightEventsList } = this.props;
    fetchSightEventsList();
  }

  handleClose = () => {
    this.setState({
      open: false,
      error: false,
      listError: false,
      newPromotionValue: '1',
      newPromotionId: 0,
    });
  }

  handlePromotionChange = (id, value) => {
    const { changePromotion, fetchSightEventsList } = this.props;
    const pathParams = { promotion: value };
    changePromotion({
      id,
      pathParams,
      onSuccess: () => {
        fetchSightEventsList();
        this.handleClose();
      },
      onFailure: () => {
        this.setState({ error: true });
      },
    });
  }

  handlePromotionReset = (id) => {
    const { deletePromotion, fetchSightEventsList } = this.props;
    deletePromotion({
      id,
      onSuccess: () => {
        fetchSightEventsList();
        this.handleClose();
      },
      onFailure: () => {
        this.setState({ listError: true });
      },
    });
  }

  handlePromotionModalOpen = () => this.setState({ open: true });

  render() {
    const { sightEventsList, classes } = this.props;
    const promotedSightEvents = sightEventsList.filter(
      item => item.promotion,
    ).sort((a, b) => a.promotion - b.promotion);
    const {
      open, error, listError, newPromotionId, newPromotionValue,
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
                        onClick={() => this.handlePromotionReset(id)}
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
        </Grid>
        <Button variant="outlined" onClick={this.handlePromotionModalOpen}>
          {promotedSightEvents.length === 3 ? 'Zmień' : 'Promuj oferty'}
        </Button>
        <DialogWindow
          open={open}
          error={error}
          disabled={!newPromotionId}
          onSubmit={() => this.handlePromotionChange(newPromotionId, newPromotionValue)}
          onClose={this.handleClose}
          title="Promocja oferty"
          contentText="Wybierz ofertę, którą chcesz promować"
        >
          <PromoteSightEventsModalBody
            InputNumberProps={{
              inputProps: { min: 1, max: 3 },
              InputLabelProps: { shrink: true },
              label: 'Kolejność',
              value: newPromotionValue,
              onChange: e => this.setState({ newPromotionValue: e.target.value }),
            }}
            SelectProps={{
              label: 'Oferta',
              value: newPromotionId,
              onChange: e => this.setState({ newPromotionId: e.target.value }),
            }}
            sightEvents={sightEventsList}
          />
        </DialogWindow>
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
  sightEventsList: sightEventSelectors.getSightEvents(state),
});

const mapDispatchToProps = {
  changePromotion: sightEventActions.changePromotion,
  deletePromotion: sightEventActions.deletePromotion,
  fetchSightEventsList: sightEventActions.fetchList,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(PromotedSightEvents);
