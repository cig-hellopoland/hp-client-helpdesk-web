import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import CategoryIcon from '@material-ui/icons/Category';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PublicIcon from '@material-ui/icons/Public';
import StarIcon from '@material-ui/icons/Star';
import {
  actions as categoriesActions,
  selectors as categoriesSelectors,
} from 'redux/categories';
import withAuth from 'services/auth/withAuth';
import Layout from 'components/Layout';
import EmptyView from './components/EmptyView';
import SortableTableHead from '../Partners/components/ListingViewTable/SortableTableHead';

const tableColumns = [
  { id: 'icon', label: 'Ikona' },
  { id: 'name', label: 'Nazwa kategorii' },
  { id: 'details', label: '' },
];

const styles = () => ({
  root: {
    minHeight: '100%',
  },
  iconCell: {
    width: 50,
  },
  paper: {
    flex: 1,
  },
});

class CategoriesList extends React.Component {
  state = {
    isFetching: true,
    menuAnchor: null,
  };

  componentDidMount() {
    this.handleFetchCategories();
  }

  handleFetchCategoriesFailure = () => this.setState({ isFetching: false });

  handleFetchCategoriesSuccess = () => this.setState({ isFetching: false });

  handleFetchCategories = () => {
    const { fetchList } = this.props;

    fetchList({
      onFailure: this.handleFetchCategoriesFailure,
      onSuccess: this.handleFetchCategoriesSuccess,
    });

    this.setState({ isFetching: true });
  };

  handleMenuOpen = event => this.setState({ menuAnchor: event.currentTarget });

  handleMenuClose = () => this.setState({ menuAnchor: null });

  render() {
    const { isFetching, menuAnchor } = this.state;
    const { classes, items: sortedList } = this.props;

    const colorActive = 'primary';
    const colorInactive = 'disabled';

    return (
      <Layout>
        <Grid container className={classes.root}>
          <Paper className={classes.paper}>
            {sortedList.length === 0
              && (
                <EmptyView
                  image={CategoryIcon}
                  label="Brak kategorii"
                  loading={isFetching}
                  message="Dodaj kategorię lub ponów zapytanie aby wyświetlić listę."
                  onRefresh={this.handleFetchCategories}
                />
              )
            }
            {sortedList.length > 0
              && (
                <React.Fragment>
                  <Table aria-labelledby="categories-list">
                    <SortableTableHead columns={tableColumns} orderBy="name" onRequestSort={() => {}} />
                    <TableBody>
                      {
                        sortedList.map(({
                          label, iconName, iconURL, id, restricted, recommended,
                        }) => (
                          <TableRow key={id} hover>
                            <TableCell className={classes.iconCell}>
                              <img src={iconURL} alt={iconName} />
                            </TableCell>
                            <TableCell>
                              <Typography>{label}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton disabled>
                                <PublicIcon color={!restricted ? colorActive : colorInactive} />
                              </IconButton>
                              <IconButton disabled>
                                <StarIcon color={recommended ? colorActive : colorInactive} />
                              </IconButton>
                              <IconButton
                                aria-owns={menuAnchor ? 'category-menu' : undefined}
                                aria-haspopup="true"
                                onClick={this.handleMenuOpen}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                  <Menu
                    id="category-menu"
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={this.handleMenuClose}
                  >
                    <MenuItem onClick={this.handleMenuClose}>Edytuj</MenuItem>
                    <MenuItem onClick={this.handleMenuClose}>Usuń</MenuItem>
                  </Menu>
                </React.Fragment>
              )
            }
          </Paper>
        </Grid>
      </Layout>
    );
  }
}

CategoriesList.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  fetchList: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
};

const mapStateToProps = state => ({
  items: categoriesSelectors.getList(state),
});

const mapDispatchToProps = {
  fetchList: categoriesActions.fetchList,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withStyles(styles),
)(CategoriesList);
