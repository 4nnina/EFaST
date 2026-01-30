import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  function logout() {
    localStorage.removeItem("FastToken");
    window.location.href = "/login";
  }

  const isAdminPage = location.pathname.includes('/dashboard') || 
                      location.pathname.includes('/calculate') ||
                      location.pathname.includes('/preferences');
  const isUserPage = location.pathname.includes('/homepage');

  return (
    <nav className="w-screen bg-gradient-to-r from-purple-600 via-blue-600 to-blue-400 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo/Title */}
        <div className="text-white font-bold text-xl cursor-pointer" onClick={() => navigate(isAdminPage ? '/dashboard' : '/homepage')}>
          EFaST
        </div>

        {/* Desktop Navigation Menu */}
        <div className="hidden md:flex gap-6 items-center">
          {isAdminPage && (
            <>
              <button 
                onClick={() => navigate('/dashboard')}
                className={`text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${
                  location.pathname.includes('/dashboard') 
                    ? 'bg-white bg-opacity-20' 
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                Admin Dashboard
              </button>
              <button 
                onClick={() => navigate('/calculate')}
                className={`text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${
                  location.pathname.includes('/calculate') 
                    ? 'bg-white bg-opacity-20' 
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                Perform Calculation
              </button>
            </>
          )}
          
          {isUserPage && (
            <>
              <button 
                onClick={() => navigate('/homepage')}
                className={`text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${
                  location.pathname.includes('/homepage') 
                    ? 'bg-white bg-opacity-20' 
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                My Preferences
              </button>
            </>
          )}

          <button 
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-white text-2xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="md:hidden bg-purple-700 px-6 py-4 space-y-2">
          {isAdminPage && (
            <>
              <button 
                onClick={() => {
                  navigate('/dashboard');
                  setShowMenu(false);
                }}
                className="block w-full text-left text-white font-semibold py-2 px-4 hover:bg-purple-600 rounded-lg transition duration-200"
              >
                Admin Dashboard
              </button>
              <button 
                onClick={() => {
                  navigate('/calculate');
                  setShowMenu(false);
                }}
                className="block w-full text-left text-white font-semibold py-2 px-4 hover:bg-purple-600 rounded-lg transition duration-200"
              >
                Perform Calculation
              </button>
            </>
          )}
          
          {isUserPage && (
            <>
              <button 
                onClick={() => {
                  navigate('/homepage');
                  setShowMenu(false);
                }}
                className="block w-full text-left text-white font-semibold py-2 px-4 hover:bg-purple-600 rounded-lg transition duration-200"
              >
                My Preferences
              </button>
            </>
          )}

          <button 
            onClick={logout}
            className="block w-full text-left bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
