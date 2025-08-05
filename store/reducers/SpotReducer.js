import {UPDATE_SPOT} from '../Types';

const initialState = {
  spots: [],
};

const spotReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SPOT:
      let newState = {
        spots: action.payload,
      };
      return newState;
    default:
      return state;
  }
};

export default spotReducer;
