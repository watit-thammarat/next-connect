import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import FormControl from '@material-ui/core/FormControl';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Gavel from '@material-ui/icons/Gavel';
import VerifiedUserTwoTone from '@material-ui/icons/VerifiedUserTwoTone';
import withStyles from '@material-ui/core/styles/withStyles';
import Link from 'next/link';

import { signupUser } from '../lib/auth';

const Transition = props => <Slide {...props} direction="up" />;

class Signup extends React.Component {
  state = {
    user: '',
    name: '',
    email: '',
    password: '',
    error: '',
    openError: false,
    openSuccess: false,
    isLoading: false
  };

  handleClose = () => this.setState({ openError: false });

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.setState({
      error: '',
      openError: false,
      openSuccess: false,
      isLoading: true
    });
    const { name, email, password } = this.state;
    let user = { name, email, password };
    try {
      user = await signupUser(user);
      this.setState({ user: user.name, openSuccess: true });
    } catch (err) {
      this.showError(err);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  showError = err => {
    const error = (err.response && err.response.data) || err.message;
    this.setState({ error, openError: true });
  };

  render() {
    const { classes } = this.props;
    const { error, openError, isLoading, openSuccess, user } = this.state;
    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <Gavel />
          </Avatar>
          <Typography variant="h5" component="h1">
            Sign up
          </Typography>
          <form className={classes.form} onSubmit={this.handleSubmit}>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="name">Name</InputLabel>
              <Input name="name" type="text" onChange={this.handleChange} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="email">Email</InputLabel>
              <Input name="email" type="email" onChange={this.handleChange} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="passworld">Password</InputLabel>
              <Input
                name="password"
                type="password"
                onChange={this.handleChange}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              color="primary"
              variant="contained"
              disabled={isLoading}
              className={classes.submit}
            >
              {isLoading ? 'Sigining up...' : 'Sign up'}
            </Button>
          </form>
          {error && (
            <Snackbar
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              open={openError}
              onClose={this.handleClose}
              autoHideDuration={6000}
              message={<span className={classes.snack}>{error}</span>}
            />
          )}
        </Paper>
        <Dialog
          open={openSuccess}
          disableBackdropClick={true}
          TransitionComponent={Transition}
        >
          <DialogTitle>
            <VerifiedUserTwoTone className={classes.icon} />
            New Account
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              User {user} successfully created
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" variant="contained">
              <Link href="/signin">
                <a className={classes.signinLink}>Sign in</a>
              </Link>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    width: 'auto',
    display: 'block',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up('md')]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing.unit * 2
  },
  signinLink: {
    textDecoration: 'none',
    color: 'white'
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%',
    marginTop: theme.spacing.unit
  },
  submit: {
    marginTop: theme.spacing.unit * 2
  },
  snack: {
    color: theme.palette.secondary.light
  },
  icon: {
    padding: '0px 2px 2px 0px',
    verticalAlign: 'middle',
    color: 'green'
  }
});

export default withStyles(styles)(Signup);
