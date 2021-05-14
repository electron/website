const gitMock = jest.createMockFromModule('../utils/git-commands');
jest.mock('../utils/git-commands', () => gitMock);
// Make sure we do not run any real git commands by accident
const executeMock = jest.createMockFromModule('../utils/execute');
jest.mock('../utils/execute', () => executeMock);

const { processDocsChanges } = require('../process-docs-changes');

describe('process-docs-changes', () => {
  it('does not create any PR if there are no changes', async () => {
    gitMock.getChanges.mockResolvedValue('');

    await processDocsChanges();

    expect(gitMock.createPR).toHaveBeenCalledTimes(0);
    expect(gitMock.pushChanges).toHaveBeenCalledTimes(0);
  });

  it('does not create any PR if package.json is not modified', async () => {
    gitMock.getChanges.mockResolvedValue('M sidebars.json');

    await processDocsChanges();

    expect(gitMock.createPR).toHaveBeenCalledTimes(0);
    expect(gitMock.pushChanges).toHaveBeenCalledTimes(0);
  });

  it('pushes changes directly to main if only package.json is modified', async () => {
    gitMock.getChanges.mockResolvedValue('M package.json');

    await processDocsChanges();

    expect(gitMock.createPR).toHaveBeenCalledTimes(0);
    expect(gitMock.pushChanges).toHaveBeenCalledTimes(1);
    expect(gitMock.pushChanges).toHaveBeenCalledWith(
      'main',
      'electron@github.com',
      'electron-bot',
      '"chore: update ref to docs (🤖)"'
    );
  });

  it('does create a PR if more files than package.json are modified', async () => {
    gitMock.getChanges.mockResolvedValue('M package.json\nM sidebars.json');

    await processDocsChanges();

    expect(gitMock.pushChanges).toHaveBeenCalledTimes(0);
    expect(gitMock.createPR).toHaveBeenCalledTimes(1);
    expect(gitMock.createPR).toHaveBeenCalledWith(
      'chore/docs-updates',
      'main',
      'electron@github.com',
      'electron-bot',
      '"chore: update ref to docs (🤖)"'
    );
  });
});
