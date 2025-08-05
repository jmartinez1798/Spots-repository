import {View, Text, ActivityIndicator} from 'react-native';
import React from 'react';
import {Commons, Colors} from '../utils';
import Modal from 'react-native-modal';

export default function Loader(props) {
  return (
    <Modal
      style={{height: Commons.height()}}
      statusBarTranslucent={false}
      isVisible={props.visible}>
      <View
        style={{
          height: Commons.size(90),
          width: Commons.size(90),
          backgroundColor: Colors.white,
          borderRadius: Commons.size(20),
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
        }}>
        <ActivityIndicator color={Colors.primary} size={Commons.size(50)} />
      </View>
    </Modal>
  );
}
