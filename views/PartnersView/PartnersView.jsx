import React from 'react';
import Layout from 'components/Layout';
import Link from 'next/link';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

const PartnersView = () => (
  <Layout>
    <Grid style={{ padding: 10 }}>
      <Link href="/partners/add" passHref>
        <Button variant="contained" component="a">
            Dodaj partnera
        </Button>
      </Link>
    </Grid>
  </Layout>
);

export default PartnersView;
