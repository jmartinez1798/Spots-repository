import React, {useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import {Colors, Images, Fonts, Commons, Endpoints} from '../utils';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import ApiService from '../services/ApiService';
import {
  updateFollowers,
  updateFollowings,
} from '../store/actions/FriendActions';
import Loader from './Loader';

export default function FriendList(props) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);
  const {followers, followings, otherFollowers, otherFollowings} = useSelector(
    state => state.friendReducer,
  );
  const [visible, setVisible] = useState(false);

  const getFriends = async () => {
    await ApiService.get(Endpoints.followers + 'my', user.token)
      .then(res => {
        dispatch(updateFollowings(res.data.followings));
        dispatch(updateFollowers(res.data.followers));
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
        setVisible(false);
      });
  };

  const removeFriend = async body => {
    setVisible(true);
    await ApiService.post(Endpoints.followers + '/unfollow', body, user.token)
      .then(res => {
        dispatch(updateFollowings(followings.filter(f => f._id !== body.user)));
        setVisible(false);
      })
      .catch(err => {
        console.log(err);
        setVisible(false);
      });
  };

  const Item = ({item, index}) => {
    return (
      <View
        style={{
          width: Commons.width(0.9),
          paddingVertical: Commons.size(12),
          justifyContent: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image
            source={{uri: item.avatar}}
            style={{
              height: Commons.size(52),
              width: Commons.size(52),
              borderRadius: Commons.size(26),
              resizeMode: 'cover',
            }}
          />

          <Text
            numOfLines={1}
            ellipsisMode={'tail'}
            style={{
              flex: 1,
              fontSize: Commons.size(16),
              fontFamily: Fonts.sans_medium,
              fontWeight: '400',
              marginHorizontal: Commons.size(8),
              color: Colors.white,
            }}>
            {item.firstName}
          </Text>

          {item._id !== user._id && (
            <TouchableOpacity
              onPress={() => {
                if (
                  props.isFollower &&
                  !followings.find(f => f._id === item._id)
                ) {
                  addFriend({
                    user: item._id,
                  });
                } else {
                  removeFriend({
                    user: item._id,
                  });
                }
              }}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={[Colors.start, Colors.end]}
                style={{
                  height: Commons.size(32),
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
                  {props.isFollower &&
                  followings.find(f => f._id === item._id) &&
                  followers.find(f => f._id === item._id)
                    ? 'Unfollow'
                    : !props.isFollower &&
                      followings.find(f => f._id === item._id)
                    ? 'Unfollow'
                    : 'Follow'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View>
      <FlatList
        contentContainerStyle={{alignItems: 'center'}}
        style={{marginTop: Commons.size(15), marginBottom: Commons.size(5)}}
        data={
          props.isOther
            ? props.isFollower
              ? otherFollowers
              : otherFollowings
            : props.isFollower
            ? followers
            : followings
        }
        renderItem={Item}
      />

      <Loader visible={visible} />
    </View>
  );
}
