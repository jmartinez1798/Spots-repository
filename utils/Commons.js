import {
  ToastAndroid,
  Platform,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import {RFValue} from 'react-native-responsive-fontsize';
import ImagePicker from 'react-native-image-crop-picker';
import Geolocation from 'react-native-geolocation-service';
import storage from '@react-native-firebase/storage';

const size = value => {
  return RFValue(value, Dimensions.get('window').height);
};

const height = (value = 1) => {
  return Dimensions.get('window').height * value;
};

const screenHeight = (value = 1) => {
  return Dimensions.get('screen').height * value;
};

const width = (value = 1) => {
  return Dimensions.get('window').width * value;
};

const calculateDateFromObj = date => {
  let strDate =
    (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) +
    '-' +
    (date.getMonth() > 8 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)) +
    '-' +
    date.getFullYear();
  return strDate || date;
};

const timeDiff = (start, end) => {
  var diff = end - start;
  var units = [1000 * 60 * 60 * 24, 1000 * 60 * 60, 1000 * 60, 1000];

  var rv = [];
  for (var i = 0; i < units.length; ++i) {
    rv.push(Math.floor(diff / units[i]));
    diff = diff % units[i];
  }
  var thisFullYear = end.getFullYear();
  var daysInLastMonth = new Date(thisFullYear, end.getMonth(), 0).getDate();
  var thisMonth = end.getMonth();
  thisFullYear = thisFullYear - start.getFullYear();
  thisMonth = thisMonth - start.getMonth();
  var subAddDays = daysInLastMonth - start.getDate();
  var thisDay = end.getDate();
  thisMonth = thisMonth - 1;
  if (thisMonth < 0) {
    thisFullYear = thisFullYear - 1;
    thisMonth = 12 + thisMonth;
  }
  subAddDays = daysInLastMonth - start.getDate();
  subAddDays = thisDay + subAddDays;

  if (subAddDays >= daysInLastMonth) {
    subAddDays = subAddDays - daysInLastMonth;
    thisMonth++;
    if (thisMonth > 11) {
      thisFullYear++;
      thisMonth = 0;
    }
  }
  return {
    years: thisFullYear,
    months: thisMonth,
    days: subAddDays,
    hours: rv[1],
    minutes: rv[2],
    seconds: rv[3],
  };
};

const reset = (navigation, screen) => {
  const resetAction = CommonActions.reset({
    index: 0,
    routes: [{name: screen}],
  });

  navigation.dispatch(resetAction);
};

const navigate = (navigation, screen, params = null) => {
  navigation.navigate(screen, params);
};

const replace = (navigation, screen, params = null) => {
  navigation.replace(screen, params);
};

const toast = message => {
  if (Platform.OS === 'android') {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  }
};

const checkPermissions = async () => {
  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);
  if (
    !JSON.stringify(granted).includes('denied') &&
    !JSON.stringify(granted).includes('never_ask_again')
  ) {
    return true;
  } else {
    toast('Kindly allow all permissions to continue');
    return false;
  }
};

const cropFile = path => {
  return new Promise(async (resolve, reject) => {
    try {
      ImagePicker.openCropper({
        path: path,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width,
      })
        .then(image => {
          resolve(image);
        })
        .catch(err => reject(err));
    } catch (err) {
      console.warn(err);
      reject(err);
    }
  });
};

const fetchLocation = () => {
  return new Promise(async (resolve, reject) => {
    if (checkPermissions()) {
      Geolocation.getCurrentPosition(
        position => {
          resolve(position);
        },
        error => {
          const {code, message} = error;
          toast(message);
          reject(error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    }
  });
};

const uploadToFirebase = (uri, filename, type = 'image') => {
  return new Promise(async (resolve, reject) => {
    if (type === 'image') {
      storage()
        .ref(filename)
        .putFile(uri)
        .then(snapshot => {
          resolve(snapshot);
        })
        .catch(error => {
          reject(error);
        });
    } else {
      const response = await fetch(uri);
      const fileBlob = await response.blob();
      storage()
        .ref(filename)
        .put(fileBlob)
        .then(snapshot => {
          resolve(snapshot);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

const distance = (lat1, lon1, lat2, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == 'K') {
      dist = dist * 1.609344;
    }
    if (unit == 'N') {
      dist = dist * 0.8684;
    }
    return dist;
  }
};

export default {
  size,
  height,
  screenHeight,
  width,
  calculateDateFromObj,
  timeDiff,
  reset,
  navigate,
  replace,
  toast,
  checkPermissions,
  cropFile,
  fetchLocation,
  uploadToFirebase,
  distance,
};
