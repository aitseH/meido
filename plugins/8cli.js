import readline from 'readline'
import {exec} from 'child_process'

export default {
  name: "cli",

  start: (meido) => {

    meido.log('debug', 'cli start>>>>>')
    meido
      .on('cli:start', () => {
        let rl = readline.createInterface({
          input: process.stdin, 
          output: process.stdout,
          prompt: 'meido>',
          completer: (line) => {
            var completions = meido.options.completions
            var hits = completions.filter((c) => { return c.indexOf(line) === 0 })
            return [hits.length ? hits : completions, line]
          }
        })
        rl.prompt()

        rl.setPrompt('meido> ', 5) 
        rl.on('line', line => {
          const newline = line.split(' ')
          let [command, ...args] = newline
          let commandType = 'object'

          if(command.match(/:\w+/)) {
            commandType = 'function'
            command = command.replace(':', '')
          } else {
            commandType = 'object'
          }

          try {
            newline.length > 0 && new Function('meido', 'commandType', 'args', `

            if(commandType == "function") {
              try {
                console.log(${command}(meido, ...args))
              } catch (err) {
                console.log(meido.${command}(meido, ...args))
              }
            } else if(commandType == "object") {
              try {
                console.log(${command})
              } catch (err) {
                console.log(meido.${command})
              }
            } 
            `)(meido, commandType, args)
          } catch(err) {
            console.error(err.toString())
          }
          rl.prompt()
          meido.state.newline = line
          meido.cli = rl

        }).on('close', () => {
          meido.emit('cli:close')
        })
      })
  }
}
