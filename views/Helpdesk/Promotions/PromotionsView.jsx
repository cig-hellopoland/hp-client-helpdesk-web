import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect, ReactReduxContext } from 'react-redux';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Snackbar from '@material-ui/core/Snackbar';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import BlockIcon from '@material-ui/icons/Block';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SaveIcon from '@material-ui/icons/Save';
import SearchIcon from '@material-ui/icons/Search';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Layout from 'components/Layout';
import EmptyView from 'components/EmptyView';
import withAuth from 'services/auth/withAuth';
import { selectors as profileSelectors } from 'redux/profile';

const emptyCampaignForm = {
  name: '',
  promotionType: 'TICKET',
  scopeType: 'TAG',
  validFrom: '',
  validTo: '',
  ticketValidTo: '',
  globalLimit: '',
  codeLimit: '',
  customerLimit: '',
  dailyLimit: '',
  requiredTicketQuantity: '1',
  grantedTicketQuantity: '1',
  discountPercent: '',
  discountAmountGrossPln: '',
  markerTagId: '',
  tagIds: [],
  sightEventIds: [],
};

const emptyCodeForm = {
  mode: 'GENERATE',
  codes: '',
  fixedCode: '',
  generateCount: '2000',
  generatedCodeLength: '12',
  generatedCodePrefix: '',
  generatedCodeSeparator: '-',
  codeType: 'ONE_TIME',
  maxRedemptions: '',
  maxRedemptionsPerCustomer: '',
  maxRedemptionsPerDay: '',
  fileName: '',
};

const emptyTargetForm = {
  tagIds: [],
  partnerIds: '',
  sightIds: '',
  sightEventIds: [],
  ticketPricePln: '1.00',
  availableTicketsNumber: '100',
  ticketName: '',
  poolName: '',
};

const promotionTypeLabels = {
  TICKET: 'Bilet promocyjny',
  PERCENT: 'Rabat procentowy',
  AMOUNT: 'Rabat kwotowy',
};

const promotionTypeHints = {
  TICKET: 'kod dodaje do koszyka specjalny bilet z puli promocyjnej',
  PERCENT: 'kod obniża wartość koszyka o wskazany procent',
  AMOUNT: 'kod obniża wartość koszyka o wskazaną kwotę brutto',
};

const scopeLabels = {
  TAG: 'Po tagu',
  MANUAL: 'Wybrane oferty',
  GLOBAL: 'Globalna',
};

const statusLabels = {
  DRAFT: 'Robocza',
  ACTIVE: 'Aktywna',
  DISABLED: 'Wyłączona',
  ARCHIVED: 'Archiwalna',
};

const codeModeLabels = {
  GENERATE: 'Wygeneruj kody',
  IMPORT: 'Wczytaj CSV',
  FIXED: 'Jeden kod stały',
};

const codeTypeLabels = {
  ONE_TIME: 'Jednorazowy',
  FIXED: 'Wielorazowy',
};

const codeStatusLabels = {
  ACTIVE: 'Aktywny',
  RESERVED: 'Zarezerwowany',
  USED: 'Użyty',
  DISABLED: 'Wyłączony',
};

const ticketPoolStatusLabels = {
  NOT_REQUIRED: 'Nie wymaga puli',
  NOT_CREATED: 'Brak puli',
  CONFIG_REQUIRED: 'Wymaga konfiguracji',
  CREATED: 'Gotowa',
  ERROR: 'Błąd tworzenia',
};

const promotionMessages = {
  PROMOTION_CODES_REQUIRED: 'Nie można uruchomić promocji bez kodów.',
  PROMOTION_TICKET_TARGETS_REQUIRED: 'Nie można uruchomić promocji TICKET bez ofert.',
  PROMOTION_TICKET_POOLS_REQUIRED:
    'Nie można uruchomić promocji TICKET. Najpierw utwórz pule promocyjne dla wszystkich ofert.',
  PROMOTION_TICKET_POOLS_NOT_GENERATED:
    'Pule promocyjne nie zostały jeszcze wygenerowane. Uzupełnij cenę i liczbę biletów, a następnie kliknij „Generuj pule”.',
  PROMOTION_TICKET_POOLS_ERROR:
    'Nie udało się utworzyć części pul promocyjnych. Sprawdź listę ofert i ponów generowanie.',
  PROMOTION_TARGETS_PREVIEW_FAILED: 'Nie udało się pobrać ofert promocji.',
};

const steps = ['Promocja', 'Kody', 'Zakres'];
const codesRowsPerPageOptions = [10, 25, 50, 100];
const maxGeneratedCodes = 100000;
const targetListLimit = 30;

const styles = {
  content: {
    padding: 16,
    width: '100%',
  },
  paper: {
    flex: 1,
    overflowX: 'auto',
  },
  toolbar: {
    padding: 8,
  },
  icon: {
    marginRight: 8,
  },
  actions: {
    minWidth: 120,
  },
  dialogContent: {
    maxHeight: 'calc(100vh - 220px)',
    minHeight: 420,
    overflowY: 'auto',
  },
  dialogActions: {
    background: '#fff',
    borderTop: '1px solid #e0e0e0',
  },
  fieldHint: {
    marginTop: 8,
  },
  detailsSection: {
    background: '#fafafa',
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    marginTop: 12,
    padding: 12,
  },
  detailsSummary: {
    background: '#fafafa',
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    padding: 12,
  },
  detailsSectionTitle: {
    marginBottom: 8,
  },
  hiddenInput: {
    display: 'none',
  },
  targetPicker: {
    position: 'relative',
  },
  targetDropdown: {
    maxHeight: 260,
    overflowY: 'auto',
  },
  targetPopper: {
    zIndex: 1500,
  },
  targetDropdownButton: {
    padding: 4,
  },
  targetMenuItem: {
    fontSize: 14,
    minHeight: 36,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  targetMenuCheckbox: {
    height: 32,
    width: 32,
  },
  targetMenuText: {
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  codesPagination: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '12px 0',
  },
  codesPaginationSelect: {
    marginLeft: 12,
    marginRight: 24,
    width: 84,
  },
  codesPaginationRange: {
    marginRight: 12,
  },
};

const canManagePromotions = profile => ((profile && profile.roles) || [])
  .some(role => role === 'ADMIN' || role === 'ROOT');

const normalizeSearchValue = value => (value || '')
  .toLocaleLowerCase('pl')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isNaN(parsed) ? null : parsed;
};

const toIntegerOrNull = (value) => {
  const parsed = toNumberOrNull(value);
  return parsed !== null && Number.isInteger(parsed) ? parsed : null;
};

const plnToCents = (value) => {
  const amount = toNumberOrNull(value);
  return amount === null ? null : Math.round(amount * 100);
};

const centsToPln = value => ((value || 0) / 100).toFixed(2);

const parseIds = value => (value || '')
  .toString()
  .split(',')
  .map(item => item.trim())
  .filter(Boolean)
  .map(Number)
  .filter(item => !Number.isNaN(item));

const normalizeIds = ids => parseIds(ids).slice().sort((left, right) => left - right);

const sameIds = (left, right) => {
  const normalizedLeft = normalizeIds(left);
  const normalizedRight = normalizeIds(right);
  return normalizedLeft.length === normalizedRight.length
    && normalizedLeft.every((id, index) => id === normalizedRight[index]);
};

const parseCodes = value => (value || '')
  .split(/\r?\n/)
  .map(item => item.trim())
  .filter(Boolean);

const dateToPayload = value => (value ? new Date(value).toISOString() : null);

const dateToEndOfDayPayload = value => (
  value ? new Date(`${value}T23:59:59.999`).toISOString() : null
);

const formatDate = value => (value ? String(value).replace('T', ' ').slice(0, 16) : '-');

const formatDateOnly = (value) => {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pl-PL');
};

class PromotionsView extends React.Component {
  static contextType = ReactReduxContext;

  state = {
    addDialogOpen: false,
    detailsDialogOpen: false,
    activeStep: 0,
    campaigns: [],
    selectedCampaign: null,
    codes: [],
    redemptions: [],
    creationTargetsPreview: [],
    creationTargetsLoading: false,
    creationTargetsLoaded: false,
    targetPreview: [],
    campaignTargetsPreview: [],
    campaignTargetsVisible: false,
    campaignTargetsLoading: false,
    tagOptions: [],
    sightEventOptions: [],
    campaignForm: { ...emptyCampaignForm },
    codeForm: { ...emptyCodeForm },
    addCodeForm: { ...emptyCodeForm },
    targetForm: { ...emptyTargetForm },
    markerTagId: '',
    filterText: '',
    campaignTagQuery: '',
    campaignTagOpen: false,
    campaignSightEventQuery: '',
    campaignSightEventOpen: false,
    poolTagQuery: '',
    poolTagOpen: false,
    poolSightEventQuery: '',
    poolSightEventOpen: false,
    codesPage: 0,
    codesRowsPerPage: 25,
    disablingCodeId: null,
    loading: false,
    snackbarOpen: false,
    snackbarMessage: '',
  };

  componentDidMount() {
    this.fetchCampaigns();
    this.fetchTargetOptions();
  }

  getHttpClient = () => {
    const { store } = this.context || {};
    const { logicMiddleware } = store || {};
    return logicMiddleware && logicMiddleware.httpClient;
  };

  openSnackbar = snackbarMessage => this.setState({ snackbarOpen: true, snackbarMessage });

  closeSnackbar = () => this.setState({ snackbarOpen: false, snackbarMessage: '' });

  resolveErrorMessage = (data, fallback) => (
    (data && data.code && promotionMessages[data.code])
    || (data && data.message)
    || fallback
  );

  handleError = fallback => (error) => {
    const responseData = error
      && error.response
      && error.response.data
      && error.response.data;
    this.setState({ loading: false });
    this.openSnackbar(this.resolveErrorMessage(responseData, fallback));
  };

  fetchCampaigns = () => {
    const httpClient = this.getHttpClient();
    if (!httpClient) {
      return;
    }
    this.setState({ loading: true });
    httpClient.get('/promotions')
      .then(({ data }) => this.setState({ campaigns: data || [], loading: false }))
      .catch(this.handleError('Nie udało się pobrać promocji'));
  };

  normalizeListResponse = data => (Array.isArray(data) ? data : (data && data.items) || []);

