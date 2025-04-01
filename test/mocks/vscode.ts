export const window = {
  showErrorMessage: (msg: string) => console.error(msg),
  showInformationMessage: (msg: string) => console.log(msg)
};

export const workspace = {
  getConfiguration: () => ({
    get: (key: string) => key === 'apiKey' ? 'test-api-key' : undefined
  })
};

export default {
  window,
  workspace
};