import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography/Typography';
import { actions as bookingsActions } from '@hello-poland/commons/redux/bookings';
import MailingForm from './Form';

class MailingFormDialog extends Component {
  handleSubmitFailure = (actions) => {
    const { setSubmitting } = actions;
    setSubmitting(false);
  };

  handleSubmitSuccess = (actions) => {
    const { clearError } = this.props;
    const { setSubmitting } = actions;
    setSubmitting(false);

    clearError();
  };

  render() {
    return (
      <Fragment>
        <Typography variant="h6" gutterBottom>Wyślij email z biletami</Typography>
        <MailingForm
          onSubmitFailure={this.handleSubmitFailure}
          onSubmitSuccess={this.handleSubmitSuccess}
          showErrors
        />
      </Fragment>

    );
  }
}

MailingFormDialog.propTypes = {
  clearError: PropTypes.func.isRequired,
};

MailingFormDialog.defaultProps = {
};


const mapDispatchToProps = {
  clearError: bookingsActions.clearError,
};

export default compose(
  connect(null, mapDispatchToProps),
)(MailingFormDialog);
