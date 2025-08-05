import moment from 'moment';
import React, {useState} from 'react';
import {useRef} from 'react';
import {useEffect} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import {Colors, Images, Fonts, Commons} from '../utils';

export default function MessageList(props) {
  const list = useRef(null);

  useEffect(() => {
    if (props.newItemAdded) {
      list.current.scrollToIndex({
        animated: true,
        index: props.data.length - 1,
      });
      props.setNewItemAdded(false);
    }
  }, [props.newItemAdded]);

  const Item = ({item, index}) => {
    return (
      <View
        key={`${index}`}
        style={{
          width: Commons.width(0.9),
          marginBottom: Commons.size(15),
          flexDirection: 'row',
          borderRadius: Commons.size(8),
        }}>
        <Image
          style={{
            height: Commons.size(36),
            width: Commons.size(36),
            borderRadius: Commons.size(18),
            resizeMode: 'cover',
          }}
          source={{uri: item.user.avatar}}
        />

        <View
          style={{
            flex: 1,
            marginLeft: Commons.size(15),
            borderRadius: Commons.size(10),
            padding: Commons.size(10),
            backgroundColor: Colors.tab_bar,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                flex: 1,
                color: Colors.white,
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(14),
                fontWeight: '500',
              }}>
              {item.user.firstName}
            </Text>

            <TouchableOpacity
              style={{
                height: Commons.size(24),
                width: Commons.size(24),
                borderRadius: Commons.size(12),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.light_grey,
              }}>
              {!item.liked && (
                <Images.HeartOutline
                  width={Commons.size(16)}
                  height={Commons.size(16)}
                />
              )}
              {item.liked && (
                <Images.Heart
                  fill={'red'}
                  width={Commons.size(16)}
                  height={Commons.size(16)}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {item.text && (
              <Text
                style={{
                  flex: 1,
                  color: Colors.white,
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(14),
                  marginTop: Commons.size(7),
                  fontWeight: '400',
                }}>
                {item.text}
              </Text>
            )}

            {item.image && (
              <View
                style={{
                  flex: 1,
                }}>
                <Image
                  source={{uri: item.image}}
                  style={{
                    height: Commons.size(140),
                    width: Commons.size(140),
                    resizeMode: 'cover',
                    borderRadius: Commons.size(15),
                    marginTop: Commons.size(7),
                  }}
                />
              </View>
            )}

            <Text
              style={{
                color: Colors.white_light,
                fontFamily: Fonts.sans_regular,
                fontSize: Commons.size(12),
                fontWeight: '400',
              }}>
              {moment(item.createdAt).format('hh:mm A - DD/MM')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      ref={list}
      initialScrollIndex={props.data.length - 1}
      onScrollToIndexFailed={info => {
        const wait = new Promise(resolve => setTimeout(resolve, 500));
        wait.then(() => {
          list.current?.scrollToIndex({
            index: props.data.length - 1,
            animated: true,
          });
        });
      }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{alignItems: 'center'}}
      style={[{paddingTop: Commons.size(15)}, props.style]}
      data={props.data}
      renderItem={Item}
      keyExtractor={item => item._id}
      ListFooterComponent={<View style={{height: Commons.size(10)}} />}
    />
  );
}
