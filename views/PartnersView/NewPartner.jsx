import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Layout from 'components/Layout';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';
import { actions as partnersActions } from 'redux/partners';
import AddPartnerForm from './components/AddPartnerForm';
import AddTicketerForm from './components/AddTicketerForm';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
  },
});

class NewPartner extends Component {
  state = {
    users: [],
  }

  createPartnerForm = React.createRef();

  addUserFrom = React.createRef();

  handleCreatePartner = (values) => {
    const { users } = this.state;
    const { createPartner } = this.props;

    createPartner({
      data: {
        ...values,
        users,
      },
      onSuccess:
    });
  }

  handleAddTicketer = (email) => {
    const { users } = this.state;
    const { current } = this.addUserFrom;
    users.push({ email, roles: ['USHER'] });
    this.setState({
      users,
    }, current.resetForm());
  }

  handleRemoveTicketer = (val) => {
    const { users } = this.state;
    const { current } = this.addUserFrom;

    const filteredUsers = users.filter(({ email }) => email !== val);
    this.setState({
      users: filteredUsers,
    }, current.resetForm());
  }

  render() {
    const { classes } = this.props;
    const { users } = this.state;
    return (
      <Layout>
        <Grid className={classes.root} container spacing={16}>
          <Grid item xs={8}>
            <AddPartnerForm
              onSubmit={this.handleCreatePartner}
            />
          </Grid>
          <Grid item xs={4}>
            <AddTicketerForm
              FormikProps={{ ref: this.addUserFrom }}
              users={users}
              onSubmit={this.handleAddTicketer}
              handleRemove={this.handleRemoveTicketer}
            />
          </Grid>
        </Grid>
      </Layout>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  createPartner: partnersActions.createPartner,
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(NewPartner);
