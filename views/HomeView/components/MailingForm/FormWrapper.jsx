import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button/Button';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
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
      isFetching: false,
      isSubmitting: false,
      submittingError: false,
    };
  }

  componentWillUnmount() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }

  handleSubmit = () => {
    const { current } = this.formikRef;
    if (current && current.submitForm) {
      this.setState({ isSubmitting: true, submittingError: false });
      current.submitForm();
      this.intervalRef = setInterval(this.handleSubmitChange, 200);
    }
  };

  // hacking missing validation callback in Formik
  handleSubmitChange = () => {
    const { current } = this.formikRef;

    if (current && current.getFormikBag) {
      const { getFormikBag } = current;
      const { isSubmitting } = getFormikBag();

      if (!isSubmitting) {
        this.setState({ isSubmitting });
        clearInterval(this.intervalRef);
      }
    }
  };

  handleSubmitFailure = (actions) => {
    const { setSubmitting } = actions;
    this.setState({ isSubmitting: false, submittingError: true });
    setSubmitting(false);
  };

  handleSubmitSuccess = (actions) => {
    const { clearError } = this.props;
    const { setSubmitting } = actions;
    setSubmitting(false);

    this.setState({
      isFetching: false,
      isSubmitting: false,
      submittingError: false,
    });
    clearError();
  };

  render() {
    const { isFetching, isSubmitting, submittingError } = this.state;
    const { error } = this.props;
    const { data } = error || {};
    const { message } = data || {};

    return (
      <Fragment>
        <Typography variant="h6" gutterBottom>Wyślij email z biletami</Typography>
        { isFetching || isSubmitting
          ? <CircularProgress size={18} style={{ marginLeft: 20 }} />
          : null }
        <MailingForm
          FormikProps={{ ref: this.formikRef }}
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
        <Button disabled={isSubmitting} onClick={this.handleSubmit} color="secondary">Wyślij</Button>
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
