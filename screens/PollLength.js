import React, {useEffect, useState} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import {SafeArea} from '../components';
import {Colors, Images, Fonts, Commons} from '../utils';
import LinearGradient from 'react-native-linear-gradient';

export default function PollLength(props) {
  const [days, setDays] = useState('1');
  const [hours, setHours] = useState('0');
  const [isEnabled, setEnabled] = useState(false);

  useEffect(() => {
    if (days > 0 || hours > 0) {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [days, hours]);

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
              Set Length
            </Text>

            <Images.Close stroke={Colors.background} />
          </View>

          <Text
            style={{
              width: Commons.width(0.9),
              fontFamily: Fonts.sans_regular,
              color: Colors.light_grey,
              alignSelf: 'center',
              marginTop: Commons.size(15),
              fontSize: Commons.size(14),
              fontWeight: '400',
            }}>
            Please fill in the details to set the length for poll
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
            Days
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: Commons.width(0.9),
              alignSelf: 'center',
              marginTop: Commons.size(5),
              borderRadius: Commons.size(10),
              borderWidth: 1,
              borderColor:
                parseInt(days) > 0 ? Colors.primary : Colors.white_light,
              padding: Commons.size(10),
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <Text style={{color: Colors.white}}>{days}</Text>
              <Text style={{color: Colors.white}}> Days</Text>
            </View>
            <View>
              <TouchableOpacity onPress={() => setDays(parseInt(days) + 1)}>
                <Images.ChevronUp />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  let val = parseInt(days);
                  if (val > 0) setDays(val - 1);
                }}>
                <Images.ChevronDown />
              </TouchableOpacity>
            </View>
          </View>

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
            Hours
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: Commons.width(0.9),
              alignSelf: 'center',
              marginTop: Commons.size(5),
              borderRadius: Commons.size(10),
              borderWidth: 1,
              borderColor:
                parseInt(hours) > 0 ? Colors.primary : Colors.white_light,
              padding: Commons.size(10),
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <Text style={{color: Colors.white}}>{hours}</Text>
              <Text style={{color: Colors.white}}> Hours</Text>
            </View>
            <View>
              <TouchableOpacity onPress={() => setHours(parseInt(hours) + 1)}>
                <Images.ChevronUp />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  let val = parseInt(hours);
                  if (val > 0) setHours(val - 1);
                }}>
                <Images.ChevronDown />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              props.route.params.setLength({
                days: days,
                hours: hours,
              });
              props.navigation.goBack();
            }}
            activeOpacity={0.7}
            style={{
              marginTop: Commons.size(20),
              borderRadius: Commons.size(10),
              overflow: 'hidden',
              marginBottom: Commons.size(35),
              alignSelf: 'center',
              backgroundColor: Colors.disabled,
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
                  Set Length
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
                  Set Length
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      }
    />
  );
}
