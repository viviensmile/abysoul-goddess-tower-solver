export function generateAllSolutions() {
  const list = []
  for (let left = 0; left <= 4; left += 1) {
    for (let middle = 0; middle <= 4 - left; middle += 1) {
      const right = 4 - left - middle
      list.push([left, middle, right])
    }
  }
  return list
}

export function getResponseCode(solution) {
  const guesses = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]

  return guesses
    .map((guess) => {
      const exactMatches = guess.reduce(
        (sum, value, index) => sum + (solution[index] === value ? 1 : 0),
        0,
      )
      return Math.min(2, exactMatches)
    })
    .join('')
}

export function filterSolutions(allSolutions, inputs) {
  return allSolutions.filter((solution) => {
    const code = getResponseCode(solution)
    return ['a', 'b', 'c', 'd'].every((key, index) => {
      const value = inputs[key]
      return value === '' || Number(value) === Number(code[index])
    })
  })
}
