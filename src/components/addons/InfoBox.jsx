import canUseDOM from "can-use-dom"
import invariant from "invariant"
import React from "react"
import ReactDOM from "react-dom"
import PropTypes from "prop-types"

import {
  construct,
  componentDidMount,
  componentDidUpdate,
  componentWillUnmount,
} from "../../utils/MapChildHelper"

import { MAP, ANCHOR, INFO_BOX } from "../../constants"

/**
 * A wrapper around `InfoBox`
 *
 * @see http://htmlpreview.github.io/?https://github.com/googlemaps/v3-utility-library/blob/master/infobox/docs/reference.html
 */
class InfoBox extends React.PureComponent {
  state = {
    [INFO_BOX]: null,
  }

  /*
   * @see https://developers.google.com/maps/documentation/javascript/3.exp/reference#InfoBox
   */
  componentWillMount() {
    if (!canUseDOM || this.state[INFO_BOX]) {
      return
    }

    const {
      InfoBox: GoogleMapsInfobox,
    } = require(/* "google-maps-infobox" uses "google" as a global variable. Since we don't
     * have "google" on the server, we can not use it in server-side rendering.
     * As a result, we import "google-maps-infobox" here to prevent an error on
     * a isomorphic server.
     */ `google-maps-infobox`)
    const infoBox = new GoogleMapsInfobox()
    construct(InfoBox.propTypes, updaterMap, this.props, infoBox)
    infoBox.setMap(this.context[MAP])
    this.setState({
      [INFO_BOX]: infoBox,
    })
  }

  componentDidMount() {
    componentDidMount(this, this.state[INFO_BOX], eventMap)
    const content = document.createElement(`div`)
    this.state[INFO_BOX].setContent(content)
    open(this.state[INFO_BOX], this.context[ANCHOR])
  }

  componentDidUpdate(prevProps) {
    componentDidUpdate(
      this,
      this.state[INFO_BOX],
      eventMap,
      updaterMap,
      prevProps
    )
  }

  componentWillUnmount() {
    componentWillUnmount(this)
    const infoBox = this.state[INFO_BOX]
    if (infoBox) {
      infoBox.setMap(null)
    }
  }

  render() {
    const infoBox = this.state[INFO_BOX]
    if (!infoBox || !infoBox.getContent()) {
      return null
    }

    return ReactDOM.createPortal(this.props.children, infoBox.getContent())
  }

  /**
   *
   * @type LatLng
   */
  getPosition() {
    return this.state[INFO_BOX].getPosition()
  }

  /**
   *
   * @type boolean
   */
  getVisible() {
    return this.state[INFO_BOX].getVisible()
  }

  /**
   *
   * @type number
   */
  getZIndex() {
    return this.state[INFO_BOX].getZIndex()
  }
}

const open = (infoBox, anchor) => {
  if (anchor) {
    infoBox.open(infoBox.getMap(), anchor)
  } else if (infoBox.getPosition()) {
    infoBox.open(infoBox.getMap())
  } else {
    invariant(
      false,
      `You must provide either an anchor (typically render it inside a <Marker>) or a position props for <InfoBox>.`
    )
  }
}

const eventMap = {
  onCloseClick: "closeclick",
  onDomReady: "domready",
  onContentChanged: "content_changed",
  onPositionChanged: "position_changed",
  onZindexChanged: "zindex_changed",
}

const updaterMap = {
  options(instance, options) {
    instance.setOptions(options)
  },

  position(instance, position) {
    instance.setPosition(position)
  },

  visible(instance, visible) {
    instance.setVisible(visible)
  },

  zIndex(instance, zIndex) {
    instance.setZIndex(zIndex)
  },
}

InfoBox.contextTypes = {
  [MAP]: PropTypes.object,
  [ANCHOR]: PropTypes.object,
}

export default InfoBox
