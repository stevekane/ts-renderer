export function isAlpha (s: string): boolean {
  const cc = s.charCodeAt(0)

  return !isNaN(cc) && (( cc >= 65 && cc <= 90 ) || ( cc >= 97 && cc <= 122 ))
}

export function isNumber (s: string): boolean {
  const cc = s.charCodeAt(0)

  return !isNaN(cc) && cc >= 48 && cc <= 57
}

export function is (target: string): (s: string) => boolean {
  return function (s: string): boolean {
    if ( s.length === 0 || target.length === 0 ) return false
    else                                         return target[0] === s[0]
  } 
}
