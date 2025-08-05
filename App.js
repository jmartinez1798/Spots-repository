//#region Imports
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import StackNavigation from './src/routes/StackNavigation';
import {navigationRef} from './src/routes/RootNavigation';
// import crashlytics from '@react-native-firebase/crashlytics';
import {Provider} from 'react-redux';
import {store, persistor} from './src/store/Store';
import {PersistGate} from 'redux-persist/integration/react';
import {MenuProvider} from 'react-native-popup-menu';
import 'react-native-gesture-handler';
//#endregion

const App = props => {
  return (
    <MenuProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NavigationContainer ref={navigationRef}>
            <StackNavigation />
          </NavigationContainer>
        </PersistGate>
      </Provider>
    </MenuProvider>
  );
};

export default App;
