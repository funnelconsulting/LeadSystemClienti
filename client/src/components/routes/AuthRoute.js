import React, { Suspense, useContext } from "react";
import { Route, Navigate } from "react-router-dom";
import { UserContext } from "../../context";
import Sidebar from "../SideBar/Sidebar";
import { SidebarContext } from "../../context/SidebarContext";

const AuthRouteWithLayout = ({ component: Component, ...rest }) => {
  const [state, setState] = useContext(UserContext);
  const { isSidebarOpen } = useContext(SidebarContext);
  
  const containerStyle = {
    transition: 'width 0.3s ease',
  };

  if (!state) {
    return <Navigate to="/login" />;
  }

  const isMobile = () => {
    const mobileBreakpoint = 768;
    return window.innerWidth <= mobileBreakpoint;
  };

  return state && state.token ? (
    <div className="big-container">
      <Sidebar />
      <div className={isMobile() ? 'container-mobile' : `${isSidebarOpen ? 'boost-container' : 'boost-container-closed'}`} style={containerStyle}>
        <Component {...rest} />
      </div>
    </div>
  ) : (
    ""
  );
};

export default AuthRouteWithLayout;
