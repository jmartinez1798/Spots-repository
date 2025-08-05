import React, {useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import {Colors, Images, Fonts, Commons} from '../utils';

export default function PostList(props) {
  const Item = ({item, index}) => {
    return (
      <View
        style={{
          marginRight: index !== props.data.length - 1 ? Commons.size(5) : 0,
          padding: Commons.size(10),
        }}>
        <View
          style={{
            width: Commons.size(100),
            height: Commons.size(140),
            borderRadius: Commons.size(10),
            overflow: 'hidden',
          }}>
          <Image
            source={{
              uri: typeof item === 'object' ? 'file://' + item.path : item,
            }}
            style={{
              width: Commons.size(100),
              height: Commons.size(140),
              resizeMode: 'cover',
            }}
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            props.setPics(props.data.filter(d => d !== item));
          }}
          style={{
            alignSelf: 'flex-start',
            alignItems: 'center',
            justifyContent: 'center',
            right: Commons.size(1),
            position: 'absolute',
            height: Commons.size(20),
            width: Commons.size(20),
            borderRadius: Commons.size(10),
            backgroundColor: Colors.white,
          }}>
          <Images.Close
            stroke={Colors.black}
            height={Commons.size(10)}
            width={Commons.size(10)}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        width: Commons.width(0.9),
      }}
      style={{
        alignSelf: 'center',
      }}
      data={props.data}
      renderItem={Item}
      keyExtractor={item => item._id}
    />
  );
}
