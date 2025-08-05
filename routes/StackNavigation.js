import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import BottomNavigation from './BottomNavigation';
import {
  Splash,
  Start,
  Authentication,
  Otp,
  ProfileBuilder,
  Congrats,
  NewChat,
  NewGroup,
  Chat,
  Settings,
  Friends,
  Post,
  CreatePost,
  CreateEvent,
  CreateSpot,
  CameraX,
  EventDetail,
  CreatePoll,
  PollLength,
  Event,
  SpotDetails,
  MySpots,
  Host,
  Audience,
  Notifications,
  MapScreen,
  Story,
  Profile
} from '../screens';

import messaging from '@react-native-firebase/messaging';
import * as RootNavigation from './RootNavigation.js';

export default function StackNavigation() {
  const Stack = createStackNavigator();
  useEffect(() => {
    requestUserPermission();

    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        // RootNavigation.navigate('generation');
      });

    var onMessage = messaging().onMessage(async remoteMessage => {
      // RootNavigation.navigate('generation');
    });

    var onNotificationOpenedApp = messaging().onNotificationOpenedApp(
      remoteMessage => {
        // RootNavigation.navigate('generation');
      },
    );

    return () => {
      onMessage();
      onNotificationOpenedApp();
    };
  }, []);

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  return (
    <Stack.Navigator detachInactiveScreens={false} initialRouteName={'splash'}>
      {/* <Stack.Navigator
       detachInactiveScreens={false}
       initialRouteName={'dashboard'}> */}
      <Stack.Screen
        name="splash"
        component={Splash}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="start"
        component={Start}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth"
        component={Authentication}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="otp"
        component={Otp}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile_builder"
        component={ProfileBuilder}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="congrats"
        component={Congrats}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="dashboard"
        component={BottomNavigation}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="new_chat"
        component={NewChat}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="new_group"
        component={NewGroup}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat"
        component={Chat}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="settings"
        component={Settings}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="friends"
        component={Friends}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="post"
        component={Post}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create_post"
        component={CreatePost}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create_event"
        component={CreateEvent}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create_spot"
        component={CreateSpot}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="camera"
        component={CameraX}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="event_detail"
        component={EventDetail}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create_poll"
        component={CreatePoll}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="poll_length"
        component={PollLength}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="event"
        component={Event}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="my_spots"
        component={MySpots}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="spot_details"
        component={SpotDetails}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="host"
        component={Host}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="audience"
        component={Audience}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profileX"
        component={Profile}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifications"
        component={Notifications}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="map"
        component={MapScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="story"
        component={Story}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
