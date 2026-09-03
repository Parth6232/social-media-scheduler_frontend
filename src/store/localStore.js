import { appConstants } from '../constant/appConstants';

export const localStore = {
  setToken: (token) => {
    localStorage.setItem(appConstants.keys.TOKEN, token);
  },
  getToken: () => {
    return localStorage.getItem(appConstants.keys.TOKEN);
  },
  removeToken: () => {
    localStorage.removeItem(appConstants.keys.TOKEN);
  }
};
