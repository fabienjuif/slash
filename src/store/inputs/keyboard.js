import { when } from 'k-ramel'

const listeners = [
  when(/@@keyboard>.*/)(({ payload }, store) => {
    const { keyCode, type } = payload
    const bindings = store.bindings.get()

    const binding = Object.entries(bindings).find(([key, value]) => value === keyCode)
    if (!binding) return

    const [key] = binding

    store.inputs.update({ [key]: type === 'keydown' })
  }),
]

export default store => {
  store.listeners.add(listeners)

  const reactKey = ({ keyCode, type }) => {
    store.dispatch({ type: `@@keyboard>${type}>${keyCode}`, payload: { type, keyCode } })
  }

  window.addEventListener('keydown', reactKey)
  window.addEventListener('keyup', reactKey)
}
