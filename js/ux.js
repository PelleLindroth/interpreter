const registerUX = document.querySelector('.register')
const interpreterUX = document.querySelector('.interpreter')
const debuggerUX = document.querySelector('.debugger')
const consoleUX = document.querySelector('.console')
const boxes = []
let commands = []
let registerObject = {}
let debugRegister = {}
let debug = false
let index = 0
let debugBox
let clearBox
let runBox

const start = () => {
  createBoxes()
  initiateConsole()
  interpreterUX.focus()
}

const createBoxes = () => {
  debuggerUX.classList.add('debugger-hide')

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      box = initiateBox(i, j)
      boxes.push(box)
      registerUX.appendChild(box)
    }
  }
}

const initiateBox = (i, j) => {
  let box = document.createElement('div')
  box.className = 'box'
  box.setAttribute('id', i + 1 + '' + (j + 1))
  box.style.gridTemplateColumn = i
  box.style.gridTemplateRow = j

  if (box.id == '41') {
    debugBox = box
    debugBox.id = 'debugBox'
    debugBox.innerHTML = 'DEBUG'
    showDebugFalse()
    debugBox.addEventListener('click', toggleDebug, true)
    return debugBox
  }
  if (box.id == '42') {
    clearBox = box
    clearBox.id = 'clearBox'
    clearBox.innerHTML = 'CLR'
    clearBox.className = 'clr'
    clearBox.addEventListener('click', reset, true)
    return clearBox
  }
  if (box.id == '43') {
    runBox = box
    runBox.id = 'runBox'
    runBox.innerHTML = 'RUN'
    showRunTrue()
    runBox.addEventListener('click', run, true)
    return runBox
  }
  return box
}

const toggleDebug = () => {
  debug = !debug

  if (debug) {
    showDebugTrue()
    consoleUX.innerHTML = 'Press <span class="green">RUN</span> to debug'
  } else {
    showDebugFalse()
    initiateConsole()
  }
}

const reset = () => {
  commands = []
  interpreterUX.value = ''
  clearBoxes()
  showInterpreter()
  showDebugFalse()
  showRunTrue()
  initiateConsole()
}

const run = () => {
  consoleUX.innerHTML = ''
  commands = interpreterUX.value.split('\n')

  if (commands.length == 1 && commands[0] == '') {
    consoleUX.innerHTML = 'No code to run!'
  } else {
    // Remove empty lines
    for (let i = 0; i < commands.length; i++) {
      if (commands[i] == '') {
        commands.splice(i, i + 1)
        i--
      }
    }
    // Run code
    if (debug) {
      debugStart()
    } else {
      registerObject = interpret(commands)

      if (registerObject.registers) {
        const registers = Object.entries(registerObject.registers)
        drawRegister(registers)
      } else {
        handleError(registerObject.error)
      }
    }
  }
}

const drawRegister = registers => {
  if (!registers) {
    console.log('no registers')
    return
  }
  let i = 0
  let error = ''
  let line = 0

  for (let reg of registers) {
    if (reg[0] == 'error' || reg[0] == 'line') {
      if (reg[0] == 'error') {
        error = reg[1]
      } else {
        line = reg[1]
        handleError(error, line)
        error = ''
        line = 0
      }
    } else {
      const [letter, value] = reg

      if (value % 1 === 0) {
        boxes[i].innerHTML = letter.toUpperCase() + ': ' + value
      } else {
        boxes[i].innerHTML = letter.toUpperCase() + ': ' + value.toFixed(2)
      }

      i++
      if (!debug) {
        consoleUX.className = 'success'
        consoleUX.innerHTML = 'Success!'
      }
    }
  }
}

const initiateConsole = () => {
  consoleUX.className = 'console'
  consoleUX.innerHTML = 'Please type your code below and press <span class="green">RUN</span>'
}

const showDebugTrue = () => {
  debugBox.className = 'debug-true'
}

const showDebugFalse = () => {
  debugBox.className = 'debug-false'
}

const showRunTrue = () => {
  runBox.classList.add('run-true')
  runBox.classList.remove('run-false')
}

const showInterpreter = () => {
  debuggerUX.classList.remove('debugger-show')
  debuggerUX.classList.add('debugger-hide')
  interpreterUX.classList.remove('interpreter-hide')
  interpreterUX.classList.add('interpreter-show')
  interpreterUX.focus()
}

const clearBoxes = () => {
  for (let box of boxes) {
    if (box.id != 'debugBox' && box.id != 'clearBox' && box.id != 'runBox') {
      box.innerHTML = ''
    }
  }
}

const handleError = error => {
  consoleUX.className = 'err'
  consoleUX.innerHTML = `Error on line ${error.line}: ${error.message}`
}
