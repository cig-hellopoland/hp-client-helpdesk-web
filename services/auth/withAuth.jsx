import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Router from 'next/router';
import { selectors as profileSelectors } from 'redux/profile';

export default ({ redirectURL } = { redirectURL: '/sign-in' }) => (View) => {
  class ViewWithAuth extends React.Component {
    componentDidMount() {
      const { allowAnonymous, isAuthenticated } = this.props;

      if (!allowAnonymous && !isAuthenticated) {
        this.redirect();
      }
    }

    componentDidUpdate() {
      const { allowAnonymous, isAuthenticated } = this.props;

      if (!allowAnonymous && !isAuthenticated) {
        this.redirect();
      }
    }

    redirect = () => {
      Router.push(redirectURL);
    };

    render() {
      return <View {...this.props} />;
    }
  }

  ViewWithAuth.propTypes = {
    allowAnonymous: PropTypes.bool,
    isAuthenticated: PropTypes.bool.isRequired,
  };

  ViewWithAuth.defaultProps = {
    allowAnonymous: false,
  };

  const mapStateToProps = state => ({
    isAuthenticated: profileSelectors.isAuthenticated(state),
  });

  return connect(mapStateToProps)(ViewWithAuth);
};
