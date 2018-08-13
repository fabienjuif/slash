import { createStore, types } from 'k-ramel'
import inputs from './inputs/index'
import skills from './skills'

const store = createStore({
  skills: types.keyValue(),
  inputs: types.object(),
  bindings: types.object(),
})

inputs(store)
skills(store)

export default store
