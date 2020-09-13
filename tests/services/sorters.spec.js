import { sortBy } from '@/services/sorters';

describe('Sorters', () => {
  let entry1;
  let entry2;
  let entry3;

  beforeEach(() => {
    entry1 = factories.entry.build(
      {
        attributes: {
          title: 'a',
          last_chapter_read: '1',
          last_chapter_available: '2',
          last_released_at: '2019-01-10T00:00:00.000Z',
        },
      },
    );
    entry2 = factories.entry.build(
      {
        attributes: {
          title: 'b',
          last_chapter_read: '3',
          last_chapter_available: '4',
          last_released_at: '2019-01-01T00:00:00.000Z',
        },
      },
    );
    entry3 = factories.entry.build(
      {
        attributes: {
          title: 'C',
          last_chapter_read: '5',
          last_chapter_available: '5',
          last_released_at: null,
        },
      },
    );
  });

  describe('sortBy', () => {
    it('sorts by title', () => {
      const sorted = sortBy(
        [entry2, entry1, entry3], 'attributes.title', 'ascending',
      );

      expect(sorted[0]).toBe(entry1);
      expect(sorted[1]).toBe(entry2);
      expect(sorted[2]).toBe(entry3);
    });

    it('sorts by last released at, with entries without a timestamp last', () => {
      const sorted = sortBy(
        [entry2, entry1, entry3], 'attributes.last_released_at', 'ascending',
      );

      expect(sorted[0]).toBe(entry1);
      expect(sorted[1]).toBe(entry2);
      expect(sorted[2]).toBe(entry3);
    });

    it('sorts by newly released, ordered by released at', () => {
      const sorted = sortBy(
        [entry2, entry1, entry3], 'newReleases', 'ascending',
      );

      expect(sorted[0]).toBe(entry1);
      expect(sorted[1]).toBe(entry2);
      expect(sorted[2]).toBe(entry3);
    });
  });
});
