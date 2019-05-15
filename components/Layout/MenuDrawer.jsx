import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Link from 'next/link';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    minWidth: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    minWidth: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
  },
  toolbar: theme.mixins.toolbar,
});

const MenuDrawer = ({
  classes, currentPath, menuItems,
}) => (
  <Drawer variant="permanent" className={classes.root} classes={{ paper: classes.drawerPaper }}>
    <div className={classes.toolbar} />
    <nav>
      <List>
        {menuItems.map(({ label, href, Icon }) => (
          <Link key={label} href={href} passHref>
            <ListItem button selected={currentPath === href}>
              <ListItemIcon><Icon /></ListItemIcon>
              <ListItemText primary={label} />
            </ListItem>
          </Link>
        ))}
      </List>
    </nav>
  </Drawer>
);

MenuDrawer.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  currentPath: PropTypes.string.isRequired,
  menuItems: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    Icon: PropTypes.func.isRequired,
  })).isRequired,
};

export default withStyles(styles)(MenuDrawer);
