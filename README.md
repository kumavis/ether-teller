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

##### walletManager.lookup(keyId, cb)

provides non-secret details ('name', internal uuid', 'address') for the ethereum key specified

##### walletManager.sign(keyId, tx, cb)

signs a tx with the ethereum key specified

##### walletManager.generateIdentity(name, cb)

creates a new ethereum key with the name specified

##### walletManager.keyList()

lists names of all ethereum keys stored