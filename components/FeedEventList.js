import React, {useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {Colors, Images, Fonts, Commons} from '../utils';
import {useSelector} from 'react-redux';

export default function FeedEventList(props) {
  const tabBarHeight = useBottomTabBarHeight();

  const Item = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          Commons.navigate(props.navigation, 'event_detail', {
            event_id: item._id,
          });
        }}
        style={{
          width: Commons.size(150),
          marginRight: index !== props.events.length - 1 ? Commons.size(15) : 0,
        }}>
        <View
          style={{
            height: Commons.size(120),
            width: Commons.size(150),
            borderRadius: Commons.size(10),
            overflow: 'hidden',
          }}>
          <Image
            source={{uri: item.coverImage}}
            style={{
              height: Commons.size(120),
              width: Commons.size(150),
              resizeMode: 'cover',
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: Commons.size(10),
          }}>
          <View
            style={{
              height: Commons.size(30),
              width: Commons.size(30),
              borderRadius: Commons.size(15),
              overflow: 'hidden',
            }}>
            <Image
              source={Images.test_dp}
              style={{
                height: Commons.size(30),
                width: Commons.size(30),
                resizeMode: 'cover',
              }}
            />
          </View>

          <View
            style={{
              height: Commons.size(30),
              width: Commons.size(30),
              marginLeft: -1 * Commons.size(15),
              borderRadius: Commons.size(15),
              overflow: 'hidden',
            }}>
            <Image
              source={Images.test_dp}
              style={{
                height: Commons.size(30),
                width: Commons.size(30),
                resizeMode: 'cover',
              }}
            />
          </View>

          <View
            style={{
              height: Commons.size(30),
              width: Commons.size(30),
              marginLeft: -1 * Commons.size(15),
              borderRadius: Commons.size(15),
              overflow: 'hidden',
            }}>
            <Image
              source={Images.test_dp}
              style={{
                height: Commons.size(30),
                width: Commons.size(30),
                resizeMode: 'cover',
              }}
            />
          </View>

          <View
            style={{
              height: Commons.size(30),
              width: Commons.size(30),
              borderRadius: Commons.size(15),
              marginLeft: -1 * Commons.size(15),
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.white,
            }}>
            <Text
              style={{
                color: Colors.primary,
                fontWeight: '700',
                fontFamily: Fonts.sans_regular,
                fontSize: Commons.size(16),
              }}>
              +4
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={1}
          ellipsizeMode={'tail'}
          style={{
            fontFamily: Fonts.sans_medium,
            fontSize: Commons.size(16),
            marginTop: Commons.size(7),
            color: Colors.white,
            fontWeight: '400',
          }}>
          {item.name}
        </Text>

        <Text
          numberOfLines={2}
          ellipsizeMode={'tail'}
          style={{
            fontFamily: Fonts.sans_regular,
            fontSize: Commons.size(12),
            color: Colors.white_light,
            fontWeight: '400',
          }}>
          {item.location.address}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{alignItems: 'center'}}
      style={{paddingVertical: Commons.size(7)}}
      data={props.events}
      renderItem={Item}
      keyExtractor={item => item._id}
      ListFooterComponent={
        <View style={{height: tabBarHeight + Commons.size(15)}} />
      }
    />
  );
}
