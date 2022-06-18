const P2PServer = require('./peers');
const p2pInstance = new P2PServer({
  blockchain: null,
  trnxPool: null,
  wallet: null
})

test('null nextblock on start up', () => {
  expect(p2pInstance.nextBlock).toBeNull()
});

test('not null nextblock after value added', () => {
  if (p2pInstance.nextBlock == null) {
    p2pInstance.nextBlock = {som:1}

    expect(p2pInstance.nextBlock).not.toBeNull()
  }
});

test('remove next block function', () => {
  if(p2pInstance.nextBlock) {
    p2pInstance.removeNextBlock()

    expect(p2pInstance.nextBlock).toBeNull()
  }
});