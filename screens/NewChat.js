import React, {useEffect, useState} from 'react';
import {Text, View, TouchableOpacity, TextInput} from 'react-native';
import {SafeArea, FollowerList, Loader} from '../components';
import {Colors, Images, Fonts, Commons, Endpoints} from '../utils';
import ApiService from '../services/ApiService';
import {useSelector} from 'react-redux';

export default function NewChat(props) {
  const {user} = useSelector(state => state.authReducer);
  const [visible, setVisible] = useState(false);
  const [allData, setAllData] = useState([]);
  const [friends, setFriends] = useState([]);
  const [data, setData] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getUsers();
    getFriends();
  }, []);

  useEffect(() => {
    if (search.trim().length > 0)
      setData(
        allData.filter(ad =>
          ad.firstName.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    else setData(allData);
  }, [search]);

  const getUsers = async () => {
    setVisible(true);
    await ApiService.get(Endpoints.user, user.token)
      .then(res => {
        setAllData(res.data);
        setData(res.data);
        setVisible(false);
      })
      .catch(err => {
        console.log(err);
        setVisible(false);
      });
  };

  const getFriends = async () => {
    await ApiService.get(Endpoints.followers + 'my', user.token)
      .then(res => {
        setFriends(res.data);
        setVisible(false);
      })
      .catch(err => {
        console.log(err);
        setVisible(false);
      });
  };

  const addFriend = async body => {
    setVisible(true);
    await ApiService.post(Endpoints.followers + '/follow', body, user.token)
      .then(res => {
        getFriends();
      })
      .catch(err => {
        console.log(err);
        setVisible(false);
      });
  };

  const removeFriend = async body => {
    setVisible(true);
    await ApiService.post(Endpoints.followers + '/unfollow', body, user.token)
      .then(res => {
        getFriends();
      })
      .catch(err => {
        console.log(err);
        setVisible(false);
      });
  };

  return (
    <SafeArea
      statusBarTransculent={false}
      statusBarColor={Colors.tab_bar}
      child={
        <View style={{flex: 1}}>
          <View
            style={{
              marginTop: Commons.size(20),
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              width: Commons.width(0.9),
            }}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  color: Colors.light_grey,
                  fontSize: Commons.size(16),
                  fontWeight: '400',
                }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.sans_regular,
                color: Colors.white,
                fontSize: Commons.size(18),
                fontWeight: '400',
                textAlign: 'center',
              }}>
              Start a conversation
            </Text>
            <Text
              style={{
                fontFamily: Fonts.sans_regular,
                color: 'transparent',
                fontSize: Commons.size(16),
                fontWeight: '400',
              }}>
              Cancel
            </Text>
          </View>

          <View
            style={{
              height: Commons.size(44),
              width: Commons.width(0.9),
              alignSelf: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              marginTop: Commons.size(30),
            }}>
            <Text
              style={{
                fontFamily: Fonts.sans_regular,
                color: Colors.light_grey,
                fontSize: Commons.size(16),
                fontWeight: '400',
              }}>
              To:{' '}
            </Text>
            <TextInput
              style={{
                flex: 1,
                marginHorizontal: Commons.size(5),
                fontFamily: Fonts.sans_regular,
                color: Colors.light_grey,
                fontSize: Commons.size(16),
                fontWeight: '400',
              }}
              value={search}
              onChangeText={setSearch}
              blurOnSubmit={true}
              returnKeyType={'search'}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              if (selectedMembers.length > 1)
                Commons.navigate(props.navigation, 'new_group', {
                  members: selectedMembers,
                });
              else
                Commons.toast('Members should be atleast 2 to create a group');
            }}
            style={{
              height: Commons.size(54),
              width: Commons.width(0.9),
              borderRadius: Commons.size(8),
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              marginTop: Commons.size(2),
              paddingHorizontal: Commons.size(7),
              backgroundColor: Colors.new_group_card,
            }}>
            <View
              style={{
                backgroundColor: Colors.group_icon_bg,
                height: Commons.size(40),
                width: Commons.size(40),
                borderRadius: Commons.size(20),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Images.Group fill={Colors.white} />
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.sans_medium,
                color: Colors.white,
                fontSize: Commons.size(16),
                fontWeight: '400',
                marginHorizontal: Commons.size(16),
              }}>
              Create a group
            </Text>
          </TouchableOpacity>

          <FollowerList
            navigation={props.navigation}
            data={friends.followings ? friends.followings : []}
            friends={friends}
            selectedMembers={selectedMembers}
            setSelectedMembers={setSelectedMembers}
            addFriend={addFriend}
            removeFriend={removeFriend}
          />

          <Loader visible={visible} />
        </View>
      }
    />
  );
}
