import React, { Component, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import {
  actions as sightEventActions,
  selectors as sightEventSelectors,
} from '@hello-poland/commons/redux/sightEvents';
import DialogWindow from 'components/DialogWindow';
import PromoteSightEventsModalBody from './PromoteSightEventModalBody';

class PromotedSightEvents extends Component {
  state = {
    open: false,
    error: false,
    newPromotionValue: 1,
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
      newPromotionValue: 1,
      newPromotionId: 0,
    });
  }

  handlePromotionChange = id => (e) => {
    const { changePromotion, fetchSightEventsList } = this.props;
    const value = e.target ? e.target.value : e;
    changePromotion({
      id,
      value,
      onSuccess: () => {
        fetchSightEventsList();
        this.handleClose();
      },
      onFailure: () => {
        this.setState({ error: true });
      },
    });
  };

  handlePromotionModalOpen = () => this.setState({ open: true });

  render() {
    const { sightEventsList } = this.props;
    const promotedSightEvents = sightEventsList.filter(
      item => item.promotion,
    ).sort((a, b) => a.promotion - b.promotion);
    const {
      open, error, newPromotionId, newPromotionValue,
    } = this.state;
    return (
      <Fragment>
        <Grid>
          <List>
            { promotedSightEvents.length > 0
              ? (promotedSightEvents.map(({ name, promotion, id }) => (
                <Fragment key={id}>
                  <ListItem>
                    <ListItemText>{name}</ListItemText>
                    <ListItemSecondaryAction>
                      <TextField
                        type="number"
                        value={promotion}
                        inputProps={{ min: 0, max: 3 }}
                        onChange={this.handlePromotionChange(id)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </Fragment>
              ))) : (
                <Typography variant="subtitle2">Brak promowanych ofert</Typography>
              )
            }
            <Button variant="outlined" onClick={this.handlePromotionModalOpen}>
              {promotedSightEvents.length > 0 ? 'Zmień' : 'Promuj oferty'}
            </Button>
          </List>
        </Grid>
        <DialogWindow
          open={open}
          error={error}
          disabled={!newPromotionId}
          onSubmit={() => this.handlePromotionChange(newPromotionId)(newPromotionValue)}
          onClose={this.handleClose}
          title="Promocja oferty"
          contentText="Wybierz ofertę, którą chcesz promować"
        >
          <PromoteSightEventsModalBody
            InputNumberProps={{
              inputProps: { min: 0, max: 3 },
              InputLabelProps: { shrink: true },
              label: 'Wartość promocji',
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
  fetchSightEventsList: PropTypes.func.isRequired,
  sightEventsList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

const mapStateToProps = state => ({
  sightEventsList: sightEventSelectors.getSightEvents(state),
});

const mapDispatchToProps = {
  changePromotion: sightEventActions.changePromotion,
  fetchSightEventsList: sightEventActions.fetchList,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(PromotedSightEvents);
