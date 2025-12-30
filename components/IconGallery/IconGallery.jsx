import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import config from 'config';
import GridItem from 'components/GridItem';
import categories from './categories';
import variants from './variants';
import icons from './icons';

const styles = theme => ({
  header: {
    '&:first-letter': {
      textTransform: 'uppercase',
    },
  },
  section: {
    marginBottom: theme.spacing.unit * 3,
  },
});

class IconGallery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      iconsManifest: undefined,
    };

    this.fetchCustomIconsManifest = this.fetchCustomIconsManifest.bind(this);
    this.handleIconClick = this.handleIconClick.bind(this);
  }

  componentDidMount() {
    this.fetchCustomIconsManifest();
  }

  async fetchCustomIconsManifest() {
    const { axios: axiosConfig } = config.public || {};

    if (!axiosConfig || !axiosConfig.iconManifestURL) {
      // brak konfiguracji – traktujemy jak błąd
      // ale nie wywracamy całej aplikacji
      // eslint-disable-next-line no-console
      console.error('IconGallery: missing iconManifestURL in config.public.axios');
      this.setState({ iconsManifest: null });
      return;
    }

    try {
      const { data } = await axios.get(
        `${axiosConfig.iconManifestURL}/custom/manifest.json`,
      );
      this.setState({ iconsManifest: data });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch custom icons manifest.', e);
      this.setState({ iconsManifest: null });
    }
  }

  handleIconClick(event, iconSrc) {
    const { onSelect } = this.props;

    if (onSelect) {
      onSelect(iconSrc);
    }
  }

  render() {
    const { classes } = this.props;
    const { iconsManifest } = this.state;

    const { iconBaseURL } = (config && config.public) || {};
    const sections = Object.values(categories);
    const variant = 'svg';

    return (
      <React.Fragment>
     <Grid container className={classes.section}>
       <GridItem>
         <Typography variant="h6" className={classes.header}>
           Ikony Hello Poland
         </Typography>

         {iconsManifest === undefined && <CircularProgress />}

         {iconsManifest
           && iconsManifest.icons
             .map(({ name }) => {
               // dokładna ścieżka do Twoich customowych ikon:
               // /static/icons/custom/svg/production/<name>.svg
               const variantPath = 'custom/svg/production';
               const src = `${iconBaseURL}/${variantPath}/${name}.svg`;

               return (
                 <IconButton
                   key={src}
                   onClick={event => this.handleIconClick(event, src)}
                 >
                   <img
                     src={src}
                     alt={name}
                     height={48}
                     width={48}
                     title={name}
                   />
                 </IconButton>
               );
             })}
       </GridItem>
     </Grid>
        {iconsManifest !== undefined
          && sections.map((sectionName) => {
            const sectionIcons = icons[sectionName];

            if (!sectionIcons) {
              return null;
            }

            return (
              <Grid container key={sectionName} className={classes.section}>
                <GridItem>
                  <Typography variant="h6" className={classes.header}>
                    {sectionName.toLowerCase()}
                  </Typography>
                </GridItem>
                {sectionIcons.map(({ name }) => {
                  const variantPath = `${sectionName.toLowerCase()}${
                    variants[variant].path
                  }`;
                  const variantSuffix = variants[variant].suffix;
                  const src = `${iconBaseURL}/${variantPath}/${name}${variantSuffix}`;

                  return (
                    <IconButton
                      key={src}
                      onClick={event => this.handleIconClick(event, src)}
                    >
                      <img
                        src={src}
                        alt={name}
                        height={48}
                        width={48}
                        title={name}
                      />
                    </IconButton>
                  );
                })}
              </Grid>
            );
          })}
      </React.Fragment>
    );
  }
}

IconGallery.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default withStyles(styles)(IconGallery);
