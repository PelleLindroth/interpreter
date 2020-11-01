const debugStart = () => {
  clearBoxes()
  setupDebugger()
  initiateNextButton()
}

const setupDebugger = () => {
  index = 0
  showDebugger()
  runBox.removeEventListener('click', run, true)
  runBox.classList.remove()
  debuggerUX.appendChild(getCommandList())
}

const showDebugger = () => {
  interpreterUX.classList.remove('interpreter-show')
  interpreterUX.classList.add('interpreter-hide')
  debuggerUX.classList.remove('debugger-hide')
  debuggerUX.classList.add('debugger-show')
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
  if (!debug) return

  let nextLine = 0
  let error = false
  registerObject = interpret(commands)
  let history = registerObject.registerHistory
  if (registerObject.error) {
    history.push(registerObject.error)
  }

  if (registerObject.error && history[index].message) {
    handleError(registerObject.error)
    error = true
    unmountDebugger(error)
    nextLine = registerObject.error.line
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
  refreshDebugWindow(nextLine, error)
  if (!error) {
    history[index] != undefined && showNextLineMessage(nextLine)
    index == history.length && unmountDebugger(error)
  } else {
    refreshDebugWindow(nextLine, error)
  }
}

const showNextLineMessage = nextLine => {
  if (commands[nextLine] == undefined) return

  consoleUX.innerHTML = `<div>
    Press <span class="yellow">NEXT</span> to ${commands[nextLine].match('^.*:$') ? action = 'skip' : action = 'execute'} <span class="code">${commands[nextLine]} </span>
      </div>`
}

function refreshDebugWindow(nextLine, error) {
  const lastLines = debuggerUX.firstChild
  if (lastLines) {
    debuggerUX.removeChild(lastLines)
    debuggerUX.appendChild(getCommandList(nextLine, error))
  }

  scrollCode(debuggerUX, nextLine * 20, 'smooth')
}

const getCommandList = (nextLine, error) => {
  let commandList = document.createElement('ul')

  for (let i = 0; i < commands.length; i++) {
    let li = document.createElement('li')
    li.innerText = commands[i]
    if (i == nextLine) {
      if (error) {
        li.classList.add('command-list-element-error')
      } else {
        li.classList.add('command-list-element-highlight')
      }
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
    debugBox.classList.add('green')
    consoleUX.classList.add('success')
    consoleUX.innerHTML = 'Successfully debugged!'
    debugBox.addEventListener('click', removeDebugger, true)
  }

  debugBox.innerHTML = 'OK'
}

const removeDebugger = () => {
  showInterpreter()
  scrollCode(interpreterUX, 0, 'auto')

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
  runBox.addEventListener('click', run, true)
}

const scrollCode = (el, value, style) => {
  el.scroll({
    top: value,
    left: 0,
    behavior: style
  })
}