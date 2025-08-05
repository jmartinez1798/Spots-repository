import {UPDATE_MINE_STORIES, UPDATE_STORIES} from '../Types';

export const updateMineStories = stories => dispatch => {
  dispatch({
    type: UPDATE_MINE_STORIES,
    payload: stories,
  });
};

export const updateStories = stories => dispatch => {
  dispatch({
    type: UPDATE_STORIES,
    payload: stories,
  });
};
