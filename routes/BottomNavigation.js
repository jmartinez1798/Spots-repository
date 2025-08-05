import React, {useState, useEffect} from 'react';
import {View, Image, TouchableOpacity, Keyboard} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Feed, Spots, Home, Chats, Profile} from '../screens';
import {Colors, Images, Fonts, Commons} from '../utils';
import {useSelector, useDispatch} from 'react-redux';

export default function BottomNavigation() {
  const {user} = useSelector(state => state.authReducer);
  const [keyboardStatus, setKeyboardStatus] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  const Tab = createBottomTabNavigator();

  const CustomTabBarButton = ({children, onPress}) => {
    if (keyboardStatus) return <View />;
    return (
      <TouchableOpacity
        style={{
          top: -1 * Commons.size(48),
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={onPress}>
        <View
          style={{
            width: Commons.size(60),
            height: Commons.size(60),
            borderRadius: Commons.size(30),
          }}>
          {children}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Tab.Navigator
      initialRouteName={'home'}
      backBehavior={'initialRoute'}
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.tab_bar,
          height: Commons.size(90),
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
      }}>
      <Tab.Screen
        name="feed"
        component={Feed}
        options={({route}) => ({
          headerShown: false,
          tabBarStyle: {
            display: route.params?.bottomNavigationVisible ? 'flex' : 'none',
            backgroundColor: Colors.tab_bar,
            height: Commons.size(90),
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarIcon: ({focused}) => (
            <Images.Feed
              height={Commons.size(30)}
              width={Commons.size(30)}
              fill={focused ? Colors.primary : Colors.in_active}
            />
          ),
        })}
      />
      <Tab.Screen
        name="spots"
        component={Spots}
        Search
        options={({route}) => ({
          headerShown: false,
          tabBarStyle: {
            display: route.params?.bottomNavigationVisible ? 'flex' : 'none',
            backgroundColor: Colors.tab_bar,
            height: Commons.size(90),
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarIcon: ({focused}) => (
            <Images.Spots
              height={Commons.size(30)}
              width={Commons.size(30)}
              fill={focused ? Colors.primary : Colors.in_active}
            />
          ),
        })}
      />
      <Tab.Screen
        name="home"
        component={Home}
        options={({route}) => ({
          title: '',
          headerShown: false,
          tabBarStyle: {
            display: route.params?.bottomNavigationVisible ? 'flex' : 'none',
            backgroundColor: Colors.tab_bar,
            height: Commons.size(90),
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarIcon: ({color}) => {
            return <Images.Home />;
          },
          tabBarButton: props => <CustomTabBarButton {...props} />,
        })}
      />
      <Tab.Screen
        name="chats"
        component={Chats}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <Images.Chats
              height={Commons.size(30)}
              width={Commons.size(30)}
              fill={focused ? Colors.primary : Colors.in_active}
            />
          ),
        }}
      />
      <Tab.Screen
        name="profile"
        component={Profile}
        options={{
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <Image
              source={user && user.avatar ? {uri: user.avatar} : Images.test_dp}
              style={{
                height: Commons.size(30),
                width: Commons.size(30),
                borderRadius: Commons.size(15),
                borderWidth: 1,
                borderColor: focused ? Colors.primary : color,
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
