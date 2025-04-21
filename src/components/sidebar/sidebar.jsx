/*eslint-disable*/
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "/blood-drop-logo.svg";
import {
  LayoutDashboard,
  Droplet,
  Heart,
  Building2,
  HelpCircle,
  QrCode,
  Home,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = React.useState("hidden");

  const location = useLocation();
  const { pathname } = location;
  const splitLocation = pathname.split("/");

  const menuItems = [
    {
      path: "/admin",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      section: "Users Data",
    },
    {
      path: "/admin/donate-blood",
      icon: <Droplet size={20} />,
      label: "Donate Blood",
      section: "Users Data",
    },
    {
      path: "/admin/need-blood",
      icon: <Heart size={20} />,
      label: "Need Blood",
      section: "Users Data",
    },
    {
      path: "/admin/host-blood-drive",
      icon: <Building2 size={20} />,
      label: "Host Blood Drive",
      section: "Users Data",
    },
    {
      path: "/admin/need-help",
      icon: <HelpCircle size={20} />,
      label: "Need Help",
      section: "Users Data",
    },
    {
      path: "/admin/qr-scanner",
      icon: <QrCode size={20} />,
      label: "QR Scanner",
      section: "Users Data",
    },
    {
      path: "/",
      icon: <Home size={20} />,
      label: "Landing Page",
      section: "Resources",
    },
    {
      path: "/admin",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      section: "Resources",
    },
  ];

  return (
    <>
      <nav className="relative z-10 flex flex-wrap items-center justify-between px-6 py-4 bg-white shadow-xl md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden md:w-64">
        <div className="flex flex-wrap items-center justify-between w-full px-0 mx-auto md:flex-col md:items-stretch md:min-h-full md:flex-nowrap">
          {/* Toggler */}
          <button
            className="p-2 text-dark-600 rounded-lg md:hidden hover:bg-gray-100"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <Menu size={24} />
          </button>
          {/* Brand */}
          <NavLink
            className="inline-block mr-0 font-bold text-left transition-transform duration-200 md:block hover:scale-105"
            to="/"
          >
            <div className="flex items-center justify-center py-4">
              <img src={logo} alt="logo" width={"40px"} />
              <span className="ml-2 text-[24px] font-bold text-dark">
                Mota<span className="text-red">bari3</span>
              </span>
            </div>
          </NavLink>
          {/* User */}
          {/* <ul className="flex flex-wrap items-center list-none md:hidden">
						<li className="relative inline-block">
						<NotificationDropdown />
						</li>
						<li className="relative inline-block">
						<UserDropdown />
						</li>
					</ul> */}
          {/* Collapse */}
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            {/* Collapse header */}
            <div className="block pb-4 mb-4 border-b border-solid md:min-w-full md:hidden">
              <div className="flex items-center justify-between">
                <NavLink
                  className="inline-block p-4 px-0 mr-0 text-sm font-bold text-left uppercase md:block md:pb-2 whitespace-nowrap"
                  to="/"
                >
                  Mota<span className="text-red">bari3</span>
                </NavLink>
                <button
                  type="button"
                  className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                  onClick={() => setCollapseShow("hidden")}
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            {/* Menu Items */}
            {["Users Data", "Resources"].map((section) => (
              <div key={section}>
                <h6 className="md:min-w-full text-red text-xs tracking-[3px] uppercase font-bold block pt-1 pb-4 no-underline">
                  {section}
                </h6>
                <ul className="flex flex-col list-none md:flex-col md:min-w-full">
                  {menuItems
                    .filter((item) => item.section === section)
                    .map((item, index) => (
                      <li key={index} className="items-center">
                        <NavLink
                          className={({ isActive }) =>
                            `flex items-center px-4 py-3 mb-1 transition-all duration-200 rounded-lg group hover:bg-gray-100 ${
                              isActive
                                ? "text-red bg-red-50 hover:bg-red-100"
                                : "text-gray-600 hover:text-gray-900"
                            }`
                          }
                          to={item.path}
                        >
                          {item.icon}
                          <span className="ml-3">{item.label}</span>
                          <ChevronRight
                            size={16}
                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          />
                        </NavLink>
                      </li>
                    ))}
                </ul>
                <hr className="my-4 md:min-w-full" />
              </div>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
