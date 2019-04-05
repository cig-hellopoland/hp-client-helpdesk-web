import React, { Component } from 'react';
import Layout from 'components/Layout';
import Link from 'next/link';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import FormDialog from 'components/FormDialog';
import AddPartnerForm from './components/addPartnerForm';

class PartnersView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    }
    this.formikRef = React.createRef();
  }

  handleSubmit = () => {
    const { current } = this.formikRef;
    if (current && current.submitForm) {
      current.submitForm();
    }
  };

  render() {
    const { open } = this.state;
    return (
      <Layout>
        <Link href="/" passHref>
          <Button component="a">
            Strona główna
          </Button>
        </Link>
        <Grid style={{ padding: 10 }}>
          <Button variant="contained" onClick={() => this.setState({open: true})}>Dodaj partnera</Button>
        </Grid>
        <FormDialog
          open={open}
          onClose={() => this.setState({ open: false})}
          onSubmit={this.handleSubmit}
        >
          <AddPartnerForm
            FormikProps={{ ref: this.formikRef }}
            onSubmitFailure={() => console.log('nie działa')}
            onSubmitSuccess={() => console.log('elo')}
          />
        </FormDialog>
      </Layout>
    );
  }
}

export default PartnersView;
