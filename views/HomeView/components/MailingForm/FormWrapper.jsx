import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography/Typography';
import {
  actions as bookingsActions,
  selectors as bookingsSelectors,
} from '@hello-poland/commons/redux/bookings';
import MailingForm from './Form';

class MailingFormDialog extends Component {
  constructor(props) {
    super(props);

    this.intervalRef = null;

    this.formikRef = React.createRef();

    this.state = {
      submittingError: false,
    };
  }

  handleSubmitFailure = (actions) => {
    const { setSubmitting } = actions;
    this.setState({ submittingError: true });
    setSubmitting(false);
  };

  handleSubmitSuccess = (actions) => {
    const { clearError } = this.props;
    const { setSubmitting } = actions;
    setSubmitting(false);

    clearError();
  };

  render() {
    const { submittingError } = this.state;
    const { error } = this.props;
    const { data } = error || {};
    const { message } = data || {};

    return (
      <Fragment>
        <Typography variant="h6" gutterBottom>Wyślij email z biletami</Typography>
        <MailingForm
          onSubmitFailure={this.handleSubmitFailure}
          onSubmitSuccess={this.handleSubmitSuccess}
        />
        {submittingError
                    && (
                      <Typography style={{ color: 'red' }}>
                        {message}
                      </Typography>
                    )
                  }
      </Fragment>

    );
  }
}

MailingFormDialog.propTypes = {
  clearError: PropTypes.func.isRequired,
  error: PropTypes.shape({}),
};

MailingFormDialog.defaultProps = {
  error: null,
};

const mapStateToProps = state => ({
  error: bookingsSelectors.getError(state),
});

const mapDispatchToProps = {
  clearError: bookingsActions.clearError,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(MailingFormDialog);
