import CategoryIcon from '@material-ui/icons/Category';
import DashboardIcon from '@material-ui/icons/Dashboard';
import DomainIcon from '@material-ui/icons/Domain';
import LocalPlayIcon from '@material-ui/icons/LocalPlay';
import LabelIcon from '@material-ui/icons/Label';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import PeopleIcon from '@material-ui/icons/People';
import PlaceIcon from '@material-ui/icons/Place';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

export default [
  {
    label: 'Dashboard', href: '/', Icon: DashboardIcon,
  },
  {
    label: 'Market',
  },
  {
    label: 'Partnerzy', href: '/market/partners', Icon: DomainIcon,
  },
  {
    disabled: true, label: 'Sprzedaż/Raporty', href: '/market/sales', Icon: ShoppingCartIcon,
  },
  {
    label: 'Kategorie', href: '/market/categories', Icon: CategoryIcon,
  },
  {
    label: 'Tagi', href: '/market/tags', Icon: LabelIcon,
  },
  {
    label: 'Obiekty', href: '/market/sights', Icon: PlaceIcon,
  },
  {
    label: 'Oferty', href: '/market/sight-events', Icon: LocalPlayIcon,
  },
  {
    label: 'Helpdesk',
  },
  {
    label: 'Promocje', href: '/helpdesk/promotions', Icon: LocalOfferIcon, roles: ['ADMIN', 'ROOT'],
  },
  {
    label: 'Użytkownicy', href: '/helpdesk/users', Icon: PeopleIcon, roles: ['ADMIN', 'ROOT'],
  },
];
