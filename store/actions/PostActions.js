import {UPDATE_POST} from '../Types';

export const updatePosts = posts => dispatch => {
  dispatch({
    type: UPDATE_POST,
    payload: posts,
  });
};
