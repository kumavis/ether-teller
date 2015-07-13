const test = require('tape')
const EthTeller = require('../index.js')
const memdown = require('memdown')

test('generate identity', function(t){
  t.plan(2)

  setupWalletManager(null, function(storage, walletManager){
    walletManager.generateIdentity({ label: 'first' }, function(err, wallet){
      t.notOk(err)
      t.ok(wallet)
    })
  })
})

test('double setup', function(t){
  t.plan(4)

  setupWalletManager(null, function(storage, walletManager){
    walletManager.generateIdentity({ label: 'first' }, function(err, wallet){
      t.notOk(err)
      t.ok(wallet)
      setupWalletManager(storage, function(storage, walletManager){
        walletManager.lookupAll(function(err, wallets){
          t.notOk(err)
          t.equal(wallets.length, 1)
        })
      })
    })
  })
})


// util

function setupWalletManager(storage, cb) {
  var task = null
  
  if (storage) {
    task = process.nextTick.bind(process)
  } else {
    storage = memdown()
    task = storage.open.bind(storage, '1234_CatsLikePizza')
  }

  task(function(){
    var walletManager = EthTeller(storage)
    cb(storage, walletManager)
  })
}
