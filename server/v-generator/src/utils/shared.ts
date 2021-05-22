const fsp = require("fs").promises

export const rewritePkg = async (dir: string, cb: (it: Record<string, string>) => void) => {
  let pkgStr = await fsp.readFile(dir, "utf-8")
  const pkg = JSON.parse(pkgStr)
  cb(pkg)
  const res = JSON.stringify(pkg, null, "\t")  
  await fsp.writeFile(dir, res)
}

export const compile = (source: string, data: Record<string, string>) => {
  let newStr = source
  Reflect.ownKeys(data).forEach((key: string) => {
    const regExp = new RegExp("&" + key + "&", "g")
    
    newStr = newStr.replace(regExp, data[key as string])
  })
  return newStr
}

export const copy = () => {

}

