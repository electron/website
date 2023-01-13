// Make sure we do not run any real git commands by accident
const executeMock = jest.createMockFromModule('../execute') as jest.Mocked<
  typeof import('../execute')
>;
jest.mock('../execute', () => executeMock);
const octokitMock = {
  pulls: { list: jest.fn(), create: jest.fn(), requestReviewers: jest.fn() },
};
const github = {
  getOctokit: () => {
    return octokitMock;
  },
  context: {
    repo: {
      repo: 'mock-repo',
      owner: 'mock-owner',
    },
  },
};
jest.mock('@actions/github', () => github);

import { createPR } from '../git-commands';

describe('git-commands', () => {
  it('creates a new PR if there are no PRs opened', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executeMock.execute.mockResolvedValue({ stdout: '' } as any);
    octokitMock.pulls.list.mockResolvedValue({ data: [] });
    octokitMock.pulls.create.mockResolvedValue({ data: { id: 42 } });

    await createPR(
      'mock-branch',
      'mock-base',
      'mock@email.com',
      'mock name',
      'chore: mock message'
    );

    expect(octokitMock.pulls.list).toBeCalledTimes(1);
    expect(octokitMock.pulls.create).toBeCalledTimes(1);
    expect(octokitMock.pulls.create).toBeCalledWith({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      base: 'mock-base',
      head: 'mock-branch',
      title: 'chore: mock message',
    });
  });

  it('force pushes to the branch if there is already a PR', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executeMock.execute.mockResolvedValue({ stdout: '' } as any);
    octokitMock.pulls.list.mockResolvedValue({
      data: [{ head: { ref: 'mock-branch' } }],
    });
    octokitMock.pulls.create.mockResolvedValue({ data: { id: 42 } });

    await createPR(
      'mock-branch',
      'mock-base',
      'mock@email.com',
      'mock name',
      'chore: mock message'
    );

    expect(octokitMock.pulls.list).toBeCalledTimes(1);
    expect(octokitMock.pulls.create).toBeCalledTimes(0);
  });
});
