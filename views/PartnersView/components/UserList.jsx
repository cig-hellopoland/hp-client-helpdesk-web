import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import IconClear from '@material-ui/icons/Clear';
import IconBlock from '@material-ui/icons/Block';
import {
  List, ListItem, ListItemText, ListItemSecondaryAction,
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import AlertDialog from 'components/AlertDialog';

const initialState = {
  open: false,
  dialogContent: '',
  onSuccess: null,
};

class UserList extends Component {
  state = initialState;

  handleRemoveUser = (index) => {
    const { actions } = this.props;
    return actions.remove(index);
  }

  handleClose = () => this.setState({ ...initialState })

  handleDialogOpen = dialog => this.setState({ ...dialog, open: true })

  render() {
    const { users } = this.props;
    const { open, dialogContent, onSuccess } = this.state;
    return (
      <>
        <List dense>
          {
            users.length > 0
              ? (
                users.map(({ email, name }, index) => (
                  <div key={email}>
                    <ListItem>
                      <ListItemText primary={name} secondary={email} />
                      <ListItemSecondaryAction>
                        <IconButton onClick={() => this.handleDialogOpen({
                          dialogContent: `Czy chcesz usunąć użytkownika ${name}?`,
                          onSuccess: () => {
                            this.handleRemoveUser(index);
                            this.handleClose();
                          },
                        })}
                        >
                          <IconClear />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </div>
                ))
              ) : (
                <Grid container alignItems="center">
                  <IconBlock />
                  <Typography variant="subtitle2">Brak bileterów</Typography>
                </Grid>
              )
          }
        </List>
        <AlertDialog
          open={open}
          onCancel={this.handleClose}
          onSuccess={onSuccess}
          title="Usuwanie użytkownika"
          content={dialogContent}
        />
      </>
    );
  }
}

UserList.propTypes = {
  actions: PropTypes.shape({}).isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default UserList;
