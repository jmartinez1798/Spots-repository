import React, {useState, useEffect} from 'react';
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

export default function CategoryList(props) {
  const tabBarHeight = 0;
  const [data, setData] = useState([{a: '1'}, {a: '2'}, {a: '1'}, {a: '2'}]);

  useEffect(() => {
    try {
      tabBarHeight = useBottomTabBarHeight();
    } catch (err) {
      console.log(err);
    }
  }, []);

  const Item = ({item, index}) => {
    return (
      <TouchableOpacity
        // onPress={() => {
        //   Commons.navigate(props.navigation, 'event_detail');
        // }}
        style={{
          width: Commons.size(135),
          marginRight: index !== data.length - 1 ? Commons.size(15) : 0,
        }}>
        <View
          style={{
            height: Commons.size(165),
            width: Commons.size(135),
            borderRadius: Commons.size(10),
            overflow: 'hidden',
          }}>
          <Image
            source={Images.test_category}
            style={{
              height: Commons.size(165),
              width: Commons.size(135),
              resizeMode: 'cover',
            }}
          />

          <View
            style={{
              position: 'absolute',
              bottom: Commons.size(7),
              left: Commons.size(7),
            }}>
            <Text
              style={{
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(16),
                marginTop: Commons.size(7),
                color: Colors.white,
                fontWeight: '400',
              }}>
              Night Life
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
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
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{alignItems: 'center'}}
      style={{paddingVertical: Commons.size(7)}}
      data={data}
      renderItem={Item}
      keyExtractor={({index}) => `${index}`}
      ListFooterComponent={
        <View style={{height: tabBarHeight + Commons.size(15)}} />
      }
    />
  );
}
