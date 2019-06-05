import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import withAuth from 'services/auth/withAuth';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Layout from 'components/Layout';
import AddPartnerForm from './components/PartnerForm';
import SuccessDialog from './components/SuccessDialog';

const styles = theme => ({
  root: {
    flex: 1,
    padding: theme.spacing.unit * 2,
  },
});

class PartnerCreate extends Component {
  constructor() {
    super();
    this.state = {
      confirmationDialog: true,
    };
  }

  handleSubmitSuccess = (sightId, actions) => {
    const { resetForm, setSubmitting } = actions;

    setSubmitting(false);
    resetForm();
    this.handleSuccessDialogOpen();
  }

  handleSuccessDialogOpen = () => this.setState({ confirmationDialog: true });

  handleSuccessDialogClose = () => this.setState({ confirmationDialog: false });

  render() {
    const { classes } = this.props;
    const { confirmationDialog } = this.state;
    return (
      <Fragment>
        <Layout>
          <Paper className={classes.root}>
            <AddPartnerForm
              onSubmitSuccess={this.handleSubmitSuccess}
            />
          </Paper>
        </Layout>
        <SuccessDialog open={confirmationDialog} onClose={this.handleSuccessDialogClose} />
      </Fragment>
    );
  }
}


PartnerCreate.propTypes = {
  classes: PropTypes.shape({}).isRequired,
};

export default compose(
  withAuth(),
  withStyles(styles),
)(PartnerCreate);
