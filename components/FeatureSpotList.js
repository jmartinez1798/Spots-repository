import React, {useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {Colors, Images, Fonts, Commons} from '../utils';
import {useEffect} from 'react';

export default function FeatureSpotList(props) {
  const tabBarHeight = 0;
  const [data, setData] = useState(props.spots);
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (err) {
    console.log(err);
  }

  const Item = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          Commons.navigate(props.navigation, 'spot_details', {
            spot: item,
          });
        }}
        style={{
          width: Commons.width(0.9),
          marginBottom: Commons.size(15),
          backgroundColor: Colors.feed_card_bg,
          paddingHorizontal: Commons.size(18),
          paddingVertical: Commons.size(12),
          borderRadius: Commons.size(15),
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={item.icon}
            style={{
              height: Commons.size(40),
              width: Commons.size(40),
              borderRadius: Commons.size(20),
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
              {item.name}
            </Text>

            <Text
              style={{
                fontFamily: Fonts.sans_regular,
                fontSize: Commons.size(12),
                fontWeight: '400',
                color: Colors.white_light,
              }}>
              1 mile away
            </Text>
          </View>

          <TouchableOpacity>
            <Images.SendTilt />
          </TouchableOpacity>
        </View>

        <View
          style={{
            height: Commons.size(145),
            width: Commons.width(0.9) - Commons.size(18) * 2,
            borderRadius: Commons.size(10),
            marginTop: Commons.size(12),
            overflow: 'hidden',
          }}>
          <Image
            source={{uri: item.images[0]}}
            style={{
              height: Commons.size(145),
              width: Commons.width(0.9) - Commons.size(18) * 2,
              resizeMode: 'cover',
            }}
          />
        </View>

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

        {/* <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: Commons.size(12),
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.feed_like_bg,
              height: Commons.size(32),
              borderRadius: Commons.size(20),
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            <View
              style={{
                marginHorizontal: Commons.size(12),
              }}>
              <Images.Like />
            </View>
            <Text
              style={{
                fontFamily: Fonts.sans_regular,
                fontSize: Commons.size(14),
                fontWeight: '400',
                color: Colors.white,
                marginRight: Commons.size(12),
              }}>
              16
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: Colors.feed_like_bg,
              height: Commons.size(32),
              borderRadius: Commons.size(20),
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              marginHorizontal: Commons.size(8),
            }}>
            <View
              style={{
                marginHorizontal: Commons.size(12),
              }}>
              <Images.Fire />
            </View>
            <Text
              style={{
                fontFamily: Fonts.sans_regular,
                fontSize: Commons.size(14),
                fontWeight: '400',
                color: Colors.white,
                marginRight: Commons.size(12),
              }}>
              16
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.sans_regular,
              fontSize: Commons.size(14),
              fontWeight: '400',
              color: Colors.white,
              textAlign: 'right',
            }}>
            24 comments
          </Text>
        </View> */}

        <TouchableOpacity
          onPress={() => {
            if (props.horizontal)
              Commons.navigate(props.navigation, 'my_spots');
          }}
          style={{
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
            {props.horizontal
              ? 'Add to Your Spot List'
              : 'Remove from Your Spot List'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      pagingEnabled={props.horizontal ? true : false}
      horizontal={props.horizontal ? true : false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{alignItems: 'center'}}
      style={{paddingVertical: Commons.size(10)}}
      data={data}
      renderItem={Item}
      keyExtractor={({index}) => `${index}`}
      //   ItemSeparatorComponent={<View style={{width: Commons.size(15)}} />}
      ListFooterComponent={
        <View style={{height: tabBarHeight + Commons.size(15)}} />
      }
    />
  );
}
