import React, { Component } from 'react';
import Layout from 'components/Layout';
import Link from 'next/link';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

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
          <Link href="/partners/new" passHref>
            <Button variant="contained" component="a">
              Dodaj partnera
            </Button>
          </Link>
        </Grid>
      </Layout>
    );
  }
}

export default PartnersView;
