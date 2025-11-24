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
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import config from 'config';

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
class TagsForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogOpen: false,
      dialogType: null,
      selectedTagId: '',
    };
  }

  getItemsByRestriction = (originalItems, isRestricted) => {
    if (Array.isArray(originalItems)) {
      return originalItems.filter(({ restricted }) => restricted === isRestricted);
    }

    return [];
  };

  handleDialogClose = () => {
    this.setState({
      dialogOpen: false,
      dialogType: null,
      selectedTagId: '',
    });
  };

  handleDialogOpen = (type) => {
    this.setState({
      dialogOpen: true,
      dialogType: type,
    });
  };

  handleItemDelete = (itemId) => {
    const { onDelete } = this.props;

    if (itemId && onDelete) {
      onDelete(itemId);
    }
  };

  handleItemSubmit = (itemId) => {
    const { onSubmit } = this.props;

    if (itemId && onSubmit) {
      onSubmit(itemId);
    }

    this.handleDialogClose();
  };

  handleSelectChange = (event) => {
    this.setState({
      selectedTagId: event.target.value,
    });
  };

  render() {
    const {
      tags, classes, defaultTranslation, items, managePublic, manageRestricted, translation,
    } = this.props;

    const { dialogOpen, dialogType, selectedTagId } = this.state;
    const { brandName } = (config && config.public) || {};

    const publicItems = this.getItemsByRestriction(items, false);
    const restrictedItems = this.getItemsByRestriction(items, true);
    const isDefaultTranslation = defaultTranslation === translation;

    return (
      <React.Fragment>
        {/* SEKCJA: Tagi partnera (publiczne) */}
        <Grid container alignItems="center" justify="space-between" className={classes.section}>
          <Grid item>
            <Typography variant="h6">Tagi partnera</Typography>
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

        {publicItems.length === 0 && (
          <Grid container item direction="column" alignItems="center" justify="center">
            <Typography>Brak tagów przypisanych przez partnera.</Typography>
          </Grid>
        )}

        {publicItems.length > 0 && (
          <Grid container>
            <Table>
              <TableBody>
                {publicItems.map(({ id, label, iconUrl }) => (
                  <TableRow hover key={id}>
                    <TableCell padding="none" className={classes.listItem}>
                      <Grid container spacing={16} alignItems="center">
                        <Grid item>
                          {!iconUrl && <CategoryIcon className={classes.image} />}
                          {iconUrl && (
                            <img alt={label} src={iconUrl} className={classes.thumbnail} />
                          )}
                        </Grid>
                        <Grid item>
                          <Grid container direction="column">
                            <Typography variant="subtitle1">
                              {label}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </TableCell>
                    {managePublic && (
                      <TableCell padding="default">
                        <Grid container alignItems="center" justify="flex-end">
                          <Button
                            color="secondary"
                            variant="contained"
                            onClick={() => this.handleItemDelete(id)}
                            title="Usuń"
                          >
                            Usuń
                          </Button>
                        </Grid>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        )}

        {/* SEKCJA: Tagi przypisane przez administratora / brand */}
        <Grid container alignItems="center" justify="space-between" className={classes.section}>
          <Grid item>
            <Typography variant="h6">
              {`Tagi przypisane przez ${brandName || 'administratora'}`}
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

        {restrictedItems.length === 0 && (
          <Grid container item direction="column" alignItems="center" justify="center">
            <Typography>
              {`Brak tagów przypisanych przez ${brandName || 'administratora'}.`}
            </Typography>
          </Grid>
        )}

        {restrictedItems.length > 0 && (
          <Grid container>
            <Table>
              <TableBody>
                {restrictedItems.map(({ id, label, iconUrl }) => (
                  <TableRow hover key={id}>
                    <TableCell padding="none" className={classes.listItem}>
                      <Grid container spacing={16} alignItems="center">
                        <Grid item>
                          {!iconUrl && <CategoryIcon className={classes.image} />}
                          {iconUrl && (
                            <img alt={label} src={iconUrl} className={classes.thumbnail} />
                          )}
                        </Grid>
                        <Grid item>
                          <Grid container direction="column">
                            <Typography variant="subtitle1">
                              {label}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </TableCell>
                    {manageRestricted && (
                      <TableCell padding="default">
                        <Grid container alignItems="center" justify="flex-end">
                          <Button
                            color="secondary"
                            variant="contained"
                            onClick={() => this.handleItemDelete(id)}
                            title="Usuń"
                          >
                            Usuń
                          </Button>
                        </Grid>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        )}

        {/* DIALOG dodawania tagu */}
        <Dialog open={dialogOpen} onClose={this.handleDialogClose}>
          <DialogTitle>
            {dialogType === DIALOG_TYPE.COMBINED && 'Dodaj / Usuń tag'}
            {dialogType === DIALOG_TYPE.PUBLIC && 'Dodaj tag partnera'}
            {dialogType === DIALOG_TYPE.RESTRICTED
              && `Dodaj tag przypisany przez ${brandName || 'administratora'}`}
          </DialogTitle>
          <DialogContent>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="tag">Tag</InputLabel>
              <Select
                value={selectedTagId}
                onChange={this.handleSelectChange}
                input={<Input id="tag" />}
              >
                {tags
                  .filter(({ id: categoryId, restricted }) => {
                    const isExistingCategory = items.some(item => item.id === categoryId);

                    switch (dialogType) {
                      case DIALOG_TYPE.RESTRICTED:
                        return !isExistingCategory && restricted;
                      case DIALOG_TYPE.PUBLIC:
                        return !isExistingCategory && !restricted;
                      default:
                        return !isExistingCategory;
                    }
                  })
                  .map(({ id: categoryId, label }) => (
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
            <Button onClick={() => this.handleItemSubmit(selectedTagId)} color="primary">
              Dodaj
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}


TagsForm.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.shape({})),
  classes: PropTypes.shape({}).isRequired,
  defaultTranslation: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({})),
  managePublic: PropTypes.bool,
  manageRestricted: PropTypes.bool,
  onSubmit: PropTypes.func,
  onDelete: PropTypes.func,
  translation: PropTypes.string,
};

TagsForm.defaultProps = {
  tags: [],
  defaultTranslation: DEFAULT_LANGUAGE,
  items: [],
  managePublic: false,
  manageRestricted: false,
  onSubmit: null,
  onDelete: null,
  translation: DEFAULT_LANGUAGE,
};

export default withStyles(styles)(TagsForm);
