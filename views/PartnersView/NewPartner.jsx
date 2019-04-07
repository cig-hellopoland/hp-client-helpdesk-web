import React, { Component } from 'react';
import Layout from 'components/Layout';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';
import AddPartnerForm from './components/AddPartnerForm';
import AddTicketerForm from './components/AddTicketerForm';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
  },
});

class NewPartner extends Component {
  state = {}

  render() {
    const { classes } = this.props;
    return (
      <Layout>
        <Grid className={classes.root} container spacing={16}>
          <Grid item xs={8}>
            <AddPartnerForm />
          </Grid>
          <Grid item xs={4}>
            <AddTicketerForm />
          </Grid>
        </Grid>

      </Layout>
    );
  }
};


export default withStyles(styles)(NewPartner);
