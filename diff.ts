export type Diff = {
  beforeFileName: string
  afterFileName: string
  hunks: Hunk[]
}

export type Hunk = {
  header: HunkHeader
  lines: Line[]
}

type HunkHeader = {
  beforeLines: number
  afterLines: number
  beforeStartLine: number
  afterStartLine: number
}

type Line = {
  text: string
  mark: 'add' | 'delete' | 'nomodified'
}

const hunkHeaderRegexp = /@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/

export function toString(diff: Diff): string {
  if (diff.hunks.length === 0) {
    return "";
  }
  let res: string
  res = '--- ' + diff.beforeFileName + '\n'
  res += '+++ ' + diff.afterFileName + '\n'
  diff.hunks.forEach((hunk: Hunk) => {
    res += '@@ -' + hunk.header.beforeStartLine + ',' + hunk.header.beforeLines + ' +' + hunk.header.afterStartLine + ',' + hunk.header.afterLines + ' @@\n'
    hunk.lines.forEach((line: Line) => {
      switch (line.mark) {
        case 'add':
          res += '+';
          break;
        case 'delete':
          res += '-';
          break;
        case 'nomodified':
          res += ' ';
          break;
      }
      res += line.text + '\n';
    })
  })

  return res;
}

export function parse(text: string): Diff[] {
  const diffs: Diff[] = [];
  let currentDiffIndex = 0;
  let currentHunkIndex = 0;

  text.split('\n').forEach((l) => {
    if (l.startsWith('---')) {
      diffs.push({
        beforeFileName: '',
        afterFileName: '',
        hunks: [],
      });

      currentDiffIndex = diffs.length - 1;
      currentHunkIndex = 0;

      diffs[currentDiffIndex].beforeFileName = l.slice(4);

      return;
    }

    if (l.startsWith('+++')) {
      diffs[currentDiffIndex].afterFileName = l.slice(4);

      return;
    }

    if (l.startsWith('@@')) {
      const matched = l.match(hunkHeaderRegexp);

      if (!matched) {
        return;
      }

      diffs[currentDiffIndex].hunks.push({
        header: {
          beforeStartLine: Number(matched[1]),
          beforeLines: matched[2] ? Number(matched[2]) : 1,
          afterStartLine: Number(matched[3]),
          afterLines: matched[4] ? Number(matched[4]) : 1,
        },
        lines: [],
      });

      currentHunkIndex = diffs[currentDiffIndex].hunks.length - 1;

      return;
    }

    if (l.startsWith('-')) {
      diffs[currentDiffIndex].hunks[currentHunkIndex].lines.push({
        text: l.slice(1),
        mark: 'delete',
      });

      return;
    }

    if (l.startsWith('+')) {
      diffs[currentDiffIndex].hunks[currentHunkIndex].lines.push({
        text: l.slice(1),
        mark: 'add',
      });

      return;
    }

    if (l.startsWith(' ')) {
      diffs[currentDiffIndex].hunks[currentHunkIndex].lines.push({
        text: l.slice(1),
        mark: 'nomodified',
      });

      return;
    }
  });

  return diffs;
}
