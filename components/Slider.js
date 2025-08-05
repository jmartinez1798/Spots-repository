import React from 'react';
import {View, TouchableOpacity, Image, StatusBar} from 'react-native';
import {Commons} from '../utils';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

export default Slider = ({item}) => {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <TouchableOpacity
      style={{
        alignSelf: 'center',
      }}>
      <Image
        style={{
          height:
            Commons.height() - tabBarHeight + StatusBar.currentHeight / 1.3,
          width: Commons.width(),
          resizeMode: 'cover',
        }}
        source={{uri: item}}
      />
    </TouchableOpacity>
  );
};
