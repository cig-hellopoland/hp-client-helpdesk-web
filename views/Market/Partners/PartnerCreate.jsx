import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withAuth from 'services/auth/withAuth';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withRouter } from 'next/router';
import Layout from 'components/Layout';
import { actions as partnersActions } from 'redux/partners';
import PartnerCompanyForm from './components/PartnerCompanyForm';
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

  componentDidMount() {
    const { clearError } = this.props;

    clearError();
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

  handleCancel = () => {
    const { router } = this.props;

    router.push('/market/partners');
  };

  render() {
    const { classes } = this.props;
    const { successDialog } = this.state;

    return (
      <Layout>
        <Paper className={classes.root}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6">Nowy partner</Typography>
            </Grid>
            <Grid item>
              <Button color="primary" onClick={this.handleCancel}>
                Anuluj
              </Button>
            </Grid>
          </Grid>
          <PartnerCompanyForm onSubmitSuccess={this.handleSubmitSuccess} />
        </Paper>
        <SuccessDialog open={successDialog} onClose={this.handleSuccessDialogClose} />
      </Layout>
    );
  }
}


PartnerCreate.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  router: PropTypes.shape({}).isRequired,
};

const mapDispatchToProps = {
  clearError: partnersActions.clearError,
};


export default compose(
  withAuth(),
  withRouter,
  withStyles(styles),
  connect(undefined, mapDispatchToProps),
)(PartnerCreate);
