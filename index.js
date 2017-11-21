import React from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Text
} from 'react-native'
import ImagePicker from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import RNFS from 'react-native-fs'
import FIcon from 'react-native-vector-icons/FontAwesome'

export default class PhotoUpload extends React.Component {
  static propTypes = {
    containerStyle: PropTypes.object,
    photoPickerTitle: PropTypes.string,
    height: PropTypes.number,
    width: PropTypes.number,
    format: PropTypes.string,
    quality: PropTypes.number,
    onPhotoSelect: PropTypes.func // returns the base64 string of uploaded photo
  }

  state = {
    height: this.props.height || 300,
    width: this.props.width || 400,
    format: this.props.format || 'JPEG',
    quality: this.props.quality || 80
  }

  options = {
    title: this.props.pickerTitle || 'Select Photo',
    storageOptions: {
      skipBackup: true,
      path: 'images'
    }
  }

  openImagePicker = () => {
    // get image from image picker
    ImagePicker.showImagePicker(this.options, async response => {
      console.log('Response = ', response)

      if (response.didCancel) {
        console.log('User cancelled image picker')
        return
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
        return
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
        return
      }

      let { height, width, quality, format } = this.state

      // resize image
      const resizedImageUri = await ImageResizer.createResizedImage(
        `data:image/jpeg;base64,${response.data}`,
        height,
        width,
        format,
        quality
      )
      const filePath = Platform.OS === 'android' && resizedImageUri.uri.replace
        ? resizedImageUri.uri.replace('file:/data', '/data')
        : resizedImageUri.uri

      // convert image back to base64 string
      const photoData = await RNFS.readFile(filePath, 'base64')
      let source = { uri: resizedImageUri.uri }
      this.setState({
        avatarSource: source
      })

      // handle photo in props functions as data string
      if (this.props.onPhotoSelect) {
        let tempImage = {
          uri: `data:${response.type};base64,` + response.data,
          width: response.width,
          height: response.height,
          data: response.data,
          type: response.type,
          name: resizedImageUri.name,
          path: filePath,
          size: resizedImageUri.size
        }
        console.log('tempImage ======>' , tempImage )
        this.props.onPhotoSelect(tempImage)
      }
    })
  }

  renderChildren = props => {
    return React.Children.map(props.children, child => {
      if (child.type === Image && this.state.avatarSource) {
        return React.cloneElement(child, {
          source: this.state.avatarSource
        })
      } else return child
    })
  }

  render () {
    return (
      <View style={[styles.container, this.props.containerStyle]}>
        <TouchableOpacity
          style={
            this.props.normalButton ? styles.normalButton : styles.floatButton
          }
          onPress={this.openImagePicker}
        >
          {this.props.normalButton
            ? <Text style={styles.buttonText}>Create Laugh</Text>
            : this.renderChildren(this.props)}
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  floatButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 55,
    height: 55,
    bottom: 10,
    right: 20,
    backgroundColor: '#a32ff9',
    borderRadius: 27.5,
    elevation: 8,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 1
  },
  normalButton: {
    // alignItems: 'center',
    // justifyContent: 'center',
    // width: 55,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 10,
    height: undefined,
    backgroundColor: '#a32ff9',
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 1
  },
  buttonText: {
    color: 'white',
    fontSize: 18
  },
})
