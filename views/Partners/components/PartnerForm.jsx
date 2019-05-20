import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import yupNumber from 'yup/lib/number';
import GridItem from 'components/GridItem';
import { actions as partnersActions } from 'redux/partners';

const commonProps = {
  fullWidth: true,
};

const businesTypes = [
  { label: 'Osoba fizyczna', value: 1 },
  { label: 'Jednoosobowa działalność gospodarcza', value: 2 },
  { label: 'Spółka cywilna', value: 3 },
  { label: 'Spółka jawna', value: 4 },
  { label: 'Spółka komandytowa', value: 5 },
  { label: 'Spółka komandytowo-akcyjna', value: 6 },
  { label: 'Spółka akcyjna', value: 7 },
  { label: 'Spółka z ograniczoną odpowiedzialnością', value: 8 },
  { label: 'Stowarzyszenie, fundacja, organizacja pożytku publicznego', value: 9 },
  { label: 'Spółdzielnia', value: 10 },
];

const trades = [
  { value: 'agd', label: 'AGD' },
  { value: 'agdrtv', label: 'AGD i RTV' },
  { value: 'alkoh', label: 'Alkohole' },
  { value: 'apteki', label: 'Apteki' },
  { value: 'artlab', label: 'Artykuły laboratoryjne' },
  { value: 'artmed', label: 'Artykuły medyczne' },
  { value: 'artspoz', label: 'Artykuły spożywcze' },
  { value: 'aukcje', label: 'Aukcje' },
  { value: 'behape', label: 'BHP' },
  { value: 'blizna', label: 'Bielizna' },
  { value: 'bilety', label: 'Bilety' },
  { value: 'buki', label: 'Bukmacher' },
  { value: 'biz', label: 'Biżuteria i zegarki' },
  { value: 'budow', label: 'Budownictwo' },
  { value: 'chemia', label: 'Chemia' },
  { value: 'czaspis', label: 'Czasopisma' },
  { value: 'dekor', label: 'Dekoracje' },
  { value: 'dewoc', label: 'Dewocjonalia' },
  { value: 'domiogr', label: 'Dom i ogród' },
  { value: 'dziecko', label: 'Dziecko' },
  { value: 'elektronika', label: 'Elektronika' },
  { value: 'epapier', label: 'E-papierosy' },
  { value: 'ezoter', label: 'Ezoteryka' },
  { value: 'filatel', label: 'Filatelistyka' },
  { value: 'finanse', label: 'Finanse' },
  { value: 'fotogr', label: 'Fotografia' },
  { value: 'fundacja', label: 'Fundacja' },
  { value: 'galant', label: 'Galanteria' },
  { value: 'gadzet', label: 'Gadżety' },
  { value: 'gry', label: 'Gry' },
  { value: 'komphost', label: 'Hosting' },
  { value: 'hotel', label: 'Hotelarstwo' },
  { value: 'instyt', label: 'Instytucje' },
  { value: 'komputery', label: 'Komputery' },
  { value: 'ksiazki', label: 'Książki' },
  { value: 'kosmetyki', label: 'Kosmetyki' },
  { value: 'ksieg', label: 'Księgarnia' },
  { value: 'kip', label: 'Kwiaty i prezenty' },
  { value: 'mwf', label: 'Masowi Wystawcy Faktur' },
  { value: 'maszyny', label: 'Maszyny' },
  { value: 'matbiur', label: 'Materiały biurowe' },
  { value: 'matfol', label: 'Materiały foliowe' },
  { value: 'matpap', label: 'Materiały papierowe' },
  { value: 'militaria', label: 'Militaria' },
  { value: 'motoryz', label: 'Motoryzacja' },
  { value: 'mim', label: 'Multimedia i muzyka' },
  { value: 'nagrob', label: 'Nagrobki' },
  { value: 'narzedzia', label: 'Narzędzia' },
  { value: 'nis', label: 'Nauka i szkolnictwo' },
  { value: 'numiz', label: 'Numizmatyka' },
  { value: 'obuwie', label: 'Obuwie' },
  { value: 'odziez', label: 'Odzież' },
  { value: 'ogl', label: 'Ogłoszenia' },
  { value: 'ogrod', label: 'Ogród' },
  { value: 'oprogra', label: 'Oprogramowanie' },
  { value: 'oswietl', label: 'Oświetlenie' },
  { value: 'pasman', label: 'Pasmanteria' },
  { value: 'podroze', label: 'Podróże' },
  { value: 'randki', label: 'Portal randkowy' },
  { value: 'portfel', label: 'Portfel elektroniczny' },
  { value: 'prasa', label: 'Prasa' },
  { value: 'prawo', label: 'Prawo' },
  { value: 'kurier', label: 'Przesyłki kurierskie' },
  { value: 'reklama', label: 'Reklama' },
  { value: 'rekodz', label: 'Rękodzieło' },
  { value: 'rodzice', label: 'Rodzice' },
  { value: 'rtv', label: 'RTV' },
  { value: 'serint', label: 'Serwis internetowy' },
  { value: 'sklmuz', label: 'Sklep muzyczny' },
  { value: 'siw', label: 'Sport i wypoczynek' },
  { value: 'suplem', label: 'Suplementy diety' },
  { value: 'szklo', label: 'Szkło' },
  { value: 'szkol', label: 'Szkolenia' },
  { value: 'sztuka', label: 'Sztuka' },
  { value: 'slubne', label: 'Ślubne' },
  { value: 'tif', label: 'Teatr i film' },
  { value: 'telek', label: 'Telekomunikacja' },
  { value: 'tkan', label: 'Tkaniny' },
  { value: 'twstrwww', label: 'Tworzenie stron WWW' },
  { value: 'ubezp', label: 'Ubezpieczenia' },
  { value: 'uslugi', label: 'Usługi' },
  { value: 'wielob', label: 'Wielobranżowość' },
  { value: 'wypmiesz', label: 'Wyposażenie mieszkania' },
  { value: 'wypsklep', label: 'Wyposażenie sklepów' },
  { value: 'wyrtyt', label: 'Wyroby tytoniowe' },
  { value: 'wio', label: 'Wzrok i okulary' },
  { value: 'vod', label: 'VoD' },
  { value: 'zabawki', label: 'Zabawki' },
  { value: 'zik', label: 'Zdrowie i kosmetyki' },
  { value: 'zwierz', label: 'Zwierzęta' },
];

