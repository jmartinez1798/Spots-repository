import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import {
  FollowerList,
  Loader,
  Map,
  SafeArea,
  SpotDetailSheet,
} from '../../components';
import {Colors, Images, Fonts, Commons, Endpoints} from '../../utils';
import Geocoder from 'react-native-geocoding';
import {MAPS_API_KEY} from '@env';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  MAP_TYPES,
  Callout,
} from 'react-native-maps';
import MapStyle from '../../utils/MapStyle';
import LocationEnabler from 'react-native-location-enabler';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {ScrollView} from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import changeNavigationBarColor, {
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import {
  updateMineStories,
  updateStories,
} from '../../store/actions/StoryActions';
import {useNavigation} from '@react-navigation/native';
import {updateEvents} from '../../store/actions/EventActions';
import {updateSpots} from '../../store/actions/SpotActions';
import {updatePosts} from '../../store/actions/PostActions';
import {useDispatch, useSelector} from 'react-redux';
import ApiService from '../../services/ApiService';
// import {spawnThread} from 'react-native-multithreading';

export default function Home(props) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);

  const tabBarHeight = useBottomTabBarHeight();
  var map = useRef(null);

  const [showDetail, setShowDetail] = useState(false);
  const [currentSpot, setCurrentSpot] = useState(null);
  const [distance, setDistance] = useState(-1);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [allData, setAllData] = useState([]);
  const [friends, setFriends] = useState([]);
  const [data, setData] = useState([]);

  const [searching, setSearching] = useState('');

  const [selectedTab, setSelectedTab] = useState(0);
  const [isSearch, setSearch] = useState(false);
  const [address, setAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 18.46633,
    longitude: -66.10572,
  });
  const [isKeyboardOpen, setKeyboardOpen] = useState(false);

  const navigation = useNavigation();

  const changeNavColor = async () => {
    await changeNavigationBarColor(Colors.background, true);
  };

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

  useEffect(() => {
    changeNavColor();
    showNavigationBar();
    getFriends();
    getStories();
    getFeed();
    getEvents();
    getSpots();

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardOpen(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardOpen(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (currentSpot) {
      setShowDetail(true);
    } else setShowDetail(false);
  }, [currentSpot]);

  useEffect(() => {
    if (showDetail) {
      hideBottomNavigation();

      setDistance(
        Commons.distance(
          currentLocation.latitude,
          currentLocation.longitude,
          currentSpot.location.lat,
          currentSpot.location.lng,
        ),
      );
    } else showBottomNavigation();
  }, [showDetail]);

  useEffect(() => {
    if (loading) getUsers();
  }, [loading]);

  const getUsers = async () => {
    await ApiService.get(`${Endpoints.user}?search=${searching}`, user.token)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  const getFriends = async () => {
    await ApiService.get(Endpoints.followers + 'my', user.token)
      .then(res => {
        setFriends(res.data);
        setVisible(false);
      })
      .catch(err => {
        setVisible(false);
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

  const getStories = async () => {
    await ApiService.get(Endpoints.stories, user.token)
      .then(res => {
        dispatch(
          updateMineStories(res.data.filter(d => d.user._id === user._id)),
        );
        dispatch(updateStories(res.data.filter(d => d.user._id !== user._id)));
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getFeed = async () => {
    await ApiService.get(Endpoints.posts_following, user.token)
      .then(res => {
        dispatch(updatePosts(res.data));
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getEvents = async () => {
    await ApiService.get(Endpoints.events, user.token)
      .then(res => {
        dispatch(updateEvents(res.data));
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getSpots = async () => {
    await ApiService.get(Endpoints.spots, user.token)
      .then(res => {
        dispatch(updateSpots(res.data));
      })
      .catch(err => {
        console.log(err);
      });
  };

  const createGroup = async spot => {
    let body = {
      users: spot.visitors,
      name: spot.name,
      image: spot.coverImage,
    };
    await ApiService.post(Endpoints.groups, body, user.token)
      .then(async res => {
        await ApiService.patch(
          Endpoints.spots,
          {
            group: res.data._id,
          },
          user.token,
          spot._id,
        )
          .then(res2 => {
            let index = spots.indexOf(spot);
            spots[index] = res2.data;
            dispatch(updateSpots(spots));
            setCurrentSpot(null);
            Commons.navigate(props.navigation, 'chat', {
              chat: res.data._id,
            });
          })
          .catch(err2 => {
            console.log(err2);
          });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const processLikePost = async () => {
    let action = '';
    let index = spots.indexOf(currentSpot);
    if (!spots[index].likes.includes(user._id)) {
      spots[index].likes.push(user._id);
      action = 'add';
    } else {
      let ind = spots[index].likes.indexOf(user._id);
      if (ind > -1) {
        spots[index].likes.splice(ind, 1);
      }
      action = 'remove';
    }
    dispatch(updateSpots(spots));
    await ApiService.post(
      Endpoints.like_spot + currentSpot._id,
      null,
      user.token,
    )
      .then(res => {})
      .catch(err => {
        if (action === 'add') {
          let ind = spots[index].likes.indexOf(user._id);
          if (ind > -1) {
            spots[index].likes.splice(ind, 1);
          }
        } else {
          spots[index].likes.push(user._id);
        }
        dispatch(updateSpots(spots));
        console.log(err);
      });
  };

  return (
    <SafeArea
      statusBarTransculent={false}
      statusBarColor={Colors.tab_bar}
      child={
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: isKeyboardOpen ? 0 : tabBarHeight,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: Commons.size(60),
              backgroundColor: Colors.tab_bar,
              paddingHorizontal: Commons.width(0.05),
            }}>
            {!isSearch && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    height: Commons.size(38),
                    width: Commons.size(38),
                    backgroundColor: 'transparent',
                  }}
                />

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
                  onPress={() => setSearch(true)}
                  style={{
                    height: Commons.size(38),
                    width: Commons.size(38),
                    borderRadius: Commons.size(19),
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Colors.light_black,
                  }}>
                  <Images.Search stroke={Colors.white} />
                </TouchableOpacity>
              </View>
            )}
            {isSearch && (
              <View
                style={{
                  height: Commons.size(44),
                  width: Commons.width(0.9),
                  backgroundColor: Colors.home_search,
                  borderRadius: Commons.size(7),
                  alignSelf: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  paddingHorizontal: Commons.size(7),
                }}>
                <Images.Search
                  stroke={Colors.white}
                  height={Commons.size(20)}
                  width={Commons.size(20)}
                />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: Commons.size(15),
                    marginHorizontal: Commons.size(5),
                    color: Colors.white,
                    fontFamily: Fonts.sans_regular,
                    fontWeight: '400',
                  }}
                  value={searching}
                  onChangeText={setSearching}
                  onSubmitEditing={() => {
                    if (searching.trim().length > 0) {
                      setLoading(true);
                    }
                  }}
                  autoFocus={true}
                  blurOnSubmit={true}
                  returnKeyType={'search'}
                  placeholder={'Search'}
                  placeholderTextColor={Colors.white_light}
                />
                <TouchableOpacity
                  onPress={() => {
                    setSearching('');
                    setSearch(false);
                    setData([]);
                  }}
                  style={{
                    height: Commons.size(30),
                    width: Commons.size(30),
                    borderRadius: Commons.size(15),
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Colors.light_black,
                  }}>
                  <Images.Close
                    height={Commons.size(20)}
                    width={Commons.size(20)}
                    stroke={Colors.white}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View
            style={{
              backgroundColor: Colors.tab_bar,
              height: Commons.size(60),
              width: Commons.width(),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {!isSearch && (
              <View
                style={{
                  width: Commons.width(0.9),
                  alignSelf: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.home_search,
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
                        All
                      </Text>
                    </LinearGradient>
                  )}
                  {selectedTab !== 0 && (
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
                        All
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {selectedTab !== 0 && selectedTab !== 1 && (
                  <View
                    style={{
                      height: Commons.size(20),
                      backgroundColor: Colors.white_light,
                      width: Commons.size(1.5),
                    }}
                  />
                )}

                <TouchableOpacity
                  onPress={() => setSelectedTab(1)}
                  activeOpacity={0.7}
                  style={{
                    flex: 0.5,
                    overflow: 'hidden',
                    borderRadius: Commons.size(8),
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
                        Friends
                      </Text>
                    </LinearGradient>
                  )}
                  {selectedTab !== 1 && (
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
                        Friends
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {selectedTab !== 1 && selectedTab !== 2 && (
                  <View
                    style={{
                      height: Commons.size(20),
                      backgroundColor: Colors.white_light,
                      width: Commons.size(1.5),
                    }}
                  />
                )}

                <TouchableOpacity
                  onPress={() => setSelectedTab(2)}
                  activeOpacity={0.7}
                  style={{
                    flex: 0.5,
                    overflow: 'hidden',
                    borderRadius: Commons.size(8),
                  }}
                  disabled={selectedTab === 2}>
                  {selectedTab === 2 && (
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
                  {selectedTab !== 2 && (
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

                {selectedTab !== 2 && selectedTab !== 3 && (
                  <View
                    style={{
                      height: Commons.size(20),
                      backgroundColor: Colors.white_light,
                      width: Commons.size(1.5),
                    }}
                  />
                )}

                <TouchableOpacity
                  onPress={() => setSelectedTab(3)}
                  activeOpacity={0.7}
                  style={{
                    flex: 0.5,
                    overflow: 'hidden',
                    borderRadius: Commons.size(8),
                  }}
                  disabled={selectedTab === 3}>
                  {selectedTab === 3 && (
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
                        Events
                      </Text>
                    </LinearGradient>
                  )}
                  {selectedTab !== 3 && (
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
                        Events
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
            {isSearch && (
              <ScrollView
                horizontal={true}
                contentContainerStyle={{
                  alignSelf: 'center',
                  paddingHorizontal: Commons.width(0.05),
                }}>
                <Text
                  style={{
                    height: Commons.size(35),
                    backgroundColor: Colors.home_search,
                    color: Colors.white,
                    textAlign: 'center',
                    marginRight: Commons.size(10),
                    textAlignVertical: 'center',
                    paddingHorizontal: Commons.size(10),
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(13),
                    fontWeight: '400',
                    borderRadius: Commons.size(8),
                  }}>
                  #Spots
                </Text>

                <Text
                  style={{
                    height: Commons.size(35),
                    backgroundColor: Colors.home_search,
                    color: Colors.white,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    paddingHorizontal: Commons.size(10),
                    marginRight: Commons.size(10),
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(13),
                    fontWeight: '400',
                    borderRadius: Commons.size(8),
                  }}>
                  #Party
                </Text>

                <Text
                  style={{
                    height: Commons.size(35),
                    backgroundColor: Colors.home_search,
                    color: Colors.white,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    paddingHorizontal: Commons.size(10),
                    marginRight: Commons.size(10),
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(13),
                    fontWeight: '400',
                    borderRadius: Commons.size(8),
                  }}>
                  #NightParty
                </Text>

                <Text
                  style={{
                    height: Commons.size(35),
                    backgroundColor: Colors.home_search,
                    color: Colors.white,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    paddingHorizontal: Commons.size(10),
                    marginRight: Commons.size(10),
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(13),
                    fontWeight: '400',
                    borderRadius: Commons.size(8),
                  }}>
                  #Dinner
                </Text>

                <Text
                  style={{
                    height: Commons.size(35),
                    backgroundColor: Colors.home_search,
                    color: Colors.white,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    paddingHorizontal: Commons.size(10),
                    marginRight: Commons.size(10),
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(13),
                    fontWeight: '400',
                    borderRadius: Commons.size(8),
                  }}>
                  #Lunch
                </Text>

                <Text
                  style={{
                    height: Commons.size(35),
                    backgroundColor: Colors.home_search,
                    color: Colors.white,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    paddingHorizontal: Commons.size(10),
                    marginRight: Commons.size(10),
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(13),
                    fontWeight: '400',
                    borderRadius: Commons.size(8),
                  }}>
                  #Concert
                </Text>
              </ScrollView>
            )}
          </View>

          <View style={{flex: 1}}>
            {!isSearch && (
              <Map
                setAddress={location => {
                  setAddress(location.address);
                }}
                isHome={true}
                isSearch={true}
                setCurrentLocation={setCurrentLocation}
                selectedTab={selectedTab}
                navigation={props.navigation}
                setCurrentSpot={setCurrentSpot}
              />
            )}
            {isSearch && (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {!loading && (
                  <FollowerList
                    navigation={props.navigation}
                    data={data.filter(d => d._id !== user._id)}
                    friends={friends}
                    addFriend={addFriend}
                    removeFriend={removeFriend}
                  />
                )}
                {loading && (
                  <ActivityIndicator
                    animating
                    size={'large'}
                    color={Colors.primary}
                  />
                )}
              </View>
            )}
          </View>

          {currentSpot && showDetail && (
            <SpotDetailSheet
              spot={currentSpot}
              setCurrentSpot={setCurrentSpot}
              distance={Math.round((distance + Number.EPSILON) * 100) / 100}
              createGroup={createGroup}
              processLikePost={processLikePost}
              me={user}
              navigation={props.navigation}
            />
          )}

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

          <Loader visible={visible} />
        </View>
      }
    />
  );
}
