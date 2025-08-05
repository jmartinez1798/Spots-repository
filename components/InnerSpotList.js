import React, {useState, useEffect, useRef} from 'react';
import {View, FlatList, Image} from 'react-native';
import {Commons} from '../utils';
import Progress from './Progress';

export default function InnerSpotList(props) {
  let list = useRef(null);
  const [data, setData] = useState(props.data);
  const [ind, setInd] = useState(-1);
  let interval;
  const scroll = useRef(0);

  const viewabilityConfig = {
    waitForInteraction: true,
    viewAreaCoveragePercentThreshold: 80,
  };

  useEffect(() => {
    setInd(0);
  }, []);

  useEffect(() => {
    if (ind > -1) {
      interval = setInterval(() => {
        if (ind < data.length - 1) {
          setInd(ind + 1);
          list.current.scrollToIndex({
            animated: true,
            index: ind + 1,
          });
        }
      }, 3000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [ind]);

  const handleScroll = event => {
    const positionX = event.nativeEvent.contentOffset.x;

    if (positionX > scroll.current) {
      if (ind + 1 <= data.length - 1) setInd(ind + 1);
    } else {
      if (ind - 1 >= 0) setInd(ind - 1);
    }
    scroll.current = positionX;
  };

  const Item = ({item, index}) => {
    if (!item) return <View />;
    return (
      <Image
        key={`${index}`}
        source={{uri: item}}
        style={{
          height: '100%',
          width: Commons.width(),
          resizeMode: 'stretch',
        }}
      />
    );
  };

  return (
    <View style={{height: '100%'}}>
      <FlatList
        ref={list}
        viewabilityConfig={viewabilityConfig}
        style={{
          flexGrow: 1,
        }}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        renderItem={Item}
        nestedScrollEnabled
        onScroll={handleScroll}
        // listKey={(item, index) => `_key${index.toString()}`}
        keyExtractor={({item}) => item}
      />
      {data.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: Commons.size(7),
            height: Commons.size(10),
          }}>
          <Progress step={ind + 1} steps={data.length} duration={3000} />
        </View>
      )}
    </View>
  );
}
