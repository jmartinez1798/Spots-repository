import {UPDATE_MINE_STORIES, UPDATE_STORIES} from '../Types';

const initialState = {
  mineStories: null,
  stories: [],
};

const storyReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_STORIES:
      var newState = {
        stories: action.payload,
        mineStories: state.mineStories,
      };
      return newState;
    case UPDATE_MINE_STORIES:
      var newState = {
        mineStories: action.payload,
        stories: state.stories,
      };
      return newState;
    default:
      return state;
  }
};

export default storyReducer;
