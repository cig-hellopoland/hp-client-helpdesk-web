import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withRouter } from 'next/router';
import withAuth from 'services/auth/withAuth';
import Layout from 'components/Layout';
import Grid from '@material-ui/core/Grid';
import ContentTabWrapper from './components/ContentTabWrapper';
import AddPartnerForm from './components/PartnerForm';
import CONTENT_TABS, { getURLByTabType, types as tabListTypes } from './tabList';

class PartnerCreate extends Component {
  handleTabChange = (selectedTabType) => {
    const { partnerId, router } = this.props;

    const { URL, URLAs } = getURLByTabType(selectedTabType, CONTENT_TABS, { partnerId });

    if (URL && URLAs) {
      router.push(URL, URLAs);
    }
  };

  render() {
    return (
      <Layout>
        <Grid container>
          <ContentTabWrapper
            activeTab={tabListTypes.PARTNER_CREATE}
            onChange={this.handleTabChange}
            tabList={CONTENT_TABS}
          >
            <AddPartnerForm />
          </ContentTabWrapper>
        </Grid>
      </Layout>
    );
  }
}

PartnerCreate.propTypes = {
  partnerId: PropTypes.number,
  router: PropTypes.shape({}).isRequired,
};

PartnerCreate.defaultProps = {
  partnerId: null,
};

export default compose(
  withAuth(),
  withRouter,
)(PartnerCreate);
