import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Pressable,
  TextInput,
  FlatList,
  Image,
  PanResponder,
} from 'react-native';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {Colors, Images, Fonts, Commons, Endpoints} from '../utils';
import FeedSpotList from './FeedSpotList';
import LinearGradient from 'react-native-linear-gradient';
import FeedEventList from './FeedEventList';
import moment from 'moment/moment';
import ApiService from '../services/ApiService';
import {useDispatch, useSelector} from 'react-redux';
import {updatePosts} from '../store/actions/PostActions';

export default function FeedList(props) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);
  const {posts} = useSelector(state => state.postReducer);
  const {events} = useSelector(state => state.eventReducer);
  const {spots} = useSelector(state => state.spotReducer);
  let tabBarHeight;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (err) {
    tabBarHeight = 0;
  }

  const processLikePost = async (id, index) => {
    let action = '';
    if (!posts[index].likes.includes(user._id)) {
      posts[index].likes.push(user._id);
      action = 'add';
    } else {
      let ind = posts[index].likes.indexOf(user._id);
      if (ind > -1) {
        posts[index].likes.splice(ind, 1);
      }
      action = 'remove';
    }
    dispatch(updatePosts(posts));
    await ApiService.post(Endpoints.like_post + id, null, user.token)
      .then(res => {})
      .catch(err => {
        if (action === 'add') {
          let ind = posts[index].likes.indexOf(user._id);
          if (ind > -1) {
            posts[index].likes.splice(ind, 1);
          }
        } else {
          posts[index].likes.push(user._id);
        }
        dispatch(updatePosts(posts));
        console.log(err);
      });
  };

  const processReactPost = async (id, index) => {
    let action = '';
    if (!posts[index].reactions.includes(user._id)) {
      posts[index].reactions.push(user._id);
      action = 'add';
    } else {
      let ind = posts[index].reactions.indexOf(user._id);
      if (ind > -1) {
        posts[index].reactions.splice(ind, 1);
      }
      action = 'remove';
    }
    dispatch(updatePosts(posts));
    await ApiService.post(Endpoints.react_post + id, null, user.token)
      .then(res => {})
      .catch(err => {
        if (action === 'add') {
          let ind = posts[index].reactions.indexOf(user._id);
          if (ind > -1) {
            posts[index].reactions.splice(ind, 1);
          }
        } else {
          posts[index].reactions.push(user._id);
        }
        dispatch(updatePosts(posts));
        console.log(err);
      });
  };

  const Item = ({item, index}) => {
    let time = Commons.timeDiff(new Date(moment(item.createdAt)), new Date());
    return (
      <View
        style={{
          width: Commons.width(0.9),
          marginBottom: Commons.size(15),
        }}>
        <Pressable
          onPress={() => {
            if (props.navigation)
              Commons.navigate(props.navigation, 'post', {
                post: item._id,
              });
          }}
          style={{
            width: Commons.width(0.9),
            marginBottom: Commons.size(15),
            backgroundColor: Colors.feed_card_bg,
            paddingHorizontal: Commons.size(18),
            paddingVertical: Commons.size(12),
            borderRadius: Commons.size(15),
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={{uri: item.user.avatar}}
              style={{
                height: Commons.size(40),
                width: Commons.size(40),
                borderRadius: Commons.size(20),
              }}
            />

            <View style={{marginHorizontal: Commons.size(12), flex: 1}}>
              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  fontSize: Commons.size(16),
                  fontWeight: '400',
                  color: Colors.white,
                }}>
                {item.user.firstName}
              </Text>

              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(12),
                  fontWeight: '400',
                  color: Colors.white_light,
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

            {!props.fromProfile && (
              <TouchableOpacity
                onPress={e => {
                  props.setLocations(
                    e.nativeEvent.pageX.toFixed(2),
                    e.nativeEvent.pageY.toFixed(2),
                    item,
                  );
                }}>
                <Images.More />
              </TouchableOpacity>
            )}
          </View>

          {item.text && (
            <Text
              style={{
                fontFamily: Fonts.sans_regular,
                fontSize: Commons.size(14),
                fontWeight: '400',
                color: Colors.white,
                marginTop: Commons.size(12),
              }}>
              {item.text}
            </Text>
          )}

          {((item.images && item.images.length > 0) ||
            item.type === 'event' ||
            item.type === 'spot') && (
            <View
              style={{
                height: Commons.size(145),
                width: Commons.width(0.9) - Commons.size(18) * 2,
                borderRadius: Commons.size(10),
                marginTop: Commons.size(12),
                overflow: 'hidden',
              }}>
              <Image
                source={{
                  uri:
                    item.type === 'event'
                      ? item.event.coverImage
                      : item.type === 'spot'
                      ? item.spot.images[0]
                      : item.images[0],
                }}
                style={{
                  height: Commons.size(145),
                  width: Commons.width(0.9) - Commons.size(18) * 2,
                  resizeMode: 'cover',
                }}
              />

              {item.type === 'event' && (
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[Colors.start, Colors.end]}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    padding: Commons.size(5),
                    borderTopRightRadius: Commons.size(10),
                    borderBottomLeftRadius: Commons.size(10),
                  }}>
                  <Images.Event fill={Colors.white} />
                </LinearGradient>
              )}

              {item.type === 'spot' && (
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[Colors.start, Colors.end]}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    padding: Commons.size(5),
                    borderTopRightRadius: Commons.size(10),
                    borderBottomLeftRadius: Commons.size(10),
                  }}>
                  <Images.Spot stroke={Colors.white} fill={Colors.white} />
                </LinearGradient>
              )}
            </View>
          )}

          {item.type === 'event' && (
            <TouchableOpacity
              onPress={() => {
                Commons.navigate(props.navigation, 'event_detail', {
                  event_id: item.event._id,
                });
              }}>
              <View style={{flexDirection: 'row', marginTop: Commons.size(10)}}>
                <View
                  style={{
                    flex: 1,
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_medium,
                      fontSize: Commons.size(18),
                      color: Colors.white,
                      fontWeight: '700',
                    }}>
                    {item.event.name}
                  </Text>

                  <Text
                    style={{
                      fontFamily: Fonts.sans_regular,
                      fontSize: Commons.size(12),
                      color: Colors.light_grey,
                      fontWeight: '400',
                    }}>
                    {item.event.location.address}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(12),
                    color: Colors.light_grey,
                    fontWeight: '400',
                  }}>
                  {moment(item.event.startTime).format('DD/MM/YY - h:mm a')}
                </Text>
              </View>

              {item.event.visitors.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: Commons.size(10),
                  }}>
                  {item.event.visitors.slice(0, 4).map((item2, index2) => {
                    if (index2 < 3) {
                      return (
                        <View
                          style={{
                            height: Commons.size(30),
                            width: Commons.size(30),
                            borderRadius: Commons.size(15),
                            marginLeft: index2 > 0 ? -1 * Commons.size(15) : 0,
                            borderWidth: 1,
                            borderBottomColor: Colors.background,
                            overflow: 'hidden',
                          }}>
                          <Image
                            source={{uri: item2.avatar}}
                            style={{
                              height: Commons.size(30),
                              width: Commons.size(30),
                              resizeMode: 'cover',
                            }}
                          />
                        </View>
                      );
                    }
                    return (
                      <View
                        style={{
                          height: Commons.size(30),
                          width: Commons.size(30),
                          borderRadius: Commons.size(15),
                          marginLeft: -1 * Commons.size(15),
                          borderWidth: 1,
                          borderBottomColor: Colors.background,
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
                            fontSize: Commons.size(15),
                          }}>
                          +{item.event.visitors.length - 3}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
              {item.event.visitors.length > 0 && (
                <Text
                  style={{
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(12),
                    fontWeight: '700',
                    color: Colors.primary,
                  }}>
                  {item.event.visitors[0].firstName}{' '}
                  <Text
                    style={{
                      fontFamily: Fonts.sans_medium,
                      fontSize: Commons.size(12),
                      fontWeight: '400',
                      color: Colors.white,
                    }}>
                    {item.event.visitors.length > 2
                      ? `and ${item.event.visitors.length - 1} people are going`
                      : item.event.visitors.length > 1
                      ? `and 1 other is going`
                      : 'is going'}
                  </Text>
                </Text>
              )}
            </TouchableOpacity>
          )}

          {item.type === 'spot' && (
            <TouchableOpacity
              onPress={() => {
                Commons.navigate(props.navigation, 'spot_details', {
                  spot: item.spot,
                });
              }}>
              <View style={{flexDirection: 'row', marginTop: Commons.size(10)}}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={item.spot.icon}
                    style={{
                      height: Commons.size(60),
                      width: Commons.size(60),
                      borderRadius: Commons.size(30),
                    }}
                  />
                  <View>
                    <Text
                      style={{
                        fontFamily: Fonts.sans_medium,
                        fontSize: Commons.size(18),
                        color: Colors.white,
                        fontWeight: '700',
                      }}>
                      {item.spot.name}
                    </Text>

                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      {item.spot.categories.map((item2, index2) => {
                        return (
                          <Text
                            style={{
                              fontFamily: Fonts.sans_regular,
                              fontSize: Commons.size(12),
                              fontWeight: '400',
                              color: Colors.white_light,
                            }}>
                            #{item2}{' '}
                          </Text>
                        );
                      })}
                    </View>

                    <Text
                      style={{
                        fontFamily: Fonts.sans_regular,
                        fontSize: Commons.size(12),
                        color: Colors.light_grey,
                        fontWeight: '400',
                      }}>
                      {item.spot.location.address}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(12),
                    color: Colors.light_grey,
                    fontWeight: '400',
                  }}>
                  {moment(item.spot.startTime).format('DD/MM/YY - h:mm a')}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: Commons.size(12),
            }}>
            <TouchableOpacity
              onPress={() => processLikePost(item._id, index)}
              style={{
                backgroundColor: item.likes.includes(user._id)
                  ? Colors.active_pin
                  : Colors.feed_like_bg,
                height: Commons.size(32),
                borderRadius: Commons.size(20),
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}>
              <View
                style={{
                  marginHorizontal: Commons.size(12),
                }}>
                <Images.Like />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(14),
                  fontWeight: '400',
                  color: Colors.white,
                  marginRight: Commons.size(12),
                }}>
                {item.likes.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => processReactPost(item._id, index)}
              style={{
                backgroundColor: item.reactions.includes(user._id)
                  ? Colors.active_pin
                  : Colors.feed_like_bg,
                height: Commons.size(32),
                borderRadius: Commons.size(20),
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                marginHorizontal: Commons.size(8),
              }}>
              <View
                style={{
                  marginHorizontal: Commons.size(12),
                }}>
                <Images.Fire />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(14),
                  fontWeight: '400',
                  color: Colors.white,
                  marginRight: Commons.size(12),
                }}>
                {item.reactions.length}
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.sans_regular,
                fontSize: Commons.size(14),
                fontWeight: '400',
                color: Colors.white,
                textAlign: 'right',
              }}>
              {item.comments.length} comments
            </Text>
          </View>
        </Pressable>

        {!props.fromProfile &&
          index === posts.length - 1 &&
          spots.length > 0 && (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Images.Spot fill={Colors.primary} stroke={Colors.primary} />
                <Text
                  style={{
                    marginHorizontal: Commons.size(10),
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(18),
                    color: Colors.white,
                    fontWeight: '400',
                  }}>
                  Spots you will love
                </Text>
              </View>

              <FeedSpotList spots={spots} navigation={props.navigation} />
            </View>
          )}

        {!props.fromProfile &&
          index === posts.length - 1 &&
          events.length > 0 && (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Images.Event fill={Colors.primary} />
                <Text
                  style={{
                    marginHorizontal: Commons.size(10),
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(18),
                    color: Colors.white,
                    fontWeight: '400',
                  }}>
                  Hot Events
                </Text>
              </View>

              <FeedEventList events={events} navigation={props.navigation} />
            </View>
          )}
      </View>
    );
  };

  return (
    <View>
      {((props.data && props.data.length > 0) || posts.length > 0) && (
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{alignItems: 'center'}}
          style={[{paddingTop: Commons.size(15)}, props.style]}
          data={
            props.fromProfile
              ? props.data
                ? props.data
                : posts.filter(f => f.user._id === user._id)
              : posts
          }
          renderItem={Item}
          keyExtractor={item => item._id}
          ListFooterComponent={
            <View style={{height: tabBarHeight + Commons.size(15)}} />
          }
          // ListEmptyComponent={
          //   <Text
          //     style={{
          //       fontFamily: Fonts.sans_medium,
          //       color: Colors.white,
          //       fontSize: Commons.size(16),
          //     }}>
          //     No Post
          //   </Text>
          // }
        />
      )}

      {((props.data && props.data.length === 0) || posts.length === 0) && (
        <View
          style={{
            width: Commons.width(0.9),
            alignSelf: 'center',
            marginTop: Commons.size(10),
          }}>
          {!props.fromProfile && spots.length > 0 && (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Images.Spot fill={Colors.primary} stroke={Colors.primary} />
                <Text
                  style={{
                    marginHorizontal: Commons.size(10),
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(18),
                    color: Colors.white,
                    fontWeight: '400',
                  }}>
                  Spots you will love
                </Text>
              </View>

              <FeedSpotList spots={spots} navigation={props.navigation} />
            </View>
          )}

          {!props.fromProfile && events.length > 0 && (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Images.Event fill={Colors.primary} />
                <Text
                  style={{
                    marginHorizontal: Commons.size(10),
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(18),
                    color: Colors.white,
                    fontWeight: '400',
                  }}>
                  Hot Events
                </Text>
              </View>

              <FeedEventList events={events} navigation={props.navigation} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
