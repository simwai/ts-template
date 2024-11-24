// Small test example
import test_, { TestFn } from 'ava'
import { SinonStub, stub } from 'sinon'

type MyTestContext = {
  consoleLogStub: SinonStub
  consoleTraceStub: SinonStub
}
const test: TestFn<MyTestContext> = test_ as unknown as TestFn<MyTestContext>

test.beforeEach((t) => {
  // Stub console methods before each test
  t.context.consoleLogStub = stub(console, 'log')
  t.context.consoleTraceStub = stub(console, 'trace')
})

// Demo
test('demo', async (t) => {
  t.true(true)
})
