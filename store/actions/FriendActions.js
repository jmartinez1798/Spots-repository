import {
  UPDATE_FOLLOWERS,
  UPDATE_FOLLOWINGS,
  UPDATE_OTHER_FOLLOWERS,
  UPDATE_OTHER_FOLLOWINGS,
} from '../Types';

export const updateFollowers = followers => dispatch => {
  dispatch({
    type: UPDATE_FOLLOWERS,
    payload: followers,
  });
};

export const updateFollowings = followings => dispatch => {
  dispatch({
    type: UPDATE_FOLLOWINGS,
    payload: followings,
  });
};

export const updateOtherFollowers = followers => dispatch => {
  dispatch({
    type: UPDATE_OTHER_FOLLOWERS,
    payload: followers,
  });
};

export const updateOtherFollowings = followings => dispatch => {
  dispatch({
    type: UPDATE_OTHER_FOLLOWINGS,
    payload: followings,
  });
};
