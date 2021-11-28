import get from "./lib/get";
import or from "./lib/or";
import post from "./lib/post";

const defaultServer = "https://emkc.org";

export const piston = (opts: any = {}) => {
  const server:any = String(opts.server || defaultServer).replace(/\/$/, '');
  const store:any = {};

  const api = {

    async runtimes() {
      if (store.runtimes) {
        return store.runtimes;
      }
      const suffix = (server === defaultServer)
        ? '/api/v2/piston/runtimes'
        : '/api/v2/runtimes';
      const url = `${server}${suffix}`;
      const runtimes:any = await get(url);
      if (runtimes && runtimes.success !== false) {
        store.runtimes = runtimes;
      }
      return runtimes;
    },

    async execute(argA:any, argB:any, argC:any) {
      const runtimes = await api.runtimes();
      if (runtimes.success === false) {
        return runtimes;
      }

      const config = typeof argA === 'object' ? argA : typeof argB === 'object' ? argB : argC || {};
      let language = (typeof argA === 'string') ? argA : undefined;
      language = language || config.language;
      const code = typeof argB === 'string' ? argB : undefined;
      const latestVersion = (runtimes.filter((n:any) => n.language === language).sort((a:any, b:any) => {
        return a.version > b.version ? -1 : b.version > a.version ? 1 : 0;
      })[0] || {}).version;

      const boilerplate:any = {
        "language": language,
        "version": config.version || latestVersion,
        "files": or(config.files, [{
            "content": code
        }]),
        "stdin": or(config.stdin, ""),
        "args": or(config.args, ["1", "2", "3"]),
        "compile_timeout": or(config.compileTimeout, 10000),
        "run_timeout": or(config.runTimeout, 3000),
        "compile_memory_limit": or(config.compileMemoryLimit, -1),
        "run_memory_limit": or(config.runMemoryLimit, -1)
      }

      const suffix = (server === defaultServer)
        ? '/api/v2/piston/execute'
        : '/api/v2/execute';
      const url = `${server}${suffix}`;
      return await post(url, boilerplate);
    }
  }

  return api;
}

export default piston;

