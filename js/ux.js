const registerUX = document.querySelector('.register')
const interpreterUX = document.querySelector('.interpreter')
const debuggerUX = document.querySelector('.debugger')
const consoleUX = document.querySelector('.console')
const boxes = []
let commands = []
let debug = false
let index = 0
let debugBox
let clearBox
let runBox

const createBoxes = () => {
  debuggerUX.classList.add('debugger-hide')

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      let box = document.createElement('div')
      box.className = 'box'
      box.setAttribute('id', i + '' + j)
      box.style.gridTemplateColumn = i
      box.style.gridTemplateRow = j

      if (box.id == '21') {
        debugBox = box
        debugBox.id = 'debugBox'
        debugBox.innerHTML = 'DEBUG'
        debugBox.className = 'debug-false'
        debugBox.addEventListener('click', toggleDebug, true)
      }
      if (box.id == '22') {
        clearBox = box
        clearBox.id = 'clearBox'
        clearBox.innerHTML = 'CLR'
        clearBox.className = 'clr'
        clearBox.addEventListener('click', reset, true)
      }
      if (box.id == '23') {
        runBox = box
        runBox.id = 'runBox'
        runBox.innerHTML = 'RUN'
        runBox.className = 'run-true'
        runBox.addEventListener('click', execute, true)
      }
      boxes.push(box)
      registerUX.appendChild(box)
    }
  }
}

const drawRegister = registers => {
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

const toggleDebug = () => {
  debug = !debug

  if (debug) {
    consoleUX.innerHTML = 'Press RUN to debug'
    debugBox.classList.add('debug-true')
    debugBox.classList.remove('debug-false')
  } else {
    initiateConsole()
    debugBox.classList.add('debug-false')
    debugBox.classList.remove('debug-true')
  }
}

const reset = () => {
  commands = []
  interpreterUX.value = ''
  interpreterUX.focus()
  clearBoxes()
  showInterpreter()
  debugBox.classList.remove('debug-true')
  initiateConsole()
}

const execute = () => {
  consoleUX.innerHTML = ''
  commands = interpreterUX.value.split('\n')

  if (commands.length == 1 && commands[0] == '') {
    consoleUX.innerHTML = 'No code to run!'
  } else {
    for (let i = 0; i < commands.length; i++) {
      if (commands[i] == '') {
        commands.splice(i, i + 1)
        i--
      }
    }
    if (debug) {
      debugInterpreter()
    } else {
      const registerObject = interpret(commands)
      const registers = Object.entries(registerObject)
      drawRegister(registers)
    }
  }
}

const initiateConsole = () => {
  consoleUX.className = 'console'
  consoleUX.innerHTML = 'Please type your code below and press RUN'
}

const clearBoxes = () => {
  for (let box of boxes) {
    if (box.id != 'debugBox' && box.id != 'clearBox' && box.id != 'runBox') {
      box.innerHTML = ''
    }
  }
}

const handleError = (err, ln) => {
  consoleUX.className = 'err'
  consoleUX.innerHTML = `Error on line ${ln}: ${err}`
}
