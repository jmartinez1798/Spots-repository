import React, {useState, useRef, useEffect} from 'react';
import {BackHandler, Text, View, Image, TouchableOpacity} from 'react-native';
import {SafeArea} from '../components';
import {Commons, Images, Fonts, Colors} from '../utils';
import Lottie from 'lottie-react-native';

const Congrats = props => {
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, []);

  function handleBackButtonClick() {
    return false;
  }

  return (
    <SafeArea
      statusBarTransculent={true}
      child={
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              width: Commons.size(200),
              height: Commons.size(250),
              marginTop: -1 * Commons.size(100),
            }}>
            <Lottie
              source={require('../utils/success_anim.json')}
              autoPlay
              loop
            />
          </View>
          {/* <Image
            source={Images.success}
            style={{
              width: Commons.size(200),
              height: Commons.size(250),
              marginTop: -1 * Commons.size(100),
            }}
          /> */}

          <Text
            style={{
              fontSize: Commons.size(32),
              fontFamily: Fonts.sans_regular,
              fontWeight: '700',
              color: Colors.white,
              alignSelf: 'center',
            }}>
            Congratulations!
          </Text>

          <Text
            style={{
              width: Commons.width(0.9),
              fontSize: Commons.size(16),
              fontFamily: Fonts.sans_regular,
              fontWeight: '400',
              color: Colors.white,
              alignSelf: 'center',
              textAlign: 'center',
            }}>
            Your profile is successfuly created. Please continue to get started.
          </Text>

          <TouchableOpacity
            onPress={() => Commons.reset(props.navigation, 'dashboard')}
            activeOpacity={0.7}
            style={{
              position: 'absolute',
              bottom: Commons.size(50),
              borderRadius: Commons.size(10),
              overflow: 'hidden',
              alignSelf: 'center',
              backgroundColor: Colors.white,
            }}>
            <View
              style={{
                width: Commons.width(0.9),
                height: Commons.size(50),
                justifyContent: 'center',
                paddingHorizontal: Commons.size(20),
              }}>
              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  fontSize: Commons.size(18),
                  alignSelf: 'center',
                  fontWeight: '400',
                  color: Colors.black,
                }}>
                Continue
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      }
    />
  );
};

export default Congrats;
