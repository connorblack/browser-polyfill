if (!console.count) {
  const counts: { [key: string]: number } = {}

  console.count = (label: string = '<no label>') => {
    if (!counts[label]) counts[label] = 0
    counts[label]++
    console.log(`${label}: ${counts[label]}`)
  }
}
