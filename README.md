## Eth-Teller

Automated Ethereum Wallet Management.

### warning

This is under development. Crypto has not been audited yet.

### usage

Use with [`ancient-tome`](https://github.com/kumavis/ancient-tome) and `ancient-tome/indexer`.

```js
var AncientLocal = require('ancient-tome/local')
var TomeIndexer = require('ancient-tome/indexer')

var secureStorage = TomeIndexer(AncientLocal())

secureStorage.open(password, function(err){
  if (err) return cb(err)

  var walletManager = EthTeller(secureStorage)
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
