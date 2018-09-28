import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { selectors as viewSelectors } from 'redux/view';
import Header from './Header';
import Content from './Content';

const Layout = ({ children, documentTitle }) => (
  <Fragment>
    <Header documentTitle={documentTitle} />
    <Content>
      {children}
    </Content>
  </Fragment>
);

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.object,
  ]).isRequired,
  documentTitle: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  documentTitle: viewSelectors.getDocumentTitle(state),
});

export default connect(mapStateToProps)(Layout);
