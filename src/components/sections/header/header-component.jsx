import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  isAuthenticated,
  logout,
  getUser,
} from "../../../utility-functions/auth-utils";
import Logo from "/blood-drop-logo.svg";

// Update the navigation array to handle both donor and hospital users
const getNavigation = (isLoggedIn, userType) => {
  const baseNavigation = [
    { name: "Home", href: "/" },
    { name: "Host Blood Drive", href: "/host-blood-drive" },
    { name: "Donate Money", href: "/donation" },
    { name: "Help Needed", href: "/contact" },
    { name: "Need Blood", href: "/need-blood", secondLast: true },
  ];

  // Add Donate Blood option only for non-hospital users or when not logged in
  if (!isLoggedIn || userType !== "hospital") {
    baseNavigation.push({
      name: "Donate Blood",
      href: "/donate-blood",
      last: true,
    });
  }

  // Add auth navigation items for non-logged in users
  if (!isLoggedIn) {
    return [
      ...baseNavigation,
      { name: "Login", href: "/login", auth: true },
      { name: "Signup", href: "/signup", auth: true },
    ];
  }

  return baseNavigation;
};

const HeaderComponent = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [blurActivation, setBlurActivation] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const user = getUser();
  const isLoggedIn = isAuthenticated();

  // Get navigation items based on auth status and user type
  const navigation = getNavigation(isLoggedIn, user?.userType);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  // Determine if we're on a light background page
  const isLightPage =
    [
      "/login",
      "/signup",
      "/hospital-dashboard",
      "/admin/login",
      "/forgot-password",
      "/reset-password",
      "/donation",
    ].includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/");
  const isDonorDashboard = location.pathname.startsWith("/donor-dashboard");

  useEffect(() => {
    const onScroll = () => {
      setBlurActivation(window.pageYOffset > 5);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const reuseableClass = {
    for_last: `last:bg-red last:text-white last:hover:bg-red/90`,
    for_second_last: `rounded-rsm border ${
      isLightPage && !blurActivation
        ? "border-gray-500/[.5] text-gray-900 hover:bg-red/90 hover:text-white hover:border-transparent"
        : "border-white/[.5] hover:bg-red/90 hover:text-white hover:border-transparent"
    }`,
    for_auth: `ml-4 bg-red text-white hover:bg-red/90 transition-colors duration-200`,
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        blurActivation
          ? "bg-dark/[.6] backdrop-blur-md border-b border-white/[.2]"
          : isLightPage
          ? "bg-white shadow-md"
          : isDonorDashboard
          ? "bg-dark/[.6] backdrop-blur-md border-b border-white/[.2]"
          : "bg-transparent"
      }`}
    >
      <nav
        className="flex items-center justify-between p-[15px] lg:px-6 w-[min(1250px,100%-15px)] m-auto"
        aria-label="Global"
      >
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <img className="w-8 h-8" src={Logo} alt="Motabri3 Logo" />
            <span
              className={`not-italic font-bold text-[24px] leading-[55px] ${
                isLightPage && !blurActivation ? "text-dark" : "text-white"
              }`}
            >
              Mota<span className="text-[red]">bari3</span>
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 ${
              isLightPage && !blurActivation ? "text-dark" : "text-white"
            }`}
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-4 lg:transition items-center">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className={({ isActive }) => `
                text-sm font-medium lg:transition leading-6 px-3 py-2 rounded-rsm
                relative
                ${
                  !item.auth
                    ? "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300"
                    : ""
                }
                ${
                  isLightPage && !blurActivation
                    ? "text-gray-900 hover:text-gray-700 after:bg-gray-900"
                    : "text-white hover:text-white/80 after:bg-white"
                }
                ${item.secondLast && reuseableClass.for_second_last}
                ${item.last && reuseableClass.for_last}
                ${item.auth && reuseableClass.for_auth}
                ${isActive ? "after:w-full" : ""}
              `}
            >
              {item.name}
            </NavLink>
          ))}

          {/* User Profile Dropdown - Only show when logged in */}
          {isLoggedIn && user && (
            <div className="relative ml-4">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full bg-red text-white flex items-center justify-center hover:bg-red/90 transition-colors"
              >
                {user?.email?.charAt(0).toUpperCase() ||
                  user?.userType?.charAt(0).toUpperCase() ||
                  "U"}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to={user?.userType === 'admin' ? '/admin' : `/${user?.userType}-dashboard`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Motabari3</span>
              <img className="h-8 w-auto" src={Logo} alt="" />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                    }}
                    className={({ isActive }) => `
                      -mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7
                      text-gray-900 hover:bg-gray-50
                      ${item.secondLast && "border border-dark/[.5]"}
                      ${item.last && "bg-red text-white hover:bg-red/90"}
                      ${item.auth && "bg-red text-white hover:bg-red/90"}
                      ${isActive ? "bg-gray-50" : ""}
                    `}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default HeaderComponent;
