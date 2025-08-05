import {UPDATE_POST} from '../Types';

const initialState = {
  posts: [],
};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_POST:
      let newState = {
        posts: action.payload,
      };
      return newState;
    default:
      return state;
  }
};

export default postReducer;
