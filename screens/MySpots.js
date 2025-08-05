import React, {useState} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import {SafeArea, FeatureSpotList} from '../components';
import {Commons, Images, Fonts, Colors} from '../utils';

export default function MySpots(props) {
  const [visible, setVisible] = useState(false);

  return (
    <SafeArea
      statusBarTransculent={false}
      statusBarColor={Colors.tab_bar}
      child={
        <View style={{flex: 1, backgroundColor: Colors.background}}>
          <View
            style={{
              padding: Commons.size(15),
              backgroundColor: Colors.tab_bar,
              alignSelf: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Images.Back
                stroke={Colors.white}
                height={Commons.size(24)}
                width={Commons.size(24)}
              />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: Commons.size(18),
                fontFamily: Fonts.sans_regular,
                color: Colors.white,
                fontWeight: '500',
              }}>
              Spots
            </Text>
            <TouchableOpacity>
              <Images.Back
                stroke={'transparent'}
                height={Commons.size(24)}
                width={Commons.size(24)}
              />
            </TouchableOpacity>
          </View>

          <View style={{flex: 1}}>
            <Text
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(24),
                color: Colors.white,
                fontWeight: '700',
                marginTop: Commons.size(20),
              }}>
              My Spots List
            </Text>
            <FeatureSpotList navigation={props.navigation} />
          </View>
        </View>
      }
    />
  );
}
