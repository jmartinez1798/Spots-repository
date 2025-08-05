import React, {useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import {Colors, Images, Fonts, Commons, Endpoints} from '../utils';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';

export default function ChatList(props) {
  var tabBarHeight = 0;
  const {chats} = useSelector(state => state.chatReducer);
  const {user} = useSelector(state => state.authReducer);

  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (err) {
    console.log(err);
  }

  const Item = ({item, index}) => {
    let time = Commons.timeDiff(new Date(moment(item.updatedAt)), new Date());

    let other =
      item.type === 'direct'
        ? item.users.find(u => u._id !== user._id)
        : item.group;
    return (
      <TouchableOpacity
        onPress={() => {
          if (props.canTouch) {
            Commons.navigate(props.navigation, 'chat', {
              chat_id: item._id,
            });
          }
        }}
        style={{
          height: Commons.size(70),
          width: Commons.width(0.9),
          marginBottom: Commons.size(15),
          backgroundColor: Colors.chat_card_bg,
          paddingHorizontal: Commons.size(10),
          justifyContent: 'center',
          borderRadius: Commons.size(8),
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image
            source={{
              uri: other
                ? item.type === 'direct'
                  ? other.avatar
                  : other.image
                : '',
            }}
            style={{
              height: Commons.size(52),
              width: Commons.size(52),
              borderRadius: Commons.size(26),
            }}
          />

          <View style={{marginHorizontal: Commons.size(9), flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  flex: 1,
                  fontSize: Commons.size(16),
                  fontFamily: Fonts.sans_medium,
                  fontWeight: '400',
                  color: Colors.white,
                }}>
                {other
                  ? item.type === 'direct'
                    ? other.firstName
                    : other.name
                  : ''}
              </Text>

              <View
                style={{
                  height: Commons.size(18),
                  paddingHorizontal: Commons.size(5),
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.badge,
                  borderRadius: Commons.size(5),
                }}>
                <Text
                  style={{
                    color: Colors.white,
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(12),
                    fontWeight: '400',
                  }}>
                  {item.messages && item.messages.length > 0
                    ? item.messages.filter(m => m.read === 'No').length
                    : 0}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: Commons.size(2),
              }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {item.type === 'group' &&
                  item.messages &&
                  item.messages.length > 0 && (
                    <Text
                      style={{
                        fontSize: Commons.size(14),
                        lineHeight: Commons.size(18),
                        fontFamily: Fonts.sans_regular,
                        fontWeight: '400',
                        color: Colors.primary,
                      }}>
                      {item.messages[item.messages.length - 1].user._id ===
                      user._id
                        ? 'Me'
                        : item.messages[
                            item.messages.length - 1
                          ].user.firstName.split(' ')[0]}
                      :{'  '}
                    </Text>
                  )}
                <Text
                  numberOfLines={1}
                  ellipsisMode={'tail'}
                  style={{
                    fontSize: Commons.size(14),
                    maxWidth: Commons.size(166),
                    lineHeight: Commons.size(18),
                    fontFamily: Fonts.sans_regular,
                    fontWeight: '400',
                    color: Colors.chat_card_msg,
                  }}>
                  {item.messages && item.messages.length > 0
                    ? item.messages[item.messages.length - 1].type === 'text'
                      ? item.messages[item.messages.length - 1].text
                      : 'Attachement'
                    : 'No message yet'}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: Commons.size(12),
                  fontFamily: Fonts.sans_regular,
                  fontWeight: '400',
                  color: Colors.chat_card_time,
                }}>
                {time.days === 0 || time.days === '-1' || time.days === -1
                  ? time.hours === 0 || time.hours === '-1' || time.hours === -1
                    ? time.minutes === 0 ||
                      time.minutes === '-1' ||
                      time.minutes === -1
                      ? 'Few seconds ago'
                      : time.minutes + 'm ago'
                    : time.hours + 'h ago'
                  : time.days + 'd ago'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      refreshControl={
        <RefreshControl
          refreshing={props.refreshing}
          onRefresh={props.getChats}
        />
      }
      onScrollToIndexFailed={info => {
        const wait = new Promise(resolve => setTimeout(resolve, 500));
        wait.then(() => {});
      }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{alignItems: 'center'}}
      style={[{marginTop: Commons.size(15)}, props.style]}
      data={chats}
      renderItem={Item}
      keyExtractor={item => item._id}
      ListFooterComponent={
        <View style={{height: tabBarHeight + Commons.size(15)}} />
      }
    />
  );
}
