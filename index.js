const Uuid = require('hat')
const extend = require('xtend')
const crypto = require('crypto')
const ethUtil = require('ethereumjs-util')
const async = require('async')
const semaphore = require('semaphore')

const keyStoragePrefix = 'key-'


module.exports = function(storage) {

  var keyIndex = null
  var lock = semaphore(1)
  lock.leave = lock.leave.bind(lock)

  var apiObject = {
    lookupAll: lookupAll,
    generateIdentity: generateIdentity,
    importIdentity: importIdentity,
  }

  // lock until keyIndex is loaded
  lock.take(function(){
    loadKeyIndex(lock.leave)
  })
  
  return apiObject

  // public

  // asynchronously returns safeKeyData for all keys
  function lookupAll(cb){
    ensureUnlocked(function(){
      async.map(keyIndex, lookupKey, cb)
    })
  }

  function generateIdentity(opts, cb) {
    ensureUnlocked(function(){
      importIdentity({
        label: opts.label,
        privateKey: crypto.randomBytes(32),
      }, cb)
    })
  }

  // opts.privateKey should be a buffer
  function importIdentity(opts, cb) {
    var privateKey = opts.privateKey
    var publicKey = ethUtil.privateToPublic(privateKey)
    var address = ethUtil.publicToAddress(publicKey)

    var keyPair = {
      id: Uuid(),
      label: opts.label,
      privateKey: privateKey,
      publicKey: publicKey,
      address: address,
    }

    ensureUnlocked(function(){

      appendToKeyIndex(keyPair.id)
      setKey(keyPair, function(err){
        if (err) return cb(err)
        cb(null, KeyObject(keyPair))
      })

    })

  }

  // private

  function KeyObject(data) {
    var id = data.id
    return {
      // properties
      label: data.label,
      address: data.address.toString('hex'),
      // methods
      signTx: signTx.bind(null, id),
    }
  }

  function lookupKey(keyId, cb){
    getKey(keyId, function(err, data){
      if (err) return cb(err)
      cb(null, KeyObject(data))
    })
  }

  function signTx(keyId, tx, cb){
    getKey(keyId, function(err, data){
      if (err) return cb(err)
      try {
        var privateKey = new Buffer(data.privateKey, 'hex')
        tx.sign(privateKey)
        cb(null, tx)
      } catch (err) {
        if (err) return cb(err)
      }
    })
  }

  function getKey(keyId, cb) {
    storage.get(keyStoragePrefix+keyId, function(err, data){
      if (err) return cb(err)
      cb(null, deserializeKey(data))
    })
  }

  function setKey(key, cb) {
    storage.put(keyStoragePrefix+key.id, serializeKey(key), cb)
  }

  function serializeKey(key) {
    var data = extend(key)
    data.privateKey = key.privateKey.toString('base64')
    data.publicKey = key.publicKey.toString('base64')
    return JSON.stringify(data)
  }

  function deserializeKey(data) {
    var key = JSON.parse(data)
    key.privateKey = Buffer(key.privateKey, 'base64')
    key.publicKey = Buffer(key.publicKey, 'base64')
    return key
  }

  function appendToKeyIndex(id){
    keyIndex.push(id)
    updateKeyIndex()
  }

  function updateKeyIndex(){
    storage.put('keyIndex', JSON.stringify(keyIndex), function noop(){})
  }

  function loadKeyIndex(cb){
    storage.get('keyIndex', function(err, data){
      if (err || !data) {
        keyIndex = []
      } else {
        keyIndex = JSON.parse(data)
      }
      cb()
    })
  }

  // util

  function ensureUnlocked(cb){
    lock.take(function(){
      lock.leave()
      cb()
    })
  }

}