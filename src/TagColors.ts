const tagColors = [
    'charts.orange',
    'charts.purple',
    'terminal.ansiBlue',
    'terminal.ansiCyan',
    'terminal.ansiGreen',
    'terminal.ansiMagenta',
    'terminal.ansiRed',
    'terminal.ansiYellow'
];

export function getColorAtIndex(index: number) {
    const i = index % tagColors.length;
    return tagColors[i];
}
