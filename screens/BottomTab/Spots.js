import React, {useMemo, useState, useCallback, useEffect, useRef} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Pressable,
  ScrollView,
  FlatList,
} from 'react-native';
import {Progress, SafeArea} from '../../components';
import {Colors, Images, Fonts, Commons, Endpoints} from '../../utils';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {OuterSpotList, SpotDetailSheet} from '../../components';
import LocationEnabler from 'react-native-location-enabler';
import ApiService from '../../services/ApiService';
import {updateSpots} from '../../store/actions/SpotActions';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

export default function Spots(props) {
  const dispatch = useDispatch();
  const tabBarHeight = useBottomTabBarHeight();
  let list = useRef(null);
  let inner = useRef(null);

  const {user} = useSelector(state => state.authReducer);
  const {spots} = useSelector(state => state.spotReducer);
  const [showDetail, setShowDetail] = useState(false);
  const [distance, setDistance] = useState(-1);
  const [currentSpot, setCurrentSpot] = useState(null);
  const [steps, setSteps] = useState([{index: 0, step: -1}]);
  const [ind, setInd] = useState(-1);

  let listener = null;
  let interval = null;
  const {
    PRIORITIES: {HIGH_ACCURACY},
    addListener,
    checkSettings,
    requestResolutionSettings,
  } = LocationEnabler;
  const config = {
    priority: HIGH_ACCURACY,
    alwaysShow: true,
    needBle: false,
  };

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

  useEffect(() => {
    const {addListener} = LocationEnabler;
    listener = addListener(({locationEnabled}) => {
      if (locationEnabled) {
        fetchLocation();
      }
    });

    return () => {
      listener.remove();
    };
  }, []);

  useEffect(() => {
    if (ind > -1) {
      interval = setInterval(() => {
        inner.current.scrollToIndex({
          animated: true,
          index: ind + 1,
        });
      }, 3000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [ind]);

  useEffect(() => {
    if (currentSpot) {
      setShowDetail(true);
    } else setShowDetail(false);
  }, [currentSpot]);

  useEffect(() => {
    if (showDetail) {
      hideBottomNavigation();

      accessLocation();
    } else showBottomNavigation();
  }, [showDetail]);

  const accessLocation = () => {
    try {
      const {checkSettings, requestResolutionSettings} = LocationEnabler;
      if (checkSettings(config)) {
        fetchLocation();
      } else {
        requestResolutionSettings(config);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const fetchLocation = () => {
    Commons.fetchLocation()
      .then(res => {
        setDistance(
          Commons.distance(
            res.coords.latitude,
            res.coords.longitude,
            currentSpot.location.lat,
            currentSpot.location.lng,
          ),
        );
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
    if (!spots[index].likes) {
      spots[index].likes = [];
      spots[index].likes.push(user._id);
      action = 'add';
    } else {
      if (spots[index].likes.includes(user._id)) {
        spots[index].likes.push(user._id);
        action = 'add';
      } else {
        let ind = spots[index].likes.indexOf(user._id);
        if (ind > -1) {
          spots[index].likes.splice(ind, 1);
        }
        action = 'remove';
      }
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
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: Commons.size(55),
              backgroundColor: Colors.tab_bar,
              paddingHorizontal: Commons.width(0.05),
            }}>
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
          </View>

          <OuterSpotList data={spots} setCurrentSpot={setCurrentSpot} />

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
        </View>
      }
    />
  );
}
