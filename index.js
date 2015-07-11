var Uuid = require('hat')
var extend = require('xtend')
var crypto = require('crypto')
var EC = require('elliptic').ec
var ec = new EC('secp256k1')
var ethUtil = require('ethereumjs-util')

var keyStoragePrefix = 'key-'


module.exports = function(storage) {

  var apiObject = {
    lookup: lookup,
    lookupAll: lookupAll,
    sign: sign,
    generateIdentity: generateIdentity,
    importIdentity: importIdentity,
  }

  return apiObject

  // public

  function lookup(keyId, cb){
    getKey(keyId, function(err, data){
      if (err) return cb(err)
      cb(null, safeKeyDetails(data))
    })
  }

  function sign(keyId, tx, cb){
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

  function generateIdentity(label, cb) {

    var privateKey = crypto.randomBytes(32)
    var publicKey = new Buffer(ec.keyFromPrivate(privateKey).getPublic('arr'))

    var keyPair = {
      id: Uuid(),
      label: label,
      privateKey: privateKey,
      publicKey: publicKey,
    }

    setKey(keyPair, function(err){
      if (err) return cb(err)

      cb(null, safeKeyDetails(keyPair))
    })

  }

  // publicKey and privateKey should be buffers
  function importIdentity(data, cb) {

    var keyPair = {
      id: Uuid(),
      label: data.label,
      privateKey: data.privateKey,
      publicKey: data.publicKey,
    }

    setKey(keyPair, function(err){
      if (err) return cb(err)
      cb(null, safeKeyDetails(keyPair))
    })

  }

  // asynchronously returns safeKeyData for all keys
  function lookupAll(cb){
    async.map(keyList(), lookup, cb)
  }

  // private

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

  function safeKeyDetails(data) {
    return {
      id: data.id,
      label: data.label,
      address: ethUtil.pubToAddress(data.publicKey).toString('hex'),
    }
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