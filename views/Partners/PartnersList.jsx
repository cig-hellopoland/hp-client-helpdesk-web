import React from 'react';
import withAuth from 'services/auth/withAuth';
import Layout from 'components/Layout';
import Grid from '@material-ui/core/Grid';
import ContentTabWrapper from './components/ContentTabWrapper';
import CONTENT_TABS, { types as tabListTypes } from './tabList';

const PartnersList = () => (
  <Layout>
    <Grid container>
      <ContentTabWrapper
        activeTab={tabListTypes.PARTNER_LIST}
        onChange={() => {}}
        tabList={CONTENT_TABS}
      >
        woot!
      </ContentTabWrapper>
    </Grid>
  </Layout>
);

export default withAuth()(PartnersList);
