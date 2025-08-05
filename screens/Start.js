import {View, Text, TouchableOpacity, Image} from 'react-native';
import React, {useEffect} from 'react';
import {SafeArea} from '../components';
import {Commons, Images, Fonts, Colors} from '../utils';
import LinearGradient from 'react-native-linear-gradient';
import changeNavigationBarColor, {
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import * as Animatable from 'react-native-animatable';

export default function Start(props) {
  useEffect(() => {
    changeNavColor();
    showNavigationBar();
  }, []);

  const changeNavColor = async () => {
    await changeNavigationBarColor(Colors.background, true);
  };

  return (
    <SafeArea
      statusBarTransculent={true}
      child={
        <View style={{flex: 1}}>
          <View
            stye={{
              position: 'absolute',
              top: -1 * Commons.size(140),
              left: -1 * Commons.size(182),
            }}>
            <Images.Start
              height={Commons.size(1038)}
              width={Commons.size(1401)}
            />
          </View>

          <View
            style={{
              alignSelf: 'center',
              position: 'absolute',
              top: Commons.size(60),
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              <Images.AppLogo
                height={Commons.size(36)}
                width={Commons.size(48)}
              />
              <Text
                style={{
                  fontFamily: Fonts.gilroy_medium,
                  color: Colors.white,
                  fontSize: Commons.size(29),
                  fontWeight: '600',
                  marginLeft: Commons.size(7),
                }}>
                spots
              </Text>
            </View>
            <Text
              style={{
                width: Commons.width(0.8),
                textAlign: 'center',
                fontFamily: Fonts.sans_medium,
                color: Colors.white,
                fontSize: Commons.size(24),
                marginTop: Commons.size(20),
                fontWeight: '400',
                marginLeft: Commons.size(7),
              }}>
              Find new spots to love and meet your mates.
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: Commons.size(10),
                alignSelf: 'center',
              }}>
              <Animatable.View
                animation="bounceInLeft"
                iterationCount={1}
                direction="normal"
                style={{
                  backgroundColor: Colors.tags,
                  borderRadius: Commons.size(4),
                  marginRight: Commons.size(7),
                  paddingVertical: Commons.size(3),
                  paddingHorizontal: Commons.size(7),
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    color: Colors.white,
                    fontSize: Commons.size(14),
                    fontWeight: '400',
                  }}>
                  Spots
                </Text>
              </Animatable.View>

              <Animatable.View
                animation="bounceInLeft"
                iterationCount={1}
                direction="normal"
                style={{
                  backgroundColor: Colors.tags,
                  borderRadius: Commons.size(4),
                  marginRight: Commons.size(7),
                  paddingVertical: Commons.size(3),
                  paddingHorizontal: Commons.size(7),
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    color: Colors.white,
                    fontSize: Commons.size(14),
                    fontWeight: '400',
                  }}>
                  Hangout
                </Text>
              </Animatable.View>

              <Animatable.View
                animation="bounceInRight"
                iterationCount={1}
                direction="normal"
                style={{
                  backgroundColor: Colors.tags,
                  borderRadius: Commons.size(4),
                  marginRight: Commons.size(7),
                  paddingVertical: Commons.size(3),
                  paddingHorizontal: Commons.size(7),
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    color: Colors.white,
                    fontSize: Commons.size(14),
                    fontWeight: '400',
                  }}>
                  Drinks
                </Text>
              </Animatable.View>

              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  color: Colors.white,
                  backgroundColor: Colors.tags,
                  borderRadius: Commons.size(4),
                  fontSize: Commons.size(14),
                  fontWeight: '400',
                  paddingVertical: Commons.size(3),
                  paddingHorizontal: Commons.size(7),
                }}>
                Fun
              </Text>
            </View>
          </View>

          <Animatable.View
            animation="bounceInDown"
            iterationCount={1}
            direction="normal"
            style={{
              position: 'absolute',
              top: Commons.size(304),
              left: Commons.size(28),
            }}>
            <Images.Abs1 />
          </Animatable.View>

          <Animatable.View
            animation="bounceInLeft"
            iterationCount={1}
            direction="alternate"
            style={{
              position: 'absolute',
              top: Commons.size(271),
              left: Commons.size(286),
            }}>
            <Images.Abs2 />
          </Animatable.View>

          <Animatable.View
            animation="bounceInRight"
            iterationCount={1}
            direction="alternate"
            style={{
              position: 'absolute',
              top: Commons.size(352),
              left: Commons.size(226),
            }}>
            <Images.Abs3 />
          </Animatable.View>

          <Animatable.View
            animation="fadeInDownBig"
            iterationCount={1}
            direction="alternate"
            style={{
              position: 'absolute',
              top: Commons.size(492),
              left: Commons.size(99),
            }}>
            <Images.Abs4 />
          </Animatable.View>

          <Animatable.View
            animation="fadeInDownBig"
            iterationCount={1}
            direction="alternate"
            style={{
              position: 'absolute',
              top: Commons.size(457),
              left: Commons.size(252),
            }}>
            <Images.Abs5 />
          </Animatable.View>

          <Animatable.View
            animation="zoomInDown"
            iterationCount={1}
            direction="alternate"
            style={{
              position: 'absolute',
              top: Commons.size(570),
              left: Commons.size(31),
            }}>
            <Images.Abs6 />
          </Animatable.View>

          <Animatable.View
            animation="zoomInUp"
            iterationCount={1}
            direction="alternate"
            style={{
              position: 'absolute',
              top: Commons.size(591),
              left: Commons.size(247),
            }}>
            <Images.Abs7 />
          </Animatable.View>

          <Animatable.View
            animation="zoomInRight"
            iterationCount={1}
            direction="alternate"
            style={{
              position: 'absolute',
              top: Commons.size(471),
              left: Commons.size(59),
            }}>
            <Images.Abs8 />
          </Animatable.View>

          {/* Bottom Layout */}
          <View
            style={{
              position: 'absolute',
              left: Commons.width(0.05),
              right: Commons.width(0.05),
              bottom: Commons.size(45),
            }}>
            <TouchableOpacity
              onPress={() => {
                Commons.navigate(props.navigation, 'auth', {
                  auth_type: 'sign_up',
                });
              }}
              activeOpacity={0.7}
              style={{
                borderRadius: Commons.size(10),
                overflow: 'hidden',
              }}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={[Colors.start, Colors.end]}
                style={{
                  width: Commons.width(0.9),
                  height: Commons.size(60),
                  justifyContent: 'center',
                  paddingHorizontal: Commons.size(20),
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: Fonts.sans_medium,
                      fontSize: Commons.size(18),
                      fontWeight: '400',
                      color: Colors.white,
                    }}>
                    Get Started
                  </Text>

                  <Images.Forward
                    height={Commons.size(14)}
                    width={Commons.size(31)}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View
              style={{
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: Commons.size(5),
              }}>
              <Text
                style={{
                  fontSize: Commons.size(16),
                  fontFamily: Fonts.sans_regular,
                  fontWeight: '400',
                  color: Colors.white,
                }}>
                Already have an account?
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Commons.navigate(props.navigation, 'auth', {
                    auth_type: 'sign_in',
                  });
                }}>
                <Text
                  style={{
                    fontSize: Commons.size(16),
                    fontFamily: Fonts.sans_medium,
                    marginLeft: Commons.size(7),
                    fontWeight: '400',
                    color: Colors.primary,
                  }}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    />
  );
}
