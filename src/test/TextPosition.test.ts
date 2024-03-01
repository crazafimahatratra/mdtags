import { TextPosition } from "../TextPosition"

const text = `Eveniet delectus vero aperiam et atque et voluptate consequatur mollitia.
Consectetur repellat quia vel odio neque consequatur repudiandae voluptas sapiente.
Quis fugiat cum et. Molestias ipsam tempora non ea ea. Debitis voluptas totam nostrum et.
Ea qui sit voluptas minima quia neque.`

const cases = [[0, 0, 0], [8, 0, 8], [64, 0, 64], [74, 1, 0], [86, 1, 12], [248, 3, 0], [178, 2, 20]];
test.each(cases)((`Given position %p It should return {line : %p, col: %p}`), (char, line, col) => {
    const textPosition = new TextPosition();
    const position = textPosition.getTagPosition(text, char);
    expect(position.line).toEqual(line);
    expect(position.col).toEqual(col);
});

const extracts: [string, number, string][] = [
    ['Eveniet delectus vero aperiam et atque et voluptate consequatur mollitia.', 8, 'Eveniet delectus'], 
    ['Eveniet delectus vero aperiam et atque et voluptate consequatur mollitia.', 42, '...vero aperiam et atque et voluptate'],
    ['Consectetur repellat quia vel odio neque consequatur repudiandae voluptas sapiente.', 54, '... odio neque consequatur repudiandae'],
];
test.each(extracts)((`getTagExtract(text, %p, %p) => %s`), (line, col, extract) => {
    const textPosition = new TextPosition();

    const actualExtract = textPosition.getTagExtract(line, col);

    expect(actualExtract).toEqual(extract);
})

const lengths: [string, number, number][] = [['Dolor ut omnis non.', 0, 5]];
test.each(lengths)((`Given phrase %s, getWordLengthAfter %p should return %p`), (line, col, length) => {
    const textPosition = new TextPosition();

    const actualLength = textPosition.getWordLengthAfter(line, col);

    expect(actualLength).toEqual(length);
})
