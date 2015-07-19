## Eth-Teller

Ethereum Wallet Management.

### warning

This is under development. The API has not been frozen yet.

### usage

Use with a [`leveldown`](https://github.com/level/abstract-leveldown).

```js
var storage = memdown()

storage.open(function(err){
  if (err) return cb(err)

  var walletManager = EthTeller(storage)
  walletManager.generateIdentity(name, function(err, wallet){ ... })
  
})
```

### api


##### walletManager.lookupAll( cb(err, [KeyObject, ...]) )

Loads all keys as KeyObjects

##### walletManager.generateIdentity( { label: String }, cb(err, KeyObject) )

creates a new ethereum key with the label specified

##### walletManager.importIdentity( { label: String, privateKey: Buffer }, cb(err, KeyObject) )

creates a new ethereum key with the label specified

##### walletManager.exportIdentity( keyId, cb(err, result) )

##### walletManager.exportAll( cb(err, result) )


### KeyObject

A KeyObject is a simple representation of a key that does not directly expose the privateKey

```js
{
  // properties
  label: String,
  address: String('non-prefixed hex'),
  // methods
  signTx: fn(Transaction),
}
```

##### keyObject.signTx( Transaction, cb(err, Transaction) )

Takes an ethereumjs-lib Transaction and a callback
