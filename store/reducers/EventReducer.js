import {UPDATE_EVENT} from '../Types';

const initialState = {
  events: [],
};

const eventReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_EVENT:
      let newState = {
        events: action.payload,
      };
      return newState;
    default:
      return state;
  }
};

export default eventReducer;
