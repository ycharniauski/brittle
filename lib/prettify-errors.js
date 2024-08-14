const grey = "\x1b[90m";
const red = "\x1b[31m";
const reset = "\x1b[0m";

function compareArrRec(res, indent, act, exp) {
  const len = Math.max(act.length, exp.length)
  const temp = []
  for (let i = 0; i < len; i+=1) {
    compareRec(temp, `${indent}  `, act[i], exp[i])
  }

  if (temp.length > 0) {
    res.push(`${indent}[`)
    temp.forEach(t => res.push(t))
    res.push(`${indent}]`)
  }
}

function compareObjRec(res, indent, act, exp) {
  const temp = []

  const keys = Object.keys({ ...act, ...exp})
  const affectedKeys = {}
  for (let key of keys) {
    if (compareRec(temp, `${indent}  ${key}: `, act[key], exp[key])) {
      affectedKeys[key] = true
    }
  }

  if (temp.length > 0) {
    res.push(`${indent}{`)
    keys.filter(key => !affectedKeys[key]).sort().forEach(key => {
      res.push(`${grey}${indent}  ${key}:  ${prettifyVal(exp[key] || act[key])}${reset}`)
    })
    temp.forEach(t => res.push(`${red}${t}${reset}`))
    res.push(`${indent}}`)
  }
}

function prettifyVal (val) {
  if (typeof val === 'string') return `'${val}'`
  if (Array.isArray(val)) return `[Array(${val.length})]`
  return val
}

function compareRec(res, indent, act, exp) {
  if (act === exp) return false

  if (act && exp) {
    if (Array.isArray(act) && Array.isArray(exp)) {
      return compareArrRec(res, indent + ' ', act, exp)
    }
    if (Array.isArray(act) || Array.isArray(exp)) {
      res.push(`${indent}+${prettifyVal(act)}`)
      res.push(`${indent}-${prettifyVal(exp)}`)
      return true
    }

    if (typeof act === 'object' && typeof exp === 'object') {
      return compareObjRec(res, indent + ' ', act, exp)
    }
  }
  res.push(`${indent}+${prettifyVal(act)}`)
  res.push(`${indent}-${prettifyVal(exp)}`)
  return true
}

exports.prettifyError = function prettifyError(o) {
  const res = []
  compareRec(res, '   ', o.actual, o.expected)
  return res.join('\n')
}
