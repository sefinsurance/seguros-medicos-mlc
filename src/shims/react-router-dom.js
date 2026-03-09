import React from 'react';

export function Link({ to = '#', href, children, ...props }) {
  return React.createElement('a', { href: href ?? to, ...props }, children);
}

export function NavLink(props) {
  return React.createElement(Link, props);
}

export const BrowserRouter = ({ children }) => React.createElement(React.Fragment, null, children);
export const Router = BrowserRouter;
export const Routes = ({ children }) => React.createElement(React.Fragment, null, children);
export const Route = ({ element }) => element ?? null;
