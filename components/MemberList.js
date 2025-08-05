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

export default function MemberList(props) {
  const Item = ({item, index}) => {
    return (
      <View
        style={{
          marginRight: index !== props.data.length - 1 ? Commons.size(19) : 0,
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: Commons.size(24),
          backgroundColor: Colors.avatar_bg,
          flexDirection: 'row',
        }}>
        <View
          style={{
            alignSelf: 'center',
            height: Commons.size(48),
            width: Commons.size(48),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: Commons.size(24),
            backgroundColor: Colors.avatar_bg,
            overflow: 'hidden',
          }}>
          <Image
            source={{uri: item.avatar}}
            style={{
              width: Commons.size(48),
              height: Commons.size(48),
              borderRadius: Commons.size(24),
            }}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            props.removeMemeber(index);
          }}
          style={{
            alignSelf: 'flex-start',
            alignItems: 'center',
            justifyContent: 'center',
            right: Commons.size(3),
            top: -1 * Commons.size(3),
            position: 'absolute',
          }}>
          <Images.RoundClose
            height={Commons.size(15)}
            width={Commons.size(15)}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{alignItems: 'center'}}
      style={{
        marginRight: Commons.size(22),
        marginTop: Commons.size(5),
        flexGrow: 0,
      }}
      data={props.data}
      renderItem={Item}
      keyExtractor={item => item._id}
    />
  );
}
