import {View, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import Modal from 'react-native-modal';
import {Colors, Commons, Fonts, Images} from '../utils';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  MAP_TYPES,
  Callout,
} from 'react-native-maps';
import MapStyle from '../utils/MapStyle';
import {useRef} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Map from './Map';

export default function MapModal(props) {
  const [address, setAddress] = useState('');

  return (
    <Modal
      isVisible={props.isVisible}
      onBackButtonPress={() => {
        props.setVisible(false);
      }}
      onBackdropPress={() => {
        props.setVisible(false);
      }}
      style={{height: Commons.height(0.65)}}>
      <View
        style={{
          borderRadius: Commons.size(15),
          backgroundColor: Colors.white,
          padding: Commons.size(15),
          width: Commons.width(0.85),
          alignSelf: 'center',
        }}>
        <View style={{borderRadius: Commons.size(10), overflow: 'hidden'}}>
          <Map setAddress={setAddress} isHome={false} isSearch={true} />
        </View>

        <TouchableOpacity
          onPress={() => {
            props.setVisible(false);
            props.setAddress(address);
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
              width: Commons.width(0.75),
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
    </Modal>
  );
}
