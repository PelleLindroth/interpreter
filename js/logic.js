function interpret(instructions) {
  let registers = {}
  let labels = []
  let labelNames = []
  let loop = 0
  let notEqual = false
  let equal = false
  let greater = false
  let less = false

  // Add labels
  for (let i = 0; i < instructions.length; i++) {
    const command = instructions[i].split(' ')[0]
    if (command.match('^.*:$')) {
      let contains = false
      let newLabelName = command.slice(0, -1)

      for (let i = 0; i < labels.length; i++) {
        if (newLabelName == labels[i].name) {
          contains = true
        }
      }

      if (!contains) {
        labels.push({ name: newLabelName, line: i })
        labelNames.push(newLabelName)
      }

      continue
    }
  }

  // Execute commands
  for (let i = 0; i < instructions.length; i++) {
    const [command, reg, value] = instructions[i].split(' ')
    let num = +value // undefined if not a number

    if (command.match('^.*:$')) {
      continue
    }

    // Detect infinite loop
    if (loop++ > 500) {
      return {
        error: 'Infinite loop detected',
        line: i + 1,
      }
    }

    // Reset booleans if not jump compare command
    if (!command.match('^j.*') && command != 'jnz') {
      notEqual = false
      equal = false
      greater = false
      less = false
    }

    if (
      command != 'mov' &&
      !labelNames.includes(reg) &&
      !Number(reg) &&
      !registers[reg]
    ) {
      console.log(reg)
      console.log(labelNames.includes(reg))
      return {
        error: `Uninitialised register "${reg}"`,
        line: i + 1,
      }
    }

    // Switch commands
    switch (command) {
      case 'mov':
        if (num) {
          registers[reg] = num
        } else {
          registers[reg] = registers[value]
        }
        break

      case 'add':
        if (num) {
          registers[reg] += num
        } else {
          registers[reg] += registers[value]
        }
        break

      case 'sub':
        if (num) {
          registers[reg] -= num
        } else {
          registers[reg] -= registers[value]
        }
        break

      case 'mul':
        if (num) {
          registers[reg] *= num
        } else {
          registers[reg] *= registers[value]
        }
        break

      case 'div':
        if (num) {
          registers[reg] /= num
        } else {
          registers[reg] /= registers[value]
        }
        break

      case 'inc':
        registers[reg]++
        break

      case 'dec':
        registers[reg]--
        break

      case 'cmp':
        let a, b

        // Make sure both a and b are numbers
        if (+reg && +value) {
          a = reg
          b = value
        } else if (+reg) {
          a = reg
          b = registers[value]
        } else if (+value) {
          a = registers[reg]
          b = value
        } else {
          a = registers[reg]
          b = registers[value]

          if (+reg === 0) {
            a = 0
          }
          if (+value === 0) {
            b = 0
          }
        }

        // Compare a and b
        if (a > b) {
          notEqual = true
          greater = true
        } else if (a == b) {
          equal = true
        } else {
          notEqual = true
          less = true
        }
        break

      case 'jmp':
        for (label of labels) {
          if (reg != label.name) {
            continue
          }
          if (reg == label.name && label.line > i) {
            i = label.line
          } else {
            return {
              error: `Cannot jump back with "jmp"`,
              line: i + 1,
            }
          }
        }
        break

      case 'jne':
        if (notEqual) {
          for (label of labels) {
            if (reg == label.name) {
              i = label.line
            }
          }
        }
        notEqual = false
        break

      case 'je':
        if (equal) {
          for (label of labels) {
            if (reg == label.name) {
              i = label.line
            }
          }
        }
        equal = false
        break

      case 'jge':
        if (greater || equal) {
          for (label of labels) {
            if (reg == label.name) {
              i = label.line
            }
          }
        }
        equal = false
        greater = false
        break

      case 'jg':
        if (greater) {
          for (label of labels) {
            if (reg == label.name) {
              i = label.line
            }
          }
        }
        greater = false
        break

      case 'jle':
        if (less || equal) {
          for (label of labels) {
            if (reg == label.name) {
              i = label.line
            }
          }
        }
        equal = false
        less = false
        break

      case 'jl':
        if (less) {
          for (label of labels) {
            if (reg == label.name) {
              i = label.line
            }
          }
        }
        less = false
        break

      case 'jnz':
        if (+reg && reg > 0) {
          i += num - 1
          break
        }
        if (registers[reg] > 0) {
          steps = parseInt(value)
          if (steps < 0) {
            i += steps - 1
          } else {
            i += value - 1
          }
        }
        break

      default:
        return {
          error: `Invalid command: "${command}"`,
          line: i + 1,
        }
    }
  }

  return registers
}

// => {a: 2, b: 5, c: 1}
// console.log(
//   interpret([
//     'mov a 2',
//     'mov b 3',
//     'jmp label',
//     'rerun:',
//     'mov c 4',
//     'inc a',
//     'label:',
//     'cmp a 10',
//     'jne rerun',
//     'dec a',
//   ])
// ) // => {a: 1}
// console.log(interpret(['mov a 1', 'mov b a', 'dec b'])) // => {a:1, b:0}
/*
console.log(
  interpret(['mov a 5', 'inc a', 'dec a', 'dec a', 'jnz a -1', 'inc a'])
) // => {a: 1}
console.log(interpret(['mov a 5', 'mov b a', 'dec b', 'dec b'])) // => {a: 5, b: 3}
console.log(
  interpret(['mov a 1', 'jnz 5 3', 'mov b 3', 'dec a', 'jnz a -1', 'dec a'])
) // => {a: -1}
console.log(
  interpret(['mov a 4', 'dec a', 'jnz a -1', 'inc a', 'inc a', 'inc a'])
) // => {a: 3}
console.log(interpret(['mov a 2', 'add a 10'])) // => {a:12}
console.log(interpret(['mov a 2', 'mov b 3', 'add a b'])) // => {a:5, b:3}
console.log(interpret(['mov a 20', 'sub a 5'])) // => {a:15}
console.log(interpret(['mov a 7', 'mov b 2', 'sub a b'])) // => {a:5, b:2}
console.log(interpret(['mov a 20', 'mul a 5'])) // => {a:100}
console.log(interpret(['mov a 10', 'mov b 5', 'mul a b'])) // => {a:50, b:5}
console.log(interpret(['mov a 20', 'div a 5'])) // => {a:4}
console.log(interpret(['mov a 6', 'mov b 3', 'div a b'])) // => {a:2, b:3}
console.log(interpret(['mov a 1', 'inc a', 'jnz a 1', 'mov b a'])) // => {a:2, b:2} */
