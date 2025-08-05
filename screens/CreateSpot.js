import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeArea, Loader, MapModal} from '../components';
import {Colors, Images, Fonts, Commons, Endpoints} from '../utils';
import Geocoder from 'react-native-geocoding';
import {MAPS_API_KEY} from '@env';
import LocationEnabler from 'react-native-location-enabler';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {useSelector} from 'react-redux';
import ApiService from '../services/ApiService';
import CheckBox from '@react-native-community/checkbox';

export default function CreateEvent(props) {
  const {user} = useSelector(state => state.authReducer);
  const [isSelected, setSelected] = useState(false);
  const [isEnabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [pics, setPics] = useState([]);
  const [categories, setCategories] = useState([]);
  const icons = [
    Images.pizza,
    Images.icecream,
    Images.circus,
    Images.cola,
    Images.movie,
  ];

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
      uploadImages();
    }
  }, [loading]);

  useEffect(() => {
    if (
      pics.length > 0 &&
      title.trim().length > 3 &&
      location &&
      categories.length > 0 &&
      selectedIcon !== ''
    ) {
      setEnabled(true);
    } else setEnabled(false);
  }, [pics, title, location, categories.length, selectedIcon]);

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

  const callDelta = async (lat, long) => {
    console.log(lat, long);
    await Geocoder.from(lat, long)
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
            setPics([...pics, result]);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const uploadImages = () => {
    let images = [];
    pics.forEach(async pic => {
      let path = pic.path;
      let filename = pic.modificationDate;
      let uploadUri =
        Platform.OS === 'ios' ? path.replace('file://', '') : path;
      await Commons.uploadToFirebase(uploadUri, filename)
        .then(async snapshot => {
          if (snapshot.state === 'success') {
            const url = await storage().ref(filename).getDownloadURL();
            images.push(url);

            if (pics.indexOf(pic) === pics.length - 1) {
              createSpot(images);
            }
          }
        })
        .catch(error => {
          console.log(error);
          setLoading(false);
        });
    });
  };

  const createSpot = async images => {
    await ApiService.post(
      Endpoints.spots,
      {
        user: user._id,
        name: title.trim(),
        icon: selectedIcon,
        categories: categories,
        location: {
          name: title.trim(),
          lat: location.lat,
          lng: location.lng,
          address: location.address.trim(),
        },
        images: images,
        type: isSelected ? 'paid' : 'free',
        price: price.trim().length > 0 ? parseInt(price.trim()) : 0,
      },
      user.token,
    )
      .then(res => {
        setLoading(false);
        props.route.params.setPostType(null, res.data);
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
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
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
              Add a spot
            </Text>
            <TouchableOpacity>
              <Images.Close stroke={Colors.background} />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              width: Commons.width(0.9),
              alignSelf: 'center',
              fontFamily: Fonts.sans_regular,
              fontSize: Commons.size(14),
              color: Colors.white_light,
              fontWeight: '400',
              marginTop: Commons.size(20),
            }}>
            Please fill in the details to add a spot.
          </Text>

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
            Spot Title
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
            returnKeyType={'next'}
          />

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
            Category
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: Commons.size(55),
              width: Commons.width(0.9),
              alignSelf: 'center',
              marginTop: Commons.size(5),
              borderRadius: Commons.size(10),
              borderWidth: 1,
              borderColor:
                categories.length > 0 ? Colors.primary : Colors.white_light,
            }}>
            {categories.map((item, index) => {
              return (
                <View
                  style={{
                    paddingVertical: Commons.size(5),
                    paddingHorizontal: Commons.size(7),
                    backgroundColor: Colors.tab_bar,
                    borderRadius: Commons.size(7),
                    marginLeft: Commons.size(10),
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_regular,
                      color: Colors.white,
                      fontSize: Commons.size(12),
                      marginRight: Commons.size(10),
                    }}>
                    {item}
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setCategories(categories.filter(c => c !== item));
                    }}>
                    <Images.Close
                      fill={Colors.white}
                      stroke={Colors.white}
                      height={Commons.size(15)}
                      width={Commons.size(15)}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
            {categories.length < 3 && (
              <TextInput
                style={{
                  flex: 1,
                  fontSize: Commons.size(16),
                  paddingHorizontal: Commons.size(10),
                  color: Colors.white,
                  fontFamily: Fonts.sans_regular,
                }}
                value={category}
                onChangeText={setCategory}
                onSubmitEditing={e => {
                  if (e.nativeEvent.text.trim().length > 0) {
                    setCategories([...categories, e.nativeEvent.text]);
                    setCategory('');
                  }
                }}
                returnKeyType={'done'}
              />
            )}
            <Text
              onPress={() => {
                if (category.trim().length > 0) {
                  setCategories([...categories, category]);
                  setCategory('');
                }
              }}
              style={{
                color: Colors.white,
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(12),
                marginHorizontal: Commons.size(10),
              }}>
              Done
            </Text>
          </View>

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
            Choose your icon
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{flexGrow: 0}}
            contentContainerStyle={{
              paddingHorizontal: Commons.width(0.05),
            }}>
            {icons.map((item, index) => {
              return (
                <TouchableOpacity
                  onPress={() => setSelectedIcon(item)}
                  style={{
                    marginRight:
                      index !== icons.length - 1 ? Commons.size(10) : 0,
                    height: Commons.size(65),
                    width: Commons.size(65),
                    borderRadius: Commons.size(12),
                    borderWidth: 1,
                    borderColor:
                      selectedIcon === item ? Colors.primary : Colors.tab_bar,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Image
                    source={item}
                    style={{
                      height: Commons.size(54),
                      width: Commons.size(54),
                      resizeMode: 'center',
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
            Add photos
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{flexGrow: 0}}
            contentContainerStyle={{
              paddingHorizontal: Commons.width(0.05),
            }}>
            <TouchableOpacity
              onPress={pickImages}
              style={{
                marginRight: Commons.size(10),
                width: Commons.size(70),
                height: Commons.size(70),
                borderRadius: Commons.size(10),
                borderWidth: 1,
                borderColor: Colors.tab_bar,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
              <View
                style={{
                  height: Commons.size(34),
                  width: Commons.size(34),
                  borderRadius: Commons.size(17),
                  backgroundColor: Colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Images.Plus stroke={Colors.background} />
              </View>
            </TouchableOpacity>
            {pics.map((item, index) => {
              return (
                <View
                  style={{
                    marginRight:
                      index !== pics.length - 1 ? Commons.size(10) : 0,
                  }}>
                  <View
                    style={{
                      width: Commons.size(70),
                      height: Commons.size(70),
                      borderRadius: Commons.size(10),
                      overflow: 'hidden',
                    }}>
                    <Image
                      source={{uri: item.path}}
                      style={{
                        width: Commons.size(70),
                        height: Commons.size(70),
                        resizeMode: 'cover',
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setPics(pics.filter(d => d !== item));
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      alignItems: 'center',
                      justifyContent: 'center',
                      right: Commons.size(1),
                      position: 'absolute',
                      height: Commons.size(20),
                      width: Commons.size(20),
                      borderRadius: Commons.size(10),
                      backgroundColor: Colors.white,
                    }}>
                    <Images.Close
                      stroke={Colors.black}
                      height={Commons.size(10)}
                      width={Commons.size(10)}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

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
              Is the spot paid?
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
                    price.trim().length > 3
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

          <TouchableOpacity
            onPress={() => setLoading(true)}
            activeOpacity={0.7}
            style={{
              borderRadius: Commons.size(10),
              overflow: 'hidden',
              marginBottom: Commons.size(35),
              alignSelf: 'center',
              backgroundColor: Colors.disabled,
              marginTop: Commons.size(20),
            }}
            disabled={!isEnabled}>
            {isEnabled && (
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={[Colors.start, Colors.end]}
                style={{
                  width: Commons.width(0.9),
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
                  Submit
                </Text>
              </LinearGradient>
            )}
            {!isEnabled && (
              <View
                style={{
                  width: Commons.width(0.9),
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
                  Submit
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* <MapModal
            isVisible={visible}
            setVisible={setVisible}
            setAddress={setLocation}
          /> */}
          <Loader visible={loading} />
        </ScrollView>
      }
    />
  );
}
