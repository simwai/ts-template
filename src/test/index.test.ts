// Small test example
import test_, { TestFn } from 'ava'
import { stub, StubbableType } from 'sinon'

type MyTestContext = {
  consoleLogStub: StubbableType<Console>
  consoleTraceStub: StubbableType<Console>
}
const test: TestFn<MyTestContext> = test_ as unknown as TestFn<MyTestContext>

test.beforeEach((t) => {
  // Stub console methods before each test
  t.context.consoleLogStub = stub(console, 'log')
  t.context.consoleTraceStub = stub(console, 'trace')
})
