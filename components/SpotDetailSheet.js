import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
} from 'react-native';
import React, {useCallback, useMemo} from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import {Colors, Images, Fonts, Commons} from '../utils';
import LinearGradient from 'react-native-linear-gradient';

export default function SpotDetailSheet(props) {
  const snapPoints = useMemo(() => ['75%', '100%'], []);

  const handleSheetChanges = useCallback(index => {
    if (index === -1) {
      props.setCurrentSpot(null);
    }
  }, []);

  return (
    <Pressable
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        position: 'absolute',
        height: Commons.height(),
        width: Commons.width(),
        zIndex: 100,
      }}
      onPress={() => {
        props.setCurrentSpot(null);
      }}>
      <BottomSheet
        backgroundStyle={{backgroundColor: Colors.background}}
        enablePanDownToClose
        index={0}
        handleIndicatorStyle={{backgroundColor: Colors.white}}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}>
        <View
          style={{
            borderRadius: Commons.size(10),
            backgroundColor: Colors.background,
            paddingVertical: Commons.width(0.05),
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'center',
              width: Commons.width(0.9),
            }}>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  fontSize: Commons.size(24),
                  fontWeight: '400',
                  color: Colors.white,
                }}>
                {props.spot.name}
              </Text>

              {props.distance !== -1 && (
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                    fontWeight: '400',
                    color: Colors.primary,
                  }}>
                  {props.distance} miles away
                </Text>
              )}
            </View>

            <View
              style={{
                flexDirection: 'row',
                borderRadius: Commons.size(25),
                borderWidth: 1,
                alignItems: 'center',
                borderColor: Colors.light_grey,
              }}>
              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(18),
                  fontWeight: '400',
                  marginHorizontal: Commons.size(10),
                  color: Colors.white,
                }}>
                {props.spot.likes ? props.spot.likes.length : 0}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  props.processLikePost();
                }}
                style={{
                  height: Commons.size(34),
                  width: Commons.size(34),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: Commons.size(17),
                  backgroundColor: props.spot.likes.includes(props.me._id)
                    ? Colors.primary
                    : Colors.light_grey,
                }}>
                {props.spot.likes &&
                  props.spot.likes.includes(props.me._id) && (
                    <Images.Heart
                      fill={Colors.white}
                      height={Commons.size(20)}
                      width={Commons.size(20)}
                    />
                  )}

                {props.spot.likes &&
                  !props.spot.likes.includes(props.me._id) && (
                    <Images.HeartOutline
                      height={Commons.size(20)}
                      width={Commons.size(20)}
                    />
                  )}
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              width: Commons.width(0.9),
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: Commons.size(10),
            }}>
            {props.spot.categories.map((item, index) => {
              return (
                <Text
                  style={{
                    backgroundColor: Colors.light_grey,
                    paddingVertical: Commons.size(3),
                    paddingHorizontal: Commons.size(7),
                    fontFamily: Fonts.sans_regular,
                    color: Colors.white,
                    borderRadius: Commons.size(5),
                    fontSize: Commons.size(12),
                    marginRight: Commons.size(7),
                    fontWeight: '400',
                  }}>
                  #{item}{' '}
                </Text>
              );
            })}
          </View>

          <View
            style={{
              width: Commons.width(0.9),
              alignSelf: 'center',
              flexDirection: 'row',
              marginTop: Commons.size(20),
            }}>
            <Images.Location stroke={Colors.primary} />
            <Text
              numberOfLines={2}
              ellipsizeMode={'tail'}
              style={{
                flex: 1,
                marginHorizontal: Commons.size(5),
                fontFamily: Fonts.sans_regular,
                fontSize: Commons.size(16),
                fontWeight: '400',
                color: Colors.white,
              }}>
              {props.spot.location.address}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(
                  'https://maps.google.com/?q=' + props.spot.location.address,
                );
              }}>
              <Images.Direction />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              marginTop: Commons.size(20),
              paddingHorizontal: Commons.width(0.05),
            }}>
            {props.spot.images.map((item, index) => {
              return (
                <View
                  style={{
                    height: Commons.size(64),
                    width: Commons.size(94),
                    borderRadius: Commons.size(6),
                    marginRight: Commons.size(10),
                    overflow: 'hidden',
                  }}>
                  <Image
                    source={{uri: item}}
                    style={{
                      height: Commons.size(64),
                      width: Commons.size(94),
                      resizeMode: 'cover',
                    }}
                  />
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={{
              alignSelf: 'center',
              flexDirection: 'row',
              marginTop: Commons.size(20),
            }}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[Colors.start, Colors.end]}
              style={{
                width: Commons.width(0.9),
                height: Commons.size(90),
                borderRadius: Commons.size(10),
                flexDirection: 'row',
                alignItems: 'flex-end',
                padding: Commons.size(10),
              }}>
              <View style={{flex: 1}}>
                <Text
                  style={{
                    color: Colors.white,
                    fontWeight: '700',
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(20),
                  }}>
                  7
                </Text>
                <Text
                  style={{
                    color: Colors.white,
                    fontWeight: '400',
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                  }}>
                  Friends visiting
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    height: Commons.size(44),
                    width: Commons.size(44),
                    borderRadius: Commons.size(22),
                    overflow: 'hidden',
                  }}>
                  <Image
                    source={Images.test_dp}
                    style={{
                      height: Commons.size(44),
                      width: Commons.size(44),
                      resizeMode: 'cover',
                    }}
                  />
                </View>

                <View
                  style={{
                    height: Commons.size(44),
                    width: Commons.size(44),
                    borderRadius: Commons.size(22),
                    marginLeft: -1 * Commons.size(22),
                    overflow: 'hidden',
                  }}>
                  <Image
                    source={Images.test_dp}
                    style={{
                      height: Commons.size(44),
                      width: Commons.size(44),
                      resizeMode: 'cover',
                    }}
                  />
                </View>

                <View
                  style={{
                    height: Commons.size(44),
                    width: Commons.size(44),
                    borderRadius: Commons.size(22),
                    marginLeft: -1 * Commons.size(22),
                    overflow: 'hidden',
                  }}>
                  <Image
                    source={Images.test_dp}
                    style={{
                      height: Commons.size(44),
                      width: Commons.size(44),
                      resizeMode: 'cover',
                    }}
                  />
                </View>

                <View
                  style={{
                    height: Commons.size(44),
                    width: Commons.size(44),
                    borderRadius: Commons.size(22),
                    marginLeft: -1 * Commons.size(22),
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
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View
            style={{
              marginTop: Commons.size(20),
              width: Commons.width(0.9),
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              style={{
                flex: 0.48,
                height: Commons.size(90),
                borderRadius: Commons.size(8),
                borderWidth: 1,
                flexDirection: 'row',
                padding: Commons.size(7),
                borderColor: Colors.light_grey,
                backgroundColor: Colors.avatar_bg,
              }}>
              <View style={{justifyContent: 'flex-end', flex: 1}}>
                <Text
                  style={{
                    color: Colors.primary,
                    fontWeight: '700',
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(20),
                  }}>
                  {/* {props.spot.visitors.length} */}0
                </Text>
                <Text
                  style={{
                    color: Colors.white,
                    fontWeight: '400',
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                  }}>
                  People visiting
                </Text>
              </View>
              <Images.People />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 0.48,
                height: Commons.size(90),
                borderRadius: Commons.size(8),
                borderWidth: 1,
                flexDirection: 'row',
                padding: Commons.size(7),
                borderColor: Colors.light_grey,
                backgroundColor: Colors.avatar_bg,
              }}>
              <View style={{justifyContent: 'flex-end', flex: 1}}>
                <Text
                  style={{
                    color: Colors.primary,
                    fontWeight: '700',
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(20),
                  }}>
                  {/* {props.spot.visitors.length} */}0
                </Text>
                <Text
                  style={{
                    color: Colors.white,
                    fontWeight: '400',
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                  }}>
                  Followers visiting
                </Text>
              </View>
              <Images.Individual />
            </TouchableOpacity>
          </View>

          {props.spot.type === 'paid' && (
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
                style={{
                  borderRadius: Commons.size(10),
                  overflow: 'hidden',
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
                  <Images.Ticket />
                  <Text
                    style={{
                      fontFamily: Fonts.sans_medium,
                      fontSize: Commons.size(18),
                      alignSelf: 'center',
                      marginLeft: Commons.size(7),
                      fontWeight: '400',
                      color: Colors.white,
                    }}>
                    Buy Tickets
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </BottomSheet>
    </Pressable>
  );
}
