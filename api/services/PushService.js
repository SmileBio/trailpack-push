'use strict'

const Service = require('trails-service')
const gcm = require('node-gcm')
const apn = require('apn')
const _ = require('lodash')

/**
 * @module PushService
 * @description Send push notification to Android or iOS devices
 */
module.exports = class PushService extends Service {

  /**
   * Send a push notification to iOS devices for one or multiple tokens
   * @param token (s) to send to
   * @param message to send
   */
  sendToAPN(token, message) {
    const options = this.app.config.push.apn
    if (!Array.isArray(token)) {
      token = [token]
    }

    const apnConnection = new apn.Connection(options)
    
    if (message.badge)
      message.badge = parseInt(message.badge) || 0

    let note = new apn.Notification()
    //note = _.merge(note, message.aps)
    note.payload = message.payload
    note.badge = message.badge
    note.sound = message.sound
    note.alert = message.alert
    note.contentAvailable = note.payload['content-available'] || 0


    apnConnection.pushNotification(note, token)
      /*const myDevice = new apn.Device(token)
      apnConnection.pushNotification(note, myDevice)*/

  }

  /**
   * Send push notifications to Android devices
   * @param ids tokens to send message to
   * @param senderId serverID to use to send notifications
   * @param messageInfos data to send
   * @param retry on failure
   * @param next callback results
   */
  sendToGCM(ids, messageInfos, retry, next) {
    const options = this.app.config.push.gcm
    if (!Array.isArray(ids)) {
      ids = [ids]
    }

    //ids = _.chunk(ids, 1000)

    let message
    if (messageInfos) {
      message = new gcm.Message(messageInfos)
    }
    else {
      message = new gcm.Message()
    }

    // Set up the sender with you API key
    const sender = new gcm.Sender(options.senderId)


      if (retry) {
        sender.send(message, { registrationTokens: ids }, 5, next)
      }
      else {
        sender.sendNoRetry(message, { registrationTokens: ids }, next)
      }

  }
}

