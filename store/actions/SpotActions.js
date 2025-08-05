import {UPDATE_SPOT} from '../Types';

export const updateSpots = spots => dispatch => {
  dispatch({
    type: UPDATE_SPOT,
    payload: spots,
  });
};
