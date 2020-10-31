const debugStart = () => {
  clearBoxes()
  setupDebugger()
  initiateNextButton()
}

const setupDebugger = () => {
  index = 0
  showDebugger()
  debuggerUX.appendChild(getCommandList())
}

const initiateNextButton = () => {
  runBox.className = 'run-false'
  consoleUX.classList.add('next-line')
  showNextLineMessage(0)
  refreshDebugWindow(0)
  debugBox.className = 'nxt'
  debugBox.innerHTML = 'NEXT'
  debugBox.removeEventListener('click', toggleDebug, true)
  debugBox.addEventListener('click', executeNextLine, true)
}

const executeNextLine = () => {
  let nextLine = 0
  if (!debug) return
  let error = false
  registerObject = interpret(commands)
  let history = registerObject.registerHistory

  if (registerObject.error && registerObject.error.line - 1 == index) {
    handleError(registerObject.error)
    error = true
    unmountDebugger(error)
  } else if (history[index].jmp) {
    nextLine = history[index].to
    index++
  } else if (history[index].label) {
    nextLine = history[index++].line
    const registers = Object.entries(JSON.parse(history[index - 2].reg))
    history[index] ? nextLine = history[index].line : nextLine = nextLine
    drawRegister(registers)
  } else {
    const registers = Object.entries(JSON.parse(history[index++].reg))
    history[index] ? nextLine = history[index].line : nextLine = nextLine
    drawRegister(registers)
  }
  history[index] != undefined && showNextLineMessage(nextLine)
  refreshDebugWindow(nextLine)
  index == history.length && unmountDebugger(error)
}

const showNextLineMessage = nextLine => {
  if (commands[nextLine] == undefined) return

  let action = ''
  commands[nextLine].match('^.*:$') ? action = 'skip' : action = 'execute'

  consoleUX.innerHTML = `<div>
Press <span class="yellow">NEXT</span> to ${action} <span class="code">${commands[nextLine]} </span>
</div>`
}

const refreshDebugWindow = nextLine => {
  const lastLines = debuggerUX.firstChild
  if (lastLines) {
    debuggerUX.removeChild(lastLines)
    debuggerUX.appendChild(getCommandList(nextLine))
  }
}

const getCommandList = nextLine => {
  let commandList = document.createElement('ul')

  for (let i = 0; i < commands.length; i++) {
    let li = document.createElement('li')
    li.innerText = commands[i]
    if (i == nextLine) {
      li.classList.add('command-list-element-highlight')
    } else {
      li.classList.add('command-list-element-opaque')
    }

    commandList.appendChild(li)
  }

  commandList.classList.add('command-list')
  return commandList
}

const unmountDebugger = error => {
  debugBox.removeEventListener('click', executeNextLine, true)

  const lastLines = debuggerUX.firstChild
  if (lastLines) {
    debuggerUX.removeChild(lastLines)
    debuggerUX.appendChild(getCommandList())
  }

  if (error) {
    debugBox.addEventListener('click', removeDebugger, true)
    debugBox.classList.add('red')
    consoleUX.classList.add('red')
  } else {
    consoleUX.classList.remove('next-line')
    consoleUX.classList.add('success')
    consoleUX.innerHTML = 'Successfully debugged!'
    debugBox.addEventListener('click', removeDebugger, true)
  }

  debugBox.innerHTML = 'OK'
}

const removeDebugger = () => {
  showInterpreter()

  const lastLines = debuggerUX.firstChild
  lastLines && debuggerUX.removeChild(lastLines)

  debug = false
  showDebugFalse()
  debugBox.innerHTML = 'DEBUG'
  debugBox.removeEventListener('click', removeDebugger, true)
  debugBox.addEventListener('click', toggleDebug, true)

  initiateConsole()
  clearBoxes()
  showRunTrue()
}

const showDebugger = () => {
  interpreterUX.classList.remove('interpreter-show')
  interpreterUX.classList.add('interpreter-hide')
  debuggerUX.classList.remove('debugger-hide')
  debuggerUX.classList.add('debugger-show')
}

const showInterpreter = () => {
  debuggerUX.classList.remove('debugger-show')
  debuggerUX.classList.add('debugger-hide')
  interpreterUX.classList.remove('interpreter-hide')
  interpreterUX.classList.add('interpreter-show')
}