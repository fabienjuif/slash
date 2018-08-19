import Keyboard from './keyboard'
import AI from './ai'
import Touch from './touch'

const create = (id) => {
  return {
    id,
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      shield: false,
      jump: false,
      enter: false,
    },
  }
}

const update = (inputs) => {
  if (inputs.id === 'keyboard') Keyboard.update(inputs)
  if (inputs.id === 'ai') AI.update(inputs)
  if (inputs.id === 'touch') Touch.update(inputs)
}

const clear = (inputs) => {
  if (inputs.id === 'keyboard') Keyboard.clear(inputs)
  if (inputs.id === 'ai') AI.clear(inputs)
  if (inputs.id === 'touch') Touch.clear(inputs)
}

export default {
  create,
  update,
  clear,
}
