const assert = require("assert");

checkGetFail = async (promise, message) => {
    try {
        await promise;
    } catch (e) {
        assert(e.message.indexOf(message) !== -1, e.message)
    }
}

checkTransactionFailed = async (promise, message) => {
  let reason;
  try {
    let z = await promise;
  } catch (err) {
    let z = err;
    // assert.strictEqual(z.tx, undefined, "No Error thrown");
    reason = z.reason;
  }
  assert.strictEqual(reason, message, "Wrong Error Message");
}

checkTransactionPassed = async (promise) => {
    let z = await promise;
    assert.strictEqual(z.receipt.reason, undefined)
    assert.notStrictEqual(z.tx, undefined, "Transaction failed (no tx)");
}

advanceTime = (time) => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [time],
        id: new Date().getTime()
      }, (err, result) => {
        if (err) { return reject(err) }
        return resolve(result)
      })
    })
  }
  
  advanceBlock = () => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: new Date().getTime()
      }, (err, result) => {
        if (err) { return reject(err) }
        const newBlockHash = web3.eth.getBlock('latest').hash
  
        return resolve(newBlockHash)
      })
    })
  }
  
  takeSnapshot = () => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_snapshot',
        id: new Date().getTime()
      }, (err, snapshotId) => {
        if (err) { return reject(err) }
        return resolve(snapshotId)
      })
    })

    // return value: { id: 1657121187103, jsonrpc: '2.0', result: '0x2c' }
  }

  // id should be passed with takeSnapshot.return.result
  revertToSnapShot = (id) => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_revert',
        params: [id],
        id: new Date().getTime()
      }, (err, result) => {
        if (err) { return reject(err) }
        return resolve(result)
      })
    })
  }
  
  advanceTimeAndBlock = async (time) => {
    await advanceTime(time)
    await advanceBlock()
    return Promise.resolve(web3.eth.getBlock('latest'))
  }

module.exports = {
    checkGetFail,
    checkTransactionFailed,
    checkTransactionPassed,
    advanceTime,
    advanceBlock,
    advanceTimeAndBlock,
    takeSnapshot,
    revertToSnapShot
  }