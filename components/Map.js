import {View, Text, TouchableOpacity, Image} from 'react-native';
import React, {useRef, useState} from 'react';
import Geocoder from 'react-native-geocoding';
import {MAPS_API_KEY} from '@env';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  MAP_TYPES,
  Callout,
} from 'react-native-maps';
import MapStyle from '../utils/MapStyle';
import LocationEnabler from 'react-native-location-enabler';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {Colors, Commons, Fonts, Images} from '../utils';
import {useEffect} from 'react';
import {useSelector} from 'react-redux';

export default function Map(props) {
  var map = useRef(null);
  var searchBar = useRef(null);
  const shouldCallDelta = useRef(true);

  const [region, setRegion] = useState({
    latitude: 18.46633,
    longitude: -66.10572,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  });
  const {spots} = useSelector(state => state.spotReducer);
  const {events} = useSelector(state => state.eventReducer);

  var listener = null;
  Geocoder.init(MAPS_API_KEY);
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

  useEffect(() => {
    const {addListener} = LocationEnabler;
    listener = addListener(({locationEnabled}) => {
      if (locationEnabled) {
        fetchLocation();
      }
    });
    callDelta(18.46633, -66.10572);
    // accessLocation();

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

  const callDelta = (lat, long) => {
    Geocoder.from(lat, long)
      .then(json => {
        var addressComponent = json.results[0].formatted_address;

        props.setAddress({
          address: addressComponent,
          lat: lat,
          lng: long,
        });
        shouldCallDelta.current = false;
        map.current.animateCamera({
          center: {
            latitude: lat,
            longitude: long,
          },
        });
      })
      .catch(error => console.warn(error));
  };

  const fetchLocation = () => {
    Commons.fetchLocation()
      .then(res => {
        console.log('yes');
        if (props.setCurrentLocation) {
          props.setCurrentLocation({
            latitude: res.coords.latitude,
            longitude: res.coords.longitude,
          });
        }
        setRegion({
          ...region,
          latitude: res.coords.latitude,
          longitude: res.coords.longitude,
        });
        callDelta(res.coords.latitude, res.coords.longitude);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <View style={{flex: 1}}>
      {props.isSearch && (
        <View
          style={{
            flexDirection: 'row',
            width: Commons.width(0.95),
            alignSelf: 'center',
            marginVertical: Commons.size(5),
            // alignItems: 'center',
            // left: Commons.width(0.025),
            // right: Commons.width(0.05),
            // position: 'absolute',
            // top: Commons.width(0.025),
          }}>
          <GooglePlacesAutocomplete
            placeholder={'Search'}
            ref={searchBar}
            textInputProps={{
              placeholderTextColor: Colors.light_grey,
              style: {
                flex: 1,
                borderColor: Colors.light_grey,
                borderWidth: 1,
                borderRadius: Commons.size(5),
                paddingVertical: Commons.size(7),
                paddingHorizontal: Commons.size(15),
                fontFamily: Fonts.sans_regular,
                color: Colors.white,
                fontSize: Commons.size(14),
              },
            }}
            styles={{
              description: {
                color: Colors.black,
              },
            }}
            onPress={(data, details) => {
              callDelta(
                details.geometry.location.lat,
                details.geometry.location.lng,
              );
            }}
            fetchDetails={true}
            query={{
              key: MAPS_API_KEY,
              language: 'en',
            }}
          />

          <TouchableOpacity
            onPress={accessLocation}
            style={{
              height: Commons.size(45),
              width: Commons.size(45),
              marginLeft: Commons.size(10),
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.primary,
              borderRadius: Commons.size(5),
            }}>
            <Image
              source={Images.location_detect}
              style={{
                height: Commons.size(24),
                width: Commons.size(24),
                tintColor: Colors.white,
              }}
            />
          </TouchableOpacity>
        </View>
      )}

      <MapView
        customMapStyle={MapStyle}
        provider={PROVIDER_GOOGLE}
        style={{
          width: Commons.width(),
          flex: 1,
        }}
        ref={map}
        initialRegion={region}
        zoomEnabled={true}
        pitchEnabled={true}
        showsBuildings={true}
        showsUserLocation={false}
        showScale={true}
        // showsTraffic={true}
        showsIndoors={true}
        tracksViewChanges={false}
        onRegionChange={(region, details) => {
          if (shouldCallDelta.current) {
            setRegion({
              ...region,
              latitude: region.latitude,
              longitude: region.longitude,
            });
          } else {
            shouldCallDelta.current = true;
          }
        }}
        onPress={event => {
          setRegion({
            ...region,
            latitude: event.nativeEvent.coordinate.latitude,
            longitude: event.nativeEvent.coordinate.longitude,
          });
          callDelta(
            event.nativeEvent.coordinate.latitude,
            event.nativeEvent.coordinate.longitude,
          );
        }}>
        {props.isHome &&
          spots.map((item, index) => {
            if (
              (props.selectedTab === 0 || props.selectedTab === 2) &&
              item.location.lat &&
              item.location.lng
            ) {
              return (
                <Marker
                  onPress={() => {
                    props.setCurrentSpot(item);
                  }}
                  key={index}
                  coordinate={{
                    latitude: item.location.lat,
                    longitude: item.location.lng,
                  }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: Colors.white,
                      padding: Commons.size(5),
                      borderRadius: Commons.size(7),
                    }}>
                    <Image
                      source={item.icon}
                      style={{
                        height: Commons.size(14),
                        width: Commons.size(14),
                      }}
                    />
                    <Text
                      style={{
                        marginHorizontal: Commons.size(7),
                        fontFamily: Fonts.sans_regular,
                        fontSize: Commons.size(12),
                        color: Colors.primary,
                      }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                </Marker>
              );
            }
          })}
        {props.isHome &&
          events.map((item, index) => {
            if (
              (props.selectedTab === 0 || props.selectedTab === 3) &&
              item.location.lat &&
              item.location.lng
            ) {
              return (
                <Marker
                  onPress={() => {
                    Commons.navigate(props.navigation, 'event_detail', {
                      event_id: item._id,
                    });
                  }}
                  key={index}
                  coordinate={{
                    latitude: item.location.lat,
                    longitude: item.location.lng,
                  }}>
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      backgroundColor: Colors.white,
                      borderRadius: Commons.size(30),
                      padding: Commons.size(1),
                    }}>
                    <Image
                      source={{uri: item.coverImage}}
                      style={{
                        height: Commons.size(60),
                        width: Commons.size(60),
                        borderRadius: Commons.size(30),
                        resizeMode: 'contain',
                      }}
                    />
                  </TouchableOpacity>
                </Marker>
              );
            }
          })}
        <Marker
          draggable
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}>
          <Images.SpotsMarker />
        </Marker>
      </MapView>
    </View>
  );
}
