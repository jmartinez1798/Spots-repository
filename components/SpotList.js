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

export default function FeedSpotList(props) {
  const [data, setData] = useState(props.spots);
  let tabBarHeight;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (err) {
    tabBarHeight = 0;
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
          width: Commons.width(0.4),
          marginRight: index % 2 === 0 ? Commons.size(15) : 0,
          marginBottom: Commons.size(15),
        }}>
        <View
          style={{
            height: Commons.size(120),
            width: Commons.size(150),
            borderRadius: Commons.size(10),
            overflow: 'hidden',
          }}>
          <Image
            source={{uri: item.images[0]}}
            style={{
              height: Commons.size(120),
              width: Commons.size(150),
              resizeMode: 'cover',
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              position: 'absolute',
              bottom: Commons.size(7),
              left: Commons.size(7),
            }}>
            <View
              style={{
                height: Commons.size(24),
                width: Commons.size(24),
                borderRadius: Commons.size(12),
                overflow: 'hidden',
              }}>
              <Image
                source={Images.test_dp}
                style={{
                  height: Commons.size(24),
                  width: Commons.size(24),
                  resizeMode: 'cover',
                }}
              />
            </View>

            <View
              style={{
                height: Commons.size(24),
                width: Commons.size(24),
                borderRadius: Commons.size(12),
                marginLeft: -1 * Commons.size(12),
                overflow: 'hidden',
              }}>
              <Image
                source={Images.test_dp}
                style={{
                  height: Commons.size(24),
                  width: Commons.size(24),
                  resizeMode: 'cover',
                }}
              />
            </View>

            <View
              style={{
                height: Commons.size(24),
                width: Commons.size(24),
                borderRadius: Commons.size(12),
                marginLeft: -1 * Commons.size(12),
                overflow: 'hidden',
              }}>
              <Image
                source={Images.test_dp}
                style={{
                  height: Commons.size(24),
                  width: Commons.size(24),
                  resizeMode: 'cover',
                }}
              />
            </View>

            <View
              style={{
                height: Commons.size(24),
                width: Commons.size(24),
                borderRadius: Commons.size(12),
                marginLeft: -1 * Commons.size(12),
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
                  fontSize: Commons.size(14),
                }}>
                +4
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={{
            fontFamily: Fonts.sans_medium,
            fontSize: Commons.size(16),
            marginTop: Commons.size(7),
            color: Colors.white,
            fontWeight: '400',
          }}>
          {item.name}
        </Text>

        <Text
          style={{
            fontFamily: Fonts.sans_regular,
            fontSize: Commons.size(12),
            color: Colors.white_light,
            fontWeight: '400',
          }}>
          {item.location.address}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      numColumns={2}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={{
        paddingVertical: Commons.size(15),
        width: Commons.width(),
        alignSelf: 'center',
      }}
      contentContainerStyle={{alignSelf: 'center'}}
      data={data}
      renderItem={Item}
      keyExtractor={item => item._id}
      ListFooterComponent={<View style={{height: tabBarHeight}} />}
      ListEmptyComponent={
        <Text
          style={{
            fontFamily: Fonts.sans_medium,
            color: Colors.white,
            fontSize: Commons.size(16),
          }}>
          No Spot
        </Text>
      }
    />
  );
}
