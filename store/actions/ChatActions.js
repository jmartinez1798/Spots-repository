import {UPDATE_CHATS} from '../Types';

export const updateChats = chats => dispatch => {
  dispatch({
    type: UPDATE_CHATS,
    payload: chats,
  });
};
