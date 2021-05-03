const fs = require('fs');
const mock = {
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
};

jest.mock('fs', () => {
  return mock;
});

const { updateSha } = require('../update-pinned-version');

describe('update-pinned-version', () => {
  it('updates package.json with the given sha', async () => {
    const sha = 'new-sha';
    const expected = {
      sha,
    };
    const packageJson = {
      sha: 'old-sha',
    };
    mock.promises.readFile.mockResolvedValue(JSON.stringify(packageJson));

    await updateSha(sha);

    expect(mock.promises.writeFile).toBeCalledTimes(1);
    expect(mock.promises.writeFile).toBeCalledWith(
      expect.any(String),
      `${JSON.stringify(expected, null, 2)}\n`,
      'utf-8'
    );
  });
});
