import { TagParser } from "../TagParser"

test('Given no file, When getTags, Then it should return empty', () => {
    const data = new Map<string, string>();
    const parser = new TagParser(data);

    const tags = parser.getTags();

    expect(tags.length).toEqual(0);
});

test('Given empty files, When getTags, Then it should return empty', () => {
    const data = new Map<string, string>();
    data.set('file-1', "");
    data.set('file-2', "");
    const parser = new TagParser(data);

    const tags = parser.getTags();

    expect(tags.length).toEqual(0);
});

test('Given files with no tag, When getTags, Then it should return no tag', () => {
    const data = new Map<string, string>();
    data.set('file-1', "Quia aut eaque voluptas eligendi mollitia tenetur veritatis corporis numquam.");
    data.set('file-2', "Neque id maxime.");
    const parser = new TagParser(data);

    const tags = parser.getTags();

    expect(tags.length).toEqual(0);
});

test('Given files with two tags, When getTags, Then it should return 2 tags', () => {
    const data = new Map<string, string>();
    data.set('file-1', "Voluptates #debitis perspiciatis sit in provident et voluptatum inventore.");
    data.set('file-2', "Ut quaerat #officia in facilis.");
    const parser = new TagParser(data);

    const tags = parser.getTags();

    expect(tags.map(t => t.label)).toEqual(["#debitis", "#officia"]);
});

test('Given files with duplicated tags, When getTags, Then it should return unique tags', () => {
    const data = new Map<string, string>();
    data.set('file-1', "Voluptates #debitis perspiciatis #sit in provident et voluptatum inventore.");
    data.set('file-2', "Voluptates #debitis perspiciatis sit in #provident et voluptatum inventore.");
    const parser = new TagParser(data);

    const tags = parser.getTags();

    expect(tags.map(t => t.label)).toEqual(["#debitis", "#provident", "#sit"]);
});

test('Given files with duplicated tags, When getTags, Then it should have filename as values', () => {
    const data = new Map<string, string>();
    data.set('file-1', "Voluptates #debitis perspiciatis #sit in provident et voluptatum inventore.");
    data.set('file-2', "Voluptates #debitis perspiciatis sit in provident et voluptatum inventore.");
    const parser = new TagParser(data);

    const tags = parser.getTags();

    expect(tags.map(t => t.locations.map(l => l.label))).toEqual([["file-1", "file-2"], ["file-1"]]);
});

test('Given files with duplicated tags in the same file, When getTags, Then it should have filename as values', () => {
    const data = new Map<string, string>();
    data.set('file-1', "Voluptates #debitis #debitis #sit in provident et voluptatum inventore.");
    data.set('file-2', "Voluptates #debitis perspiciatis sit in provident et voluptatum inventore.");
    const parser = new TagParser(data);

    const tags = parser.getTags();

    expect(tags.map(t => t.locations.map(l => l.label))).toEqual([["file-1", "file-2"], ["file-1"]]);
    expect(tags.map(t => t.locations.map(l => l.chars))).toEqual(
        [[
            [{ line: 0, col: 11, extract: 'Voluptates #debitis' }, { line: 0, col: 20, extract: 'Voluptates #debitis #debitis' }],
            [{ line: 0, col: 11, extract: 'Voluptates #debitis' }]
        ], [
            [{ line: 0, col: 29, extract: '...ptates #debitis #debitis #sit' }]
        ]]);
});
