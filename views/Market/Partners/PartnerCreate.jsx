import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withAuth from 'services/auth/withAuth';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Layout from 'components/Layout';
import { actions as partnersActions } from 'redux/partners';
import AddPartnerForm from './components/PartnerForm';
import SuccessDialog from './components/SuccessDialog';

const styles = theme => ({
  root: {
    flex: 1,
    padding: theme.spacing.unit * 2,
  },
});

class PartnerCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      successDialog: false,
    };
  }

  handleSubmitSuccess = (sightId, actions) => {
    const { resetForm, setSubmitting } = actions;
    const { clearError } = this.props;

    clearError();
    setSubmitting(false);
    resetForm();

    this.handleSuccessDialogOpen();
  };

  handleSuccessDialogOpen = () => this.setState({ successDialog: true });

  handleSuccessDialogClose = () => this.setState({ successDialog: false });

  render() {
    const { classes } = this.props;
    const { successDialog } = this.state;

    return (
      <Layout>
        <Paper className={classes.root}>
          <AddPartnerForm
            onSubmitSuccess={this.handleSubmitSuccess}
          />
        </Paper>
        <SuccessDialog open={successDialog} onClose={this.handleSuccessDialogClose} />
      </Layout>
    );
  }
}


PartnerCreate.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  clearError: partnersActions.clearError,
};


export default compose(
  withAuth(),
  withStyles(styles),
  connect(undefined, mapDispatchToProps),
)(PartnerCreate);
