import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import config from 'config';

/*
const DIALOG_TYPE = {
  COMBINED: 'COMBINED',
  PUBLIC: 'PUBLIC',
  RESTRICTED: 'RESTRICTED',
};

const styles = theme => ({
  formControl: {
    minWidth: 200,
  },
  image: {
    color: theme.palette.grey[500],
    fontSize: theme.spacing.unit * 10,
  },
  listItem: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  section: {
    '& ~ &': {
      marginTop: theme.spacing.unit * 2,
    },
  },
  thumbnail: {
    width: 70,
  },
});
*/
const DIALOG_TYPE = {
  PUBLIC: 'PUBLIC',
  RESTRICTED: 'RESTRICTED',
};

const styles = theme => ({
  section: {
    marginTop: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit * 4,
  },
  actionCell: {
    width: 120,
  },
  tableContainer: {
    marginTop: theme.spacing.unit * 2,
  },
});

class CategoriesForm extends React.Component {
  state = {
    dialogOpen: false,
    dialogType: null,
    selectedCategoryId: '',
  };

  // wcześniej: function getCategoriesByRestriction(...)
  getCategoriesByRestriction = (originalItems, isRestricted) => {
    if (Array.isArray(originalItems)) {
      return originalItems.filter(({ restricted }) => restricted === isRestricted);
    }

    return [];
  };

  handleDialogOpen = (type) => {
    this.setState({
      dialogOpen: true,
      dialogType: type,
      selectedCategoryId: '',
    });
  };

  handleDialogClose = () => {
    this.setState({
      dialogOpen: false,
      dialogType: null,
      selectedCategoryId: '',
    });
  };

  handleChangeSelectedCategoryId = (event) => {
    this.setState({
      selectedCategoryId: event.target.value,
    });
  };

  handleCategoryDelete = (categoryId) => {
    const { onDelete } = this.props;

    if (categoryId && onDelete) {
      onDelete(categoryId);
    }
  };

  handleCategorySubmit = (categoryId) => {
    const { onSubmit } = this.props;

    if (categoryId && onSubmit) {
      onSubmit(categoryId);
    }

    this.handleDialogClose();
  };

