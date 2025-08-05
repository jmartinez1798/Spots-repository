import {LOGGEDIN, LOGGEDOUT, UPDATE_USER} from '../Types';

export const updateUser = user => dispatch => {
  dispatch({
    type: UPDATE_USER,
    payload: user,
  });
};

export const login = user => dispatch => {
  dispatch({
    type: LOGGEDIN,
    payload: {isLoggedIn: true, user: user},
  });
};

export const logout = () => dispatch => {
  dispatch({
    type: LOGGEDOUT,
  });
};
