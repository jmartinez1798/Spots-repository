import {
  UPDATE_FOLLOWERS,
  UPDATE_FOLLOWINGS,
  UPDATE_OTHER_FOLLOWERS,
  UPDATE_OTHER_FOLLOWINGS,
} from '../Types';

const initialState = {
  followers: [],
  followings: [],
  otherFollowers: [],
  otherFollowings: [],
};

const friendReducer = (state = initialState, action) => {
  var newState = {};
  switch (action.type) {
    case UPDATE_FOLLOWERS:
      newState = {
        followers: action.payload,
        followings: state.followings,
        otherFollowers: state.otherFollowers,
        otherFollowings: state.otherFollowings,
      };
      return newState;
    case UPDATE_FOLLOWINGS:
      newState = {
        followings: action.payload,
        followers: state.followers,
        otherFollowers: state.otherFollowers,
        otherFollowings: state.otherFollowings,
      };
      return newState;
    case UPDATE_OTHER_FOLLOWERS:
      newState = {
        otherFollowers: action.payload,
        followings: state.followings,
        followers: state.followers,
        otherFollowings: state.otherFollowings,
      };
      return newState;
    case UPDATE_OTHER_FOLLOWINGS:
      newState = {
        otherFollowings: action.payload,
        followings: state.followings,
        followers: state.followers,
        otherFollowers: state.otherFollowers,
      };
      return newState;
    default:
      return state;
  }
};

export default friendReducer;
