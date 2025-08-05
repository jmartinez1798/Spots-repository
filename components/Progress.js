import React, {useEffect, useState, useRef} from 'react';
import {Animated, Easing, View} from 'react-native';
import {Colors, Commons} from '../utils';

export default Progress = ({step, steps, duration}) => {
  const animatedValue = useRef(
    new Animated.Value(
      -1 * (Commons.width(0.95) - Commons.width(0.95) / steps) -
        Commons.width(0.95) / steps,
    ),
  ).current;
  const reactive = useRef(
    new Animated.Value(
      -1 * (Commons.width(0.95) - Commons.width(0.95) / steps),
    ),
  ).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      useNativeDriver: true,
      toValue: reactive,
      duration: duration,
    }).start();
  }, []);

  useEffect(() => {
    reactive.setValue(
      -Commons.width(0.95) + (Commons.width(0.95) * step) / steps,
    );
  }, [step]);

  return (
    <View
      style={{
        height: Commons.size(6),
        borderRadius: Commons.size(3),
        alignItems: 'center',
        width: Commons.width(0.95),
        marginHorizontal: Commons.width(0.005),
        backgroundColor: Colors.light_grey,
        overflow: 'hidden',
      }}>
      <Animated.View
        style={{
          transform: [
            {
              translateX: animatedValue,
            },
          ],
          width: '100%',
          height: Commons.size(6),
          borderRadius: Commons.size(3),
          backgroundColor: Colors.white,
        }}
      />
    </View>
  );
};
