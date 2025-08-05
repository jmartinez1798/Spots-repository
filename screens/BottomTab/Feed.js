import React, {useEffect, useState, useMemo, useCallback, useRef} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
  Image,
  FlatList,
  RefreshControl,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  SafeArea,
  FeedList,
  CategoryList,
  TownList,
  FeatureSpotList,
  Progress,
  Loader,
} from '../../components';
import {Colors, Images, Fonts, Commons, Endpoints} from '../../utils';
import ApiService from '../../services/ApiService';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useDispatch, useSelector} from 'react-redux';
import {
  updateMineStories,
  updateStories,
} from '../../store/actions/StoryActions';
import {updateEvents} from '../../store/actions/EventActions';
import {updateSpots} from '../../store/actions/SpotActions';
import {updatePosts} from '../../store/actions/PostActions';
import Modal from 'react-native-modal';
import Video from 'react-native-video';
import {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import {useIsForeground} from '../../hooks/useIsForeground';
import {useIsFocused} from '@react-navigation/core';
import BottomSheet from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import ProgressBar from 'react-native-animated-progress';

export default function Feed(props) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);
  const {stories, mineStories} = useSelector(state => state.storyReducer);
  const {spots} = useSelector(state => state.spotReducer);
  const {posts} = useSelector(state => state.postReducer);
  const isFocused = useIsFocused();
  const isForeground = useIsForeground();
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedTab, setSelectedTab] = useState(0);
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  const [viewStory, setViewStory] = useState(false);
  const [showStoryChooser, setShowStoryChooser] = useState(false);
  const [confirmer, setConfirmer] = useState(false);
  const [loading, setLoading] = useState(false);

  const [locationX, setLocationX] = useState(0);
  const [locationY, setLocationY] = useState(0);
  const [ind, setInd] = useState(-1);
  const [post, setPost] = useState(null);
  const [currentUserStories, setCurrentUserStories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [towns, setTowns] = useState([]);
  let count = 0;
  let interval = 0;
  const storyList = useRef(null);
  const statusSheet = useRef(null);
  const navigation = useNavigation();

  const hideBottomNavigation = () => {
    navigation.setParams({
      bottomNavigationVisible: false,
    });
  };

  const showBottomNavigation = () => {
    navigation.setParams({
      bottomNavigationVisible: true,
    });
  };

  const hideStoryView = () => {
    showNavigationBar();
    setInd(-1);
    setViewStory(false);
    clearInterval(interval);
  };

  const snapPoints = useMemo(() => ['100%'], []);
  const handleSheetChanges = useCallback(index => {
    if (index === -1) {
      hideStoryView();
    }
  }, []);

  const storyChooserSnapPoints = useMemo(() => ['30%'], []);
  const handleStoryChooserChanges = useCallback(index => {
    if (index === -1) setShowStoryChooser(false);
  }, []);

  const viewabilityConfig = {
    waitForInteraction: true,
    viewAreaCoveragePercentThreshold: 80,
  };

  // useEffect(() => {
  //   setTimeout(() => {
  //     refreshPage();
  //   }, 700);
  // }, []);

  useEffect(() => {
    refreshPage();
    if (viewStory) {
      hideNavigationBar();
      hideBottomNavigation();
    } else if (showStoryChooser) {
      hideBottomNavigation();
    }
  }, [isFocused, isForeground]);

  useEffect(() => {
    if (showStoryChooser) {
      hideBottomNavigation();
    } else {
      showBottomNavigation();
    }
  }, [showStoryChooser]);

  useEffect(() => {
    if (viewStory) {
      setInd(0);
    } else {
      showBottomNavigation();
    }
  }, [viewStory]);

  useEffect(() => {
    if (ind > -1) {
      setLoading(true);
      hideNavigationBar();
      hideBottomNavigation();

      interval = setInterval(() => {
        if (ind < currentUserStories.length - 1) {
          setInd(ind + 1);
          storyList.current.scrollToIndex({
            animated: true,
            index: ind + 1,
          });
        } else {
          showBottomNavigation();
          statusSheet.current.close();
        }
      }, 10000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [ind]);

  const getStories = async () => {
    await ApiService.get(Endpoints.stories, user.token)
      .then(res => {
        dispatch(
          updateMineStories(res.data.find(d => d.user._id === user._id)),
        );
        dispatch(updateStories(res.data.filter(d => d.user._id !== user._id)));
        count = count + 1;

        if (count === 5) setRefreshing(false);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getLiveStreams = async () => {
    await ApiService.get(Endpoints.live_streams, user.token)
      .then(res => {
        let streams = [];
        if (res.data.length > 0) {
          streams = [res.data[0]];
          res.data.forEach(element => {
            if (!streams.find(s => s.user._id === element.user._id)) {
              streams.push(element);
            }
          });
          setLiveStreams(streams);
        }
        count = count + 1;

        if (count === 5) setRefreshing(false);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getTowns = async () => {
    await ApiService.get(Endpoints.towns, user.token)
      .then(res => {
        setTowns(res.data);
        count = count + 1;

        if (count === 5) setRefreshing(false);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getNotifications = async () => {
    await ApiService.get(Endpoints.notifications, user.token)
      .then(res => {
        setNotifications(res.data.filter(d => d.reference === user._id));
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getFeed = async () => {
    await ApiService.get(Endpoints.posts_following, user.token)
      .then(res => {
        dispatch(updatePosts(res.data));
        count = count + 1;

        if (count === 5) setRefreshing(false);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getEvents = async () => {
    await ApiService.get(Endpoints.events, user.token)
      .then(res => {
        dispatch(updateEvents(res.data));
        count = count + 1;

        if (count === 5) setRefreshing(false);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getSpots = async () => {
    await ApiService.get(Endpoints.spots, user.token)
      .then(res => {
        dispatch(updateSpots(res.data));
        count = count + 1;

        if (count === 5) setRefreshing(false);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const refreshPage = () => {
    setRefreshing(true);
    getStories();
    getNotifications();
    getTowns();
    // getLiveStreams();
    getFeed();
    getEvents();
    getSpots();
  };

  const setLocations = (x, y, post) => {
    setLocationX(x);
    setLocationY(y);
    setPost(post);
    setShowBottom(true);
  };

  const deletePost = async id => {
    setVisible(true);
    await ApiService.delete(Endpoints.posts, id, user.token)
      .then(res => {
        dispatch(updatePosts(posts.filter(p => p._id !== id)));
        setVisible(false);
      })
      .catch(err => {
        console.log(err);
        setVisible(false);
      });
  };

  const processLikePost = async (id, index) => {
    let action = '';
    let indexx = currentUserStories.indexOf(
      currentUserStories.find(c => c._id === id),
    );
    if (!currentUserStories[indexx].likes.includes(user._id)) {
      currentUserStories[indexx].likes.push(user._id);
      action = 'add';
    } else {
      let ind = currentUserStories[indexx].likes.indexOf(user._id);
      if (ind > -1) {
        currentUserStories[indexx].likes.splice(ind, 1);
      }
      action = 'remove';
    }
    setCurrentUserStories([...currentUserStories]);
    await ApiService.post(Endpoints.stories + 'like/' + id, null, user.token)
      .then(res => {})
      .catch(err => {
        if (action === 'add') {
          let ind = currentUserStories[indexx].likes.indexOf(user._id);
          if (ind > -1) {
            currentUserStories[indexx].likes.splice(ind, 1);
          }
        } else {
          currentUserStories[indexx].likes.push(user._id);
        }
        setCurrentUserStories([...currentUserStories]);
        console.log(err);
      });
  };

  const processReactPost = async (id, index) => {
    let action = '';
    let indexx = currentUserStories.indexOf(
      currentUserStories.find(c => c._id === id),
    );
    if (!currentUserStories[indexx].reactions.includes(user._id)) {
      currentUserStories[indexx].reactions.push(user._id);
      action = 'add';
    } else {
      let indd = currentUserStories[indexx].reactions.indexOf(user._id);
      if (indd > -1) {
        currentUserStories[indexx].reactions.splice(ind, 1);
      }
      action = 'remove';
    }
    setCurrentUserStories([...currentUserStories]);
    await ApiService.post(Endpoints.stories + 'react/' + id, null, user.token)
      .then(res => {})
      .catch(err => {
        if (action === 'add') {
          let indd = currentUserStories[indexx].reactions.indexOf(user._id);
          if (indd > -1) {
            currentUserStories[indexx].reactions.splice(ind, 1);
          }
        } else {
          currentUserStories[indexx].reactions.push(user._id);
        }
        setCurrentUserStories([...currentUserStories]);
        console.log(err);
      });
  };

  const Item = ({item, index}) => {
    return (
      <View style={{height: Commons.height(), width: Commons.width()}}>
        {item.type === 'image' && (
          <Image
            source={{uri: item.mediaLink}}
            style={{
              flex: 1,
              // height: Commons.height(),
              width: Commons.width(),
              resizeMode: 'contain',
            }}
            onLoad={() => setLoading(false)}
          />
        )}
        {item.type !== 'image' && (
          <Video
            source={{uri: item.mediaLink}}
            repeat={true}
            resizeMode={'contain'}
            // ref={player}
            onBuffer={e => {
              console.log('Video is buffering');
            }}
            onError={err => {
              console.log(err);
            }}
            style={{height: Commons.height(), width: Commons.width()}}
            onLoad={() => setLoading(false)}
          />
        )}

        {/* {item.user._id !== user._id && ( */}
        <View
          style={{
            height: Commons.size(110),
            backgroundColor: Colors.background,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingHorizontal: Commons.width(0.05),
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            <TouchableOpacity
              disabled={item.user._id === user._id}
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
              disabled={item.user._id === user._id}
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
          </View>
        </View>
        {/* )} */}
      </View>
    );
  };

  const sortList = (a, b) => {
    let date1 = new Date(a.createdAt).getTime();
    let date2 = new Date(b.createdAt).getTime();
    if (date1 < date2) {
      return 1;
    }
    if (date1 > date2) {
      return -1;
    }
    return 0;
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
                Commons.navigate(props.navigation, 'notifications', {
                  notifications,
                });
              }}
              style={{
                height: Commons.size(38),
                width: Commons.size(38),
                borderRadius: Commons.size(19),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.light_black,
              }}>
              <Images.Bell />
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  height: Commons.size(8),
                  width: Commons.size(8),
                  borderRadius: Commons.size(4),
                  backgroundColor: Colors.primary,
                }}
              />
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                justifyContent: 'center',
              }}>
              <Images.AppLogo
                height={Commons.size(26)}
                width={Commons.size(35)}
              />
              <Text
                style={{
                  fontFamily: Fonts.gilroy_medium,
                  color: Colors.white,
                  fontSize: Commons.size(24),
                  fontWeight: '600',
                  marginLeft: Commons.size(7),
                }}>
                spots
              </Text>
            </View>

            <TouchableOpacity
              style={{
                height: Commons.size(38),
                width: Commons.size(38),
                borderRadius: Commons.size(19),
                alignItems: 'center',
                justifyContent: 'center',
                // backgroundColor: Colors.light_black,
              }}>
              {/* <Images.Search stroke={Colors.white} /> */}
            </TouchableOpacity>
          </View>

          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshPage}
                tintColor={Colors.primary}
              />
            }>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{
                flexGrow: 0,
              }}
              contentContainerStyle={{
                paddingHorizontal: Commons.width(0.05),
                height: Commons.size(90),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setCurrentUserStories(mineStories ? mineStories.stories : []);
                  setShowStoryChooser(true);
                }}
                style={{
                  marginRight: Commons.size(10),
                  width: Commons.size(60),
                  height: Commons.size(70),
                  overflow: 'hidden',
                }}>
                <Image
                  source={{uri: user.avatar}}
                  style={{
                    width: Commons.size(60),
                    height: Commons.size(60),
                    borderRadius: Commons.size(15),
                    borderWidth: 1.5,
                    borderColor: mineStories
                      ? Colors.primary
                      : Colors.light_grey,
                    resizeMode: 'cover',
                  }}
                />
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[Colors.start, Colors.end]}
                  style={{
                    width: Commons.size(20),
                    height: Commons.size(20),
                    justifyContent: 'center',
                    position: 'absolute',
                    bottom: Commons.size(3),
                    alignSelf: 'center',
                    alignItems: 'center',
                    borderRadius: Commons.size(7),
                  }}>
                  <Images.Plus
                    stroke={Colors.white}
                    height={Commons.size(10)}
                    width={Commons.size(10)}
                  />
                </LinearGradient>
              </TouchableOpacity>

              {liveStreams.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={`${index}`}
                    onPress={() => {
                      Commons.navigate(props.navigation, 'audience', {
                        roomId: item.liveRoomId,
                        liveStreamId: item._id,
                      });
                    }}
                    style={{
                      marginRight: Commons.size(10),
                      width: Commons.size(60),
                      height: Commons.size(70),
                      overflow: 'hidden',
                    }}>
                    <Image
                      source={{uri: item.user.avatar}}
                      style={{
                        width: Commons.size(60),
                        height: Commons.size(60),
                        borderRadius: Commons.size(15),
                        borderWidth: 1.5,
                        borderColor: item.isSeen
                          ? Colors.white_light
                          : Colors.primary,
                        resizeMode: 'cover',
                      }}
                    />
                    <LinearGradient
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      colors={[Colors.start, Colors.end]}
                      style={{
                        width: Commons.size(38),
                        height: Commons.size(20),
                        justifyContent: 'center',
                        position: 'absolute',
                        bottom: Commons.size(3),
                        alignSelf: 'center',
                        alignItems: 'center',
                        borderRadius: Commons.size(6),
                      }}>
                      <Text
                        style={{
                          fontFamily: Fonts.sans_medium,
                          fontWeight: '400',
                          color: Colors.white,
                          fontSize: Commons.size(10),
                        }}>
                        LIVE
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}

              {stories.map((item, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      // setCurrentUserStories(item.stories);
                      // setViewStory(true);
                      Commons.navigate(props.navigation, 'story', {
                        stories: item.stories,
                      });
                    }}
                    style={{
                      marginRight:
                        index !== stories.length - 1 ? Commons.size(10) : 0,
                      width: Commons.size(60),
                      height: Commons.size(70),
                      overflow: 'hidden',
                    }}>
                    <Image
                      source={{uri: item.user.avatar}}
                      style={{
                        width: Commons.size(60),
                        height: Commons.size(60),
                        borderRadius: Commons.size(15),
                        borderWidth: 1.5,
                        borderColor: item.isSeen
                          ? Colors.white_light
                          : Colors.primary,
                        resizeMode: 'cover',
                      }}
                    />
                    {item.isLive && (
                      <LinearGradient
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        colors={[Colors.start, Colors.end]}
                        style={{
                          width: Commons.size(38),
                          height: Commons.size(20),
                          justifyContent: 'center',
                          position: 'absolute',
                          bottom: Commons.size(3),
                          alignSelf: 'center',
                          alignItems: 'center',
                          borderRadius: Commons.size(6),
                        }}>
                        <Text
                          style={{
                            fontFamily: Fonts.sans_medium,
                            fontWeight: '400',
                            color: Colors.white,
                            fontSize: Commons.size(10),
                          }}>
                          LIVE
                        </Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.tab_bar,
                borderRadius: Commons.size(8),
                height: Commons.size(35),
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
                      Feed
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
                      Feed
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
                      Discover
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
                      Discover
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {selectedTab === 0 && (
              <FeedList
                setLocations={setLocations}
                navigation={props.navigation}
              />
            )}
            {selectedTab === 1 && (
              <View
                style={{
                  width: Commons.width(0.9),
                  marginTop: Commons.size(10),
                  marginBottom: tabBarHeight + Commons.size(15),
                  alignSelf: 'center',
                }}>
                <CategoryList navigation={props.navigation} />

                <Text
                  style={{
                    marginHorizontal: Commons.size(10),
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(24),
                    color: Colors.white,
                    fontWeight: '700',
                    marginTop: Commons.size(20),
                  }}>
                  Towns
                </Text>
                <TownList data={towns} />

                {spots.length > 0 && (
                  <View>
                    <Text
                      style={{
                        marginHorizontal: Commons.size(10),
                        fontFamily: Fonts.sans_medium,
                        fontSize: Commons.size(24),
                        color: Colors.white,
                        fontWeight: '700',
                        marginTop: Commons.size(20),
                      }}>
                      Featured Spots
                    </Text>
                    <FeatureSpotList
                      horizontal={true}
                      navigation={props.navigation}
                      spots={spots}
                    />
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={() => Commons.navigate(props.navigation, 'create_post')}
            activeOpacity={0.6}
            style={{
              height: Commons.size(50),
              width: Commons.size(50),
              borderRadius: Commons.size(25),
              position: 'absolute',
              right: Commons.size(20),
              bottom: Commons.size(174),
              overflow: 'hidden',
            }}>
            <Images.NewChat
              height={Commons.size(50)}
              width={Commons.size(50)}
            />
          </TouchableOpacity>

          {showBottom && (
            <Pressable
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                position: 'absolute',
                height: Commons.height(),
                width: Commons.width(),
                zIndex: 100,
              }}
              onPress={() => {
                setShowBottom(false);
              }}>
              <View
                style={{
                  borderRadius: Commons.size(5),
                  width: Commons.width(0.3),
                  position: 'absolute',
                  top: parseFloat(locationY),
                  right: Commons.width() - parseFloat(locationX),
                  backgroundColor: Colors.tab_bar,
                  padding: Commons.size(5),
                }}>
                {post.user._id === user._id && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowBottom(false);
                      Commons.navigate(props.navigation, 'create_post', {
                        post: post._id,
                        isEdit: true,
                      });
                    }}>
                    <Text
                      style={{
                        padding: Commons.size(7),
                        fontFamily: Fonts.sans_regular,
                        fontSize: Commons.size(15),
                        color: Colors.primary,
                      }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                )}
                {post.user._id === user._id && (
                  <View
                    style={{backgroundColor: Colors.light_grey, height: 1}}
                  />
                )}
                {post.user._id === user._id && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowBottom(false);
                      setTimeout(() => {
                        setConfirmer(true);
                      }, 500);
                    }}>
                    <Text
                      style={{
                        padding: Commons.size(7),
                        fontFamily: Fonts.sans_regular,
                        fontSize: Commons.size(15),
                        color: Colors.primary,
                      }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Pressable>
          )}

          {viewStory && ind > -1 && (
            <BottomSheet
              ref={statusSheet}
              backgroundStyle={{backgroundColor: Colors.background}}
              enablePanDownToClose
              index={0}
              handleIndicatorStyle={{backgroundColor: Colors.background}}
              snapPoints={snapPoints}
              onChange={handleSheetChanges}>
              <View>
                <FlatList
                  ref={storyList}
                  viewabilityConfig={viewabilityConfig}
                  style={{
                    height: Commons.height(),
                    flexGrow: 1,
                  }}
                  pagingEnabled
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={currentUserStories}
                  renderItem={Item}
                  keyExtractor={item => item._id}
                />

                {/* <Pressable
                  onPress={() => {
                    setInd(ind - 1 >= 0 ? ind - 1 : 0);
                  }}
                  style={{
                    position: 'absolute',
                    width: Commons.width(0.25),
                    top: 0,
                    left: 0,
                    bottom: 0,
                    height: Commons.height(),
                  }}
                />

                <Pressable
                  onPress={() => {
                    setInd(ind < currentUserStories.length - 1 ? ind + 1 : 0);
                  }}
                  style={{
                    position: 'absolute',
                    width: Commons.width(0.25),
                    top: 0,
                    right: 0,
                    bottom: 0,
                    height: Commons.height(),
                  }}
                /> */}

                <View
                  style={{
                    flexDirection: 'row',
                    alignSelf: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    top: StatusBar.currentHeight,
                    height: Commons.size(10),
                  }}>
                  <Progress
                    step={ind + 1}
                    steps={currentUserStories.length}
                    duration={10000}
                  />
                </View>
              </View>
            </BottomSheet>
          )}

          {showStoryChooser && (
            <Pressable
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                position: 'absolute',
                height: Commons.height(),
                width: Commons.width(),
                zIndex: 100,
              }}
              onPress={() => {
                setShowStoryChooser(false);
              }}>
              <BottomSheet
                backgroundStyle={{backgroundColor: Colors.background}}
                enablePanDownToClose
                index={0}
                handleIndicatorStyle={{backgroundColor: Colors.white}}
                snapPoints={storyChooserSnapPoints}
                onChange={handleStoryChooserChanges}>
                <View
                  style={{
                    borderRadius: Commons.size(10),
                    backgroundColor: Colors.background,
                    paddingVertical: Commons.width(0.05),
                    padding: Commons.width(0.05),
                  }}>
                  {mineStories && (
                    <TouchableOpacity
                      onPress={() => {
                        setShowStoryChooser(false);
                        Commons.navigate(props.navigation, 'story', {
                          stories: mineStories.stories,
                        });
                        // setViewStory(true);
                      }}
                      style={{
                        padding: Commons.size(10),
                      }}>
                      <Text
                        style={{
                          fontFamily: Fonts.sans_regular,
                          color: Colors.white,
                          fontSize: Commons.size(16),
                        }}>
                        View Story
                      </Text>
                    </TouchableOpacity>
                  )}
                  {mineStories && (
                    <View
                      style={{height: 1, backgroundColor: Colors.light_grey}}
                    />
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      setShowStoryChooser(false);
                      Commons.navigate(props.navigation, 'camera');
                    }}
                    style={{
                      padding: Commons.size(10),
                    }}>
                    <Text
                      style={{
                        fontFamily: Fonts.sans_regular,
                        color: Colors.white,
                        fontSize: Commons.size(16),
                      }}>
                      New Story
                    </Text>
                  </TouchableOpacity>
                  <View
                    style={{height: 1, backgroundColor: Colors.light_grey}}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setShowStoryChooser(false);
                      Commons.toast('This feature is currently unavailable');
                      // Commons.navigate(props.navigation, 'host');
                    }}
                    style={{
                      padding: Commons.size(10),
                    }}>
                    <Text
                      style={{
                        fontFamily: Fonts.sans_regular,
                        color: Colors.white,
                        fontSize: Commons.size(16),
                      }}>
                      Go Live
                    </Text>
                  </TouchableOpacity>
                </View>
              </BottomSheet>
            </Pressable>
          )}

          <Modal
            isVisible={confirmer}
            onBackButtonPress={() => setConfirmer(false)}
            onBackdropPress={() => setConfirmer(false)}
            backdropColor={Colors.light_black}
            backdropOpacity={0.3}>
            <View
              style={{
                borderRadius: Commons.size(25),
                backgroundColor: Colors.black,
                padding: Commons.size(15),
              }}>
              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  fontWeight: 'bold',
                  fontSize: Commons.size(22),
                  alignSelf: 'center',
                  color: Colors.white,
                }}>
                Delete Post
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(12),
                  alignSelf: 'center',
                  color: Colors.white,
                  marginVertical: Commons.size(10),
                }}>
                Are you sure, you want to delete this post?
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: Commons.size(20),
                }}>
                <TouchableOpacity
                  onPress={() => setConfirmer(false)}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    marginRight: Commons.size(10),
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_regular,
                      fontSize: Commons.size(14),
                      fontWeight: '600',
                      alignSelf: 'center',
                      color: Colors.white,
                      marginVertical: Commons.size(10),
                    }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setConfirmer(false);
                    setTimeout(() => {
                      deletePost(post._id);
                    }, 300);
                  }}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    marginLeft: Commons.size(10),
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_regular,
                      fontSize: Commons.size(14),
                      fontWeight: '600',
                      alignSelf: 'center',
                      color: Colors.primary,
                      marginVertical: Commons.size(10),
                    }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Loader visible={visible} />
        </View>
      }
    />
  );
}
