import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const styles = theme => ({
  root: {
    flex: 1,
  },
  childrenRoot: {
    padding: theme.spacing.unit * 2,
  },
  tabsRoot: {
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
});

class ContentTabWrapper extends Component {
  constructor(props) {
    super(props);

    const { activeTab, tabList } = props;

    this.state = {
      activeTab: tabList.findIndex(({ type }) => type === activeTab),
    };
  }

  handleTabChange = (event, value) => {
    const { onChange, tabList } = this.props;

    this.setState({ activeTab: value });

    if (onChange) {
      const selectedTabType = tabList[value].type;

      onChange(selectedTabType);
    }
  };

  render() {
    const { activeTab } = this.state;
    const { children, classes, tabList } = this.props;

    return (
      <Paper className={classes.root}>
        <Tabs
          className={classes.tabsRoot}
          onChange={this.handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          value={activeTab}
        >
          {tabList.length && tabList.map(({ disabled, label }) => (
            <Tab key={label} disabled={disabled} label={label} />
          ))}
        </Tabs>
        <div className={classes.childrenRoot}>
          {children}
        </div>
      </Paper>
    );
  }
}

ContentTabWrapper.propTypes = {
  activeTab: PropTypes.string.isRequired,
  classes: PropTypes.shape({}).isRequired,
  children: PropTypes.node.isRequired,
  onChange: PropTypes.func.isRequired,
  tabList: PropTypes.arrayOf(PropTypes.shape({
    disabled: PropTypes.bool,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })),
};

ContentTabWrapper.defaultProps = {
  tabList: [],
};

export default withStyles(styles)(ContentTabWrapper);
