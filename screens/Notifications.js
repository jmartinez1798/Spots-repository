import {View, Text, TouchableOpacity, Image, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeArea} from '../components';
import {Colors, Commons, Images, Fonts, Endpoints} from '../utils';
import ApiService from '../services/ApiService';
import {useSelector} from 'react-redux';
import moment from 'moment';

export default function Notifications(props) {
  const Item = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.type === 'followed') {
            Commons.navigate(props.navigation, 'profileX', {
              otherUser: item.user,
            });
          }
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: Commons.size(10),
          borderBottomWidth:
            index !== props.route.params.notifications.length - 1 ? 0.8 : 0,
          borderColor: Colors.disabled,
        }}>
        <Image
          source={{uri: item.user.avatar}}
          style={{
            height: Commons.size(50),
            width: Commons.size(50),
            borderRadius: Commons.size(25),
          }}
        />

        <Text
          style={{
            flex: 1,
            fontFamily: Fonts.sans_regular,
            color: Colors.white,
            fontSize: Commons.size(15),
            marginLeft: Commons.size(10),
          }}>
          {item.user.firstName} {item.message}
        </Text>

        <Text
          style={{
            fontFamily: Fonts.sans_regular,
            color: Colors.white,
            fontSize: Commons.size(10),
            marginLeft: Commons.size(10),
          }}>
          {moment(item.createdAt).format('h:mm A - DD/MM')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeArea
      statusBarTransculent={false}
      statusBarColor={Colors.tab_bar}
      child={
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: Commons.size(55),
              backgroundColor: Colors.tab_bar,
              paddingHorizontal: Commons.width(0.05),
            }}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
              style={{
                height: Commons.size(38),
                width: Commons.size(38),
                borderRadius: Commons.size(19),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Images.ChevronBack
                fill={Colors.white}
                height={Commons.size(20)}
                width={Commons.size(20)}
              />
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  color: Colors.white,
                  fontSize: Commons.size(20),
                  fontWeight: '400',
                  marginLeft: Commons.size(7),
                }}>
                Notifications
              </Text>
            </View>

            <View
              style={{
                height: Commons.size(38),
                width: Commons.size(38),
                borderRadius: Commons.size(19),
              }}>
              <Images.Search />
            </View>
          </View>

          <FlatList
            style={{marginTop: Commons.size(10)}}
            data={props.route.params.notifications}
            renderItem={Item}
            ListEmptyComponent={
              <Text
                style={{
                  alignSelf: 'center',
                  color: Colors.white,
                  fontFamily: Fonts.sans_medium,
                }}>
                No Notification
              </Text>
            }
          />
        </View>
      }
    />
  );
}
