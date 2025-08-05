import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import {
  authReducer,
  postReducer,
  eventReducer,
  spotReducer,
  storyReducer,
  chatReducer,
  friendReducer,
} from './reducers';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistStore,
  persistReducer,
  persistCombineReducers,
} from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // whitelist: [],
  // blacklist: [],
  // debug :true,
};

const rootReducer = combineReducers({
  authReducer,
  postReducer,
  eventReducer,
  spotReducer,
  storyReducer,
  chatReducer,
  friendReducer,
});

export const store = createStore(
  persistReducer(persistConfig, rootReducer),
  applyMiddleware(thunk),
);
export const persistor = persistStore(store);
