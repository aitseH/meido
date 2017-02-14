import {exec} from 'child_process'

export default {
  name: "test",

  start: async (meido) => {
    meido.Queue
      .run(async(queue, next) => {
        await next()

        meido.log('debug', 'test start')

        meido.state.notify = {
          test: 'db start',
          message: 'db start',
          onClick: () => {
            exec(' open http://localhost:8080 ')
          }
        }
      })
  }
}