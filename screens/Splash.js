import React, {useState, useEffect} from 'react';
import {Animated, View, Text} from 'react-native';
import {SafeArea} from '../components';
import {Commons, Images, Colors, Fonts} from '../utils';
import {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import {useSelector} from 'react-redux';

const Splash = props => {
  const {isLoggedIn, user} = useSelector(state => state.authReducer);
  const [fadeAnimation, setFadeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    hideNavigationBar();
    fadeIn();

    return () => {
      showNavigationBar();
    };
  }, []);

  const fadeIn = () => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    }).start(function onComplete() {
      if (isLoggedIn) {
        if (user.firstName) {
          Commons.reset(props.navigation, 'dashboard');
        } else {
          Commons.reset(props.navigation, 'profile_builder');
        }
      } else Commons.reset(props.navigation, 'start');
    });
  };

  return (
    <SafeArea
      statusBarTransculent={false}
      child={
        <Animated.View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: fadeAnimation,
          }}>
          <Images.AppLogo
            height={Commons.size(200)}
            width={Commons.size(200)}
          />
          <Text
            style={{
              fontFamily: Fonts.gilroy_medium,
              color: Colors.white,
              fontSize: Commons.size(46),
              fontWeight: '900',
            }}>
            spots
          </Text>
        </Animated.View>
      }
    />
  );
};

export default Splash;
