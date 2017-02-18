import readline from 'readline'
export default {
  name: "cli",

  start() {
    let meido = this

    meido.log('debug', 'cli start>>>>>')
    meido
      .on('cli:start', () => {
        let rl = readline.createInterface({
          input: process.stdin, 
          output: process.stdout,
          prompt: 'meido> ',
          completer: (line) => {
            var completions = meido.options.completions
            var hits = completions.filter((c) => { return c.indexOf(line) === 0 })
            return [hits.length ? hits : completions, line]
          }
        })
        rl.prompt()

        rl.on('line', line => {
          const newline = line.length > 0 ? line.split(' ') : []
          let [command, ...args] = newline
          let commandType = 'object'

          if(command && command.match(/:\w+/)) {
            commandType = 'function'
            command = command.replace(':', '')
          } else {
            commandType = 'object'
          }

          const test = []
          let i = -1
          args.length > 0 && args.forEach(a => {
            if(a.match(/:\w+/)){
              test.push(a.replace(':', ''))
            }
          })

          try {
            newline.length > 0 && new Function('meido', 'commandType', 'args', `
            if(commandType == "function") {
              
              if(args.length > 0) {
                args = args.map((raw, i) => {
                  if(raw.match(${/:\w+/})) {  
                    let fn = meido.${test[++i]}
                    if(fn) {
                      return fn
                    } else {
                      return raw
                    }
                  } else {
                    return raw
                  }
                })
              }

              try {
                console.log(${command}.call( meido, ...args))
              } catch (err) {

                console.log(meido.${command}.call(meido, ...args))

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



// import readline from 'readline'

// const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))
// const composeStr = (...fns) => fns.reduce((f,g) => `meido.${f}(meido.${g})`)

// export default {
//   name: "cli",

//   start() {
//     let meido = this

//     meido.log('debug', 'cli start>>>>>')
//     meido
//       .on('cli:start', () => {
//         let rl = readline.createInterface({
//           input: process.stdin, 
//           output: process.stdout,
//           prompt: 'meido> ',
//           completer: (line) => {
//             var completions = meido.options.completions
//             var hits = completions.filter((c) => { return c.indexOf(line) === 0 })
//             return [hits.length ? hits : completions, line]
//           }
//         })
//         rl.prompt()

//         rl.on('line', line => {
//           let functions = []
//           let commandType = 'object'
//           let command
//           let args = []

//           const newline = line.length > 0 ? line.split(' ') : []

//           for(let line of newline) {
//             if(line.match(/:\w+/)) {
//               functions.push(line.replace(':', ''))
//             } else {
//               args.push(line)
//             }
//           }

//           if(functions.length > 0) {
//             commandType = 'function'
//             command = composeStr(...functions)
//           } else {
//             command = newline
//           }
//           console.log(`${command}.call(meido, ...args)`)
//           console.log(`meido.${command}.call(meido, ...args)`)

//           try {
//             newline.length > 0 && new Function('meido', 'commandType', 'args', `
//             if(commandType == "function") {
//               try {
//                 console.log(${command}.call(meido, ...args))
//               } catch (err) {

//                 console.log(meido.${command}.call(meido, ...args))
                
//               }
//             } else if(commandType == "object") {
//               try {

//                 console.log(${command})

//               } catch (err) {

//                 console.log(meido.${command})
                
//               }
//             } 
//             `)(meido, commandType, args)
//           } catch(err) {
//             console.error(err.toString())
//           }
//           rl.prompt()
//           meido.state.newline = line
//           meido.cli = rl

//         }).on('close', () => {
//           meido.emit('cli:close')
//         })
//       })
//   }
// }
