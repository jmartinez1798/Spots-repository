import React, {useEffect, useState} from 'react';
import {Text, View, TouchableOpacity, Image, Linking} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {SafeArea, FeatureSpotList, CategoryList} from '../components';
import {Commons, Images, Fonts, Colors} from '../utils';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import MapStyle from '../utils/MapStyle';
import LocationEnabler from 'react-native-location-enabler';

export default function SpotDetails(props) {
  const [distance, setDistance] = useState(-1);
  const spot = props.route.params.spot;
  let listener;
  const {
    PRIORITIES: {HIGH_ACCURACY},
  } = LocationEnabler;
  const config = {
    priority: HIGH_ACCURACY,
    alwaysShow: true,
    needBle: false,
  };

  useEffect(() => {
    const {addListener} = LocationEnabler;
    listener = addListener(({locationEnabled}) => {
      if (locationEnabled) {
        fetchLocation();
      }
    });
    accessLocation();

    return () => {
      listener.remove();
    };
  }, []);

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

  return (
    <SafeArea
      statusBarTransculent={false}
      statusBarColor={Colors.tab_bar}
      child={
        <View style={{flex: 1, backgroundColor: Colors.background}}>
          <View
            style={{
              padding: Commons.size(15),
              backgroundColor: Colors.tab_bar,
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
              Spot Details
            </Text>
            <TouchableOpacity>
              <Images.Back
                stroke={'transparent'}
                height={Commons.size(24)}
                width={Commons.size(24)}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: Commons.size(15)}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
                width: Commons.width(0.9),
                marginTop: Commons.size(20),
              }}>
              <Image
                source={spot.icon}
                style={{
                  height: Commons.size(60),
                  width: Commons.size(60),
                  borderRadius: Commons.size(30),
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
                  {spot.name}
                </Text>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {spot.categories.map((item, index) => {
                    return (
                      <Text
                        style={{
                          fontFamily: Fonts.sans_regular,
                          fontSize: Commons.size(12),
                          fontWeight: '400',
                          color: Colors.white_light,
                        }}>
                        #{item}{' '}
                      </Text>
                    );
                  })}
                </View>

                {distance !== -1 && (
                  <Text
                    style={{
                      fontFamily: Fonts.sans_regular,
                      fontSize: Commons.size(12),
                      fontWeight: '400',
                      color: Colors.white_light,
                    }}>
                    {Math.round((distance + Number.EPSILON) * 100) / 100} miles
                    away
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => Commons.navigate(props.navigation, 'event')}
                style={{
                  borderRadius: Commons.size(10),
                  overflow: 'hidden',
                  marginHorizontal: Commons.size(10),
                }}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[Colors.start, Colors.end]}
                  style={{
                    height: Commons.size(40),
                    justifyContent: 'center',
                    paddingHorizontal: Commons.size(10),
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_medium,
                      fontSize: Commons.size(18),
                      alignSelf: 'center',
                      fontWeight: '400',
                      color: Colors.white,
                    }}>
                    Follow
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Linking.openURL(
                    'https://maps.google.com/?q=' + spot.location.address,
                  );
                }}>
                <Images.SendTilt />
              </TouchableOpacity>
            </View>

            <View
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                backgroundColor: Colors.tab_bar,
                padding: Commons.size(10),
                marginTop: Commons.size(18),
                borderRadius: Commons.size(8),
              }}>
              <Text
                numberOfLines={5}
                style={{
                  color: Colors.white,
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(14),
                  fontWeight: '400',
                }}>
                Simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever
                since the 1500s, when an unknown printer took a galley of type
                and scrambled it to make a type specimen book
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: Commons.size(20),
                }}>
                <View
                  style={{
                    height: Commons.size(30),
                    width: Commons.size(30),
                    borderRadius: Commons.size(15),
                    overflow: 'hidden',
                  }}>
                  <Image
                    source={Images.test_dp}
                    style={{
                      height: Commons.size(30),
                      width: Commons.size(30),
                      resizeMode: 'cover',
                    }}
                  />
                </View>

                <View
                  style={{
                    height: Commons.size(30),
                    width: Commons.size(30),
                    marginLeft: -1 * Commons.size(15),
                    borderRadius: Commons.size(15),
                    overflow: 'hidden',
                  }}>
                  <Image
                    source={Images.test_dp}
                    style={{
                      height: Commons.size(30),
                      width: Commons.size(30),
                      resizeMode: 'cover',
                    }}
                  />
                </View>

                <View
                  style={{
                    height: Commons.size(30),
                    width: Commons.size(30),
                    marginLeft: -1 * Commons.size(15),
                    borderRadius: Commons.size(15),
                    overflow: 'hidden',
                  }}>
                  <Image
                    source={Images.test_dp}
                    style={{
                      height: Commons.size(30),
                      width: Commons.size(30),
                      resizeMode: 'cover',
                    }}
                  />
                </View>

                <View
                  style={{
                    height: Commons.size(30),
                    width: Commons.size(30),
                    borderRadius: Commons.size(15),
                    marginLeft: -1 * Commons.size(15),
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
                    +4
                  </Text>
                </View>

                <Text
                  style={{
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(12),
                    fontWeight: '700',
                    marginLeft: Commons.size(15),
                    color: Colors.primary,
                  }}>
                  Robert Jr.{' '}
                  <Text
                    style={{
                      fontFamily: Fonts.sans_medium,
                      fontSize: Commons.size(12),
                      fontWeight: '400',
                      color: Colors.white,
                    }}>
                    and 32 people are going
                  </Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (props.horizontal)
                  Commons.navigate(props.navigation, 'my_spots');
              }}
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                borderColor: Colors.primary,
                borderWidth: 1,
                borderRadius: Commons.size(10),
                height: Commons.size(35),
                marginTop: Commons.size(20),
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
                {!props.horizontal
                  ? 'Add to Your Spot List'
                  : 'Remove from Your Spot List'}
              </Text>
            </TouchableOpacity>

            <View
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginTop: Commons.size(20),
              }}>
              <Text
                style={{
                  fontSize: Commons.size(18),
                  fontFamily: Fonts.sans_medium,
                  color: Colors.white,
                  fontWeight: '500',
                }}>
                Location
              </Text>
              <View
                style={{
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
                    latitude: parseFloat(spot.location.lat),
                    longitude: parseFloat(spot.location.lng),
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
                      latitude: parseFloat(spot.location.lat),
                      longitude: parseFloat(spot.location.lng),
                    }}>
                    <Images.SpotsMarker />
                  </Marker>
                </MapView>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  marginTop: Commons.size(20),
                }}>
                {spot.images.map((item, index) => {
                  return (
                    <Image
                      style={{
                        height: Commons.size(165),
                        width: Commons.size(135),
                        resizeMode: 'cover',
                        marginRight:
                          index !== spot.images.length - 1
                            ? Commons.size(10)
                            : 0,
                        borderRadius: Commons.size(10),
                      }}
                      source={{uri: item}}
                    />
                  );
                })}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      }
    />
  );
}
