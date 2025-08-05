import {UPDATE_EVENT} from '../Types';

export const updateEvents = events => dispatch => {
  dispatch({
    type: UPDATE_EVENT,
    payload: events,
  });
};
