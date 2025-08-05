import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import {SafeArea, FeedList, SpotList, Loader} from '../../components';
import {Colors, Images, Fonts, Commons, Endpoints} from '../../utils';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import ApiService from '../../services/ApiService';
import {useIsFocused} from '@react-navigation/native';
import {
  updateFollowers,
  updateFollowings,
  updateOtherFollowers,
  updateOtherFollowings,
} from '../../store/actions/FriendActions';

export default function Profile(props) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);
  const {posts} = useSelector(state => state.postReducer);
  const {followers, followings, otherFollowers, otherFollowings} = useSelector(
    state => state.friendReducer,
  );
  const isFocused = useIsFocused();
  const [selectedTab, setSelectedTab] = useState(0);
  const [spots, setSpots] = useState([]);
  const [otherPosts, setOtherPosts] = useState([]);
  const [closeFriends, setCloseFriends] = useState([]);
  const [visible, setVisible] = useState(false);
  const otherUser = props.route?.params?.otherUser;

  useEffect(() => {
    if (isFocused) {
      getSpots();
      getFriends();
      getCloseFriends();
      if (otherUser) {
        getPosts();
      }
    }
  }, [isFocused]);

  const getCloseFriends = async () => {
    await ApiService.get(Endpoints.friends + 'my', user.token)
      .then(res => {
        console.log('Close friends: ', res.data);
        // setCloseFriends(res.data.filter(f => f.type === 'close'));
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getSpots = async () => {
    if (otherUser) {
      await ApiService.get(Endpoints.spots + 'user/', user.token, otherUser._id)
        .then(res => {
          setSpots(res.data);
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      await ApiService.get(Endpoints.spots + 'my', user.token)
        .then(res => {
          setSpots(res.data);
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  const getPosts = async () => {
    await ApiService.get(Endpoints.posts + 'user/', user.token, otherUser._id)
      .then(res => {
        setOtherPosts(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getFriends = async () => {
    if (otherUser) {
      await ApiService.get(
        Endpoints.followers + 'user/',
        user.token,
        otherUser._id,
      )
        .then(res => {
          dispatch(updateOtherFollowers(res.data.followers));
          dispatch(updateOtherFollowings(res.data.followings));
        })
        .catch(err => {
          console.log(err);
        });
    }
    await ApiService.get(Endpoints.followers + 'my', user.token)
      .then(res => {
        dispatch(updateFollowers(res.data.followers));
        dispatch(updateFollowings(res.data.followings));
        // setCloseFriends(res.data.filter(f => f.type === 'close'));
        setVisible(false);
      })
      .catch(err => {
        console.log(err);
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
      child={
        <ScrollView
          style={{flex: 1, marginTop: Commons.size(20)}}
          showsVerticalScrollIndicator={false}>
          <Image
            source={
              otherUser
                ? {uri: otherUser.avatar}
                : user && user.avatar
                ? {uri: user.avatar}
                : Images.test_dp
            }
            style={{
              height: Commons.size(88),
              width: Commons.size(88),
              alignSelf: 'center',
              borderRadius: Commons.size(17),
              resizeMode: 'cover',
            }}
          />

          <Text
            style={{
              fontFamily: Fonts.sans_regular,
              fontSize: Commons.size(20),
              fontWeight: '700',
              alignSelf: 'center',
              color: Colors.white,
              marginTop: Commons.size(12),
            }}>
            {otherUser
              ? otherUser.firstName
              : user && user.firstName
              ? user.firstName
              : ''}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.sans_regular,
              fontSize: Commons.size(14),
              alignSelf: 'center',
              fontWeight: '400',
              color: Colors.light_grey,
            }}>
            {otherUser ? otherUser.email : user && user.email ? user.email : ''}
          </Text>

          {otherUser && (
            <TouchableOpacity
              style={{
                marginTop: Commons.size(20),
                width: Commons.width(0.9),
                alignSelf: 'center',
              }}
              onPress={() => {
                if (followings.find(f => f._id === otherUser._id)) {
                  removeFriend({
                    user: otherUser._id,
                  });
                } else {
                  addFriend({
                    user: otherUser._id,
                  });
                }
              }}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={[Colors.start, Colors.end]}
                style={{
                  height: Commons.size(40),
                  justifyContent: 'center',
                  borderRadius: Commons.size(8),
                  paddingHorizontal: Commons.size(21),
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                    alignSelf: 'center',
                    fontWeight: '400',
                    color: Colors.white,
                  }}>
                  {followings.find(f => f._id === otherUser._id)
                    ? 'Unfollow'
                    : 'Follow'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {!otherUser && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: Commons.width(0.9),
                marginTop: Commons.size(15),
                alignSelf: 'center',
              }}>
              <TouchableOpacity
                onPress={() =>
                  Commons.navigate(props.navigation, 'profile_builder', {
                    isUpdate: true,
                  })
                }
                style={{
                  height: Commons.size(34),
                  backgroundColor: Colors.tab_bar,
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: Commons.size(10),
                  borderRadius: Commons.size(4),
                }}>
                <Text
                  style={{
                    alignSelf: 'center',
                    color: Colors.white_light,
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                  }}>
                  Edit Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Commons.navigate(props.navigation, 'settings')}
                style={{
                  backgroundColor: Colors.tab_bar,
                  height: Commons.size(34),
                  width: Commons.size(34),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: Commons.size(4),
                }}>
                <Images.Settings
                  height={Commons.size(20)}
                  width={Commons.size(20)}
                />
              </TouchableOpacity>
            </View>
          )}

          <View
            style={{
              height: Commons.size(71),
              backgroundColor: Colors.tab_bar,
              width: Commons.width(0.9),
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: Commons.size(18),
              justifyContent: 'space-evenly',
              flexDirection: 'row',
              borderRadius: Commons.size(8),
            }}>
            <TouchableOpacity
              onPress={() => {
                Commons.navigate(props.navigation, 'friends', {
                  title: 'Followers',
                  isOther: otherUser,
                });
              }}
              disabled={
                otherUser ? otherFollowers.length === 0 : followers.length === 0
              }
              style={{
                flex: 0.3,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: Colors.white,
                  fontWeight: '400',
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(24),
                }}>
                {otherUser
                  ? otherFollowers
                    ? otherFollowers.length
                    : 0
                  : followers.length}
              </Text>
              <Text
                style={{
                  color: Colors.white_light,
                  fontWeight: '400',
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(14),
                }}>
                Followers
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Commons.navigate(props.navigation, 'friends', {
                  title: 'Following',
                  isOther: otherUser,
                });
              }}
              disabled={
                otherUser
                  ? otherFollowings.length === 0
                  : followings.length === 0
              }
              style={{
                flex: 0.3,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: Colors.white,
                  fontWeight: '400',
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(24),
                }}>
                {otherUser
                  ? otherFollowings
                    ? otherFollowings.length
                    : 0
                  : followings.length}
              </Text>
              <Text
                style={{
                  color: Colors.white_light,
                  fontWeight: '400',
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(14),
                }}>
                Following
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 0.3,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: Colors.white,
                  fontWeight: '400',
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(24),
                }}>
                {closeFriends.length}
              </Text>
              <Text
                style={{
                  color: Colors.white_light,
                  fontWeight: '400',
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(14),
                }}>
                Close Friends
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            numberOfLines={5}
            style={{
              width: Commons.width(0.9),
              alignSelf: 'center',
              backgroundColor: Colors.tab_bar,
              padding: Commons.size(10),
              marginTop: Commons.size(18),
              borderRadius: Commons.size(8),
              fontFamily: Fonts.sans_regular,
              fontSize: Commons.size(14),
              fontWeight: '400',
              color: Colors.white,
            }}>
            {otherUser
              ? otherUser.biography
              : user && user.biography
              ? user.biography
              : ''}
          </Text>

          {(otherUser && followings.find(f => f._id === otherUser._id)) ||
          !otherUser ? (
            <View>
              <View
                style={{
                  width: Commons.width(0.9),
                  alignSelf: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.tab_bar,
                  borderWidth: 1,
                  borderColor: Colors.light_black,
                  borderRadius: Commons.size(8),
                  height: Commons.size(35),
                  marginTop: Commons.size(15),
                }}>
                <TouchableOpacity
                  onPress={() => setSelectedTab(0)}
                  activeOpacity={0.7}
                  style={{
                    flex: 0.5,
                    overflow: 'hidden',
                    borderRadius: Commons.size(8),
                  }}
                  disabled={selectedTab === 0}>
                  {selectedTab === 0 && (
                    <LinearGradient
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      colors={[Colors.start, Colors.end]}
                      style={{
                        height: Commons.size(35),
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily: Fonts.sans_regular,
                          fontSize: Commons.size(14),
                          alignSelf: 'center',
                          fontWeight: '400',
                          color: Colors.white,
                        }}>
                        Posts
                      </Text>
                    </LinearGradient>
                  )}
                  {selectedTab === 1 && (
                    <View
                      style={{
                        height: Commons.size(35),
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily: Fonts.sans_regular,
                          fontSize: Commons.size(14),
                          alignSelf: 'center',
                          fontWeight: '400',
                          color: Colors.white,
                        }}>
                        Posts
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedTab(1)}
                  activeOpacity={0.7}
                  style={{
                    flex: 0.5,
                    overflow: 'hidden',
                    borderRadius: Commons.size(5),
                  }}
                  disabled={selectedTab === 1}>
                  {selectedTab === 1 && (
                    <LinearGradient
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      colors={[Colors.start, Colors.end]}
                      style={{
                        height: Commons.size(35),
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily: Fonts.sans_regular,
                          fontSize: Commons.size(14),
                          alignSelf: 'center',
                          fontWeight: '400',
                          color: Colors.white,
                        }}>
                        Spots
                      </Text>
                    </LinearGradient>
                  )}
                  {selectedTab === 0 && (
                    <View
                      style={{
                        height: Commons.size(35),
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily: Fonts.sans_regular,
                          fontSize: Commons.size(14),
                          alignSelf: 'center',
                          fontWeight: '400',
                          color: Colors.white,
                        }}>
                        Spots
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {selectedTab === 0 && (
                <FeedList
                  fromProfile
                  navigation={props.navigation}
                  data={
                    otherUser
                      ? otherPosts
                      : posts.filter(p => p.user._id === user._id)
                  }
                />
              )}
              {selectedTab === 1 && (
                <SpotList spots={spots} navigation={props.navigation} />
              )}
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(14),
                  fontWeight: '400',
                  alignSelf: 'center',
                  textAlign: 'center',
                  color: Colors.white,
                  marginTop: Commons.size(150),
                }}>
                Follow {otherUser.firstName} to view posts & spots
              </Text>
            </View>
          )}

          <Loader visible={visible} />
        </ScrollView>
      }
    />
  );
}
