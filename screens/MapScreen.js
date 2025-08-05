import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {Map, SafeArea} from '../components';
import {Colors, Commons, Fonts} from '../utils';
import LinearGradient from 'react-native-linear-gradient';

export default function MapScreen(props) {
  let loc = null;
  return (
    <SafeArea
      child={
        <View style={{flex: 1}}>
          <Map
            setAddress={location => {
              loc = location;
            }}
            isHome={false}
            isSearch={true}
          />

          <TouchableOpacity
            onPress={() => {
              props.route.params.setAddress(loc);
              props.navigation.goBack();
            }}
            activeOpacity={0.7}
            style={{
              borderRadius: Commons.size(10),
              overflow: 'hidden',
              alignSelf: 'center',
              backgroundColor: Colors.disabled,
              marginTop: Commons.size(15),
            }}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[Colors.start, Colors.end]}
              style={{
                width: Commons.width(0.95),
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
                  color: Colors.white,
                }}>
                Done
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      }
    />
  );
}
