const LAST_ROUTE_KEY = "skillmatch_last_route";

export const getLastRoute = () => {
  return localStorage.getItem(LAST_ROUTE_KEY);
};

export const saveLastRoute = (pathname) => {
  localStorage.setItem(LAST_ROUTE_KEY, pathname);
};
