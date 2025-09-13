import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { 
  MdDashboard, 
  MdPeople, 
  MdClass, 
  MdGrade, 
  MdCloudUpload, 
  MdHome, 
  MdLogin, 
  MdPersonAdd, 
  MdLogout, 
  MdClose, 
  MdMenuBook 
} from 'react-icons/md';

interface NavbarProps {
  isAuthenticated?: boolean;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onClose?: () => void;
}

export const Navbar = ({ isAuthenticated = false, user, onClose }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: MdDashboard
    },
    {
      name: 'Students',
      href: '/students',
      icon: MdPeople
    },
    {
      name: 'Classes',
      href: '/classes',
      icon: MdClass
    },
    {
      name: 'Grades',
      href: '/grades',
      icon: MdGrade
    },
    {
      name: 'Import Data',
      href: '/upload',
      icon: MdCloudUpload
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header - Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3" onClick={handleLinkClick}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MdMenuBook className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Student Management
            </h1>
          </Link>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Navigation - Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isAuthenticated ? (
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav className="space-y-2">
            <Link
              to="/"
              onClick={handleLinkClick}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <MdHome className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </nav>
        )}
      </div>

      {/* Footer - User Section */}
      <div className="p-4 border-t border-gray-200">
        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full"
            >
              <MdLogout className="w-4 h-4 mr-2 inline" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link to="/login" className="block" onClick={handleLinkClick}>
              <Button variant="outline" size="sm" className="w-full">
                <MdLogin className="w-4 h-4 mr-2 inline" />
                Login
              </Button>
            </Link>
            <Link to="/register" className="block" onClick={handleLinkClick}>
              <Button size="sm" className="w-full">
                <MdPersonAdd className="w-4 h-4 mr-2 inline" />
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};