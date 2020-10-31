function interpret(instructions) {
  let registers = {}
  let registerHistory = []
  let labels = []
  let labelNames = []
  let loop = 0
  let notEqual = false
  let equal = false
  let greater = false
  let less = false
  let supportedCommands = [
    'mov',
    'inc',
    'dec',
    'jnz',
    'add',
    'sub',
    'mul',
    'div',
    'jmp',
    'cmp',
    'jne',
    'je',
    'jge',
    'jg',
    'jle',
    'jl',
  ]

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
    }
  }

  // Execute program
  for (let i = 0; i < instructions.length; i++) {
    const [command, reg, value] = instructions[i].split(' ')
    let num = +value // undefined if not a number

    // If label, continue
    if (command.match('^.*:$')) {
      registerHistory.push({ line: i, label: command })
      continue
    }

    // Detect invalid command
    if (!supportedCommands.includes(command)) {
      return {
        error: {
          message: `Invalid command: "${command}"`,
          line: i + 1,
        },
        registerHistory,
        labelNames,
      }
    }

    // Detect infinite loop
    if (loop++ > 500) {
      return {
        error: {
          message: 'Infinite loop detected',
          line: i + 1,
        },
        registerHistory,
        labelNames,
      }
    }

    // Reset booleans if not jump compare command
    if (!command.match('^j.*') && command != 'jnz' && command != 'jmp') {
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
      return {
        error: {
          error: `Uninitialised register "${reg}"`,
          line: i + 1,
        },
        registerHistory,
        labelNames,
      }
    }

    // Execute current command
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
            registerHistory.push({ line: i, jmp: reg, to: label.line })
            i = label.line
          } else {
            return {
              error: {
                error: {
                  error: `Cannot jump back with "jmp"`,
                  line: i + 1,
                },
                registerHistory,
                labelNames,
              },
            }
          }
        }
        break

      case 'jne':
        if (notEqual) {
          for (label of labels) {
            if (reg == label.name) {
              registerHistory.push({ line: i, jmp: reg, to: label.line })
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
              registerHistory.push({ line: i, jmp: reg, to: label.line })
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
              registerHistory.push({ line: i, jmp: reg, to: label.line })
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
              registerHistory.push({ line: i, jmp: reg, to: label.line })
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
              registerHistory.push({ line: i, jmp: reg, to: label.line })
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
              registerHistory.push({ line: i, jmp: reg, to: label.line })
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
          error: {
            error: `Invalid command: "${command}"`,
            line: i + 1,
          },
          registerHistory,
          labelNames,
        }
    }
    registerHistory.push({ line: i, reg: JSON.stringify(registers) })
  }

  return {
    registers,
    registerHistory,
    labelNames,
  }
}
