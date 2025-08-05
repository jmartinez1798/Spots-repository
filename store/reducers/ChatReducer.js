import {UPDATE_CHATS} from '../Types';

const initialState = {
  chats: [],
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_CHATS:
      let newState = {
        chats: action.payload,
      };
      return newState;
    default:
      return state;
  }
};

export default chatReducer;
