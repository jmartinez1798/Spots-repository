import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Text,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import SwipeGesture from 'react-native-swipe-gestures';
import * as Progress from 'react-native-progress';
import {Colors, Commons, Endpoints, Fonts, Images} from '../utils';
import {useSelector} from 'react-redux';
import ApiService from '../services/ApiService';

export default function Story(props) {
  const {user} = useSelector(state => state.authReducer);
  const [currentUserStories, setCurrentUserStories] = useState(
    props.route.params.stories,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isImage, setImage] = useState(false);
  let interval = useRef(null);

  React.useEffect(() => {
    if (isImage && progress > 1) {
      onSwipeLeft();
      clearInterval(interval.current);
    }
  }, [progress]);

  const onSwipeLeft = () => {
    if (currentIndex < currentUserStories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      setLoading(true);
    } else {
      props.navigation.goBack();
    }
  };

  const onSwipeRight = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      setLoading(true);
    }
  };

  const onProgress = data => {
    setProgress(data.currentTime / data.seekableDuration);
  };

  const onLoaded = () => {
    setLoading(false);
    setImage(currentUserStories[currentIndex].type === 'image');
    if (currentUserStories[currentIndex].type === 'image') {
      interval.current = setInterval(() => {
        setProgress(progress => progress + 0.01);
      }, 100);
    }
  };

  const panResponder =
    // useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dx !== 0 && gestureState.dy !== 0;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx > 0) {
          onSwipeRight();
        } else if (gestureState.dx < 0) {
          onSwipeLeft();
        }
      },
      onPanResponderGrant: (evt, gestureState) => {
        if (isImage) {
          setLoading(true);
          clearInterval(interval.current);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isImage) {
          setLoading(false);
          setProgress(progress => progress + 0.02);
          interval.current = setInterval(() => {
            setProgress(progress => progress + 0.01);
          }, 100);
        }
      },
    });

  const processLikePost = async (id, index) => {
    let action = '';
    let indexx = currentUserStories.indexOf(
      currentUserStories.find(c => c._id === id),
    );
    if (!currentUserStories[indexx].likes.includes(user._id)) {
      currentUserStories[indexx].likes.push(user._id);
      action = 'add';
    } else {
      let ind = currentUserStories[indexx].likes.indexOf(user._id);
      if (ind > -1) {
        currentUserStories[indexx].likes.splice(ind, 1);
      }
      action = 'remove';
    }
    setCurrentUserStories([...currentUserStories]);
    await ApiService.post(
      Endpoints.currentUserStories + 'like/' + id,
      null,
      user.token,
    )
      .then(res => {})
      .catch(err => {
        if (action === 'add') {
          let ind = currentUserStories[indexx].likes.indexOf(user._id);
          if (ind > -1) {
            currentUserStories[indexx].likes.splice(ind, 1);
          }
        } else {
          currentUserStories[indexx].likes.push(user._id);
        }
        setCurrentUserStories([...currentUserStories]);
        console.log(err);
      });
  };

  const processReactPost = async (id, index) => {
    let action = '';
    let indexx = currentUserStories.indexOf(
      currentUserStories.find(c => c._id === id),
    );
    if (!currentUserStories[indexx].reactions.includes(user._id)) {
      currentUserStories[indexx].reactions.push(user._id);
      action = 'add';
    } else {
      let indd = currentUserStories[indexx].reactions.indexOf(user._id);
      if (indd > -1) {
        currentUserStories[indexx].reactions.splice(indd, 1);
      }
      action = 'remove';
    }
    setCurrentUserStories([...currentUserStories]);
    await ApiService.post(
      Endpoints.currentUserStories + 'react/' + id,
      null,
      user.token,
    )
      .then(res => {})
      .catch(err => {
        if (action === 'add') {
          let indd = currentUserStories[indexx].reactions.indexOf(user._id);
          if (indd > -1) {
            currentUserStories[indexx].reactions.splice(indd, 1);
          }
        } else {
          currentUserStories[indexx].reactions.push(user._id);
        }
        setCurrentUserStories([...currentUserStories]);
        console.log(err);
      });
  };

  return (
    <SwipeGesture
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      config={{
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80,
      }}
      style={styles.container}>
      <View {...panResponder.panHandlers} style={styles.container}>
        {currentUserStories[currentIndex].type === 'video' ? (
          <Video
            source={{uri: currentUserStories[currentIndex].mediaLink}}
            style={styles.media}
            resizeMode="contain"
            onProgress={onProgress}
            onLoad={onLoaded}
            onEnd={onSwipeLeft}
          />
        ) : (
          <FastImage
            source={{uri: currentUserStories[currentIndex].mediaLink}}
            style={styles.media}
            resizeMode={FastImage.resizeMode.contain}
            onLoad={onLoaded}
          />
        )}

        <View
          style={{
            height: Commons.size(110),
            width: Commons.width(),
            backgroundColor: Colors.background,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingHorizontal: Commons.width(0.05),
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            <TouchableOpacity
              disabled={currentUserStories[currentIndex].user._id === user._id}
              onPress={() =>
                processLikePost(currentUserStories[currentIndex]._id, index)
              }
              style={{
                backgroundColor: currentUserStories[
                  currentIndex
                ].likes.includes(user._id)
                  ? Colors.active_pin
                  : Colors.feed_like_bg,
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
                {currentUserStories[currentIndex].likes.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={currentUserStories[currentIndex].user._id === user._id}
              onPress={() =>
                processReactPost(currentUserStories[currentIndex]._id, index)
              }
              style={{
                backgroundColor: currentUserStories[
                  currentIndex
                ].reactions.includes(user._id)
                  ? Colors.active_pin
                  : Colors.feed_like_bg,
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
                {currentUserStories[currentIndex].reactions.length}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {!loading && (
        <Progress.Bar
          style={styles.progressBar}
          progress={progress}
          color={'#fff'}
          width={Commons.width(0.98)}
          unfilledColor={Colors.light_grey}
          borderWidth={0}
          height={Commons.size(6)}
        />
      )}
    </SwipeGesture>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  progressBar: {
    position: 'absolute',
    top: Commons.size(20),
    // width: '100%',
  },
});
