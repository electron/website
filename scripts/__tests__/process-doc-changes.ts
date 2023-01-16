const gitMock = jest.createMockFromModule(
  '../utils/git-commands'
) as jest.Mocked<typeof import('../utils/git-commands')>;
jest.mock('../utils/git-commands', () => gitMock);

jest.mock('../utils/execute');

import { processDocsChanges } from '../process-docs-changes';

describe('process-docs-changes', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development';
  });
  it('does not create any PR if there are no changes', async () => {
    gitMock.getChanges.mockResolvedValue('');

    await processDocsChanges();

    expect(gitMock.createPR).toHaveBeenCalledTimes(0);
    expect(gitMock.pushChanges).toHaveBeenCalledTimes(0);
  });

  it('pushes changes directly to main if only package.json is modified', async () => {
    gitMock.getChanges.mockResolvedValue('M package.json');
    gitMock.getCurrentBranchName.mockResolvedValue('main');

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

  it('does create a PR if more files than package.json are modified and branch is tracked', async () => {
    gitMock.getChanges.mockResolvedValue(
      'M package.json\nM sidebars.json\nU randomDoc.md'
    );
    gitMock.isCurrentBranchTracked.mockResolvedValue(true);
    gitMock.getCurrentBranchName.mockResolvedValue('main');

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

  it('does push changes if branch is not tracked regardless of the number of files', async () => {
    gitMock.getChanges.mockResolvedValue('M package.json\n');
    gitMock.isCurrentBranchTracked.mockResolvedValue(false);

    await processDocsChanges();

    expect(gitMock.pushChanges).toHaveBeenCalledTimes(1);
    expect(gitMock.createPR).toHaveBeenCalledTimes(0);
  });

  it('does push changes if branch is tracked and no new files are added', async () => {
    gitMock.getChanges.mockResolvedValue('M package.json\nM randomdoc.md');
    gitMock.isCurrentBranchTracked.mockResolvedValue(false);

    await processDocsChanges();

    expect(gitMock.pushChanges).toHaveBeenCalledTimes(1);
    expect(gitMock.createPR).toHaveBeenCalledTimes(0);
  });
});
