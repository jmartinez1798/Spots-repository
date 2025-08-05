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

export default function TownList(props) {
  const tabBarHeight = useBottomTabBarHeight();

  const Item = ({item, index}) => {
    return (
      <View
        style={{
          width: Commons.size(144),
          marginRight: index !== props.data.length - 1 ? Commons.size(15) : 0,
        }}>
        <View
          style={{
            height: Commons.size(144),
            width: Commons.size(144),
            borderRadius: Commons.size(15),
            overflow: 'hidden',
          }}>
          <Image
            source={{uri: item.image}}
            style={{
              height: Commons.size(144),
              width: Commons.size(144),
              resizeMode: 'cover',
            }}
          />

          <View
            style={{
              position: 'absolute',
              bottom: Commons.size(7),
              left: Commons.size(7),
            }}>
            <Text
              style={{
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(16),
                marginTop: Commons.size(7),
                color: Colors.white,
                fontWeight: '400',
              }}>
              {item.name}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{alignItems: 'center'}}
      style={{paddingVertical: Commons.size(10)}}
      data={props.data}
      renderItem={Item}
      keyExtractor={({item, index}) => `${index}`}
      ListFooterComponent={
        <View style={{height: tabBarHeight + Commons.size(15)}} />
      }
    />
  );
}