const styles = {
  formControl: {
    width: '100%',
  },
  section: {
    marginTop: 40,
  },
};

class AddPartnerForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialValues: {
        email: '',
        name: '',
        commission: 0,
        p24MerchantId: '',
        affiliateCode: '',
        users: [],
      },
    };

    this.validationSchema = yupObject().shape({
      email: yupString().email().trim().required(),
      name: yupString().required(),
      commission: yupNumber().min(0).max(100).required(),
      p24MerchantId: yupString().required(),
      affiliateCode: yupString(),
    });
  }


  handleSubmit = (values) => {
    const { onSubmit } = this.props;
    onSubmit(values);
  };

  handleSubmit = (values, actions) => {
    const { createPartner, onSuccess, onFailure } = this.props;
    const { resetForm, setSubmitting } = actions;
    createPartner({
      data: {
        ...values,
      },
      onSuccess: () => {
        resetForm();
        onSuccess();
      },
      onFailure: () => {
        setSubmitting(false);
        onFailure();
      },
    });
  };

  render() {
    const { initialValues } = this.state;
    const { buttons, classes, FormikProps } = this.props;
    return (
      <Formik
        {...FormikProps}
        initialValues={initialValues}
        validationSchema={this.validationSchema}
        onSubmit={this.handleSubmit}
        enableReinitialize
      >
        { ({ isSubmitting }) => (
          <Form autoComplete="off" noValidate>
            <Grid container spacing={16}>
              <GridItem>
                <Typography variant="h6">Dane partnera</Typography>
              </GridItem>
              <GridItem>
                <Field name="name" label="Nazwa" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Field name="street" label="Ulica" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={3} sm={3}>
                <Field name="zipCode" label="Kod pocztowy" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={6} sm={6}>
                <Field name="city" label="Miasto" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={3} sm={3}>
                <Field name="country" label="Kraj" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="phone" label="Telefon" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="email" label="E-mail" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4} />
              <GridItem className={classes.section}>
                <Typography variant="h6">Informacje o działalności</Typography>
              </GridItem>
              <GridItem md={3} sm={3}>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="business-type">Rodzaj działalności</InputLabel>
                  <Select
                    value=""
                    onChange={this.handleChange}
                    input={<Input name="businessType" id="business-type" />}
                    autoWidth
                  >
                    {businesTypes.map(({ label, value }) => (
                      <MenuItem key={label} value={value}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem md={3} sm={3} />
              <GridItem md={3} sm={3} />
              <GridItem md={3} sm={3} />
              <GridItem md={3} sm={3}>
                <Field name="taxNumber" label="NIP" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={3} sm={3}>
                <Field name="employerId" label="REGON" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={3} sm={3}>
                <Field name="socialNumber" label="PESEL" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={3} sm={3}>
                <Field name="natoinalCourtRegister" label="KRS" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem className={classes.section}>
                <Typography variant="h6">Osoba reprezentująca</Typography>
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="contactName" label="Imię i nazwisko" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="contactPhone" label="Telefon" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="contactEmail" label="E-mail" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem className={classes.section}>
                <Typography variant="h6">Płatności</Typography>
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="bankAccount" label="Konto bankowe" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="invoiceEmail" label="E-mail do faktur" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4} />
              <GridItem md={4} sm={4}>
                <Field name="commission" type="number" label="Prowizja (%)" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="affiliateCode" label="Kod afiliacyjny" component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4} />
              <GridItem className={classes.section}>
                <Typography variant="h6">Przelewy24</Typography>
              </GridItem>
              <GridItem md={4} sm={4}>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="trade-type">Branża</InputLabel>
                  <Select
                    value=""
                    onChange={this.handleChange}
                    input={<Input name="trade" id="trade-type" />}
                    autoWidth
                  >
                    {trades.map(({ label, value }) => (
                      <MenuItem key={label} value={value}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="shopUrl" label="Adres URL sklepu" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Field name="serviceDescription" label="Opis usługi" required component={TextField} {...commonProps} />
              </GridItem>
            </Grid>
            {buttons
              && (
              <Grid container spacing={16} justify="flex-end">
                <GridItem container md={3} sm={3} justify="flex-end">
                  <Button variant="contained" color="primary" type="submit" disabled={isSubmitting}>
                    Zapisz
                  </Button>
                </GridItem>
              </Grid>
              )
            }
          </Form>
        )}
      </Formik>
    );
  }
}

AddPartnerForm.propTypes = {
  buttons: PropTypes.bool,
  classes: PropTypes.shape({}).isRequired,
  createPartner: PropTypes.func.isRequired,
  FormikProps: PropTypes.shape({}),
  listAction: PropTypes.func,
  onSubmit: PropTypes.func,
  onFailure: PropTypes.func,
  onSuccess: PropTypes.func,
};

AddPartnerForm.defaultProps = {
  buttons: true,
  FormikProps: null,
  listAction: null,
  onSubmit: null,
  onFailure: null,
  onSuccess: null,
};

const mapDispatchToProps = {
  createPartner: partnersActions.createItem,
};

export default compose(
  withStyles(styles),
  connect(null, mapDispatchToProps),
)(AddPartnerForm);