  render() {
    const {
      categories,
      classes,
      defaultTranslation,
      items,
      managePublic,
      manageRestricted,
      translation,
    } = this.props;

    const {
      dialogOpen,
      dialogType,
      selectedCategoryId,
    } = this.state;

    const { brandName } = (config && config.public) || {};

    const publicCategories = this.getCategoriesByRestriction(items, false);
    const restrictedCategories = this.getCategoriesByRestriction(items, true);
    const isDefaultTranslation = translation === defaultTranslation;

    return (
      <React.Fragment>
        {/* KATEGORIE PARTNERA */}
        <Grid container alignItems="center" justify="space-between" className={classes.section}>
          <Grid item>
            <Typography variant="h6">Kategorie partnera</Typography>
          </Grid>
          {managePublic && (
            <Grid item>
              <IconButton
                aria-label="Dodaj"
                disabled={!isDefaultTranslation}
                onClick={() => this.handleDialogOpen(DIALOG_TYPE.PUBLIC)}
                title="Dodaj"
              >
                <AddIcon />
              </IconButton>
            </Grid>
          )}
        </Grid>

        <Grid container className={classes.tableContainer}>
          {publicCategories.length === 0 ? (
            <Typography>Brak kategorii partnera</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell># ID</TableCell>
                  <TableCell>Nazwa kategorii</TableCell>
                  <TableCell className={classes.actionCell} />
                </TableRow>
              </TableHead>
              <TableBody>
                {publicCategories.map(({ id: categoryId, label }) => (
                  <TableRow key={categoryId}>
                    <TableCell>{categoryId}</TableCell>
                    <TableCell>{label}</TableCell>
                    <TableCell align="right">
                      {managePublic && (
                        <Button
                          color="primary"
                          disabled={!isDefaultTranslation}
                          onClick={() => this.handleCategoryDelete(categoryId)}
                        >
                          Usuń
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Grid>

        {/* KATEGORIE ADMINISTRATORA / BRANDU */}
        <Grid container alignItems="center" justify="space-between" className={classes.section}>
          <Grid item>
            <Typography variant="h6">
              {`Kategorie ${brandName || 'administratora'}`}
            </Typography>
          </Grid>
          {manageRestricted && (
            <Grid item>
              <IconButton
                aria-label="Dodaj"
                disabled={!isDefaultTranslation}
                onClick={() => this.handleDialogOpen(DIALOG_TYPE.RESTRICTED)}
                title="Dodaj"
              >
                <AddIcon />
              </IconButton>
            </Grid>
          )}
        </Grid>

        <Grid container className={classes.tableContainer}>
          {restrictedCategories.length === 0 ? (
            <Typography>Brak kategorii administratora</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell># ID</TableCell>
                  <TableCell>Nazwa kategorii</TableCell>
                  <TableCell className={classes.actionCell} />
                </TableRow>
              </TableHead>
              <TableBody>
                {restrictedCategories.map(({ id: categoryId, label }) => (
                  <TableRow key={categoryId}>
                    <TableCell>{categoryId}</TableCell>
                    <TableCell>{label}</TableCell>
                    <TableCell align="right">
                      {manageRestricted && (
                        <Button
                          color="primary"
                          disabled={!isDefaultTranslation}
                          onClick={() => this.handleCategoryDelete(categoryId)}
                        >
                          Usuń
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Grid>

        {/* DIALOG DODAWANIA KATEGORII */}
        <Dialog
          open={dialogOpen}
          onClose={this.handleDialogClose}
          aria-labelledby="category-dialog-title"
          aria-describedby="category-dialog-description"
        >
          <DialogTitle id="category-dialog-title">
            Dodaj kategorię
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth>
              <InputLabel shrink={!!selectedCategoryId} htmlFor="category-select">
                Wybierz kategorię
              </InputLabel>
              <Select
                value={selectedCategoryId}
                onChange={this.handleChangeSelectedCategoryId}
                inputProps={{
                  id: 'category-select',
                }}
              >
                {categories.filter(({ id: categoryId, restricted }) => {
                  const publicAssigned = this.getCategoriesByRestriction(items, false);
                  const restrictedAssigned = this.getCategoriesByRestriction(items, true);

                  const isExistingCategory = [
                    ...publicAssigned,
                    ...restrictedAssigned,
                  ].some(({ id }) => id === categoryId);

                  switch (dialogType) {
                    case DIALOG_TYPE.RESTRICTED:
                      return !isExistingCategory && restricted;
                    case DIALOG_TYPE.PUBLIC:
                      return !isExistingCategory && !restricted;
                    default:
                      return !isExistingCategory;
                  }
                }).map(({ id: categoryId, label }) => (
                  <MenuItem key={categoryId} value={categoryId}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogClose} color="primary">
              Anuluj
            </Button>
            <Button
              onClick={() => this.handleCategorySubmit(selectedCategoryId)}
              color="primary"
              disabled={!selectedCategoryId}
            >
              Dodaj
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}


CategoriesForm.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.shape({})),
  classes: PropTypes.shape({}).isRequired,
  defaultTranslation: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({})),
  managePublic: PropTypes.bool,
  manageRestricted: PropTypes.bool,
  onSubmit: PropTypes.func,
  onDelete: PropTypes.func,
  translation: PropTypes.string,
};

CategoriesForm.defaultProps = {
  categories: [],
  defaultTranslation: DEFAULT_LANGUAGE,
  items: [],
  managePublic: false,
  manageRestricted: false,
  onSubmit: null,
  onDelete: null,
  translation: DEFAULT_LANGUAGE,
};

export default withStyles(styles)(CategoriesForm);
