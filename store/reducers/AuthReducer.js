import {LOGGEDIN, LOGGEDOUT, UPDATE_USER} from '../Types';

const initialState = {
  isLoggedIn: false,
  user: null,
};

const authReducer = (state = initialState, action) => {
  var newState = {};
  switch (action.type) {
    case LOGGEDIN:
      newState = {
        isLoggedIn: action.payload.isLoggedIn,
        user: action.payload.user,
      };
      return newState;
    case UPDATE_USER:
      newState = {
        isLoggedIn: state.isLoggedIn,
        user: action.payload,
      };
      return newState;
    case LOGGEDOUT:
      newState = {
        isLoggedIn: false,
        user: null,
      };
      return newState;
    default:
      return state;
  }
};

export default authReducer;
