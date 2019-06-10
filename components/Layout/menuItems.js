import DashboardIcon from '@material-ui/icons/Dashboard';
import DomainIcon from '@material-ui/icons/Domain';
import LocalPlayIcon from '@material-ui/icons/LocalPlay';
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
    disabled: true, label: 'Użytkownicy', href: '/market/users', Icon: PeopleIcon,
  },
  {
    label: 'Partnerzy', href: '/market/partners', Icon: DomainIcon,
  },
  {
    disabled: true, label: 'Sprzedaż', href: '/market/sales', Icon: ShoppingCartIcon,
  },
  {
    disabled: true, label: 'Atrakcje', href: '/market/sights', Icon: PlaceIcon,
  },
  {
    disabled: true, label: 'Oferty', href: '/market/sight-events', Icon: LocalPlayIcon,
  },
  {
    label: 'Help Desk',
  },
  {
    disabled: true, label: 'Użytkownicy', href: '/helpdesk/users', Icon: PeopleIcon,
  },
];
