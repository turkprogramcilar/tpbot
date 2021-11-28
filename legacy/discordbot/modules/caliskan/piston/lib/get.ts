const fetch = require("node-fetch")
export const get = async (url:any) => {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch(e) {
    return { success: false, error: e };
  }
}

export default get;