import {Text, View, SafeAreaView, StatusBar} from 'react-native';
import {Colors, Commons} from '../utils';
import React from 'react';

export default function SafeArea(props) {
  return (
    <SafeAreaView
      style={[
        props.style,
        {
          flex: 1,
          backgroundColor: Colors.background,
        },
      ]}>
      <StatusBar
        translucent={props.statusBarTransculent}
        barStyle="light-content"
        backgroundColor={
          props.statusBarTransculent
            ? 'transparent'
            : props.statusBarColor
            ? props.statusBarColor
            : Colors.background
        }
      />

      {props.child}
    </SafeAreaView>
  );
}
