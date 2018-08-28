/* eslint-disable import/prefer-default-export */
import { random as lodashRandom } from 'lodash-es'

export const choose = (...args) => {
  if (args.length === 1) return args[0][lodashRandom(0, args[0].length - 1)]

  // construct the bucket
  let bucket = []
  for (let i = 0; i < args.length; i += 1) {
    const item = args[i]
    let what
    let weight

    if (Array.isArray(item)) {
      what = item[0] // eslint-disable-line prefer-destructuring
      weight = item[1] // eslint-disable-line prefer-destructuring
    } else {
      what = item
      weight = 1
    }

    if (weight !== 0) {
      bucket = bucket.concat(Array.from({ length: weight }).map(() => what))
    }
  }

  // take one thing randomly
  return bucket[lodashRandom(0, bucket.length - 1)]
}

export const chance = weight => lodashRandom(0, weight) === 0

export const random = (min, max) => lodashRandom(min, max)
