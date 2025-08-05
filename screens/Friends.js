import React from 'react';
import {Text, View, TouchableOpacity, TextInput, Image} from 'react-native';
import {SafeArea, FriendList} from '../components';
import {Colors, Images, Fonts, Commons} from '../utils';
import LinearGradient from 'react-native-linear-gradient';

export default function Friends(props) {
  return (
    <SafeArea
      statusBarTransculent={false}
      child={
        <View style={{flex: 1}}>
          <View
            style={{
              width: Commons.width(0.9),
              marginTop: Commons.size(20),
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
                fontSize: Commons.size(16),
                fontFamily: Fonts.sans_regular,
                color: Colors.white,
                fontWeight: '400',
              }}>
              {props.route.params.title}
            </Text>
            <Images.Back
              height={Commons.size(24)}
              width={Commons.size(24)}
              stroke={'transparent'}
            />
          </View>

          <View
            style={{
              height: Commons.size(44),
              width: Commons.width(0.9),
              borderWidth: 1,
              borderColor: Colors.light_black,
              backgroundColor: Colors.friends_search_bar,
              borderRadius: Commons.size(7),
              alignSelf: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              paddingHorizontal: Commons.size(7),
              marginTop: Commons.size(30),
            }}>
            <Images.Search
              stroke={Colors.white}
              height={Commons.size(15)}
              width={Commons.size(15)}
            />
            <TextInput
              style={{
                flex: 1,
                fontSize: Commons.size(15),
                color: Colors.white,
                marginHorizontal: Commons.size(5),
                fontFamily: Fonts.sans_regular,
                fontWeight: '400',
              }}
              blurOnSubmit={true}
              returnKeyType={'search'}
              placeholder={'Search'}
              placeholderTextColor={Colors.light_black}
            />
          </View>

          <FriendList
            isFollower={props.route.params.title === 'Followers'}
            isOther={props.route.params.isOther}
          />
        </View>
      }
    />
  );
}
