import React, {useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {Colors, Images, Fonts, Commons} from '../utils';
import {FlatListSlider} from 'react-native-flatlist-slider';
import Slider from './Slider';

export default function OuterSpotList(props) {
  const tabBarHeight = useBottomTabBarHeight();
  const [allData, setAllData] = useState(props.data);
  const [data, setData] = useState(
    props.data.length > 0 ? [props.data[0]] : [],
  );

  const Item = ({item}) => {
    if (item.images.length > 0) {
      return (
        <View style={{height: '100%'}}>
          <FlatListSlider
            data={item.images}
            component={<Slider />}
            contentContainerStyle={{
              alignSelf: 'center',
            }}
            indicator={false}
          />
        </View>
      );
    }
    return <View style={{height: '100%'}} />;
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <FlatList
        style={{
          height: Commons.height() - Commons.size(55),
        }}
        data={data}
        renderItem={Item}
        keyExtractor={(item, index) => `_key${item._id}`}
        ListEmptyComponent={
          <Text
            style={{
              alignSelf: 'center',
              fontFamily: Fonts.gilroy_medium,
              color: Colors.white,
            }}>
            No Spot
          </Text>
        }
      />

      {data.length > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: tabBarHeight + Commons.size(90),
            marginHorizontal: Commons.width(0.05),
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: Commons.size(120),
              borderColor: Colors.white,
              borderWidth: 1,
              borderRadius: Commons.size(6),
              padding: Commons.size(5),
            }}>
            <View
              style={{
                backgroundColor: '#00FF94',
                height: Commons.size(8),
                width: Commons.size(8),
                marginHorizontal: Commons.size(5),
                borderRadius: Commons.size(4),
              }}
            />

            <Text
              style={{
                color: Colors.white,
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(14),
                fontWeight: '400',
              }}>
              {data[0].visitors ? data[0].visitors.length : '0'} people
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: Commons.size(10),
              width: Commons.width(0.9),
            }}>
            <Text
              style={{
                flex: 1,
                color: Colors.white,
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(32),
                fontWeight: '700',
              }}>
              {data[0].name}
            </Text>
            <TouchableOpacity onPress={() => props.setCurrentSpot(data[0])}>
              <Images.Info2 />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'center',
              width: Commons.width(0.9),
              marginBottom: Commons.size(10),
            }}>
            <Images.Location
              height={Commons.size(16)}
              width={Commons.size(16)}
              fill={Colors.primary}
            />
            <Text
              style={{
                flex: 1,
                color: Colors.white,
                fontFamily: Fonts.sans_regular,
                fontSize: Commons.size(12),
                fontWeight: '400',
              }}>
              {data[0].location.address}
            </Text>
          </View>
        </View>
      )}

      {data.length > 0 && (
        <View
          style={{
            width: Commons.width(),
            height: Commons.size(90),
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            paddingHorizontal: Commons.size(20),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: '#FFF',
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.58,
            shadowRadius: 16.0,
            elevation: 24,
            alignSelf: 'center',
            position: 'absolute',
            bottom: tabBarHeight,
            left: 0,
            right: 0,
          }}>
          <TouchableOpacity
            onPress={() => {
              let index = allData.indexOf(data[0]);
              if (index < allData.length - 1) {
                setData([allData[index + 1]]);
              } else {
                setData([allData[0]]);
              }
            }}
            style={{
              height: Commons.size(50),
              width: Commons.size(50),
              borderRadius: Commons.size(25),
              borderWidth: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: Colors.light_grey,
            }}>
            <Images.Close
              height={Commons.size(25)}
              width={Commons.size(25)}
              stroke={Colors.light_grey}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              let index = allData.indexOf(data[0]);
              if (index < allData.length - 1) {
                setData([allData[index + 1]]);
              } else {
                setData([allData[0]]);
              }
            }}
            style={{
              height: Commons.size(50),
              width: Commons.size(50),
              borderRadius: Commons.size(25),
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.primary,
            }}>
            <Images.Heart
              fill={Colors.white}
              height={Commons.size(25)}
              width={Commons.size(25)}
            />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