  fetchTargetOptions = () => {
    const httpClient = this.getHttpClient();
    if (!httpClient) {
      return;
    }
    Promise.all([
      httpClient.get('/tags'),
      httpClient.get('/sight-events'),
    ])
      .then(([tagsResponse, sightEventsResponse]) => this.setState({
        tagOptions: this.normalizeListResponse(tagsResponse.data),
        sightEventOptions: this.normalizeListResponse(sightEventsResponse.data),
      }))
      .catch(() => this.openSnackbar('Nie udało się pobrać listy tagów lub ofert'));
  };

  optionLabel = (options, id) => {
    const option = options.find(item => String(item.id) === String(id));
    if (!option) {
      return id;
    }
    return option.label || option.name || `#${id}`;
  };

  optionText = option => (option ? (option.label || option.name || `#${option.id}`) : '');

  filteredOptions = (options, query) => {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) {
      return options.slice(0, targetListLimit);
    }
    return options.filter(option => (
      normalizeSearchValue(`${option.id} ${this.optionText(option)}`).includes(normalizedQuery)
    )).slice(0, targetListLimit);
  };

  targetSummary = (ids, emptyLabel, options) => {
    const selectedIds = parseIds(ids);
    if (!selectedIds.length) {
      return emptyLabel;
    }
    if (selectedIds.length <= 2) {
      return selectedIds.map(id => this.optionLabel(options, id)).join(', ');
    }
    return `${selectedIds.length} wybranych`;
  };

  targetOptionById = (id) => {
    const { sightEventOptions } = this.state;
    return sightEventOptions.find(item => String(item.id) === String(id));
  };

  targetPreviewById = (id) => {
    const { creationTargetsPreview } = this.state;
    return creationTargetsPreview.find(item => String(item.sightEventId) === String(id));
  };

  campaignTargetPreviewById = (id) => {
    const { campaignTargetsPreview, selectedCampaign } = this.state;
    const previewItem = campaignTargetsPreview
      .find(item => String(item.sightEventId) === String(id));
    if (previewItem) {
      return previewItem;
    }
    const relation = selectedCampaign && (selectedCampaign.sightEvents || [])
      .find(item => String(item.sightEventId) === String(id));
    const optionTarget = this.targetFromOption(id);
    return relation && {
      ...optionTarget,
      sightEventName: relation.sightEventName || optionTarget.sightEventName,
      hptSightEventId: relation.hptSightEventId || optionTarget.hptSightEventId,
      hptAtnaId: relation.hptAtnaId,
      hptTicketDefinitionId: relation.hptTicketDefinitionId,
      hptTicketPoolDefinitionId: relation.hptTicketPoolDefinitionId,
      ticketPoolStatus: relation.ticketPoolStatus,
    };
  };

  targetFromOption = (id) => {
    const option = this.targetOptionById(id);
    return (option && {
      sightEventId: option.id,
      sightEventName: option.name,
      sightId: option.sightId || (option.sight && option.sight.id),
      sightName: option.sightName || (option.sight && option.sight.name),
      partnerId: option.partnerId || (option.partner && option.partner.id),
      partnerName: option.partnerName || (option.partner && option.partner.name),
      hptSightEventId: option.hptId,
    }) || {
      sightEventId: id,
      sightEventName: `Oferta #${id}`,
    };
  };

  selectedCreationTargets = () => {
    const { campaignForm } = this.state;
    const selectedIds = parseIds(campaignForm.sightEventIds);
    return selectedIds.map((id) => {
      const previewItem = this.targetPreviewById(id);
      return previewItem || this.targetFromOption(id);
    });
  };

  selectedCampaignTargets = () => {
    const { targetForm } = this.state;
    const selectedIds = parseIds(targetForm.sightEventIds);
    return selectedIds.map((id) => {
      const previewItem = this.campaignTargetPreviewById(id);
      return previewItem || this.targetFromOption(id);
    });
  };

  campaignTargetIds = (campaign) => {
    if (!campaign) {
      return [];
    }
    return ((campaign.sightEvents || [])
      .filter(item => item.active !== false)
      .map(item => item.sightEventId)
      .filter(Boolean));
  };

  hasCampaignTargetChanges = () => {
    const { selectedCampaign, targetForm } = this.state;
    return !sameIds(targetForm.sightEventIds, this.campaignTargetIds(selectedCampaign));
  };

  canSaveCampaignTargets = () => {
    const { selectedCampaign } = this.state;
    return this.hasCampaignTargetChanges()
      || (selectedCampaign && selectedCampaign.promotionType === 'TICKET');
  };

  campaignTagSummary = () => {
    const { selectedCampaign, tagOptions } = this.state;
    if (!selectedCampaign || !selectedCampaign.tagIds || !selectedCampaign.tagIds.length) {
      return '-';
    }
    return selectedCampaign.tagIds.map(id => this.optionLabel(tagOptions, id)).join(', ');
  };

  campaignTargetForm = (campaign) => {
    const form = { ...emptyTargetForm };
    if (!campaign) {
      return form;
    }
    if (campaign.scopeType === 'TAG') {
      form.tagIds = campaign.tagIds || [];
    }
    form.sightEventIds = ((campaign.sightEvents || [])
      .filter(item => item.active !== false)
      .map(item => item.sightEventId)
      .filter(Boolean));
    form.poolName = campaign.name || '';
    return form;
  };

  hasTargetSelection = targetSetup => !!(
    (targetSetup.tagIds && targetSetup.tagIds.length)
    || (targetSetup.partnerIds && targetSetup.partnerIds.length)
    || (targetSetup.sightIds && targetSetup.sightIds.length)
    || (targetSetup.sightEventIds && targetSetup.sightEventIds.length)
  );

  getTargetDropdownStyle = anchor => ({
    ...styles.targetDropdown,
    width: anchor ? anchor.clientWidth : undefined,
  });

  toggleFormTarget = (formName, fieldName, id) => () => {
    const normalizedId = Number(id);
    const { activeStep } = this.state;
    const refreshCreationTargets = formName === 'campaignForm' && fieldName === 'tagIds'
      && activeStep === 2;
    this.setState((state) => {
      const currentIds = parseIds(state[formName][fieldName]);
      const nextIds = currentIds.includes(normalizedId)
        ? currentIds.filter(item => item !== normalizedId)
        : currentIds.concat(normalizedId);
      const nextForm = {
        ...state[formName],
        [fieldName]: nextIds,
      };
      if (refreshCreationTargets) {
        nextForm.sightEventIds = [];
      }
      return {
        [formName]: nextForm,
        ...(refreshCreationTargets ? {
          creationTargetsPreview: [],
          creationTargetsLoaded: false,
        } : {}),
      };
    }, () => {
      if (refreshCreationTargets) {
        this.refreshCreationTargetsPreview(true);
      }
    });
  };

  handleAddDialogOpen = () => this.setState({
    addDialogOpen: true,
    activeStep: 0,
    campaignForm: { ...emptyCampaignForm },
    codeForm: { ...emptyCodeForm },
    creationTargetsPreview: [],
    creationTargetsLoading: false,
    creationTargetsLoaded: false,
    campaignTagQuery: '',
    campaignTagOpen: false,
    campaignSightEventQuery: '',
    campaignSightEventOpen: false,
  });

  handleAddDialogClose = () => this.setState({
    addDialogOpen: false,
    activeStep: 0,
    creationTargetsPreview: [],
    creationTargetsLoading: false,
    creationTargetsLoaded: false,
  });

  handleDetailsDialogClose = () => this.setState({
    detailsDialogOpen: false,
    selectedCampaign: null,
    codes: [],
    redemptions: [],
    targetPreview: [],
    campaignTargetsPreview: [],
    campaignTargetsVisible: false,
    campaignTargetsLoading: false,
    addCodeForm: { ...emptyCodeForm },
    targetForm: { ...emptyTargetForm },
    poolTagQuery: '',
    poolTagOpen: false,
    poolSightEventQuery: '',
    poolSightEventOpen: false,
  });

  handlePreviousStep = () => this.setState(state => ({ activeStep: state.activeStep - 1 }));

  handleFilterChange = event => this.setState({ filterText: event.target.value });

  handleQueryChange = name => event => this.setState({ [name]: event.target.value });

  openTargetMenu = name => () => this.setState({ [name]: true });

  closeTargetMenu = name => () => this.setState({ [name]: false });

  toggleTargetMenu = name => (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState(state => ({ [name]: !state[name] }));
  };

  handleTargetKeyDown = name => (event) => {
    if (event.key === 'Escape') {
      this.setState({ [name]: false });
    }
  };

  keepTargetMenuOpen = (event) => {
    event.preventDefault();
  };

  validateCampaignStep = () => {
    const { campaignForm } = this.state;
    const requiredTicketQuantity = toNumberOrNull(campaignForm.requiredTicketQuantity);
    const grantedTicketQuantity = toNumberOrNull(campaignForm.grantedTicketQuantity);
    if (!campaignForm.name.trim()) {
      return 'Podaj nazwę promocji.';
    }
    if (!campaignForm.validFrom || !campaignForm.validTo) {
      return 'Podaj datę początku i końca promocji.';
    }
    if (new Date(campaignForm.validTo) <= new Date(campaignForm.validFrom)) {
      return 'Data końca promocji musi być późniejsza niż data początku.';
    }
    if (campaignForm.promotionType === 'TICKET' && !campaignForm.ticketValidTo) {
      return 'Podaj graniczną datę ważności biletów promocyjnych.';
    }
    if (campaignForm.promotionType === 'TICKET'
        && new Date(`${campaignForm.ticketValidTo}T23:59:59.999`)
          < new Date(campaignForm.validTo)) {
      return 'Bilety muszą być ważne co najmniej do końca promocji.';
    }
    if (campaignForm.promotionType === 'TICKET'
        && (!requiredTicketQuantity || requiredTicketQuantity <= 0
          || !grantedTicketQuantity || grantedTicketQuantity <= 0)) {
      return 'Podaj poprawną liczbę kupowanych i przyznawanych biletów.';
    }
    if (campaignForm.promotionType === 'PERCENT') {
      const discountPercent = toNumberOrNull(campaignForm.discountPercent);
      if (discountPercent === null || discountPercent <= 0 || discountPercent > 100) {
        return 'Podaj rabat procentowy od 0 do 100.';
      }
    }
    if (campaignForm.promotionType === 'AMOUNT') {
      const discountAmount = toNumberOrNull(campaignForm.discountAmountGrossPln);
      if (discountAmount === null || discountAmount <= 0) {
        return 'Podaj rabat kwotowy w PLN.';
      }
    }
    return null;
  };

  validateCodeStep = (form) => {
    const { codeForm } = this.state;
    const checkedForm = form || codeForm;
    if (checkedForm.mode === 'GENERATE') {
      const generateCount = toIntegerOrNull(checkedForm.generateCount);
      const generatedCodeLength = toIntegerOrNull(checkedForm.generatedCodeLength);
      if (!generateCount || generateCount <= 0 || generateCount > maxGeneratedCodes) {
        return `Podaj całkowitą liczbę kodów od 1 do ${maxGeneratedCodes}.`;
      }
      if (!generatedCodeLength || generatedCodeLength <= 0 || generatedCodeLength > 64) {
        return 'Długość losowej części kodu musi być liczbą całkowitą od 1 do 64.';
      }
    }
    if (checkedForm.mode === 'IMPORT' && !parseCodes(checkedForm.codes).length) {
      return 'Wczytaj albo wklej listę kodów.';
    }
    if (checkedForm.mode === 'FIXED' && !checkedForm.fixedCode.trim()) {
      return 'Podaj kod stały.';
    }
    return null;
  };

  validateTargetStep = () => {
    const { campaignForm } = this.state;
    if (campaignForm.scopeType === 'TAG' && !parseIds(campaignForm.tagIds).length) {
      return 'Wybierz co najmniej jeden tag.';
    }
    if ((campaignForm.scopeType === 'TAG' || campaignForm.scopeType === 'MANUAL')
        && !parseIds(campaignForm.sightEventIds).length) {
      return 'Wybierz co najmniej jedną ofertę.';
    }
    return null;
  };

  validateStep = (step) => {
    if (step === 0) {
      return this.validateCampaignStep();
    }
    if (step === 1) {
      return this.validateCodeStep();
    }
    return this.validateTargetStep();
  };

  validateAllSteps = () => this.validateCampaignStep()
    || this.validateCodeStep()
    || this.validateTargetStep();

  handleNextStep = () => {
    const { activeStep } = this.state;
    const error = this.validateStep(activeStep);
    if (error) {
      this.openSnackbar(error);
      return;
    }
    this.setState(
      state => ({ activeStep: state.activeStep + 1 }),
      () => {
        const { activeStep: nextStep } = this.state;
        if (nextStep === 2) {
          this.refreshCreationTargetsPreview(true);
        }
      },
    );
  };

  handleCodesPageChange = (event, codesPage) => this.setState({ codesPage });

  handleCodesRowsPerPageChange = (event) => {
    this.setState({
      codesPage: 0,
      codesRowsPerPage: Number(event.target.value),
    });
  };

  goToPreviousCodesPage = () => {
    this.setState(state => ({
      codesPage: Math.max(0, state.codesPage - 1),
    }));
  };

  goToNextCodesPage = () => {
    this.setState((state) => {
      const lastPage = Math.max(0, Math.ceil(state.codes.length / state.codesRowsPerPage) - 1);
      return {
        codesPage: Math.min(lastPage, state.codesPage + 1),
      };
    });
  };

  handleCampaignFormChange = name => (event) => {
    const { value } = event.target;
    this.setState((state) => {
      const nextForm = {
        ...state.campaignForm,
        [name]: value,
      };
      if (name === 'promotionType' && value === 'TICKET' && nextForm.scopeType === 'GLOBAL') {
        nextForm.scopeType = 'TAG';
      }
      return { campaignForm: nextForm };
    });
  };

  handleCodeFormChange = name => (event) => {
    const { value } = event.target;
    this.setState(state => ({
      codeForm: {
        ...state.codeForm,
        [name]: value,
      },
    }));
  };

  handleAddCodeFormChange = name => (event) => {
    const { value } = event.target;
    this.setState(state => ({
      addCodeForm: {
        ...state.addCodeForm,
        [name]: value,
      },
    }));
  };

  handleTargetFormChange = name => (event) => {
    const { value } = event.target;
    this.setState(state => ({
      targetForm: {
        ...state.targetForm,
        [name]: value,
      },
    }));
  };

  handleCodesFileChange = formName => (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const codes = parseCodes(reader.result);
      this.setState(state => ({
        [formName]: {
          ...state[formName],
          mode: 'IMPORT',
          codes: codes.join('\n'),
          fileName: file.name,
        },
      }));
      this.openSnackbar(`Wczytano ${codes.length} kodów z pliku`);
    };
    reader.readAsText(file);
  };

  selectCampaign = (campaign) => {
    const httpClient = this.getHttpClient();
    if (!httpClient || !campaign) {
      return;
    }
    this.setState({
      loading: true,
      selectedCampaign: campaign,
      markerTagId: campaign.markerTagId || '',
      detailsDialogOpen: true,
      targetPreview: [],
      campaignTargetsPreview: [],
      campaignTargetsVisible: false,
      codesPage: 0,
    });
    Promise.all([
      httpClient.get(`/promotions/${campaign.id}`),
      httpClient.get(`/promotions/${campaign.id}/codes`),
      httpClient.get(`/promotions/${campaign.id}/redemptions`),
    ])
      .then(([campaignResponse, codesResponse, redemptionsResponse]) => {
        const campaignData = campaignResponse.data;
        this.setState({
          selectedCampaign: campaignData,
          markerTagId: campaignData.markerTagId || '',
          codes: codesResponse.data || [],
          redemptions: redemptionsResponse.data || [],
          targetForm: this.campaignTargetForm(campaignData),
          loading: false,
        });
      })
      .catch(this.handleError('Nie udało się pobrać szczegółów promocji'));
  };

  codeSetupPayload = (form) => {
    const codeType = form.mode === 'FIXED' ? 'FIXED' : form.codeType;
    const payload = {
      fileName: form.fileName || null,
      codeType,
      maxRedemptions: codeType === 'FIXED' ? toNumberOrNull(form.maxRedemptions) : null,
      maxRedemptionsPerCustomer: codeType === 'FIXED'
        ? toNumberOrNull(form.maxRedemptionsPerCustomer)
        : null,
      maxRedemptionsPerDay: codeType === 'FIXED'
        ? toNumberOrNull(form.maxRedemptionsPerDay)
        : null,
    };
    if (form.mode === 'IMPORT') {
      payload.codes = parseCodes(form.codes);
    } else if (form.mode === 'FIXED') {
      payload.fixedCode = form.fixedCode;
      payload.codeType = 'FIXED';
    } else {
      payload.generateCount = toIntegerOrNull(form.generateCount);
      payload.generatedCodeLength = toIntegerOrNull(form.generatedCodeLength);
      payload.generatedCodePrefix = form.generatedCodePrefix || null;
      payload.generatedCodeSeparator = form.generatedCodeSeparator || null;
    }
    return payload;
  };

  campaignPayload = () => {
    const { campaignForm, codeForm } = this.state;
    const { promotionType } = campaignForm;
    const payload = {
      name: campaignForm.name,
      promotionType,
      scopeType: campaignForm.scopeType,
      status: 'DRAFT',
      validFrom: dateToPayload(campaignForm.validFrom),
      validTo: dateToPayload(campaignForm.validTo),
      ticketValidTo: promotionType === 'TICKET'
        ? dateToEndOfDayPayload(campaignForm.ticketValidTo) : null,
      globalLimit: toNumberOrNull(campaignForm.globalLimit),
      codeLimit: toNumberOrNull(campaignForm.codeLimit),
      customerLimit: toNumberOrNull(campaignForm.customerLimit),
      dailyLimit: toNumberOrNull(campaignForm.dailyLimit),
      markerTagId: toNumberOrNull(campaignForm.markerTagId),
      codeSetup: this.codeSetupPayload(codeForm),
    };

    if (campaignForm.scopeType === 'TAG') {
      payload.tagIds = parseIds(campaignForm.tagIds);
      if (parseIds(campaignForm.sightEventIds).length) {
        payload.targetSetup = {
          sightEventIds: parseIds(campaignForm.sightEventIds),
        };
      }
    }
    if (campaignForm.scopeType === 'MANUAL') {
      payload.targetSetup = {
        sightEventIds: parseIds(campaignForm.sightEventIds),
      };
    }
    if (promotionType === 'TICKET') {
      payload.requiredTicketQuantity = toNumberOrNull(campaignForm.requiredTicketQuantity);
      payload.grantedTicketQuantity = toNumberOrNull(campaignForm.grantedTicketQuantity);
    }
    if (promotionType === 'PERCENT') {
      payload.discountPercent = toNumberOrNull(campaignForm.discountPercent);
    }
    if (promotionType === 'AMOUNT') {
      payload.discountAmountGross = plnToCents(campaignForm.discountAmountGrossPln);
    }
    return payload;
  };

  createCampaign = () => {
    const httpClient = this.getHttpClient();
    if (!httpClient) {
      return;
    }
    const error = this.validateAllSteps();
    if (error) {
      this.openSnackbar(error);
      return;
    }

    this.setState({ loading: true });
    httpClient.post('/promotions', this.campaignPayload())
      .then(({ data: campaign }) => {
        this.setState({ loading: false, addDialogOpen: false, activeStep: 0 });
        this.openSnackbar('Utworzono promocję roboczą');
        this.fetchCampaigns();
        this.selectCampaign(campaign);
      })
      .catch(this.handleError('Nie udało się utworzyć promocji'));
  };

  handleMarkerTagChange = (event) => {
    this.setState({ markerTagId: event.target.value });
  };

  saveMarkerTag = () => {
    const httpClient = this.getHttpClient();
    const { markerTagId, selectedCampaign } = this.state;
    if (!httpClient || !selectedCampaign) {
      return;
    }
    this.setState({ loading: true });
    httpClient.patch(`/promotions/${selectedCampaign.id}/marker-tag`, {
      markerTagId: toNumberOrNull(markerTagId),
    })
      .then(({ data }) => {
        this.setState(state => ({
          selectedCampaign: data,
          markerTagId: data.markerTagId || '',
          campaigns: state.campaigns.map(campaign => (
            campaign.id === data.id ? { ...campaign, markerTagId: data.markerTagId } : campaign
          )),
          loading: false,
        }), () => this.openSnackbar('Zapisano oznaczenie promocji'));
      })
      .catch(this.handleError('Nie udało się zapisać oznaczenia promocji'));
  };

  replaceCodes = () => {
    const httpClient = this.getHttpClient();
    const { selectedCampaign, addCodeForm } = this.state;
    if (!httpClient || !selectedCampaign) {
      return;
    }
    const error = this.validateCodeStep(addCodeForm);
    if (error) {
      this.openSnackbar(error);
      return;
    }

    this.setState({ loading: true });
    httpClient.put(`/promotions/${selectedCampaign.id}/codes`, this.codeSetupPayload(addCodeForm))
      .then(() => {
        this.setState({ loading: false });
        this.openSnackbar('Zastąpiono kody promocji');
        this.selectCampaign(selectedCampaign);
      })
      .catch(this.handleError('Nie udało się zastąpić kodów'));
  };

  disableCode = (code) => {
    const httpClient = this.getHttpClient();
    const { selectedCampaign } = this.state;
    if (!httpClient || !selectedCampaign || !code) {
      return;
    }
    this.setState({ disablingCodeId: code.id });
    httpClient.put(`/promotions/${selectedCampaign.id}/codes/${code.id}`, {
      status: 'DISABLED',
    })
      .then(() => {
        this.setState({ disablingCodeId: null });
        this.openSnackbar('Kod został wyłączony');
        this.selectCampaign(selectedCampaign);
      })
      .catch((error) => {
        this.setState({ disablingCodeId: null });
        this.handleError('Nie udało się wyłączyć kodu')(error);
      });
  };

  exportCodes = () => {
    const httpClient = this.getHttpClient();
    const { selectedCampaign } = this.state;
    if (!httpClient || !selectedCampaign) {
      return;
    }
    httpClient.get(`/promotions/${selectedCampaign.id}/codes/export`, { responseType: 'blob' })
      .then(({ data }) => {
        const url = window.URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `promotion-${selectedCampaign.id}-codes.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(this.handleError('Nie udało się wyeksportować kodów'));
  };

  targetPayload = () => {
    const { selectedCampaign, targetForm } = this.state;
    const targetSetup = {
      tagIds: parseIds(targetForm.tagIds),
      partnerIds: parseIds(targetForm.partnerIds),
      sightIds: parseIds(targetForm.sightIds),
      sightEventIds: parseIds(targetForm.sightEventIds),
    };
    if (!this.hasTargetSelection(targetSetup) && selectedCampaign) {
      if (selectedCampaign.scopeType === 'TAG') {
        targetSetup.tagIds = parseIds(selectedCampaign.tagIds);
      }
      if (selectedCampaign.scopeType === 'MANUAL') {
        targetSetup.sightEventIds = ((selectedCampaign.sightEvents || [])
          .filter(item => item.active !== false)
          .map(item => item.sightEventId)
          .filter(Boolean));
      }
    }
    return {
      targetSetup,
      ticketPoolSetup: {
        ticketPrice: plnToCents(targetForm.ticketPricePln),
        availableTicketsNumber: toNumberOrNull(targetForm.availableTicketsNumber),
        ticketName: targetForm.ticketName || null,
        poolName: targetForm.poolName || null,
      },
    };
  };

  creationTargetsPreviewPayload = (useScopeSource) => {
    const { campaignForm } = this.state;
    const targetSetup = {};
    const selectedSightEventIds = parseIds(campaignForm.sightEventIds);
    if (!useScopeSource && selectedSightEventIds.length) {
      targetSetup.sightEventIds = selectedSightEventIds;
    } else if (campaignForm.scopeType === 'TAG') {
      targetSetup.tagIds = parseIds(campaignForm.tagIds);
    } else if (campaignForm.scopeType === 'MANUAL') {
      targetSetup.sightEventIds = selectedSightEventIds;
    }
    return {
      promotionType: campaignForm.promotionType,
      scopeType: campaignForm.scopeType,
      tagIds: parseIds(campaignForm.tagIds),
      targetSetup,
    };
  };

  refreshCreationTargetsPreview = (useScopeSource = false) => {
    const httpClient = this.getHttpClient();
    const { campaignForm } = this.state;
    if (!httpClient || campaignForm.scopeType === 'GLOBAL') {
      return;
    }
    if (campaignForm.scopeType === 'TAG' && !parseIds(campaignForm.tagIds).length) {
      this.setState({
        creationTargetsPreview: [],
        creationTargetsLoaded: false,
      });
      return;
    }
    if (campaignForm.scopeType === 'MANUAL' && !parseIds(campaignForm.sightEventIds).length) {
      this.setState({
        creationTargetsPreview: [],
        creationTargetsLoaded: false,
      });
      return;
    }
    this.setState({ creationTargetsLoading: true });
    httpClient.post('/promotions/targets/preview', this.creationTargetsPreviewPayload(useScopeSource))
      .then(({ data }) => {
        const sightEvents = (data && data.sightEvents) || [];
        this.setState(state => ({
          creationTargetsPreview: sightEvents,
          creationTargetsLoading: false,
          creationTargetsLoaded: true,
          campaignForm: {
            ...state.campaignForm,
            sightEventIds: sightEvents.map(item => item.sightEventId).filter(Boolean),
          },
        }));
      })
      .catch((error) => {
        this.setState({ creationTargetsLoading: false, creationTargetsLoaded: true });
        this.handleError('Nie udało się pobrać ofert dla promocji')(error);
      });
  };

  removeCreationTarget = sightEventId => () => {
    const id = Number(sightEventId);
    this.setState(state => ({
      campaignForm: {
        ...state.campaignForm,
        sightEventIds: parseIds(state.campaignForm.sightEventIds).filter(item => item !== id),
      },
      creationTargetsPreview: state.creationTargetsPreview
        .filter(item => Number(item.sightEventId) !== id),
    }));
  };

  removeCampaignTarget = sightEventId => () => {
    const id = Number(sightEventId);
    this.setState(state => ({
      targetForm: {
        ...state.targetForm,
        sightEventIds: parseIds(state.targetForm.sightEventIds).filter(item => item !== id),
      },
    }));
  };

  participantsPayload = () => {
    const { selectedCampaign, targetForm } = this.state;
    const payload = {
      targetSetup: {
        sightEventIds: parseIds(targetForm.sightEventIds),
      },
    };
    if (selectedCampaign && selectedCampaign.promotionType === 'TICKET') {
      payload.ticketPoolSetup = {
        ticketPrice: plnToCents(targetForm.ticketPricePln),
        availableTicketsNumber: toNumberOrNull(targetForm.availableTicketsNumber),
        ticketName: targetForm.ticketName || null,
        poolName: targetForm.poolName || null,
      };
    }
    return payload;
  };

  saveCampaignTargets = () => {
    const httpClient = this.getHttpClient();
    const { selectedCampaign, targetForm } = this.state;
    if (!httpClient || !selectedCampaign) {
      return;
    }
    if (!this.canSaveCampaignTargets()) {
      this.openSnackbar('Lista ofert nie została zmieniona.');
      return;
    }
    if (!parseIds(targetForm.sightEventIds).length) {
      this.openSnackbar('Wybierz co najmniej jedną ofertę.');
      return;
    }
    if (selectedCampaign.promotionType === 'TICKET') {
      const ticketPrice = toNumberOrNull(targetForm.ticketPricePln);
      const availableTicketsNumber = toNumberOrNull(targetForm.availableTicketsNumber);
      if (ticketPrice === null || ticketPrice <= 0
          || !availableTicketsNumber || availableTicketsNumber <= 0) {
        this.openSnackbar('Cena biletu musi być większa od 0 PLN. Podaj też liczbę biletów dla nowych pul.');
        return;
      }
    }
    this.setState({ loading: true });
    httpClient.put(`/promotions/${selectedCampaign.id}/sight-events`, this.participantsPayload())
      .then(({ data }) => {
        this.setState({
          selectedCampaign: data,
          targetForm: this.campaignTargetForm(data),
          campaignTargetsPreview: [],
          campaignTargetsVisible: false,
          loading: false,
        });
        this.openSnackbar(selectedCampaign.promotionType === 'TICKET'
          ? 'Zapisano oferty i zaktualizowano ich bilety promocyjne.'
          : 'Zapisano listę ofert promocji');
        this.fetchCampaigns();
      })
      .catch(this.handleError('Nie udało się zapisać listy ofert promocji'));
  };

  previewTargets = () => {
    const httpClient = this.getHttpClient();
    const { selectedCampaign } = this.state;
    if (!httpClient || !selectedCampaign) {
      return;
    }
    this.setState({ loading: true });
    httpClient.post(`/promotions/${selectedCampaign.id}/ticket-pools/preview`, this.targetPayload())
      .then(({ data }) => this.setState({
        targetPreview: (data && data.sightEvents) || [],
        loading: false,
      }))
      .catch(this.handleError('Nie udało się pobrać podglądu ofert'));
  };

  toggleCampaignTargetsPreview = () => {
    const httpClient = this.getHttpClient();
    const {
      campaignTargetsPreview,
      campaignTargetsVisible,
      selectedCampaign,
    } = this.state;
    if (campaignTargetsVisible) {
      this.setState({ campaignTargetsVisible: false });
      return;
    }
    if (campaignTargetsPreview.length) {
      this.setState({ campaignTargetsVisible: true });
      return;
    }
    if (!httpClient || !selectedCampaign || selectedCampaign.scopeType === 'GLOBAL') {
      return;
    }
    this.setState({ campaignTargetsLoading: true });
    this.fetchCampaignTargetsPreview()
      .then(({ data }) => {
        const sightEvents = (data && data.sightEvents) || [];
        this.setState(state => ({
          campaignTargetsPreview: sightEvents,
          campaignTargetsVisible: true,
          campaignTargetsLoading: false,
          targetForm: parseIds(state.targetForm.sightEventIds).length ? state.targetForm : {
            ...state.targetForm,
            sightEventIds: sightEvents.map(item => item.sightEventId).filter(Boolean),
          },
        }));
      })
      .catch((error) => {
        this.setState({ campaignTargetsLoading: false });
        this.handleError(promotionMessages.PROMOTION_TARGETS_PREVIEW_FAILED)(error);
      });
  };

  fetchCampaignTargetsPreview = () => {
    const httpClient = this.getHttpClient();
    const { selectedCampaign } = this.state;
    if (!httpClient || !selectedCampaign) {
      return Promise.reject(new Error('Missing selected campaign'));
    }
    return httpClient.post(`/promotions/${selectedCampaign.id}/ticket-pools/preview`, {
      targetSetup: {},
    });
  };

  ticketTargetReady = item => item
    && item.ticketPoolStatus === 'CREATED'
    && item.hptAtnaId;

  ticketPoolsActivationMessage = (sightEvents, missingPools) => {
    if (missingPools.some(item => item.ticketPoolStatus === 'ERROR')) {
      return promotionMessages.PROMOTION_TICKET_POOLS_ERROR;
    }
    const noGenerationWasStarted = missingPools.length === sightEvents.length
      && missingPools.every(item => item.ticketPoolStatus === 'NOT_CREATED' && !item.hptAtnaId);
    if (noGenerationWasStarted) {
      return promotionMessages.PROMOTION_TICKET_POOLS_NOT_GENERATED;
    }
    const readyPoolsCount = sightEvents.length - missingPools.length;
    return `Gotowe pule: ${readyPoolsCount} z ${sightEvents.length}. Wygeneruj brakujące pule przed uruchomieniem promocji.`;
  };

  validateTicketPromotionBeforeActivation = () => (
    this.fetchCampaignTargetsPreview()
      .then(({ data }) => {
        const sightEvents = (data && data.sightEvents) || [];
        const missingPools = sightEvents.filter(item => !this.ticketTargetReady(item));
        this.setState({
          campaignTargetsPreview: sightEvents,
          campaignTargetsVisible: true,
        });
        if (!sightEvents.length) {
          this.openSnackbar(promotionMessages.PROMOTION_TICKET_TARGETS_REQUIRED);
          return false;
        }
        if (missingPools.length) {
          this.openSnackbar(this.ticketPoolsActivationMessage(sightEvents, missingPools));
          return false;
        }
        return true;
      })
      .catch((error) => {
        this.handleError(promotionMessages.PROMOTION_TARGETS_PREVIEW_FAILED)(error);
        return false;
      })
  );

  generatePools = () => {
    const httpClient = this.getHttpClient();
    const { selectedCampaign } = this.state;
    if (!httpClient || !selectedCampaign) {
      return;
    }
    this.setState({ loading: true });
    httpClient.post(`/promotions/${selectedCampaign.id}/ticket-pools/generate`, this.targetPayload())
      .then(({ data }) => {
        this.setState({ selectedCampaign: data, loading: false });
        this.openSnackbar('Wygenerowano pule promocyjne');
        this.selectCampaign(data);
      })
      .catch(this.handleError('Nie udało się wygenerować pul'));
  };

  activateCampaign = () => {
    const httpClient = this.getHttpClient();
    const { selectedCampaign } = this.state;
    if (!httpClient || !selectedCampaign) {
      return;
    }
    if (selectedCampaign.promotionType === 'TICKET') {
      this.validateTicketPromotionBeforeActivation()
        .then((canActivate) => {
          if (canActivate) {
            this.activateCampaignRequest();
          }
        });
      return;
    }
    this.activateCampaignRequest();
  };

  activateCampaignRequest = () => {
    const httpClient = this.getHttpClient();
    const { selectedCampaign } = this.state;
    if (!httpClient || !selectedCampaign) {
      return;
    }
    this.setState({ loading: true });
    httpClient.patch(`/promotions/${selectedCampaign.id}/status`, { status: 'ACTIVE' })
      .then(({ data }) => {
        this.setState({ selectedCampaign: data, loading: false });
        this.openSnackbar('Uruchomiono promocję');
        this.fetchCampaigns();
      })
      .catch(this.handleError('Nie udało się uruchomić promocji'));
  };

  endCampaign = () => {
    const httpClient = this.getHttpClient();
    const { selectedCampaign } = this.state;
    if (!httpClient || !selectedCampaign) {
      return;
    }
    this.setState({ loading: true });
    httpClient.patch(`/promotions/${selectedCampaign.id}/status`, { status: 'DISABLED' })
      .then(({ data }) => {
        this.setState({ selectedCampaign: data, loading: false });
        this.openSnackbar('Promocja została zakończona');
        this.fetchCampaigns();
      })
      .catch(this.handleError('Nie udało się zakończyć promocji'));
  };

  filteredCampaigns = () => {
    const { campaigns, filterText } = this.state;
    const query = normalizeSearchValue(filterText);
    if (!query) {
      return campaigns;
    }
    return campaigns.filter(item => (
      normalizeSearchValue(item.name).includes(query)
      || normalizeSearchValue(item.promotionType).includes(query)
      || normalizeSearchValue(item.status).includes(query)
    ));
  };

  renderCampaignSpecificFields() {
    const { campaignForm } = this.state;
    if (campaignForm.promotionType === 'TICKET') {
      return (
        <React.Fragment>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              helperText="Ile zwykłych biletów musi mieć klient w koszyku"
              label="Wymagana liczba biletów"
              onChange={this.handleCampaignFormChange('requiredTicketQuantity')}
              value={campaignForm.requiredTicketQuantity}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              helperText="Ile biletów promocyjnych dostanie po użyciu kodu"
              label="Przyznawana liczba biletów"
              onChange={this.handleCampaignFormChange('grantedTicketQuantity')}
              value={campaignForm.grantedTicketQuantity}
            />
          </Grid>
        </React.Fragment>
      );
    }
    if (campaignForm.promotionType === 'PERCENT') {
      return (
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            helperText="Np. 20 oznacza rabat 20% od wartości koszyka"
            label="Rabat procentowy"
            onChange={this.handleCampaignFormChange('discountPercent')}
            value={campaignForm.discountPercent}
          />
        </Grid>
      );
    }
    return (
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          helperText="Kwota brutto w złotówkach, np. 50 albo 50.00. System zapisze ją w groszach."
          label="Rabat kwota PLN"
          onChange={this.handleCampaignFormChange('discountAmountGrossPln')}
          value={campaignForm.discountAmountGrossPln}
        />
      </Grid>
    );
  }

  renderTargetPicker({
    label,
    helperText,
    emptyLabel,
    options,
    selectedIds,
    query,
    queryName,
    open,
    openName,
    anchorName,
    formName,
    fieldName,
    compactSummary = false,
  }) {
    const filteredOptions = this.filteredOptions(options, query);
    const selectedNumbers = parseIds(selectedIds);
    let inputValue = this.targetSummary(selectedIds, emptyLabel, options);
    if (compactSummary && selectedNumbers.length) {
      inputValue = `${selectedNumbers.length} wybranych`;
    }
    if (open) {
      inputValue = query;
    }
    return (
      <ClickAwayListener onClickAway={this.closeTargetMenu(openName)}>
        <div
          ref={(element) => { this[anchorName] = element; }}
          style={styles.targetPicker}
        >
          <TextField
            fullWidth
            helperText={helperText}
            InputLabelProps={{ shrink: true }}
            label={label}
            onChange={this.handleQueryChange(queryName)}
            onFocus={this.openTargetMenu(openName)}
            onKeyDown={this.handleTargetKeyDown(openName)}
            value={inputValue}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={`Rozwiń listę: ${label}`}
                    onClick={this.toggleTargetMenu(openName)}
                    style={styles.targetDropdownButton}
                  >
                    <ArrowDropDownIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Popper
            anchorEl={this[anchorName]}
            open={open}
            placement="bottom-start"
            style={styles.targetPopper}
          >
            <Paper
              onMouseUp={this.keepTargetMenuOpen}
              style={this.getTargetDropdownStyle(this[anchorName])}
            >
              {filteredOptions.map(option => (
                <MenuItem
                  key={option.id}
                  onClick={this.toggleFormTarget(formName, fieldName, option.id)}
                  style={styles.targetMenuItem}
                >
                  <Checkbox
                    checked={selectedNumbers.includes(Number(option.id))}
                    style={styles.targetMenuCheckbox}
                  />
                  <ListItemText
                    primary={this.optionText(option)}
                    primaryTypographyProps={{ style: styles.targetMenuText }}
                  />
                </MenuItem>
              ))}
              {!filteredOptions.length && (
                <MenuItem disabled style={styles.targetMenuItem}>
                  Brak wyników
                </MenuItem>
              )}
            </Paper>
          </Popper>
        </div>
      </ClickAwayListener>
    );
  }

  renderScopeFields() {
    const {
      campaignForm,
      campaignTagOpen,
      campaignTagQuery,
      tagOptions,
    } = this.state;
    if (campaignForm.scopeType === 'GLOBAL') {
      return (
        <Grid item xs={12}>
          <Typography color="textSecondary">
            Promocja globalna działa na cały koszyk zgodnie z warunkami promocji.
          </Typography>
        </Grid>
      );
    }
    if (campaignForm.scopeType === 'TAG') {
      return (
        <Grid item xs={12}>
          {this.renderTargetPicker({
            label: 'Tagi objęte promocją',
            helperText: 'Wpisz nazwę i wybierz tagi, których oferty mają brać udział w promocji',
            emptyLabel: 'Wybierz tagi',
            options: tagOptions,
            selectedIds: campaignForm.tagIds,
            query: campaignTagQuery,
            queryName: 'campaignTagQuery',
            open: campaignTagOpen,
            openName: 'campaignTagOpen',
            anchorName: 'campaignTagAnchor',
            formName: 'campaignForm',
            fieldName: 'tagIds',
          })}
        </Grid>
      );
    }
    return (
      <Grid item xs={12}>
        <Typography color="textSecondary">
          Wybierz konkretne oferty, które mają brać udział w promocji.
        </Typography>
      </Grid>
    );
  }

  renderCampaignStep() {
    const { campaignForm, tagOptions } = this.state;
    const allowedScopes = campaignForm.promotionType === 'TICKET'
      ? ['TAG', 'MANUAL']
      : ['TAG', 'MANUAL', 'GLOBAL'];

    return (
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            helperText="Nazwa widoczna w Helpdesku i raportach"
            label="Nazwa promocji"
            onChange={this.handleCampaignFormChange('name')}
            value={campaignForm.name}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            helperText={promotionTypeHints[campaignForm.promotionType]}
            label="Typ promocji"
            onChange={this.handleCampaignFormChange('promotionType')}
            value={campaignForm.promotionType}
          >
            {Object.keys(promotionTypeLabels).map(type => (
              <MenuItem key={type} value={type}>
                {promotionTypeLabels[type]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            helperText="TAG służy wyłącznie do wizualnego oznaczenia ofert i nie zmienia zakresu promocji"
            label="Oznacz promocję tagiem"
            onChange={this.handleCampaignFormChange('markerTagId')}
            value={campaignForm.markerTagId}
          >
            <MenuItem value="">Bez oznaczenia</MenuItem>
            {tagOptions.map(tag => (
              <MenuItem key={tag.id} value={tag.id}>
                {this.optionText(tag)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            helperText="Określa, na jakie oferty może zadziałać kod"
            label="Zakres promocji"
            onChange={this.handleCampaignFormChange('scopeType')}
            value={campaignForm.scopeType}
          >
            {allowedScopes.map(scope => (
              <MenuItem key={scope} value={scope}>
                {scopeLabels[scope]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText="Od kiedy kod może zostać zastosowany"
            label="Ważna od"
            onChange={this.handleCampaignFormChange('validFrom')}
            type="datetime-local"
            value={campaignForm.validFrom}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText="Do końca wskazanego dnia/godziny"
            label="Ważna do"
            onChange={this.handleCampaignFormChange('validTo')}
            type="datetime-local"
            value={campaignForm.validTo}
          />
        </Grid>
        {campaignForm.promotionType === 'TICKET' && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="Najpóźniejszy termin wizyty możliwy do kupienia z biletem promocyjnym"
              label="Bilety ważne maksymalnie do"
              onChange={this.handleCampaignFormChange('ticketValidTo')}
              type="date"
              value={campaignForm.ticketValidTo}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            helperText="Maksymalna liczba użyć w całej promocji, niezależnie od liczby kodów"
            label="Limit promocji"
            onChange={this.handleCampaignFormChange('globalLimit')}
            value={campaignForm.globalLimit}
          />
        </Grid>
        {this.renderCampaignSpecificFields()}
      </Grid>
    );
  }

  renderCodeFields(form, handleChange, fileInputId, formName) {
    const effectiveCodeType = form.mode === 'FIXED' ? 'FIXED' : form.codeType;
    return (
      <Grid container spacing={16}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            helperText="Wybierz, czy system ma wygenerować kody, wczytać CSV albo użyć jednego kodu"
            label="Sposób przygotowania kodów"
            onChange={handleChange('mode')}
            value={form.mode}
          >
            {Object.keys(codeModeLabels).map(mode => (
              <MenuItem key={mode} value={mode}>
                {codeModeLabels[mode]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {form.mode !== 'FIXED' && (
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              helperText="Jednorazowy kod blokuje się po opłaceniu zamówienia"
              label="Rodzaj kodu"
              onChange={handleChange('codeType')}
              value={form.codeType}
            >
              {Object.keys(codeTypeLabels).map(type => (
                <MenuItem key={type} value={type}>
                  {codeTypeLabels[type]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
        {form.mode === 'GENERATE' && (
          <React.Fragment>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                helperText="Ile kodów system ma utworzyć"
                inputProps={{ min: 1, max: maxGeneratedCodes, step: 1 }}
                label="Liczba kodów"
                onChange={handleChange('generateCount')}
                type="number"
                value={form.generateCount}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                helperText="Długość losowej części kodu"
                inputProps={{ min: 1, max: 64, step: 1 }}
                label="Długość kodu"
                onChange={handleChange('generatedCodeLength')}
                type="number"
                value={form.generatedCodeLength}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                helperText="Opcjonalny prefiks, np. VISA"
                label="Prefiks"
                onChange={handleChange('generatedCodePrefix')}
                value={form.generatedCodePrefix}
              />
            </Grid>
          </React.Fragment>
        )}
        {form.mode === 'IMPORT' && (
          <React.Fragment>
            <Grid item xs={12}>
              <input
                accept=".csv,text/csv,text/plain"
                id={fileInputId}
                onChange={this.handleCodesFileChange(formName)}
                style={styles.hiddenInput}
                type="file"
              />
              <Button component="label" htmlFor={fileInputId}>
                <CloudUploadIcon style={styles.icon} />
                <span>Wczytaj CSV z kodami</span>
              </Button>
              <Typography color="textSecondary" style={styles.fieldHint}>
                Plik CSV powinien mieć jedną kolumnę bez nagłówka. Jeden kod w jednej linii.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                helperText="Tu możesz wkleić kody ręcznie, po jednym w linii"
                label="Lista kodów"
                onChange={handleChange('codes')}
                rows={5}
                value={form.codes}
              />
            </Grid>
          </React.Fragment>
        )}
        {form.mode === 'FIXED' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              helperText="Np. WAKAJKI2026. Kod może być używany wiele razy zgodnie z limitami."
              label="Kod stały"
              onChange={handleChange('fixedCode')}
              value={form.fixedCode}
            />
          </Grid>
        )}
        {effectiveCodeType === 'ONE_TIME' ? (
          <Grid item xs={12}>
            <Typography color="textSecondary">
              Kod jednorazowy może zostać wykorzystany tylko raz, więc limit użyć kodu wynosi 1
              i nie wymaga dodatkowej konfiguracji.
            </Typography>
          </Grid>
        ) : (
          <React.Fragment>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                helperText="Limit dla tego jednego kodu. Puste pole oznacza brak dodatkowego limitu."
                label="Limit użyć kodu"
                onChange={handleChange('maxRedemptions')}
                value={form.maxRedemptions}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                helperText="Ile razy jeden klient może użyć kodu"
                label="Limit na klienta"
                onChange={handleChange('maxRedemptionsPerCustomer')}
                value={form.maxRedemptionsPerCustomer}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                helperText="Opcjonalny limit użyć jednego kodu dziennie"
                label="Limit dzienny"
                onChange={handleChange('maxRedemptionsPerDay')}
                value={form.maxRedemptionsPerDay}
              />
            </Grid>
          </React.Fragment>
        )}
      </Grid>
    );
  }

  renderCreationTargetsTable() {
    const targets = this.selectedCreationTargets();
    const {
      campaignForm,
      creationTargetsLoaded,
      creationTargetsLoading,
    } = this.state;
    if (campaignForm.scopeType === 'GLOBAL') {
      return null;
    }
    return (
      <Grid item xs={12} style={styles.detailsSection}>
        <Grid container alignItems="center" justify="space-between" style={styles.fieldHint}>
          <Grid item>
            <Typography variant="subtitle1" style={styles.detailsSectionTitle}>
              Wybrane oferty
            </Typography>
            <Typography color="textSecondary">
              Lista zostanie zapisana przy promocji i można ją ręcznie zmienić przed utworzeniem.
            </Typography>
          </Grid>
          <Grid item>
            <Button
              disabled={creationTargetsLoading}
              onClick={() => this.refreshCreationTargetsPreview(true)}
            >
              <SearchIcon style={styles.icon} />
              <span>Pobierz oferty z tagu</span>
            </Button>
          </Grid>
        </Grid>
        {campaignForm.scopeType === 'TAG' && creationTargetsLoaded && !targets.length && (
          <Typography color="error" style={styles.fieldHint}>
            Pod wybranymi tagami nie ma aktywnych ofert.
          </Typography>
        )}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Partner</TableCell>
              <TableCell>Obiekt</TableCell>
              <TableCell>Oferta</TableCell>
              <TableCell>HT</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {targets.map(item => (
              <TableRow key={item.sightEventId}>
                <TableCell>{item.partnerName || '-'}</TableCell>
                <TableCell>{item.sightName || '-'}</TableCell>
                <TableCell>{item.sightEventName || '-'}</TableCell>
                <TableCell>{item.hptSightEventId || '-'}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={this.removeCreationTarget(item.sightEventId)}>
                    <DeleteIcon style={styles.icon} />
                    <span>Usuń</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!targets.length && (
              <TableRow>
                <TableCell colSpan={5}>
                  {creationTargetsLoading ? 'Pobieranie ofert...' : 'Brak wybranych ofert.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Grid>
    );
  }

  renderTargetStep() {
    const {
      campaignForm,
      campaignSightEventOpen,
      campaignSightEventQuery,
      sightEventOptions,
    } = this.state;
    return (
      <Grid container spacing={16}>
        {this.renderScopeFields()}
        {campaignForm.scopeType !== 'GLOBAL' && (
          <Grid item xs={12}>
            {this.renderTargetPicker({
              label: 'Dodaj lub usuń oferty',
              helperText: 'Wpisz nazwę i ręcznie skoryguj listę ofert objętych promocją',
              emptyLabel: 'Wybierz oferty',
              options: sightEventOptions,
              selectedIds: campaignForm.sightEventIds,
              query: campaignSightEventQuery,
              queryName: 'campaignSightEventQuery',
              open: campaignSightEventOpen,
              openName: 'campaignSightEventOpen',
              anchorName: 'campaignSightEventAnchor',
              formName: 'campaignForm',
              fieldName: 'sightEventIds',
              compactSummary: true,
            })}
          </Grid>
        )}
        {this.renderCreationTargetsTable()}
        <Grid item xs={12}>
          <Typography color="textSecondary">
            Promocja zostanie utworzona jako robocza. Eksport kodów, generowanie pul i uruchomienie
            są dostępne w podglądzie szczegółów promocji.
          </Typography>
        </Grid>
      </Grid>
    );
  }

  renderAddDialogContent() {
    const { activeStep, codeForm } = this.state;
    if (activeStep === 0) {
      return this.renderCampaignStep();
    }
    if (activeStep === 1) {
      return this.renderCodeFields(
        codeForm,
        this.handleCodeFormChange,
        'promotion-codes-create-file',
        'codeForm',
      );
    }
    return this.renderTargetStep();
  }

  renderAddDialog() {
    const { activeStep, addDialogOpen, loading } = this.state;
    return (
      <Dialog
        disableBackdropClick
        fullWidth
        maxWidth="md"
        open={addDialogOpen}
      >
        <DialogTitle>Dodaj promocję</DialogTitle>
        <DialogContent style={styles.dialogContent}>
          <Stepper activeStep={activeStep}>
            {steps.map(step => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {this.renderAddDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button disabled={loading} onClick={this.handleAddDialogClose}>
            Anuluj
          </Button>
          <Button disabled={loading || activeStep === 0} onClick={this.handlePreviousStep}>
            Wstecz
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button color="secondary" disabled={loading} onClick={this.handleNextStep}>
              Dalej
            </Button>
          ) : (
            <Button color="secondary" disabled={loading} onClick={this.createCampaign}>
              Utwórz promocję
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }

  renderCampaignsTable() {
    const campaigns = this.filteredCampaigns();
    const { filterText, loading } = this.state;
    return (
      <Paper style={styles.paper}>
        <Grid container justify="space-between" alignItems="flex-end" style={styles.toolbar}>
          <Grid item>
            <Button aria-label="Dodaj" onClick={this.handleAddDialogOpen}>
              <AddIcon style={styles.icon} />
              <span>DODAJ</span>
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Filtruj promocje"
              onChange={this.handleFilterChange}
              value={filterText}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
        {!campaigns.length ? (
          <EmptyView
            image={SearchIcon}
            label="Brak promocji"
            loading={loading}
            message="Dodaj pierwszą promocję."
          />
        ) : (
          <Table aria-labelledby="promotions-list">
            <TableHead>
              <TableRow>
                <TableCell># ID</TableCell>
                <TableCell>Nazwa</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Zakres</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Okres</TableCell>
                <TableCell>Użycia</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {promotionTypeLabels[item.promotionType] || item.promotionType}
                  </TableCell>
                  <TableCell>{scopeLabels[item.scopeType] || item.scopeType}</TableCell>
                  <TableCell>{statusLabels[item.status] || item.status}</TableCell>
                  <TableCell>
                    <div>{`${formatDate(item.validFrom)} - ${formatDate(item.validTo)}`}</div>
                    {item.promotionType === 'TICKET' && (
                      <Typography color="textSecondary" variant="caption">
                        {`Bilety do: ${formatDateOnly(item.ticketValidTo)}`}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{item.usedRedemptionsCount || 0}</TableCell>
                  <TableCell align="right" style={styles.actions}>
                    <IconButton onClick={() => this.selectCampaign(item)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    );
  }

  renderCodesPagination() {
    const { codes, codesPage, codesRowsPerPage } = this.state;
    const from = codes.length ? (codesPage * codesRowsPerPage) + 1 : 0;
    const to = Math.min(codes.length, (codesPage + 1) * codesRowsPerPage);
    const lastPage = Math.max(0, Math.ceil(codes.length / codesRowsPerPage) - 1);
    return (
      <div style={styles.codesPagination}>
        <Typography color="textSecondary">Wierszy</Typography>
        <TextField
          select
          margin="dense"
          onChange={this.handleCodesRowsPerPageChange}
          style={styles.codesPaginationSelect}
          value={codesRowsPerPage}
        >
          {codesRowsPerPageOptions.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <Typography color="textSecondary" style={styles.codesPaginationRange}>
          {`${from}-${to} z ${codes.length}`}
        </Typography>
        <IconButton
          disabled={codesPage <= 0}
          onClick={this.goToPreviousCodesPage}
          title="Poprzednia strona"
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          disabled={codesPage >= lastPage}
          onClick={this.goToNextCodesPage}
          title="Następna strona"
        >
          <ChevronRightIcon />
        </IconButton>
      </div>
    );
  }

  renderCodesPreview() {
    const {
      codes, codesPage, codesRowsPerPage, disablingCodeId,
    } = this.state;
    const pagedCodes = codes.slice(
      codesPage * codesRowsPerPage,
      codesPage * codesRowsPerPage + codesRowsPerPage,
    );
    return (
      <React.Fragment>
        {this.renderCodesPagination()}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kod</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Rodzaj</TableCell>
              <TableCell>Użycia</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedCodes.map(code => (
              <TableRow key={code.id}>
                <TableCell>{code.code}</TableCell>
                <TableCell>{codeStatusLabels[code.status] || code.status}</TableCell>
                <TableCell>{codeTypeLabels[code.codeType] || code.codeType}</TableCell>
                <TableCell>{code.usedRedemptionsCount || 0}</TableCell>
                <TableCell align="right">
                  {code.status === 'ACTIVE' ? (
                    <Button
                      disabled={disablingCodeId === code.id}
                      onClick={() => this.disableCode(code)}
                      size="small"
                      title="Zablokuj kod"
                    >
                      <BlockIcon style={styles.icon} />
                      <span>Zablokuj</span>
                    </Button>
                  ) : (
                    <Typography color="textSecondary">
                      {codeStatusLabels[code.status] || code.status}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {this.renderCodesPagination()}
      </React.Fragment>
    );
  }

  renderTicketPoolsSection() {
    const {
      loading,
      poolSightEventOpen,
      poolSightEventQuery,
      poolTagOpen,
      poolTagQuery,
      selectedCampaign,
      sightEventOptions,
      tagOptions,
      targetForm,
      targetPreview,
    } = this.state;
    const ticketPoolSightEventOptions = sightEventOptions
      .filter(item => item.hptId !== null && item.hptId !== undefined);
    if (!selectedCampaign
        || selectedCampaign.promotionType !== 'TICKET'
        || selectedCampaign.status !== 'DRAFT') {
      return null;
    }
    return (
      <div style={styles.detailsSection}>
        <Typography variant="subtitle1" gutterBottom>
          Pule promocyjne
        </Typography>
        <Grid container spacing={16}>
          <Grid item xs={12} sm={6}>
            {this.renderTargetPicker({
              label: 'Tagi',
              helperText: 'Wpisz nazwę i wybierz tagi dla generowania pul',
              emptyLabel: 'Wybierz tagi',
              options: tagOptions,
              selectedIds: targetForm.tagIds,
              query: poolTagQuery,
              queryName: 'poolTagQuery',
              open: poolTagOpen,
              openName: 'poolTagOpen',
              anchorName: 'poolTagAnchor',
              formName: 'targetForm',
              fieldName: 'tagIds',
            })}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderTargetPicker({
              label: 'Oferty',
              helperText: 'Wpisz nazwę i wybierz konkretne oferty zsynchronizowane z HT',
              emptyLabel: 'Wybierz oferty',
              options: ticketPoolSightEventOptions,
              selectedIds: targetForm.sightEventIds,
              query: poolSightEventQuery,
              queryName: 'poolSightEventQuery',
              open: poolSightEventOpen,
              openName: 'poolSightEventOpen',
              anchorName: 'poolSightEventAnchor',
              formName: 'targetForm',
              fieldName: 'sightEventIds',
              compactSummary: true,
            })}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              helperText="ID partnerów po przecinku"
              label="Partnerzy"
              onChange={this.handleTargetFormChange('partnerIds')}
              value={targetForm.partnerIds}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              helperText="ID obiektów po przecinku"
              label="Obiekty"
              onChange={this.handleTargetFormChange('sightIds')}
              value={targetForm.sightIds}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              helperText="Cena biletu specjalnego, np. 1.00"
              label="Cena biletu PLN"
              onChange={this.handleTargetFormChange('ticketPricePln')}
              value={targetForm.ticketPricePln}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              helperText="Liczba biletów w puli dla każdej oferty"
              label="Liczba biletów"
              onChange={this.handleTargetFormChange('availableTicketsNumber')}
              value={targetForm.availableTicketsNumber}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              helperText="Opcjonalnie, domyślnie nazwa promocji"
              label="Nazwa puli"
              onChange={this.handleTargetFormChange('poolName')}
              value={targetForm.poolName}
            />
          </Grid>
        </Grid>
        <Grid container spacing={16} style={styles.fieldHint}>
          <Grid item>
            <Button disabled={loading} onClick={this.previewTargets}>
              <SearchIcon style={styles.icon} />
              <span>Podgląd ofert</span>
            </Button>
          </Grid>
          <Grid item>
            <Button color="secondary" disabled={loading} onClick={this.generatePools}>
              <PlayArrowIcon style={styles.icon} />
              <span>Generuj pule</span>
            </Button>
          </Grid>
        </Grid>
        {!!targetPreview.length && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Oferta</TableCell>
                <TableCell>Obiekt</TableCell>
                <TableCell>Partner</TableCell>
                <TableCell>Status puli</TableCell>
                <TableCell>ATNA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {targetPreview.map(item => (
                <TableRow key={item.sightEventId}>
                  <TableCell>{item.sightEventName}</TableCell>
                  <TableCell>{item.sightName}</TableCell>
                  <TableCell>{item.partnerName}</TableCell>
                  <TableCell>{item.ticketPoolStatus}</TableCell>
                  <TableCell>{item.hptAtnaId || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    );
  }

  renderCampaignDetailsData() {
    const {
      loading, markerTagId, selectedCampaign, tagOptions,
    } = this.state;
    if (!selectedCampaign) {
      return null;
    }
    return (
      <div style={styles.detailsSection}>
        <Typography variant="subtitle1" style={styles.detailsSectionTitle}>
          Dane promocji
        </Typography>
        <Grid container spacing={16}>
          <Grid item xs={12} sm={3}>
            <Typography color="textSecondary">Okres użycia kodów</Typography>
            <Typography>
              {`${formatDate(selectedCampaign.validFrom)} - ${formatDate(selectedCampaign.validTo)}`}
            </Typography>
          </Grid>
          {selectedCampaign.promotionType === 'TICKET' && (
            <Grid item xs={12} sm={3}>
              <Typography color="textSecondary">Bilety ważne maksymalnie do</Typography>
              <Typography>{formatDateOnly(selectedCampaign.ticketValidTo)}</Typography>
            </Grid>
          )}
          <Grid item xs={12} sm={3}>
            <Typography color="textSecondary">Zakres</Typography>
            <Typography>{scopeLabels[selectedCampaign.scopeType]}</Typography>
          </Grid>
          {selectedCampaign.scopeType === 'TAG' && (
            <Grid item xs={12} sm={3}>
              <Typography color="textSecondary">Tag promocji</Typography>
              <Typography>{this.campaignTagSummary()}</Typography>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              helperText="Nie przypisuje TAG-u do ofert; oznacza tylko oferty, które już go mają"
              label="Oznacz promocję tagiem"
              onChange={this.handleMarkerTagChange}
              value={markerTagId}
            >
              <MenuItem value="">Bez oznaczenia</MenuItem>
              {tagOptions.map(tag => (
                <MenuItem key={tag.id} value={tag.id}>
                  {this.optionText(tag)}
                </MenuItem>
              ))}
            </TextField>
            <Button
              color="secondary"
              disabled={loading}
              onClick={this.saveMarkerTag}
              style={styles.fieldHint}
            >
              <SaveIcon style={styles.icon} />
              <span>Zapisz oznaczenie</span>
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography color="textSecondary">Limit promocji</Typography>
            <Typography>{selectedCampaign.globalLimit || 'Brak'}</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography color="textSecondary">Limit klienta</Typography>
            <Typography>{selectedCampaign.customerLimit || 'Brak'}</Typography>
          </Grid>
          {selectedCampaign.promotionType === 'TICKET' && (
            <React.Fragment>
              <Grid item xs={12} sm={3}>
                <Typography color="textSecondary">Wymagana liczba biletów</Typography>
                <Typography>{selectedCampaign.requiredTicketQuantity || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography color="textSecondary">Przyznawana liczba biletów</Typography>
                <Typography>{selectedCampaign.grantedTicketQuantity || '-'}</Typography>
              </Grid>
            </React.Fragment>
          )}
          {selectedCampaign.promotionType === 'PERCENT' && (
            <Grid item xs={12} sm={3}>
              <Typography color="textSecondary">Rabat procentowy</Typography>
              <Typography>{`${selectedCampaign.discountPercent || 0}%`}</Typography>
            </Grid>
          )}
          {selectedCampaign.promotionType === 'AMOUNT' && (
            <Grid item xs={12} sm={3}>
              <Typography color="textSecondary">Rabat kwota PLN</Typography>
              <Typography>{`${centsToPln(selectedCampaign.discountAmountGross)} PLN`}</Typography>
            </Grid>
          )}
        </Grid>
      </div>
    );
  }

  renderCampaignTargetsPreview() {
    const {
      campaignTargetsLoading,
      campaignTargetsPreview,
      campaignTargetsVisible,
      campaignSightEventOpen,
      campaignSightEventQuery,
      loading,
      selectedCampaign,
      sightEventOptions,
      targetForm,
    } = this.state;
    if (!selectedCampaign || selectedCampaign.scopeType === 'GLOBAL') {
      return null;
    }
    const canEditTargets = selectedCampaign.status === 'DRAFT'
      || selectedCampaign.status === 'ACTIVE';
    const canSaveTargets = this.canSaveCampaignTargets();
    const ticketPoolSightEventOptions = sightEventOptions
      .filter(item => item.hptId !== null && item.hptId !== undefined);
    const displayedTargets = canEditTargets
      ? this.selectedCampaignTargets()
      : campaignTargetsPreview;
    const emptyColSpan = (selectedCampaign.promotionType === 'TICKET' ? 4 : 2)
      + (canEditTargets ? 1 : 0);
    return (
      <div style={styles.detailsSection}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <Typography variant="subtitle1" style={styles.detailsSectionTitle}>
              Oferty objęte promocją
            </Typography>
            <Typography color="textSecondary" style={styles.fieldHint}>
              Zmień listę poniżej, a potem zapisz konfigurację ofert.
              {selectedCampaign.promotionType === 'TICKET'
                ? ' Zapis aktualizuje też cenę i ważność istniejących biletów promocyjnych.'
                : ''}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              disabled={campaignTargetsLoading}
              onClick={this.toggleCampaignTargetsPreview}
            >
              <VisibilityIcon style={styles.icon} />
              <span>{campaignTargetsVisible ? 'Ukryj oferty' : 'Podgląd ofert'}</span>
            </Button>
          </Grid>
        </Grid>
        {canEditTargets && (
          <Grid container spacing={16} style={styles.fieldHint}>
            <Grid item xs={12}>
              {this.renderTargetPicker({
                label: 'Dodaj lub usuń oferty',
                helperText: 'Wpisz nazwę i wybierz finalną listę ofert objętych promocją',
                emptyLabel: 'Wybierz oferty',
                options: ticketPoolSightEventOptions,
                selectedIds: targetForm.sightEventIds,
                query: campaignSightEventQuery,
                queryName: 'campaignSightEventQuery',
                open: campaignSightEventOpen,
                openName: 'campaignSightEventOpen',
                anchorName: 'campaignSightEventDetailsAnchor',
                formName: 'targetForm',
                fieldName: 'sightEventIds',
                compactSummary: true,
              })}
            </Grid>
            {selectedCampaign.promotionType === 'TICKET' && (
              <React.Fragment>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    helperText="Cena nowych i istniejących biletów promocyjnych, domyślnie 1.00"
                    label="Cena biletu PLN"
                    onChange={this.handleTargetFormChange('ticketPricePln')}
                    value={targetForm.ticketPricePln}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    helperText="Liczba biletów w nowej puli dla każdej dodanej oferty"
                    label="Liczba biletów"
                    onChange={this.handleTargetFormChange('availableTicketsNumber')}
                    value={targetForm.availableTicketsNumber}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    helperText="Opcjonalnie, domyślnie nazwa promocji"
                    label="Nazwa puli"
                    onChange={this.handleTargetFormChange('poolName')}
                    value={targetForm.poolName}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography color="textSecondary" style={styles.fieldHint}>
                    Okres promocji określa czas użycia kodu podczas zakupu. Ważność biletu kończy
                    się w granicznej dacie ustawionej w konfiguracji promocji.
                  </Typography>
                </Grid>
              </React.Fragment>
            )}
            <Grid item xs={12}>
              <Button
                color={canSaveTargets ? 'secondary' : 'default'}
                disabled={loading || !canSaveTargets}
                onClick={this.saveCampaignTargets}
              >
                <SaveIcon style={styles.icon} />
                <span>Zapisz konfigurację ofert</span>
              </Button>
            </Grid>
          </Grid>
        )}
        {campaignTargetsVisible && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Partner</TableCell>
                <TableCell>Oferta</TableCell>
                {selectedCampaign.promotionType === 'TICKET' && (
                  <React.Fragment>
                    <TableCell>Status puli</TableCell>
                    <TableCell>ATNA</TableCell>
                  </React.Fragment>
                )}
                {canEditTargets && <TableCell align="right">Akcje</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedTargets.map(item => (
                <TableRow key={item.sightEventId}>
                  <TableCell>{item.partnerName || '-'}</TableCell>
                  <TableCell>{item.sightEventName || '-'}</TableCell>
                  {selectedCampaign.promotionType === 'TICKET' && (
                    <React.Fragment>
                      <TableCell>
                        {ticketPoolStatusLabels[item.ticketPoolStatus] || item.ticketPoolStatus || '-'}
                      </TableCell>
                      <TableCell>{item.hptAtnaId || '-'}</TableCell>
                    </React.Fragment>
                  )}
                  {canEditTargets && (
                    <TableCell align="right">
                      <Button size="small" onClick={this.removeCampaignTarget(item.sightEventId)}>
                        <DeleteIcon style={styles.icon} />
                        <span>Usuń</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!displayedTargets.length && (
                <TableRow>
                  <TableCell colSpan={emptyColSpan}>
                    Brak ofert dla aktualnego zakresu promocji.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    );
  }

  renderDetailsDialog() {
    const {
      addCodeForm, codes, detailsDialogOpen, loading, redemptions, selectedCampaign,
    } = this.state;
    if (!selectedCampaign) {
      return null;
    }
    const isDraft = selectedCampaign.status === 'DRAFT';
    const isActive = selectedCampaign.status === 'ACTIVE';
    return (
      <Dialog
        disableBackdropClick
        fullWidth
        maxWidth="md"
        onClose={this.handleDetailsDialogClose}
        open={detailsDialogOpen}
      >
        <DialogTitle>{selectedCampaign.name}</DialogTitle>
        <DialogContent style={styles.dialogContent}>
          <div style={styles.detailsSummary}>
            <Grid container spacing={16}>
              <Grid item xs={12} sm={3}>
                <Typography color="textSecondary">Status</Typography>
                <Typography>
                  {statusLabels[selectedCampaign.status] || selectedCampaign.status}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography color="textSecondary">Typ</Typography>
                <Typography>
                  {promotionTypeLabels[selectedCampaign.promotionType]}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography color="textSecondary">Użycia</Typography>
                <Typography>{selectedCampaign.usedRedemptionsCount || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography color="textSecondary">Rezerwacje</Typography>
                <Typography>{selectedCampaign.reservedRedemptionsCount || 0}</Typography>
              </Grid>
            </Grid>
          </div>
          {selectedCampaign.promotionType === 'AMOUNT' && (
            <Typography color="textSecondary" style={styles.fieldHint}>
              {`Rabat kwotowy: ${centsToPln(selectedCampaign.discountAmountGross)} PLN`}
            </Typography>
          )}
          {this.renderCampaignDetailsData()}
          {this.renderCampaignTargetsPreview()}
          <div style={styles.detailsSection}>
            <Typography variant="subtitle1" style={styles.detailsSectionTitle}>
              Kody
            </Typography>
            {isDraft && (
              <React.Fragment>
                <Typography color="textSecondary" style={styles.fieldHint}>
                  Ponowne zapisanie kodów w promocji roboczej zastąpi całą poprzednią listę kodów.
                </Typography>
                {this.renderCodeFields(
                  addCodeForm,
                  this.handleAddCodeFormChange,
                  'promotion-codes-details-file',
                  'addCodeForm',
                )}
                <Button
                  color="secondary"
                  disabled={loading}
                  onClick={this.replaceCodes}
                  style={styles.fieldHint}
                >
                  <AddIcon style={styles.icon} />
                  <span>{codes.length ? 'Zastąp kody' : 'Zapisz kody'}</span>
                </Button>
              </React.Fragment>
            )}
            {!isDraft && (
              <Typography color="textSecondary" style={styles.fieldHint}>
                Po uruchomieniu promocji można blokować aktywne kody,
                ale nie można generować ani zmieniać listy.
              </Typography>
            )}
            {this.renderCodesPreview()}
          </div>
          {this.renderTicketPoolsSection()}
          <Typography color="textSecondary" style={styles.detailsSection}>
            {`Realizacje: ${redemptions.length}`}
          </Typography>
        </DialogContent>
        <DialogActions style={styles.dialogActions}>
          <Button disabled={!codes.length || loading} onClick={this.exportCodes}>
            <CloudDownloadIcon style={styles.icon} />
            <span>Eksportuj kody</span>
          </Button>
          <Button disabled={loading} onClick={this.handleDetailsDialogClose}>
            Zamknij
          </Button>
          {isDraft && (
            <Button
              color="secondary"
              disabled={loading}
              onClick={this.activateCampaign}
            >
              Uruchom promocję
            </Button>
          )}
          {isActive && (
            <Button
              color="secondary"
              disabled={loading}
              onClick={this.endCampaign}
            >
              Zakończ promocję
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }

  render() {
    const { snackbarMessage, snackbarOpen } = this.state;
    const { profile } = this.props;

    if (!canManagePromotions(profile)) {
      return (
        <Layout>
          <div style={styles.content}>
            <Paper style={styles.paper}>
              <Typography>Brak dostępu.</Typography>
            </Paper>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div style={styles.content}>
          {this.renderCampaignsTable()}
          {this.renderAddDialog()}
          {this.renderDetailsDialog()}
          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={4000}
            message={snackbarMessage}
            onClose={this.closeSnackbar}
            open={snackbarOpen}
          />
        </div>
      </Layout>
    );
  }
}

PromotionsView.propTypes = {
  profile: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => ({
  profile: profileSelectors.getProfile(state),
});

export default compose(
  withAuth(),
  connect(mapStateToProps),
)(PromotionsView);
