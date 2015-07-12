const Uuid = require('hat')
const extend = require('xtend')
const crypto = require('crypto')
const ethUtil = require('ethereumjs-util')
const async = require('async')

const keyStoragePrefix = 'key-'


module.exports = function(storage) {

  var apiObject = {
    lookupAll: lookupAll,
    generateIdentity: generateIdentity,
    importIdentity: importIdentity,
  }

  return apiObject

  // public

  // asynchronously returns safeKeyData for all keys
  function lookupAll(cb){
    async.map(keyList(), lookupKey, cb)
  }

  function generateIdentity(label, cb) {
    
    importIdentity({
      label: label,
      privateKey: crypto.randomBytes(32),
    }, cb)

  }

  // publicKey and privateKey should be buffers
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

    setKey(keyPair, function(err){
      if (err) return cb(err)
      cb(null, safeKeyDetails(keyPair))
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
      cb(null, safeKeyDetails(data))
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

  // looks up all key ids from the index
  function keyList() {
    // filter for keys
    return storage.index()
      .filter(function(entry){
        return entry.slice(0, keyStoragePrefix.length) === keyStoragePrefix
      })
      .map(function(entry){
        return entry.slice(keyStoragePrefix.length)
      })
  }

  function getKey(keyId, cb) {
    storage.get(keyStoragePrefix+keyId, function(err, data){
      if (err) return cb(err)
      cb(null, deserializeKey(data))
    })
  }

  function setKey(key, cb) {
    storage.set(keyStoragePrefix+key.id, serializeKey(key), cb)
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

}