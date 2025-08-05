import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import DatePicker from 'react-native-date-picker';
import {SafeArea, FollowerList, Loader, MapModal} from '../components';
import {Colors, Images, Fonts, Commons, Endpoints} from '../utils';
import ApiService from '../services/ApiService';
import moment from 'moment/moment';
import Geocoder from 'react-native-geocoding';
import {MAPS_API_KEY} from '@env';
import LocationEnabler from 'react-native-location-enabler';
import {useSelector} from 'react-redux';
import storage from '@react-native-firebase/storage';
import CheckBox from '@react-native-community/checkbox';

export default function CreateEvent(props) {
  const {user} = useSelector(state => state.authReducer);
  const [isEnabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSelected, setSelected] = useState(false);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [avatar, setAvatar] = useState({uri: ''});
  const [date, setDate] = useState('');
  const [price, setPrice] = useState('');
  const [dateObj, setDateObj] = useState(new Date(Date.now()));
  const [fromDate, setFromDate] = useState(new Date(Date.now()));
  const [toDate, setToDate] = useState(new Date(Date.now()));
  const [showPicker, setShowPicker] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [visible, setVisible] = useState(false);

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
    if (loading) {
      uploadImage();
    }
  }, [loading]);

  useEffect(() => {
    if (
      avatar.uri !== '' &&
      title.trim().length > 3 &&
      location &&
      // date.trim().length > 3 &&
      from.trim().length > 3 &&
      to.trim().length > 3
    )
      setEnabled(true);
    else setEnabled(false);
  }, [avatar, title, location, from, to]);

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
        setLocation({
          address: json.results[0].formatted_address,
          lat: lat,
          lng: long,
        });
      })
      .catch(error => console.warn(error));
  };

  const fetchLocation = () => {
    Commons.fetchLocation()
      .then(res => {
        callDelta(res.coords.latitude, res.coords.longitude);
      })
      .catch(err => {
        console.log(err);
        callDelta(33.3152, 44.3661);
      });
  };

  const pickImages = async () => {
    await launchImageLibrary({
      mediaType: 'photo',
    })
      .then(async res => {
        await Commons.cropFile(res.assets[0].uri)
          .then(result => {
            let obj = {
              filename:
                result.modificationDate +
                result.path.substring(result.path.lastIndexOf('.')),
              uri: result.path,
              path: result.path,
            };
            setAvatar(obj);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const uploadImage = async () => {
    let {path, filename} = avatar;
    let uploadUri = Platform.OS === 'ios' ? path.replace('file://', '') : path;
    await Commons.uploadToFirebase(uploadUri, filename)
      .then(async snapshot => {
        if (snapshot.state === 'success') {
          const url = await storage().ref(filename).getDownloadURL();
          createEvent(url);
        }
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  };

  const createEvent = async url => {
    await ApiService.post(
      Endpoints.events,
      {
        name: title.trim(),
        startTime: fromDate.toISOString(),
        endTime: toDate.toISOString(),
        coverImage: url,
        location: {
          name: title.trim(),
          lat: location.lat,
          lng: location.lng,
          address: location.address.trim(),
        },
        type: isSelected ? 'paid' : 'free',
        price: price.trim().length > 0 ? parseInt(price.trim()) : 0,
      },
      user.token,
    )
      .then(res => {
        setLoading(false);
        res.data.locationAddress = location.address.trim();
        props.route.params.setPostType(res.data, null);
        props.navigation.goBack();
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <SafeArea
      statusBarTransculent={false}
      statusBarColor={Colors.background}
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
              <Images.Close stroke={Colors.white} />
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
              Create Event
            </Text>
            <TouchableOpacity
              onPress={() => setLoading(true)}
              disabled={!isEnabled}>
              {isEnabled && (
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[Colors.start, Colors.end]}
                  style={{
                    width: Commons.size(45),
                    height: Commons.size(25),
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: Commons.size(6),
                    backgroundColor: Colors.avatar_bg,
                  }}>
                  <Text
                    style={{
                      fontSize: Commons.size(14),
                      fontFamily: Fonts.sans_regular,
                      fontWeight: '400',
                      color: Colors.white,
                    }}>
                    Post
                  </Text>
                </LinearGradient>
              )}
              {!isEnabled && (
                <View
                  style={{
                    width: Commons.size(45),
                    height: Commons.size(25),
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: Commons.size(6),
                    backgroundColor: Colors.avatar_bg,
                  }}>
                  <Text
                    style={{
                      fontSize: Commons.size(14),
                      fontFamily: Fonts.sans_regular,
                      fontWeight: '400',
                      color: Colors.white_light,
                    }}>
                    Post
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              if (avatar.uri === '') {
                pickImages();
              }
            }}
            style={{
              width: Commons.width(0.9),
              height: Commons.size(110),
              borderRadius: Commons.size(10),
              marginTop: Commons.size(15),
              alignSelf: 'center',
              backgroundColor: Colors.avatar_bg,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {avatar.uri !== '' && (
              <Image
                source={{uri: avatar.uri}}
                style={{
                  width: Commons.width(0.9),
                  height: Commons.size(110),
                  resizeMode: 'cover',
                }}
              />
            )}
            {avatar.uri === '' && <Images.Focus />}
          </TouchableOpacity>

          <Text
            style={{
              width: Commons.width(0.9),
              alignSelf: 'center',
              marginTop: Commons.size(20),
              fontFamily: Fonts.sans_medium,
              fontSize: Commons.size(16),
              color: Colors.white,
              marginBottom: Commons.size(5),
            }}>
            Event Title
          </Text>
          <TextInput
            style={{
              width: Commons.width(0.9),
              alignSelf: 'center',
              marginTop: Commons.size(5),
              borderRadius: Commons.size(10),
              borderWidth: 1,
              borderColor:
                title.trim().length > 3 ? Colors.primary : Colors.white_light,
              fontSize: Commons.size(16),
              paddingHorizontal: Commons.size(10),
              color: Colors.white,
              fontFamily: Fonts.sans_regular,
            }}
            value={title}
            onChangeText={setTitle}
            returnKeyType={'done'}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: Commons.width(0.9),
              alignSelf: 'center',
              marginTop: Commons.size(20),
            }}>
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(16),
                color: Colors.white,
                marginBottom: Commons.size(5),
              }}>
              Location
            </Text>

            <TouchableOpacity
              style={{
                marginBottom: Commons.size(5),
              }}
              onPress={() =>
                Commons.navigate(props.navigation, 'map', {
                  setAddress: location => {
                    setLocation(location);
                  },
                })
              }>
              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  fontSize: Commons.size(16),
                  color: Colors.primary,
                }}>
                Choose on Map
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={accessLocation}
            style={{
              width: Commons.width(0.9),
              alignSelf: 'center',
              marginTop: Commons.size(5),
              borderRadius: Commons.size(10),
              borderWidth: 1,
              borderColor:
                location && location.address.trim().length > 3
                  ? Colors.primary
                  : Colors.white_light,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: Commons.size(10),
            }}>
            <TextInput
              style={{
                flex: 1,
                fontSize: Commons.size(16),
                color: Colors.white,
                fontFamily: Fonts.sans_regular,
              }}
              value={location ? location.address : ''}
              editable={false}
              placeholder={'Tap to detect current location'}
              placeholderTextColor={Colors.white_light}
              returnKeyType={'done'}
            />
            <Images.Location fill={Colors.white} />
          </TouchableOpacity>

          {/* <Text
            style={{
              width: Commons.width(0.9),
              alignSelf: 'center',
              marginTop: Commons.size(20),
              fontFamily: Fonts.sans_medium,
              fontSize: Commons.size(16),
              color: Colors.white,
              marginBottom: Commons.size(5),
            }}>
            Date
          </Text>
          <TouchableOpacity
            onPress={() => {
              setShowPicker(true);
            }}
            style={{
              flexDirection: 'row',
              width: Commons.width(0.9),
              alignSelf: 'center',
              marginTop: Commons.size(5),
              borderRadius: Commons.size(10),
              borderWidth: 1,
              borderColor: date !== '' ? Colors.primary : Colors.white_light,
              paddingHorizontal: Commons.size(10),
            }}>
            <TextInput
              style={{
                flex: 1,
                fontSize: Commons.size(16),
                color: Colors.white,
                fontFamily: Fonts.sans_regular,
              }}
              onFocus={() => {
                setShowPicker(true);
              }}
              editable={false}
              value={date}
              onChangeText={text => handleChange()}
              maxLength={15}
              returnKeyType={'done'}
            />
            <TouchableOpacity
              style={{justifyContent: 'center'}}
              onPress={() => {
                setShowPicker(true);
              }}>
              <Images.Calendar
                fill={date !== '' ? Colors.primary : Colors.white_light}
                height={Commons.size(25)}
                width={Commons.size(25)}
              />
            </TouchableOpacity>
          </TouchableOpacity> */}

          <Text
            style={{
              alignSelf: 'center',
              marginTop: Commons.size(20),
              fontFamily: Fonts.sans_medium,
              fontSize: Commons.size(16),
              color: Colors.white,
              marginBottom: Commons.size(5),
            }}>
            Date & Time
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: Commons.width(0.9),
              alignSelf: 'center',
            }}>
            <View>
              <Text
                style={{
                  width: Commons.width(0.4),
                  alignSelf: 'flex-start',
                  marginTop: Commons.size(10),
                  fontFamily: Fonts.sans_medium,
                  fontSize: Commons.size(16),
                  color: Colors.white,
                  marginBottom: Commons.size(5),
                }}>
                From
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowFromPicker(true);
                }}
                style={{
                  width: Commons.width(0.4),
                  alignSelf: 'center',
                  marginTop: Commons.size(5),
                  borderRadius: Commons.size(10),
                  borderWidth: 1,
                  borderColor:
                    from.trim().length > 3
                      ? Colors.primary
                      : Colors.white_light,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: Commons.size(10),
                }}>
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: Commons.size(16),
                    color: Colors.white,
                    fontFamily: Fonts.sans_regular,
                  }}
                  value={from}
                  onChangeText={setFrom}
                  editable={false}
                  returnKeyType={'done'}
                />
              </TouchableOpacity>
            </View>

            <View>
              <Text
                style={{
                  width: Commons.width(0.4),
                  alignSelf: 'center',
                  marginTop: Commons.size(10),
                  fontFamily: Fonts.sans_medium,
                  fontSize: Commons.size(16),
                  color: Colors.white,
                  marginBottom: Commons.size(5),
                }}>
                To
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowToPicker(true);
                }}
                style={{
                  width: Commons.width(0.4),
                  alignSelf: 'center',
                  marginTop: Commons.size(5),
                  borderRadius: Commons.size(10),
                  borderWidth: 1,
                  borderColor:
                    to.trim().length > 3 ? Colors.primary : Colors.white_light,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: Commons.size(10),
                }}>
                <TextInput
                  style={{
                    fontSize: Commons.size(16),
                    color: Colors.white,
                    fontFamily: Fonts.sans_regular,
                  }}
                  value={to}
                  onChangeText={setTo}
                  editable={false}
                  returnKeyType={'done'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: Commons.width(0.9),
              marginTop: Commons.size(10),
              alignSelf: 'center',
            }}>
            <CheckBox
              tintColors={{true: Colors.primary, false: Colors.light_grey}}
              value={isSelected}
              onValueChange={() => setSelected(!isSelected)}
            />

            <Text
              style={{
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(14),
                color: Colors.white,
              }}>
              Is the event paid?
            </Text>
          </View>

          {isSelected && (
            <View
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginTop: Commons.size(20),
              }}>
              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  fontSize: Commons.size(16),
                  color: Colors.white,
                  marginBottom: Commons.size(5),
                }}>
                Ticket Price
              </Text>
              <TextInput
                style={{
                  marginTop: Commons.size(5),
                  borderRadius: Commons.size(10),
                  borderWidth: 1,
                  borderColor:
                    price.trim().length > 0
                      ? Colors.primary
                      : Colors.white_light,
                  fontSize: Commons.size(16),
                  paddingHorizontal: Commons.size(10),
                  color: Colors.white,
                  fontFamily: Fonts.sans_regular,
                }}
                value={price}
                onChangeText={setPrice}
                returnKeyType={'next'}
                keyboardType={'number-pad'}
              />
            </View>
          )}

          {/* <DatePicker
            modal
            mode="date"
            minimumDate={new Date(Date.now())}
            textColor={Colors.primary}
            open={showPicker}
            date={dateObj}
            onConfirm={date => {
              dateToSend = date.toISOString();
              let strDate =
                (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) +
                '-' +
                (date.getMonth() > 8
                  ? date.getMonth() + 1
                  : '0' + (date.getMonth() + 1)) +
                '-' +
                date.getFullYear();
              const currentDate = strDate || date;

              setDate(currentDate);
              setShowPicker(false);
              setDateObj(date);
            }}
            onCancel={() => {
              setShowPicker(false);
            }}
          /> */}

          <DatePicker
            modal
            mode="datetime"
            minimumDate={new Date(Date.now())}
            textColor={Colors.primary}
            open={showFromPicker}
            date={fromDate}
            onConfirm={time => {
              setFrom(moment(time.toISOString()).format('DD/MM - H:mm a'));
              setFromDate(time);
              setShowFromPicker(false);

              setTo('');
              setToDate(new Date(Date.now()));
            }}
            onCancel={() => {
              setShowFromPicker(false);
            }}
          />

          <DatePicker
            modal
            mode="datetime"
            minimumDate={fromDate}
            textColor={Colors.primary}
            date={toDate}
            open={showToPicker}
            onConfirm={time => {
              setTo(moment(time.toISOString()).format('DD/MM - H:mm a'));
              setToDate(time);
              // setTo(moment(time.toISOString()));
              setShowToPicker(false);
            }}
            onCancel={() => {
              setShowToPicker(false);
            }}
          />

          {/* <MapModal
            isVisible={visible}
            setVisible={setVisible}
            setAddress={setLocation}
          /> */}
          <Loader visible={loading} />
        </View>
      }
    />
  );
}
