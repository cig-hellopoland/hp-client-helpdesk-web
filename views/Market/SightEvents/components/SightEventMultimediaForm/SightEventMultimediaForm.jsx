import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _uniq from 'lodash/uniq';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import {
  actions as sightEventsActions,
  selectors as sightEventsSelectors,
} from '@hello-poland/commons/redux/sightEvents';
import { DEFAULT_LANGUAGE } from 'utils/translations';

const sectionTitle = {
  'application/pdf': 'Pliki',
  'image/jpeg': 'Obrazy',
};

const styles = theme => ({
  fetchButton: {
    marginTop: theme.spacing.unit * 3,
  },
  image: {
    color: theme.palette.grey[500],
    fontSize: theme.spacing.unit * 10,
  },
  section: {
    '& ~ &': {
      marginTop: theme.spacing.unit * 4,
    },
  },
  thumbnail: {
    width: 200,
  },
});

class SightEventMultimediaForm extends React.Component {
  handleDelete = (itemId, itemName) => {
    console.log('handleDelete', itemId, itemName);
  };

  handleUploadModalOpen = () => {
    console.log('opened!');
  };

  render() {
    const { classes, data } = this.props;
    const dataTypes = _uniq(data.map(({ type }) => type));


    console.log(dataTypes, data);
    return (
      <React.Fragment>
        {(!data || data.length === 0)
          && (
            <Grid container item direction="column" alignItems="center" justify="center">
              <FolderOpenIcon className={classes.image} />
              <Typography variant="h6">Multimedia</Typography>
              <Typography>Brak plików przypisanych do oferty.</Typography>
              <Button className={classes.fetchButton} variant="outlined" onClick={this.handleUploadModalOpen}>
                Dodaj
              </Button>
            </Grid>
          )
        }
        {(data && data.length > 0) && dataTypes.map(dataType => (
          <div key={dataType} className={classes.section}>
            <Typography variant="h6">{sectionTitle[dataType]}</Typography>
            <Table>
              <TableBody>
                {data.map(({
                  downloadUrl, id: dataId, name, type,
                }) => dataType === type
                  && (
                    <TableRow key={`${name}-${dataId}`} hover>
                      <TableCell className={classes.thumbnail} padding={type === 'image/jpeg' ? 'none' : 'default'}>
                        {type === 'image/jpeg'
                          ? <img src={downloadUrl.qvgWebp} width={160} alt={name} />
                          : <InsertDriveFileIcon />
                        }
                      </TableCell>
                      <TableCell>{name}</TableCell>
                      <TableCell align="right">
                        {type !== 'image/jpeg'
                          && (
                            <IconButton
                              component="a"
                              href={downloadUrl}
                              aria-label="Pobierz"
                              title="Pobierz"
                              target="_blank"
                            >
                              <GetAppIcon />
                            </IconButton>
                          )
                        }
                        <IconButton aria-label="Usuń" title="Usuń" onClick={() => this.handleDelete(dataId, { name, type })}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </React.Fragment>
    );
  }
}

SightEventMultimediaForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})),
  language: PropTypes.string,
  requestError: PropTypes.shape({
    message: PropTypes.string,
  }),
  updateItem: PropTypes.func.isRequired,
};

SightEventMultimediaForm.defaultProps = {
  data: [],
  language: DEFAULT_LANGUAGE,
  requestError: null,
};

const mapStateToProps = state => ({
  requestError: sightEventsSelectors.getError(state),
});

const mapDispatchToProps = {
  clearError: sightEventsActions.clearError,
  updateItem: sightEventsActions.updateItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(SightEventMultimediaForm);
