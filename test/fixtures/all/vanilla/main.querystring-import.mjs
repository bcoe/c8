import module from 'node:module'

async function resolve (moduleId, context, next) {
  const result = await next(moduleId, context);
  const url = new URL(result.url)
  url.searchParams.set('randomSeed', Math.random());
  result.url = url.href;
  return result;
}

function load(url, context, next) {
  if (url.includes('main.js')) {
    const loadedId = url.replace('main.js', 'loaded.js')

    return {
      shortCircuit: true,
      format: 'module',
      source: `import loaded from "${loadedId}";loaded()`,
    };
  }

  if (url.includes('loaded.js')) {
    return {
      shortCircuit: true,
      format: 'module',
      source: 'export default () => true',
    };
  }

  return next(url, context);
}

module.register && module.register(`
data:text/javascript,
export ${encodeURIComponent(load)}
export ${encodeURIComponent(resolve)}`.slice(1))

export default import('./main.js?qs=1')
