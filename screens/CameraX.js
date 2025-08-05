import {
  View,
  Text,
  BackHandler,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import React, {useEffect, useState, useMemo, useRef, useCallback} from 'react';
import {Colors, Images, Commons, Fonts, Endpoints} from '../utils';
import ApiService from '../services/ApiService';
import {useSelector} from 'react-redux';
import {CaptureButton} from '../components/CaptureButton';
import {RFValue} from 'react-native-responsive-fontsize';
import {
  PinchGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import {sortFormats, useCameraDevices} from 'react-native-vision-camera';
import {Camera, frameRateIncluded} from 'react-native-vision-camera';
import {
  CONTENT_SPACING,
  MAX_ZOOM_FACTOR,
  SAFE_AREA_PADDING,
} from '../utils/Constants';
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {useIsForeground} from '../hooks/useIsForeground';
import {useIsFocused} from '@react-navigation/core';
import {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import {Loader, SafeArea} from '../components';
import LinearGradient from 'react-native-linear-gradient';
import {launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';
import storage from '@react-native-firebase/storage';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

const SCALE_FULL_ZOOM = 3;
const BUTTON_SIZE = 40;

const CameraX = props => {
  const {user} = useSelector(state => state.authReducer);
  var camera = useRef(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const zoom = useSharedValue(0);
  const isPressingButton = useSharedValue(false);

  // check if camera page is active
  const isFocussed = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocussed && isForeground;

  const [cameraPosition, setCameraPosition] = useState('back');
  const [enableHdr, setEnableHdr] = useState(false);
  const [flash, setFlash] = useState('off');
  const [enableNightMode, setEnableNightMode] = useState(false);
  const [isShown, setShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pic, setPic] = useState('');
  const [video, setVideo] = useState('');
  let type = '';

  // camera format settings
  const devices = useCameraDevices();
  const device = devices[cameraPosition];
  const formats = useMemo(() => {
    if (device?.formats == null) return [];
    return device.formats.sort(sortFormats);
  }, [device?.formats]);

  //#region Memos
  const [is60Fps, setIs60Fps] = useState(true);

  useEffect(() => {
    if (loading) uploadFile();
  }, [loading]);

  useEffect(() => {
    if (isFocussed) {
      hideNavigationBar();
    }
  }, [isFocussed, isForeground]);

  const fps = useMemo(() => {
    if (!is60Fps) return 30;

    if (enableNightMode && !device?.supportsLowLightBoost) {
      // User has enabled Night Mode, but Night Mode is not natively supported, so we simulate it by lowering the frame rate.
      return 30;
    }

    const supportsHdrAt60Fps = formats.some(
      f =>
        f.supportsVideoHDR &&
        f.frameRateRanges.some(r => frameRateIncluded(r, 60)),
    );
    if (enableHdr && !supportsHdrAt60Fps) {
      // User has enabled HDR, but HDR is not supported at 60 FPS.
      return 30;
    }

    const supports60Fps = formats.some(f =>
      f.frameRateRanges.some(r => frameRateIncluded(r, 60)),
    );
    if (!supports60Fps) {
      // 60 FPS is not supported by any format.
      return 30;
    }
    // If nothing blocks us from using it, we default to 60 FPS.
    return 60;
  }, [
    device?.supportsLowLightBoost,
    enableHdr,
    enableNightMode,
    formats,
    is60Fps,
  ]);

  const supportsCameraFlipping = useMemo(
    () => devices.back != null && devices.front != null,
    [devices.back, devices.front],
  );
  const supportsFlash = device?.hasFlash ?? false;
  const supportsHdr = useMemo(
    () => formats.some(f => f.supportsVideoHDR || f.supportsPhotoHDR),
    [formats],
  );
  const supports60Fps = useMemo(
    () =>
      formats.some(f =>
        f.frameRateRanges.some(rate => frameRateIncluded(rate, 60)),
      ),
    [formats],
  );
  const canToggleNightMode = enableNightMode
    ? true // it's enabled so you have to be able to turn it off again
    : (device?.supportsLowLightBoost ?? false) || fps > 30; // either we have native support, or we can lower the FPS
  //#endregion

  const format = useMemo(() => {
    let result = formats;
    if (enableHdr) {
      // We only filter by HDR capable formats if HDR is set to true.
      // Otherwise we ignore the `supportsVideoHDR` property and accept formats which support HDR `true` or `false`
      result = result.filter(f => f.supportsVideoHDR || f.supportsPhotoHDR);
    }

    // find the first format that includes the given FPS
    return result.find(f =>
      f.frameRateRanges.some(r => frameRateIncluded(r, fps)),
    );
  }, [formats, fps, enableHdr]);

  //#region Animated Zoom
  // This just maps the zoom factor to a percentage value.
  // so e.g. for [min, neutr., max] values [1, 2, 128] this would result in [0, 0.0081, 1]
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

  const cameraAnimatedProps = useAnimatedProps(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
    return {
      zoom: z,
    };
  }, [maxZoom, minZoom, zoom]);
  //#endregion

  //#region Callbacks
  const setIsPressingButton = useCallback(
    _isPressingButton => {
      isPressingButton.value = _isPressingButton;
    },
    [isPressingButton],
  );
  // Camera callbacks
  const onError = useCallback(error => {
    console.error(error);
  }, []);
  const onInitialized = useCallback(() => {
    console.log('Camera initialized!');
    setIsCameraInitialized(true);
  }, []);
  const onMediaCaptured = useCallback(
    (media, type) => {
      if (type === 'photo') {
        setPic(media.path);
        setShown(true);
      } else {
        setVideo(media.path);
        setShown(true);
      }
    },
    [props.navigation],
  );
  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition(p => (p === 'back' ? 'front' : 'back'));
  }, []);
  const onFlashPressed = useCallback(() => {
    setFlash(f => (f === 'off' ? 'on' : 'off'));
  }, []);
  //#endregion

  //#region Tap Gesture
  const onDoubleTap = useCallback(() => {
    onFlipCameraPressed();
  }, [onFlipCameraPressed]);
  //#endregion

  //#region Effects
  const neutralZoom = device?.neutralZoom ?? 1;
  useEffect(() => {
    // Run everytime the neutralZoomScaled value changes. (reset zoom when device changes)
    zoom.value = neutralZoom;
  }, [neutralZoom, zoom]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    checkPermissions();

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      showNavigationBar();
    };
  }, []);

  const checkPermissions = async () => {
    await Commons.checkPermissions()
      .then(res => {
        Camera.getMicrophonePermissionStatus().then(status =>
          setHasMicrophonePermission(status === 'authorized'),
        );
      })
      .catch(err => {
        onBackPress();
      });
  };

  const onBackPress = () => {
    props.navigation.goBack();
    return true;
  };

  const onPinchGesture = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startZoom = zoom.value;
    },
    onActive: (event, context) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate(
        event.scale,
        [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
        [-1, 0, 1],
        Extrapolate.CLAMP,
      );
      zoom.value = interpolate(
        scale,
        [-1, 0, 1],
        [minZoom, startZoom, maxZoom],
        Extrapolate.CLAMP,
      );
    },
  });
  //#endregion

  if (device != null && format != null) {
    console.log(
      `Re-rendering camera page with ${
        isActive ? 'active' : 'inactive'
      } camera. ` +
        `Device: "${device.name}" (${format.photoWidth}x${format.photoHeight} @ ${fps}fps)`,
    );
  } else {
    console.log('re-rendering camera page without active camera');
  }

  const onFrameProcessorSuggestionAvailable = useCallback(suggestion => {
    console.log(
      `Suggestion available! ${suggestion.type}: Can do ${suggestion.suggestedFrameProcessorFps} FPS`,
    );
  }, []);

  const pickImage = async () => {
    await launchImageLibrary({
      mediaType: 'mixed',
    })
      .then(res => {
        if (res.assets[0].type.includes('image')) setPic(res.assets[0].uri);
        else setVideo(res.assets[0].uri);
        setShown(true);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const uploadFile = async () => {
    let path = pic ? pic : video;
    if (pic) type = 'image';
    else type = 'video';
    let filename = new Date().getTime().toString();
    let uploadUri = Platform.OS === 'ios' ? path.replace('file://', '') : path;
    await Commons.uploadToFirebase(uploadUri, filename, type)
      .then(async snapshot => {
        if (snapshot.state === 'success') {
          const url = await storage().ref(filename).getDownloadURL();
          createStory(url);
        }
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  };

  const createStory = async url => {
    await ApiService.post(
      Endpoints.stories,
      {
        type: type,
        mediaLink: url,
      },
      user.token,
    )
      .then(res => {
        setLoading(false);
        props.navigation.goBack();
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  const StoryItem = ({item}) => {
    if (item.type === 'image') {
      return (
        <Image
          source={{uri: item.mediaLink}}
          style={{height: '100%', width: '100%', resizeMode: 'stretch'}}
          onLoadEnd={e => {
            console.log('Image Loaded');
          }}
        />
      );
    }
    return (
      <Video
        source={{uri: item.mediaLink}}
        repeat={true}
        resizeMode={'contain'}
        onVideoLoad={e => {
          console.log('Video Loaded');
        }}
        // ref={player}
        onBuffer={e => {
          console.log('Video is buffering');
        }}
        onError={err => {
          console.log('Video is buffering');
        }}
      />
    );
  };

  return (
    <SafeArea
      statusBarTransculent={true}
      child={
        <View style={styles.container}>
          <View style={{flex: 1}}>
            {device != null && !isShown && (
              <PinchGestureHandler
                onGestureEvent={onPinchGesture}
                enabled={isActive}>
                <Reanimated.View style={{flex: 1}}>
                  <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
                    <ReanimatedCamera
                      ref={camera}
                      style={StyleSheet.absoluteFill}
                      device={device}
                      format={format}
                      fps={fps}
                      hdr={enableHdr}
                      lowLightBoost={
                        device.supportsLowLightBoost && enableNightMode
                      }
                      isActive={isActive}
                      onInitialized={onInitialized}
                      onError={onError}
                      enableZoomGesture={false}
                      animatedProps={cameraAnimatedProps}
                      photo={true}
                      video={true}
                      audio={hasMicrophonePermission}
                      frameProcessor={
                        //   device.supportsParallelVideoProcessing
                        //     ? frameProcessor
                        // :
                        undefined
                      }
                      orientation="portrait"
                      frameProcessorFps={1}
                      onFrameProcessorPerformanceSuggestionAvailable={
                        onFrameProcessorSuggestionAvailable
                      }
                    />
                  </TapGestureHandler>
                </Reanimated.View>
              </PinchGestureHandler>
            )}

            {isShown && pic != '' && (
              <Image source={{uri: 'file://' + pic}} style={{flex: 1}} />
            )}

            {isShown && video != '' && (
              <Video
                source={{uri: video}}
                repeat={true}
                resizeMode={'contain'}
                // ref={player}
                // onBuffer={onBuffer}
                // onError={videoError}
                style={{flex: 1}}
              />
            )}

            {!isShown && (
              <CaptureButton
                style={styles.captureButton}
                camera={camera}
                onMediaCaptured={onMediaCaptured}
                cameraZoom={zoom}
                minZoom={minZoom}
                maxZoom={maxZoom}
                flash={supportsFlash ? flash : 'off'}
                enabled={isCameraInitialized && isActive}
                setIsPressingButton={setIsPressingButton}
              />
            )}

            {/* <StatusBarBlurBackground /> */}

            {/* <View style={styles.rightButtonRow}>
              {supportsCameraFlipping && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={onFlipCameraPressed}
                  activeOpacity={0.4}>
                  <IonIcon name="camera-reverse" color="white" size={24} />
                </TouchableOpacity>
              )}
              {supportsFlash && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={onFlashPressed}
                  activeOpacity={0.4}>
                  <IonIcon
                    name={flash === 'on' ? 'flash' : 'flash-off'}
                    color="white"
                    size={24}
                  />
                </TouchableOpacity>
              )}
              {supports60Fps && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setIs60Fps(!is60Fps)}>
                  <Text style={styles.text}>
                    {is60Fps ? '60' : '30'}
                    {'\n'}FPS
                  </Text>
                </TouchableOpacity>
              )}
              {supportsHdr && (
                <PressabTouchableOpacityleOpacity
                  style={styles.button}
                  onPress={() => setEnableHdr(h => !h)}>
                  <MaterialIcon
                    name={enableHdr ? 'hdr' : 'hdr-off'}
                    color="white"
                    size={24}
                  />
                </PressabTouchableOpacityleOpacity>
              )}
              {canToggleNightMode && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setEnableNightMode(!enableNightMode)}
                  disabledOpacity={0.4}>
                  <IonIcon
                    name={enableNightMode ? 'moon' : 'moon-outline'}
                    color="white"
                    size={24}
                  />
                </TouchableOpacity>
              )}
            </View> */}
          </View>

          <View
            style={{
              height: Commons.size(110),
              backgroundColor: Colors.background,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: Commons.width(0.05),
            }}>
            {!isShown && (
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  height: Commons.size(50),
                  width: Commons.size(50),
                  borderRadius: Commons.size(12),
                  overflow: 'hidden',
                }}>
                <Image
                  style={{
                    height: Commons.size(50),
                    width: Commons.size(50),
                    resizeMode: 'cover',
                  }}
                  source={{uri: user.avatar}}
                />
              </TouchableOpacity>
            )}

            {isShown && (
              <TouchableOpacity
                style={{alignItems: 'center', justifyContent: 'center'}}>
                <Images.Download />
                <Text
                  style={{
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(14),
                    color: Colors.white,
                  }}>
                  Save
                </Text>
              </TouchableOpacity>
            )}

            {!isShown && (
              <TouchableOpacity onPress={onFlipCameraPressed}>
                <Images.Flip />
              </TouchableOpacity>
            )}

            {isShown && (
              <TouchableOpacity
                onPress={() => setLoading(true)}
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
                    width: Commons.size(160),
                    height: Commons.size(45),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_medium,
                      fontSize: Commons.size(18),
                      alignSelf: 'center',
                      fontWeight: '400',
                      color: Colors.white,
                    }}>
                    Share to Story
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              if (isShown) {
                setShown(false);
                setPic('');
                setVideo('');
              } else onBackPress();
            }}
            style={{
              height: Commons.size(32),
              width: Commons.size(32),
              borderRadius: Commons.size(16),
              backgroundColor: Colors.white,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: Commons.size(30),
              right: Commons.width(0.05),
            }}>
            <Images.Close stroke={Colors.background} />
          </TouchableOpacity>

          <Loader visible={loading} />
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  captureButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: SAFE_AREA_PADDING.paddingBottom,
  },
  button: {
    marginBottom: CONTENT_SPACING,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonRow: {
    position: 'absolute',
    right: SAFE_AREA_PADDING.paddingRight,
    top: RFValue(100),
  },
  text: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CameraX;
