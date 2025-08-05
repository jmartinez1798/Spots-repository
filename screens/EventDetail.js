import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import {Loader, SafeArea} from '../components';
import {Commons, Images, Fonts, Colors, Endpoints} from '../utils';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import moment from 'moment';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import MapStyle from '../utils/MapStyle';
import {useDispatch, useSelector} from 'react-redux';
import ApiService from '../services/ApiService';
import {updateChats} from '../store/actions/ChatActions';
import {updateEvents} from '../store/actions/EventActions';

export default function EventDetail(props) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);
  const {events} = useSelector(state => state.eventReducer);
  const {chats} = useSelector(state => state.chatReducer);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const event = events.find(e => e._id === props.route.params.event_id);

  useEffect(() => {
    if (loading) {
      joinEvent();
    }
  }, [loading]);

  const joinEvent = async () => {
    await ApiService.post(
      Endpoints.add_to_visitors,
      {
        event_id: event._id,
      },
      user.token,
    )
      .then(res => {
        if (chats.length === 0) {
          getChats(res.data);
        } else {
          let id = chats.find(c => {
            return c.type === 'group' && c.group.event === event._id;
          })._id;
          props.navigation.pop(1);
          props.navigation.navigate('chat', {
            chat_id: id,
          });
          let index = events.indexOf(events.find(e => e._id === event._id));
          events[index] = res.data;
          dispatch(updateEvents(events));
          setLoading(false);
        }
        // props.navigation.goBack();
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  };

  const getChats = async data => {
    await ApiService.get(Endpoints.chats, user.token)
      .then(res => {
        dispatch(updateChats(res.data));
        let id = res.data.find(
          c => c.type === 'group' && c.group.event._id === event._id,
        )._id;
        if (data) {
          setLoading(false);
          let index = events.indexOf(events.find(e => e._id === event._id));
          events[index] = data;
          dispatch(updateEvents(events));
        }
        props.navigation.pop(1);
        props.navigation.navigate('chat', {
          chat_id: id,
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <SafeArea
      statusBarTransculent={true}
      child={
        <View style={{flex: 1}}>
          <ScrollView
            contentContainerStyle={{paddingBottom: Commons.width(0.05)}}
            showsVerticalScrollIndicator={false}>
            <View style={{height: Commons.size(270), width: Commons.width()}}>
              <Image
                source={{uri: event.coverImage}}
                style={{
                  height: Commons.size(270),
                  width: Commons.width(),
                  resizeMode: 'cover',
                }}
              />

              <View
                style={{
                  width: Commons.width(0.9),
                  top: Commons.size(30),
                  position: 'absolute',
                  alignSelf: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <TouchableOpacity onPress={() => props.navigation.goBack()}>
                  <Images.Back
                    stroke={Colors.white}
                    height={Commons.size(24)}
                    width={Commons.size(24)}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: Commons.size(18),
                    fontFamily: Fonts.sans_regular,
                    color: Colors.white,
                    fontWeight: '500',
                  }}>
                  {event.name}
                </Text>
                <Images.Back
                  height={Commons.size(24)}
                  width={Commons.size(24)}
                  stroke={'transparent'}
                />
              </View>
            </View>

            <Text
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginTop: Commons.width(0.05),
                fontSize: Commons.size(14),
                fontFamily: Fonts.sans_regular,
                color: Colors.white,
                fontWeight: '400',
              }}>
              {event.name}
            </Text>

            <View
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginTop: Commons.size(20),
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{flex: 1}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Images.Calendar fill={Colors.white} />
                  <Text
                    style={{
                      fontSize: Commons.size(14),
                      fontFamily: Fonts.sans_regular,
                      color: Colors.white,
                      marginLeft: Commons.size(10),
                      fontWeight: '400',
                    }}>
                    {moment(event.startTime).format('DD/MM/YY - h:mm a')}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: Commons.size(15),
                  }}>
                  <Images.Calendar fill={Colors.white} />
                  <Text
                    style={{
                      fontSize: Commons.size(14),
                      fontFamily: Fonts.sans_regular,
                      color: Colors.white,
                      marginLeft: Commons.size(10),
                      fontWeight: '400',
                    }}>
                    {moment(event.endTime).format('DD/MM/YY - h:mm a')}
                  </Text>
                </View>
              </View>

              {/* <TouchableOpacity
                style={{
                  borderColor: Colors.primary,
                  borderWidth: 1,
                  borderRadius: Commons.size(10),
                  height: Commons.size(35),
                  paddingHorizontal: Commons.size(10),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(16),
                    fontWeight: '400',
                    color: Colors.white,
                  }}>
                  Add to Your Spot List
                </Text>
              </TouchableOpacity> */}
            </View>

            <View
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginVertical: Commons.size(20),
                height: Commons.size(2),
                backgroundColor: Colors.light_grey,
              }}
            />

            <Text
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                fontSize: Commons.size(18),
                fontFamily: Fonts.sans_medium,
                color: Colors.white,
                fontWeight: '500',
              }}>
              Location
            </Text>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(
                  'https://maps.google.com/?q=' + event.location.address,
                );
              }}
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                height: Commons.size(180),
                borderRadius: Commons.size(12),
                marginTop: Commons.size(10),
                overflow: 'hidden',
              }}>
              <MapView
                customMapStyle={MapStyle}
                provider={PROVIDER_GOOGLE}
                style={{
                  height: Commons.size(180),
                  width: Commons.width(0.9),
                }}
                region={{
                  latitude: parseFloat(event.location.lat),
                  longitude: parseFloat(event.location.lng),
                  latitudeDelta: 0.004,
                  longitudeDelta: 0.004,
                }}
                scrollEnabled={false}
                showsTraffic={false}
                showsMyLocationButton={false}
                showsCompass={false}
                showsBuildings={true}
                rotateEnabled={false}
                moveOnMarkerPress={false}
                zoomEnabled={false}
                pitchEnabled={false}
                showsUserLocation={false}
                showScale={false}
                showsIndoors={true}
                tracksViewChanges={false}>
                <Marker
                  coordinate={{
                    latitude: parseFloat(event.location.lat),
                    longitude: parseFloat(event.location.lng),
                  }}>
                  <Images.SpotsMarker />
                </Marker>
              </MapView>
            </TouchableOpacity>

            <View
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: Commons.size(30),
              }}>
              <TouchableOpacity
                onPress={() => setVisible(true)}
                style={{
                  flex: 1,
                  borderColor: Colors.primary,
                  borderWidth: 1,
                  borderRadius: Commons.size(10),
                  height: Commons.size(50),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(16),
                    fontWeight: '400',
                    color: Colors.white,
                  }}>
                  Invite
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (
                    event.user._id === user._id ||
                    event.visitors.find(v => v._id === user._id)
                  ) {
                    if (chats.length === 0) {
                      getChats(null);
                    } else {
                      let id = chats.find(
                        c =>
                          c.type === 'group' && c.group.event._id === event._id,
                      )._id;
                      props.navigation.navigate('chat', {
                        chat_id: id,
                      });
                    }
                  } else {
                    setLoading(true);
                  }
                }}
                style={{
                  borderRadius: Commons.size(10),
                  overflow: 'hidden',
                  marginLeft: Commons.size(10),
                  flex: 1,
                }}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[Colors.start, Colors.end]}
                  style={{
                    height: Commons.size(50),
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_medium,
                      fontSize: Commons.size(18),
                      alignSelf: 'center',
                      marginLeft: Commons.size(7),
                      fontWeight: '400',
                      color: Colors.white,
                    }}>
                    {event.user._id === user._id ||
                    event.visitors.find(v => v._id === user._id)
                      ? 'View'
                      : event.type === 'paid'
                      ? `Join for $${event.price}`
                      : 'Join'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginVertical: Commons.size(20),
                height: Commons.size(2),
                backgroundColor: Colors.light_grey,
              }}
            />

            <Text
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                fontSize: Commons.size(18),
                fontFamily: Fonts.sans_medium,
                color: Colors.white,
                fontWeight: '500',
              }}>
              Admins
            </Text>
            {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {admins.map((item, index) => {
                return ( */}
            <View
              style={{
                marginRight: 0,
                width: Commons.width(0.9),
                alignSelf: 'center',
                // index !== admins.length - 1 ? Commons.size(15) : 0,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: Commons.size(10),
              }}>
              <View
                style={{
                  alignSelf: 'center',
                  height: Commons.size(70),
                  width: Commons.size(70),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: Commons.size(35),
                  backgroundColor: Colors.avatar_bg,
                  overflow: 'hidden',
                }}>
                <Image
                  source={{uri: event.user.avatar}}
                  style={{
                    height: Commons.size(70),
                    width: Commons.size(70),
                    resizeMode: 'cover',
                  }}
                />
              </View>

              <Text
                style={{
                  fontSize: Commons.size(14),
                  fontFamily: Fonts.sans_regular,
                  color: Colors.white,
                  fontWeight: '400',
                }}>
                {event.user.firstName}
              </Text>

              <Text
                style={{
                  fontSize: Commons.size(10),
                  fontFamily: Fonts.sans_regular,
                  color: Colors.white,
                  fontWeight: '400',
                }}>
                Host
              </Text>
            </View>
            {/* );
              })}
            </ScrollView> */}

            <View
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginVertical: Commons.size(20),
                height: Commons.size(2),
                backgroundColor: Colors.light_grey,
              }}
            />

            <Text
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                fontSize: Commons.size(18),
                fontFamily: Fonts.sans_medium,
                color: Colors.white,
                fontWeight: '500',
              }}>
              Going
            </Text>
            {event.visitors.length > 0 && (
              <View
                style={{
                  width: Commons.width(0.9),
                  alignSelf: 'center',
                  alignItems: 'center',
                  marginTop: Commons.size(10),
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  {event.visitors.slice(0, 4).map((item, index) => {
                    if (index < 3) {
                      return (
                        <View
                          style={{
                            height: Commons.size(56),
                            width: Commons.size(56),
                            borderRadius: Commons.size(28),
                            marginLeft: index > 0 ? -1 * Commons.size(28) : 0,
                            borderWidth: 1,
                            borderBottomColor: Colors.background,
                            overflow: 'hidden',
                          }}>
                          <Image
                            source={{uri: item.avatar}}
                            style={{
                              height: Commons.size(56),
                              width: Commons.size(56),
                              resizeMode: 'cover',
                            }}
                          />
                        </View>
                      );
                    }
                    return (
                      <View
                        style={{
                          height: Commons.size(56),
                          width: Commons.size(56),
                          borderRadius: Commons.size(28),
                          marginLeft: -1 * Commons.size(28),
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
                            fontSize: Commons.size(20),
                          }}>
                          +{event.visitors.length - 3}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <Text
                  style={{
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(12),
                    fontWeight: '700',
                    color: Colors.primary,
                  }}>
                  {event.visitors[0].firstName}{' '}
                  <Text
                    style={{
                      fontFamily: Fonts.sans_medium,
                      fontSize: Commons.size(12),
                      fontWeight: '400',
                      color: Colors.white,
                    }}>
                    {event.visitors.length > 2
                      ? `and ${event.visitors.length - 1} people are going`
                      : event.visitors.length > 1
                      ? `and 1 other is going`
                      : 'is going'}
                  </Text>
                </Text>
              </View>
            )}
            {event.visitors.length === 0 && (
              <Text
                style={{
                  width: Commons.width(0.9),
                  alignSelf: 'center',
                  alignSelf: 'center',
                  color: Colors.white,
                  fontFamily: Fonts.sans_medium,
                }}>
                No visitor yet
              </Text>
            )}
          </ScrollView>

          <Modal
            statusBarTranslucent={true}
            isVisible={visible}
            onBackdropPress={() => {
              setVisible(false);
            }}
            onBackButtonPress={() => {
              setVisible(false);
            }}>
            <View
              style={{
                borderRadius: Commons.size(15),
                backgroundColor: Colors.background,
                padding: Commons.width(0.05),
                overflow: 'hidden',
              }}>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={{alignSelf: 'flex-end'}}>
                <Images.Close
                  height={Commons.size(30)}
                  width={Commons.size(30)}
                  stroke={Colors.light_grey}
                />
              </TouchableOpacity>

              <Image
                source={Images.qr}
                style={{
                  height: Commons.width(0.75),
                  width: Commons.width(0.75),
                  marginVertical: Commons.size(20),
                  alignSelf: 'center',
                  borderRadius: Commons.size(5),
                }}
              />

              <TouchableOpacity
                onPress={() => setVisible(false)}
                activeOpacity={0.7}
                style={{
                  borderRadius: Commons.size(10),
                  overflow: 'hidden',
                  marginBottom: Commons.size(35),
                  alignSelf: 'center',
                  backgroundColor: Colors.disabled,
                }}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[Colors.start, Colors.end]}
                  style={{
                    width: Commons.width(0.75),
                    height: Commons.size(50),
                    justifyContent: 'center',
                    paddingHorizontal: Commons.size(20),
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_medium,
                      fontSize: Commons.size(18),
                      alignSelf: 'center',
                      fontWeight: '400',
                      color: Colors.white,
                    }}>
                    Close
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Modal>

          <Loader visible={loading} />
        </View>
      }
    />
  );
}
