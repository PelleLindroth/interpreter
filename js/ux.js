const registerUX = document.querySelector('.register')
const interpreterUX = document.querySelector('.interpreter')
const consoleUX = document.querySelector('.console')
const boxes = []
let commands = []

consoleUX.innerHTML = 'Please type your code below and press RUN'

for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    let box = document.createElement('div')
    box.className = 'box'
    box.setAttribute('id', i + '' + j)
    box.style.gridTemplateColumn = i
    box.style.gridTemplateRow = j
    if (box.id == '32') {
      box.innerHTML = 'CLR'
      box.className = 'clr'
      box.addEventListener('click', () => {
        commands = []
        interpreterUX.value = ''
        interpreterUX.focus()
        clearBoxes()
      })
    }
    if (box.id == '33') {
      box.innerHTML = 'RUN'
      box.className = 'run'
      box.addEventListener('click', () => {
        consoleUX.innerHTML = ''
        const commands = interpreterUX.value.split('\n')

        if (commands.length == 1 && commands[0] == '') {
          consoleUX.innerHTML = 'No code to run!'
        } else {
          for (let i = 0; i < commands.length; i++) {
            if (commands[i] == '') {
              commands.splice(i, i + 1)
              i--
            }
          }
          const registerObject = interpret(commands)
          const registers = Object.entries(registerObject)
          drawRegister(registers)
        }
      })
    }
    boxes.push(box)
    registerUX.appendChild(box)
  }
}

interpreterUX.focus()

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
      consoleUX.className = 'success'
      consoleUX.innerHTML = 'Success!'
    }
  }
}

const clearBoxes = () => {
  for (let box of boxes) {
    if (box.id != '32' && box.id != '33') box.innerHTML = ''
  }

  consoleUX.className = 'console'
  consoleUX.innerHTML = 'Please type your code below and press RUN'
}

const handleError = (err, ln) => {
  consoleUX.className = 'err'
  consoleUX.innerHTML = `Error on line ${ln}: ${err}`
}
