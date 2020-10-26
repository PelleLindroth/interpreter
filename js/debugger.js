const debugInterpreter = () => {
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
  showNextLineMessage()
  debugBox.className = 'nxt'
  debugBox.innerHTML = 'NEXT'
  debugBox.removeEventListener('click', toggleDebug, true)
  debugBox.addEventListener('click', executeNextLine, true)
}

const executeNextLine = () => {
  console.log('runs!')
  index++
  console.log(index)
  commands[index] != undefined && showNextLineMessage()

  const registerObject = interpret(commands.slice(0, index))
  drawRegister(Object.entries(registerObject))

  const lastLines = debuggerUX.firstChild
  if (lastLines) {
    debuggerUX.removeChild(lastLines)
    debuggerUX.appendChild(getCommandList())
  }

  if (index + 1 == commands.length) {
    removeDebugger()
  }
}

const showNextLineMessage = () => {
  consoleUX.innerHTML = `<div>
Press <span class="yellow">NEXT</span> to execute <span class="code">${commands[index]} </span>
</div>`
}

const getCommandList = () => {
  let commandList = document.createElement('ul')

  for (let i = 0; i < commands.length; i++) {
    let li = document.createElement('li')
    li.innerText = commands[i]
    if (i > index) {
      li.classList.add('command-list-element-opaque')
    } else if (i == index) {
      li.classList.add('command-list-element-highlight')
    } else {
      li.classList.add('command-list-element-success')
    }

    commandList.appendChild(li)
  }

  commandList.classList.add('command-list')
  return commandList
}

const removeDebugger = () => {
  debugBox.removeEventListener('click', executeNextLine, true)
  showInterpreter()

  const lastLines = debuggerUX.firstChild
  debuggerUX.removeChild(lastLines)

  consoleUX.classList.remove('next-line')
  consoleUX.classList.add('success')
  consoleUX.innerHTML = 'Successfully debugged!'

  debugBox.classList.remove('nxt')
  debugBox.classList.remove('debug-true')
  debugBox.classList.add('debug-false')
  debugBox.innerHTML = 'DEBUG'

  debugBox.removeEventListener('click', executeNextLine(), true)
  debugBox.addEventListener('click', toggleDebug, true)
  debug = false

  runBox.classList.add('run-true')
  runBox.classList.remove('run-false')
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
